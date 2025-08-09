export const dynastyWarriors = [
  { name: "Zhao Yun", color: "#4cc9f0" },
  { name: "Guan Yu", color: "#72efdd" },
  { name: "Lu Bu", color: "#ff6e6e" },
  { name: "Zhuge Liang", color: "#ffd166" },
  { name: "Diao Chan", color: "#f77fbe" },
];

export const fireEmblemHeroes = [
  { name: "Marth", color: "#8ecae6" },
  { name: "Ike", color: "#c2df8a" },
  { name: "Lyn", color: "#b8f2e6" },
  { name: "Edelgard", color: "#ffb4a2" },
  { name: "Lucina", color: "#ccd5ff" },
];

export const levels = [
  {
    id: 1,
    name: "Training Grounds",
    warriors: [dynastyWarriors[0], dynastyWarriors[1], dynastyWarriors[2]],
    enemies: [
      { ...fireEmblemHeroes[0], type: "soldier", x: 900, y: 540, radius: 24, hp: 40 },
      { ...fireEmblemHeroes[1], type: "soldier", x: 980, y: 540, radius: 24, hp: 40 },
    ],
    structures: [
      { type: "box", x: 940, y: 560, w: 220, h: 20, color: "#cbb2fe" },
      { type: "box", x: 900, y: 520, w: 20, h: 80, color: "#ffd6a5" },
      { type: "box", x: 980, y: 520, w: 20, h: 80, color: "#ffd6a5" },
    ],
  },
  {
    id: 2,
    name: "Fortress Wall",
    warriors: [dynastyWarriors[3], dynastyWarriors[4], dynastyWarriors[2], dynastyWarriors[1]],
    enemies: [
      { ...fireEmblemHeroes[2], type: "soldier", x: 1040, y: 520, radius: 24, hp: 50 },
      { ...fireEmblemHeroes[3], type: "soldier", x: 1150, y: 520, radius: 26, hp: 60 },
      { ...fireEmblemHeroes[4], type: "soldier", x: 1100, y: 440, radius: 22, hp: 45 },
    ],
    structures: [
      { type: "box", x: 1100, y: 560, w: 360, h: 20, color: "#cbb2fe" },
      { type: "box", x: 1020, y: 520, w: 20, h: 80, color: "#ffd6a5" },
      { type: "box", x: 1180, y: 520, w: 20, h: 80, color: "#ffd6a5" },
      { type: "box", x: 1100, y: 480, w: 200, h: 20, color: "#cbb2fe" },
      { type: "box", x: 1100, y: 440, w: 20, h: 80, color: "#ffd6a5" },
    ],
  },
  {
    id: 3,
    name: "Citadel Keep",
    warriors: [dynastyWarriors[2], dynastyWarriors[0], dynastyWarriors[4], dynastyWarriors[3], dynastyWarriors[1]],
    enemies: [
      { ...fireEmblemHeroes[0], type: "soldier", x: 1180, y: 520, radius: 24, hp: 55 },
      { ...fireEmblemHeroes[1], type: "soldier", x: 1260, y: 520, radius: 24, hp: 55 },
      { ...fireEmblemHeroes[2], type: "soldier", x: 1220, y: 440, radius: 24, hp: 55 },
      { ...fireEmblemHeroes[3], type: "soldier", x: 1220, y: 360, radius: 28, hp: 70 },
    ],
    structures: [
      { type: "box", x: 1220, y: 560, w: 460, h: 20, color: "#cbb2fe" },
      { type: "box", x: 1180, y: 520, w: 20, h: 80, color: "#ffd6a5" },
      { type: "box", x: 1260, y: 520, w: 20, h: 80, color: "#ffd6a5" },
      { type: "box", x: 1220, y: 480, w: 200, h: 20, color: "#cbb2fe" },
      { type: "box", x: 1220, y: 440, w: 20, h: 80, color: "#ffd6a5" },
      { type: "box", x: 1220, y: 400, w: 200, h: 20, color: "#cbb2fe" },
    ],
  },
];

export const defaultSlingAnchor = { x: 220, y: 520 };