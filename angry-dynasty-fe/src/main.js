import { levels, defaultSlingAnchor } from './levels.js';
import { createWarriorBody, createEnemyBody, createBlockBody, createGround } from './entities.js';

const M = Matter; // global from CDN

const state = {
  engine: null,
  render: null,
  runner: null,
  world: null,
  currentLevelIndex: 0,
  slingAnchor: { ...defaultSlingAnchor },
  slingMaxStretch: 120,
  slingBandWidth: 6,
  currentWarrior: null,
  warriorsQueue: [],
  enemies: [],
  blocks: [],
  isDragging: false,
  hasLaunched: false,
  lastPointer: { x: 0, y: 0 },
  damageCooldowns: new Map(),
};

function init() {
  const container = document.getElementById('game-container');
  const width = window.innerWidth;
  const height = window.innerHeight;

  const engine = M.Engine.create({ enableSleeping: true });
  engine.gravity.y = 1.0;

  const render = M.Render.create({
    element: container,
    engine,
    options: {
      width,
      height,
      background: 'transparent',
      wireframes: false,
      showVelocity: false,
      showAngleIndicator: false,
    },
  });

  const runner = M.Runner.create();

  state.engine = engine;
  state.world = engine.world;
  state.render = render;
  state.runner = runner;

  // Ground & world bounds
  M.World.add(state.world, createGround(M, width, height));

  // Custom draw for slingshot bands and labels
  M.Events.on(render, 'afterRender', () => {
    drawSling(render.context);
    drawLabels(render.context);
  });

  // Collision-based damage processing
  M.Events.on(engine, 'collisionStart', onCollision);

  // Mouse controls
  attachPointerControls(render.canvas);

  // UI buttons
  document.getElementById('resetBtn').addEventListener('click', () => reloadLevel());
  document.getElementById('nextBtn').addEventListener('click', () => nextLevel());
  document.getElementById('overlayReset').addEventListener('click', () => { hideOverlay(); reloadLevel(); });
  document.getElementById('overlayNext').addEventListener('click', () => { hideOverlay(); nextLevel(); });

  // Start
  M.Render.run(render);
  M.Runner.run(runner, engine);

  loadLevel(state.currentLevelIndex);

  window.addEventListener('resize', onResize);
}

function onResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  state.render.canvas.width = width;
  state.render.canvas.height = height;
}

function loadLevel(index) {
  clearWorld();
  const level = levels[index % levels.length];
  document.getElementById('levelName').textContent = `${level.name}`;

  state.slingAnchor = level.slingAnchor || { ...defaultSlingAnchor };

  // Add structures
  state.blocks = level.structures.map(def => createBlockBody(M, def));
  M.World.add(state.world, state.blocks);

  // Add enemies
  state.enemies = level.enemies.map(e => createEnemyBody(M, e, e.x, e.y));
  M.World.add(state.world, state.enemies);

  // Prepare warriors queue
  state.warriorsQueue = level.warriors.map(w => ({ ...w }));
  spawnNextWarrior();

  state.hasLaunched = false;
  updateHud();
}

function clearWorld() {
  const { world } = state;
  const toRemove = world.bodies.filter(b => !b.isStatic);
  toRemove.forEach(b => M.World.remove(world, b));
}

function spawnNextWarrior() {
  if (state.warriorsQueue.length === 0) {
    state.currentWarrior = null;
    maybeFinishAttempt();
    updateHud();
    return;
  }
  const next = state.warriorsQueue.shift();
  const wBody = createWarriorBody(M, next, state.slingAnchor.x, state.slingAnchor.y);
  M.Body.setPosition(wBody, { x: state.slingAnchor.x, y: state.slingAnchor.y });
  M.Body.setVelocity(wBody, { x: 0, y: 0 });
  M.Body.setAngularVelocity(wBody, 0);
  M.Body.setStatic(wBody, true);
  state.currentWarrior = wBody;
  M.World.add(state.world, wBody);
  state.isDragging = false;
  state.hasLaunched = false;
  updateHud();
}

function reloadLevel() {
  loadLevel(state.currentLevelIndex);
}

function nextLevel() {
  state.currentLevelIndex = (state.currentLevelIndex + 1) % levels.length;
  loadLevel(state.currentLevelIndex);
}

function updateHud() {
  const enemiesAlive = state.enemies.length;
  document.getElementById('warriorsCount').textContent = `${(state.currentWarrior ? 1 : 0) + state.warriorsQueue.length}`;
  document.getElementById('enemiesCount').textContent = `${enemiesAlive}`;
}

function attachPointerControls(canvas) {
  canvas.addEventListener('mousedown', onPointerDown);
  canvas.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
  canvas.addEventListener('touchstart', e => { e.preventDefault(); const t = e.changedTouches[0]; onPointerDown({ clientX: t.clientX, clientY: t.clientY, isTouch: true }); }, { passive: false });
  canvas.addEventListener('touchmove', e => { e.preventDefault(); const t = e.changedTouches[0]; onPointerMove({ clientX: t.clientX, clientY: t.clientY, isTouch: true }); }, { passive: false });
  window.addEventListener('touchend', e => { const t = e.changedTouches[0]; onPointerUp({ clientX: t?.clientX, clientY: t?.clientY, isTouch: true }); });
}

function onPointerDown(e) {
  state.lastPointer = { x: e.clientX, y: e.clientY };
  const w = state.currentWarrior;
  if (!w) return;
  const dist = distance(e.clientX, e.clientY, w.position.x, w.position.y);
  if (dist <= (w.plugin?.meta?.radius || 22) + 18 && !state.hasLaunched) {
    state.isDragging = true;
  }
}

function onPointerMove(e) {
  state.lastPointer = { x: e.clientX, y: e.clientY };
  if (!state.isDragging || !state.currentWarrior) return;
  const clamped = clampToCircle({ x: e.clientX, y: e.clientY }, state.slingAnchor, state.slingMaxStretch);
  M.Body.setPosition(state.currentWarrior, clamped);
  M.Body.setVelocity(state.currentWarrior, { x: 0, y: 0 });
  M.Body.setAngularVelocity(state.currentWarrior, 0);
}

function onPointerUp(e) {
  if (!state.isDragging || !state.currentWarrior) return;
  state.isDragging = false;
  if (state.hasLaunched) return;

  const proj = state.currentWarrior;
  const from = proj.position;
  const to = state.slingAnchor;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const stretch = Math.min(Math.hypot(dx, dy), state.slingMaxStretch);
  if (stretch < 8) return; // small movement, ignore

  // Launch impulse proportional to stretch
  const scale = 0.0026; // tuning
  const force = { x: dx * scale, y: dy * scale };
  M.Body.setStatic(proj, false);
  M.Body.applyForce(proj, proj.position, force);
  state.hasLaunched = true;

  // After a while, allow spawning next warrior
  waitForProjectileToRest().then(() => {
    // Remove projectile after rest to keep world clean
    if (state.currentWarrior) {
      M.World.remove(state.world, state.currentWarrior);
      state.currentWarrior = null;
    }
    spawnNextWarrior();
  });
}

function waitForProjectileToRest() {
  return new Promise(resolve => {
    const check = () => {
      const p = state.currentWarrior;
      if (!p) { resolve(); return; }
      const speed = Math.hypot(p.velocity.x, p.velocity.y);
      const offscreen = p.position.y > state.render.canvas.height + 200 || p.position.x > state.render.canvas.width + 400 || p.position.x < -400;
      if (speed < 0.2 || offscreen) {
        resolve();
        return;
      }
      requestAnimationFrame(check);
    };
    setTimeout(check, 800);
  });
}

function drawSling(ctx) {
  const anchor = state.slingAnchor;
  const proj = state.currentWarrior;
  if (!proj) return;

  // Base
  ctx.save();
  ctx.lineWidth = state.slingBandWidth;
  ctx.strokeStyle = 'rgba(255,255,255,.2)';
  ctx.fillStyle = '#38406a';

  // Anchor post
  ctx.beginPath();
  ctx.arc(anchor.x, anchor.y, 12, 0, Math.PI * 2);
  ctx.fill();

  // Bands
  if (state.isDragging || !state.hasLaunched) {
    ctx.strokeStyle = 'rgba(110,165,255,.75)';
    ctx.beginPath();
    ctx.moveTo(anchor.x, anchor.y);
    ctx.lineTo(proj.position.x, proj.position.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLabels(ctx) {
  const drawText = (text, x, y, color = '#fff') => {
    ctx.save();
    ctx.font = '12px ui-monospace, monospace';
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.fillText(text, x + 1, y + 1);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  const drawCenteredText = (text, x, y, color = '#fff') => {
    ctx.save();
    ctx.font = '12px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.fillText(text, x + 1, y + 1);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  // Labels on warriors and enemies
  state.world.bodies.forEach(b => {
    const kind = b.plugin?.kind;
    if (kind === 'warrior') {
      const name = b.plugin.meta.name;
      drawCenteredText(name, b.position.x, b.position.y - (b.plugin.meta.radius + 14), '#bfe6ff');
    } else if (kind === 'enemy') {
      const { name, initialHp } = b.plugin.meta;
      const hp = Math.max(0, Math.round(b.plugin.meta.hp));
      drawCenteredText(`${name} (${hp})`, b.position.x, b.position.y - (b.plugin.meta.radius + 14), hp <= 0 ? '#ff8ea4' : '#ffd6a5');
    }
  });
}

function onCollision(event) {
  for (const pair of event.pairs) {
    handlePairDamage(pair.bodyA, pair.bodyB);
    handlePairDamage(pair.bodyB, pair.bodyA);
  }
}

function handlePairDamage(a, b) {
  const enemy = a?.plugin?.kind === 'enemy' ? a : null;
  if (!enemy) return;

  const now = performance.now();
  const last = state.damageCooldowns.get(enemy.id) || 0;
  if (now - last < 60) return; // rate limit damage per enemy

  // Calculate relative impact speed
  const relVx = (a.velocity?.x || 0) - (b.velocity?.x || 0);
  const relVy = (a.velocity?.y || 0) - (b.velocity?.y || 0);
  const impactSpeed = Math.hypot(relVx, relVy);

  const threshold = 1.5;
  if (impactSpeed < threshold) return;

  const massFactor = (b.mass || 1) * 0.6 + 0.6; // heavier objects deal more
  const damage = Math.min(30, (impactSpeed - threshold) * 7 * massFactor);

  enemy.plugin.meta.hp -= damage;
  state.damageCooldowns.set(enemy.id, now);

  if (enemy.plugin.meta.hp <= 0) {
    // Mark as defeated
    M.World.remove(state.world, enemy);
    state.enemies = state.enemies.filter(e => e.id !== enemy.id);
    updateHud();
    checkForWin();
  }
}

function maybeFinishAttempt() {
  // If no warriors left and still enemies, it's a fail
  if (state.warriorsQueue.length === 0 && !state.currentWarrior) {
    const enemiesLeft = state.enemies.length;
    if (enemiesLeft > 0) {
      showOverlay('Defeat', 'Out of warriors. Retry the level.');
    }
  }
}

function checkForWin() {
  if (state.enemies.length === 0) {
    showOverlay('Victory!', 'All enemies defeated. Proceed to the next level.');
  }
}

function showOverlay(title, subtitle) {
  const overlay = document.getElementById('overlay');
  document.getElementById('overlayTitle').textContent = title;
  document.getElementById('overlaySubtitle').textContent = subtitle;
  overlay.classList.remove('hidden');
}
function hideOverlay() {
  document.getElementById('overlay').classList.add('hidden');
}

function clampToCircle(point, center, radius) {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const dist = Math.hypot(dx, dy);
  if (dist <= radius) return { x: point.x, y: point.y };
  const k = radius / (dist || 1);
  return { x: center.x + dx * k, y: center.y + dy * k };
}

function distance(x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  return Math.hypot(dx, dy);
}

// Kickoff
init();