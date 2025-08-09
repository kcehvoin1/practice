/*********** Entities & factories ***********/

export function createWarriorBody(M, { name, color }, x, y) {
  const radius = 22;
  const body = M.Bodies.circle(x, y, radius, {
    restitution: 0.45,
    friction: 0.2,
    density: 0.0025,
    render: { fillStyle: color },
    label: `Warrior:${name}`,
  });
  body.plugin = body.plugin || {};
  body.plugin.kind = "warrior";
  body.plugin.meta = { name, color, radius };
  return body;
}

export function createEnemyBody(M, { name, color, radius = 22, hp = 40 }, x, y) {
  const body = M.Bodies.circle(x, y, radius, {
    restitution: 0.2,
    friction: 0.6,
    density: 0.002,
    render: { fillStyle: color },
    label: `Enemy:${name}`,
  });
  body.plugin = body.plugin || {};
  body.plugin.kind = "enemy";
  body.plugin.meta = { name, color, radius, hp, initialHp: hp };
  return body;
}

export function createBlockBody(M, { type, x, y, w = 60, h = 20, color = "#ccc" }) {
  if (type === "box") {
    return M.Bodies.rectangle(x, y, w, h, {
      restitution: 0.1,
      friction: 0.8,
      density: 0.003,
      render: { fillStyle: color },
      label: `Block:${w}x${h}`,
    });
  }
  return M.Bodies.rectangle(x, y, w, h, {
    restitution: 0.1,
    friction: 0.8,
    density: 0.003,
    render: { fillStyle: color },
    label: `Block:${w}x${h}`,
  });
}

export function createGround(M, width, height) {
  const ground = M.Bodies.rectangle(width / 2, height - 10, width * 3, 20, {
    isStatic: true,
    render: { fillStyle: "#2a304f" },
    label: "Ground",
  });
  const leftWall = M.Bodies.rectangle(-20, height / 2, 40, height * 3, {
    isStatic: true,
    render: { fillStyle: "#2a304f" },
    label: "WallLeft",
  });
  const rightWall = M.Bodies.rectangle(width + 20, height / 2, 40, height * 3, {
    isStatic: true,
    render: { fillStyle: "#2a304f" },
    label: "WallRight",
  });
  const ceiling = M.Bodies.rectangle(width / 2, -20, width * 3, 40, {
    isStatic: true,
    render: { fillStyle: "#2a304f" },
    label: "Ceiling",
  });
  return [ground, leftWall, rightWall, ceiling];
}