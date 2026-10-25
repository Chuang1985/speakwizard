/*
 * 故事柑仔店島：神明集郵冊（進香中軸線）的廟宇、系列模板與裝飾
 * 原點在地磚中央、正面朝 +z（門口那條路）。
 */
import * as THREE from "three";
import { mat, glow, mesh, box, cyl, ball, cone, at, group, rot, scl, sign, roof } from "./kit.js";

const RED = "#c4473a", RED2 = "#a8382e", TILE = "#d9822b", GREEN = "#2f7a62", GOLD = "#e2b33c", STONE = "#c9b088";

// 剪黏：屋脊上一排彩色小瓷片
function jiannian(w, y, z = 0) {
  const g = new THREE.Group();
  const cs = ["#2f9a7a", "#e2453c", "#f2b33c", "#3d6fb6", "#f6f1e2"];
  for (let i = 0; i < 7; i++) g.add(at(cone(0.06, 0.16, cs[i % 5], 4), -w / 2 + (i + 0.5) * (w / 7), y, z));
  return g;
}

// 通用小廟：台基、牆、門、匾額、燕尾屋頂、兩盞燈籠；extra 放各廟自己的道具
function temple({ w = 1.8, d = 1.5, h = 1.1, wall = RED, roofC = TILE, ridge = GREEN, plaque, lamp = "#e2453c" }) {
  const g = new THREE.Group();
  g.add(at(box(w + 0.3, 0.22, d + 0.3, STONE), 0, 0.11, 0));
  g.add(at(box(w, h, d, wall), 0, 0.22 + h / 2, -0.05));
  g.add(at(box(w * 0.4, h * 0.75, 0.05, "#3a1f17"), 0, 0.22 + h * 0.37, d / 2 - 0.03));
  for (const x of [-w / 2 + 0.1, w / 2 - 0.1]) g.add(at(cyl(0.07, 0.07, h, RED2, 8), x, 0.22 + h / 2, d / 2 + 0.1));
  g.add(at(roof(w + 0.45, d + 0.55, roofC, ridge, ridge), 0, 0.22 + h + 0.18, -0.05));
  g.add(jiannian(w * 0.8, 0.22 + h + 0.5, -0.05));
  if (plaque) g.add(at(sign(plaque, Math.min(w - 0.15, 0.28 * [...plaque].length + 0.2), 0.28, "#1d1418", GOLD), 0, 0.22 + h * 0.86, d / 2 + 0.03));
  for (const x of [-w / 2 + 0.2, w / 2 - 0.2]) g.add(at(ball(0.11, glow(lamp, 0.8), 8), x, 0.22 + h - 0.05, d / 2 + 0.3));
  return g;
}
function tower(top, plaque) { // 鐘樓、鼓樓：兩層方樓
  const g = new THREE.Group();
  g.add(at(box(1.6, 0.22, 1.6, STONE), 0, 0.11, 0), at(box(1.3, 1.2, 1.3, RED), 0, 0.82, 0));
  g.add(at(roof(1.7, 1.7, TILE, GREEN, GREEN), 0, 1.55, 0));
  for (const [x, z] of [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]]) g.add(at(cyl(0.05, 0.05, 0.9, RED2, 6), x, 2.05, z));
  g.add(at(top, 0, 2.05, 0));
  g.add(at(roof(1.4, 1.4, TILE, GREEN, GREEN), 0, 2.6, 0), at(ball(0.1, GOLD, 6), 0, 3.0, 0));
  g.add(at(sign(plaque, 0.6, 0.22, "#1d1418", GOLD), 0, 1.15, 0.66));
  return g;
}

export const SHEN_BUILDERS = {
  // 總建築：天后宮。三川殿＋正殿，龍柱、石獅、大匾、剪黏
  mazuTemple(anim) {
    const g = new THREE.Group();
    g.add(at(cyl(3.5, 3.7, 0.35, STONE, 6), 0, 0.17, 0), at(box(5.2, 0.3, 4.2, "#d8c8a0"), 0, 0.45, -0.2));
    // 正殿（後方、較高）
    g.add(at(box(4.0, 2.2, 2.0, RED), 0, 1.7, -1.1), at(roof(4.8, 2.7, TILE, GREEN, GREEN), 0, 3.0, -1.1), jiannian(3.8, 3.5, -1.1));
    g.add(at(box(2.6, 0.9, 1.4, RED), 0, 3.6, -1.1), at(roof(3.4, 2.0, TILE, GREEN, GREEN), 0, 4.25, -1.1), at(ball(0.22, glow("#ffcf4a", 1), 10), 0, 4.75, -1.1));
    // 三川殿（前方）
    g.add(at(box(4.4, 1.6, 1.4, RED), 0, 1.4, 0.9), at(roof(5.0, 2.0, TILE, GREEN, GREEN), 0, 2.4, 0.9), jiannian(4.2, 2.85, 0.9));
    for (const x of [-1.4, 0, 1.4]) g.add(at(box(0.8, 1.2, 0.05, "#3a1f17"), x, 1.2, 1.62));
    for (const x of [-0.75, 0.75]) { // 龍柱：柱身繞一圈金色
      g.add(at(cyl(0.12, 0.12, 1.6, "#a89880", 10), x, 1.4, 1.9));
      for (let k = 0; k < 4; k++) g.add(at(mesh(new THREE.TorusGeometry(0.14, 0.03, 4, 10), GOLD), x, 0.8 + k * 0.38, 1.9));
    }
    for (const x of [-2.0, 2.0]) g.add(at(cyl(0.1, 0.1, 1.6, RED2, 8), x, 1.4, 1.9));
    g.add(at(sign("天后宮", 1.6, 0.48, "#1d1418", GOLD), 0, 2.0, 1.66));
    for (const s of [-1, 1]) { // 石獅
      const lion = group(at(box(0.5, 0.25, 0.6, STONE), 0, 0.12, 0), scl(at(ball(0.25, "#bba878", 8), 0, 0.45, 0.05), 1, 1, 0.9), at(ball(0.18, "#bba878", 8), 0, 0.7, 0.2));
      g.add(at(lion, s * 1.3, 0.6, 2.4));
    }
    for (const x of [-1.8, -0.6, 0.6, 1.8]) g.add(at(cyl(0.15, 0.15, 0.32, glow("#e2453c", 0.9), 8), x, 2.05, 2.0));
    return g;
  },
  bellTower() {
    const bell = group(at(cyl(0.02, 0.02, 0.15, "#3a2a22", 3), 0, 0.45, 0), at(cone(0.25, 0.5, GOLD, 10), 0, 0.15, 0));
    return tower(bell, "鐘樓");
  },
  drumTower() {
    const drum = rot(group(cyl(0.3, 0.3, 0.4, "#c8433a", 12), at(cyl(0.31, 0.31, 0.02, "#f2e6c8", 12), 0, 0.2, 0), at(cyl(0.31, 0.31, 0.02, "#f2e6c8", 12), 0, -0.2, 0)), Math.PI / 2);
    drum.position.y = 0.3;
    return tower(group(drum), "鼓樓");
  },
  tudiTemple() {
    const g = temple({ w: 1.6, d: 1.3, plaque: "土地公廟" });
    g.add(at(scl(cyl(0.12, 0.2, 0.18, GOLD, 8), 1.3, 1, 0.8), 0, 0.4, 1.0)); // 元寶
    return g;
  },
  chenghuangTemple() { // 城隍廟：門上掛大算盤
    const g = temple({ w: 2.0, d: 1.5, h: 1.25, wall: "#9a3a2e", roofC: "#3a3430", ridge: "#2a2a30", plaque: "城隍廟" });
    const abacus = group(box(1.0, 0.36, 0.06, "#5a3a22"));
    for (let i = 0; i < 9; i++) for (const y of [-0.08, 0.1]) abacus.add(at(ball(0.035, "#2a1a14", 5), -0.42 + i * 0.105, y, 0.04));
    abacus.add(at(box(1.0, 0.02, 0.07, "#8a6a48"), 0, 0.02, 0));
    g.add(at(abacus, 0, 1.75, 0.8));
    return g;
  },
  yuelaoTemple(anim) { // 月老祠：院子裡紅線牽滿
    const g = temple({ w: 1.7, d: 1.3, plaque: "月老祠", lamp: "#ff8aa0" });
    for (const x of [-0.85, 0.85]) g.add(at(cyl(0.03, 0.03, 1.2, "#5a3a22", 4), x, 0.6, 1.1));
    for (let i = 0; i < 3; i++) g.add(at(rot(cyl(0.008, 0.008, 1.7, "#e2453c", 3), 0, 0, Math.PI / 2), 0, 0.75 + i * 0.15, 1.1));
    for (let i = 0; i < 5; i++) g.add(scl(at(ball(0.05, glow("#ff8aa0", 0.8), 6), -0.6 + i * 0.3, 0.68 + (i % 3) * 0.15, 1.12), 1, 1, 0.5));
    return g;
  },
  zhushengTemple() { // 註生娘娘廟：粉色燈籠、一雙小鞋
    const g = temple({ w: 1.7, d: 1.3, wall: "#c45a5a", plaque: "註生娘娘", lamp: "#ffb0c0" });
    for (const x of [-0.12, 0.12]) g.add(at(scl(ball(0.08, "#e2627a", 6), 0.8, 0.5, 1.4), x, 0.3, 1.0));
    return g;
  },
  guandiTemple() { // 關帝廟：門口立青龍偃月刀
    const g = temple({ w: 1.9, d: 1.4, h: 1.2, wall: "#b8322a", ridge: "#2a6a4a", plaque: "關帝廟" });
    g.add(at(cyl(0.025, 0.025, 1.9, "#5a3a22", 4), 0.95, 0.95, 1.0), rot(at(box(0.1, 0.5, 0.03, "#c8ccd4"), 1.0, 1.95, 1.0), 0, 0, -0.2));
    return g;
  },
  wenchangTemple(anim) { // 文昌祠：旁邊一座惜字亭（燒字紙的小塔）
    const g = temple({ w: 1.6, d: 1.3, wall: "#3a6a8a", roofC: TILE, plaque: "文昌祠" });
    const pagoda = group(at(box(0.4, 0.4, 0.4, STONE), 0, 0.2, 0), at(box(0.32, 0.35, 0.32, "#bba878"), 0, 0.58, 0), at(cone(0.3, 0.3, "#8a7a5a", 6), 0, 0.9, 0),
      at(box(0.12, 0.12, 0.02, glow("#ff8a3c", 1.1)), 0, 0.58, 0.17));
    g.add(at(pagoda, 1.05, 0, 0.75));
    return g;
  },
  wangyeTemple(anim) { // 王爺府：門口一排令旗
    const g = temple({ w: 1.9, d: 1.4, wall: "#a83a2e", plaque: "王爺府" });
    ["#e2453c", "#f2b33c", "#2f7a62", "#3d6fb6", "#1d1418"].forEach((c, i) => {
      const flag = at(box(0.2, 0.28, 0.01, c), -0.6 + i * 0.3 + 0.1, 1.5, 1.05);
      flag.geometry.translate(0.1, 0, 0);
      g.add(at(cyl(0.012, 0.012, 1.4, "#5a3a22", 3), -0.6 + i * 0.3, 0.9, 1.05), flag);
      anim.push((t) => (flag.rotation.y = Math.sin(t * 2.2 + i) * 0.4));
    });
    return g;
  },
  church() { // 小教堂：白牆、尖塔、十字架、彩色玻璃
    const g = new THREE.Group();
    g.add(at(box(1.4, 1.3, 1.8, "#f2efe6"), 0, 0.65, -0.1), at(rot(box(1.5, 0.08, 1.1, "#5a5a6a"), 0.6), 0, 1.5, 0.15), at(rot(box(1.5, 0.08, 1.1, "#5a5a6a"), -0.6), 0, 1.5, -0.35));
    g.add(at(box(0.6, 1.0, 0.6, "#f2efe6"), 0, 1.8, 0.6), at(cone(0.45, 0.9, "#5a5a6a", 4), 0, 2.75, 0.6));
    g.add(at(box(0.05, 0.4, 0.05, GOLD), 0, 3.35, 0.6), at(box(0.22, 0.05, 0.05, GOLD), 0, 3.4, 0.6));
    g.add(at(cyl(0.18, 0.18, 0.04, glow("#8ab0ff", 0.8), 12), 0, 1.8, 0.91), at(box(0.45, 0.7, 0.05, "#5a3a22"), 0, 0.35, 0.81));
    g.children.at(-2).rotation.x = Math.PI / 2;
    return g;
  },
  shanshenShrine() { // 山神祠：岩石裡的石龕，旁邊兩棵樹
    const g = new THREE.Group();
    g.add(scl(at(mesh(new THREE.DodecahedronGeometry(0.9), "#7a7468"), 0, 0.6, -0.2), 1.2, 0.9, 0.9));
    g.add(at(box(0.6, 0.6, 0.3, "#5a544a"), 0, 0.45, 0.55), at(box(0.4, 0.4, 0.05, "#2a2420"), 0, 0.45, 0.71), at(ball(0.07, glow("#ffcf4a", 0.9), 6), 0, 0.45, 0.75));
    for (const x of [-1.0, 0.9]) g.add(at(cone(0.45, 1.3, "#3f6e35", 6), x, 0.85, 0.2), at(cyl(0.06, 0.06, 0.3, "#5a4632", 4), x, 0.15, 0.2));
    g.add(at(sign("山神", 0.5, 0.2, "#1d1418", GOLD), 0, 0.88, 0.71));
    return g;
  },
  heshenShrine(anim) { // 河神廟：藍瓦小廟、門前一條石魚
    const g = temple({ w: 1.5, d: 1.2, wall: "#3a7a8a", roofC: "#2a5a7a", ridge: "#f2e6c8", plaque: "河神廟", lamp: "#8be9ff" });
    const fish = group(scl(ball(0.2, "#7ab0c0", 8), 1.6, 0.8, 0.6), rot(at(cone(0.14, 0.2, "#7ab0c0", 4), -0.35, 0, 0), 0, 0, Math.PI / 2));
    g.add(at(fish, 0, 0.45, 1.05));
    anim.push((t) => (fish.rotation.y = Math.sin(t * 1.5) * 0.3));
    return g;
  },
  dashiye(anim) { // 大士爺：高大的紙紮神像，青臉、頭頂觀音像
    const g = new THREE.Group();
    g.add(at(box(1.6, 0.35, 1.2, "#8a2a2a"), 0, 0.17, 0), at(box(1.7, 0.06, 1.3, GOLD), 0, 0.37, 0));
    const fig = new THREE.Group();
    fig.add(at(cyl(0.45, 0.6, 1.6, "#3a5a8a", 10), 0, 1.2, 0), at(box(0.9, 0.3, 0.6, "#c8433a"), 0, 1.75, 0));
    fig.add(at(ball(0.42, "#4a8a9a", 12), 0, 2.4, 0), at(box(0.12, 0.25, 0.04, "#e2627a"), 0, 2.2, 0.4));
    for (const s of [-1, 1]) fig.add(at(ball(0.08, "#ffffff", 6), s * 0.15, 2.5, 0.38), at(ball(0.04, "#1a1a1a", 6), s * 0.15, 2.5, 0.43));
    fig.add(at(cone(0.15, 0.35, "#f2e6c8", 6), 0, 3.0, 0), at(ball(0.08, GOLD, 6), 0, 2.85, 0.05));
    g.add(fig);
    g.add(at(cyl(0.2, 0.16, 0.25, "#9a6e2c", 8), 0, 0.5, 0.6));
    return g;
  },
  patrol(anim) { // 日夜巡守亭：一邊太陽燈、一邊月亮燈
    const g = new THREE.Group();
    g.add(at(cyl(0.9, 0.95, 0.18, STONE, 6), 0, 0.09, 0));
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; g.add(at(cyl(0.05, 0.05, 1.5, RED2, 6), Math.cos(a) * 0.75, 0.9, Math.sin(a) * 0.75)); }
    g.add(at(cone(1.15, 0.7, TILE, 6), 0, 1.95, 0), at(ball(0.1, GOLD, 6), 0, 2.35, 0));
    const sun = at(ball(0.18, glow("#ffb04a", 1.2), 10), -0.4, 1.3, 0.5), moon = at(ball(0.16, glow("#dfe8ff", 1.2), 10), 0.4, 1.3, 0.5);
    g.add(sun, moon);
    anim.push((t) => { sun.position.y = 1.3 + Math.sin(t) * 0.1; moon.position.y = 1.3 - Math.sin(t) * 0.1; });
    return g;
  },
  wangchuan(anim) { // 王船：彩繪船身、紅帆、令旗（停在水上）
    const g = new THREE.Group();
    const boat = new THREE.Group();
    boat.add(scl(at(mesh(new THREE.SphereGeometry(0.6, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat("#c8433a", { side: THREE.DoubleSide })), 0, 0.3, 0), 1, 0.7, 2.4));
    boat.add(at(box(1.0, 0.1, 2.4, "#f2b33c"), 0, 0.32, 0), at(box(0.6, 0.45, 0.7, "#2f7a62"), 0, 0.6, -0.4));
    boat.add(at(cyl(0.03, 0.03, 1.8, "#5a3a22", 4), 0, 1.2, 0.3), at(box(0.04, 0.9, 0.8, "#e2453c"), 0, 1.4, 0.35));
    for (let i = 0; i < 3; i++) boat.add(at(box(0.15, 0.2, 0.01, ["#f2b33c", "#3d6fb6", "#1d1418"][i]), 0.08, 2.0 - i * 0.05, 0.3 - i * 0.5));
    for (const z of [-0.9, 0.9]) boat.add(at(ball(0.07, glow("#ffd36b", 1.2), 6), 0, 0.55, z));
    g.add(at(boat, 0, -0.15, 0));
    anim.push((t) => { boat.position.y = -0.15 + Math.sin(t * 1.3) * 0.06; boat.rotation.z = Math.sin(t) * 0.05; });
    return g;
  },
};

// ---------- 系列模板 ----------
export const SHEN_TEMPLATES = {
  // 陰廊小龕：黑瓦小龕、青色燈、直式牌
  yinkan(anim, text, i) {
    const g = new THREE.Group();
    g.add(at(box(0.6, 0.15, 0.5, "#6a6478"), 0, 0.07, 0), at(box(0.5, 0.6, 0.4, "#3a3448"), 0, 0.45, -0.02));
    g.add(at(box(0.3, 0.35, 0.02, "#140f18"), 0, 0.42, 0.19), at(cone(0.45, 0.3, "#1f1c2a", 4), 0, 0.9, 0));
    g.children.at(-1).rotation.y = Math.PI / 4;
    g.add(at(ball(0.06, glow("#7ff0d6", 1.1), 6), 0, 0.45, 0.2));
    g.add(at(sign(text, 0.22, 0.6, "#1d1418", "#7ff0d6", true), 0.42, 0.45, 0.05));
    return g;
  },
  // 光明燈：一座小燈塔，一格一格亮著
  lightlamp(anim, text, i) {
    const g = new THREE.Group();
    g.add(at(box(0.6, 0.15, 0.4, STONE), 0, 0.07, 0), at(box(0.5, 1.0, 0.3, RED), 0, 0.65, 0));
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) g.add(at(box(0.16, 0.18, 0.03, glow(["#ffd36b", "#fff1d0", "#ffb04a"][(r + c + i) % 3], 0.9)), -0.1 + c * 0.2, 0.4 + r * 0.25, 0.16));
    g.add(at(cone(0.38, 0.25, TILE, 4), 0, 1.28, 0), at(sign(text, 0.5, 0.14, "#1d1418", GOLD), 0, 1.06, 0.17));
    g.children.at(-2).rotation.y = Math.PI / 4;
    return g;
  },
};

// ---------- 裝飾 ----------
export const SHEN_DECOR = {
  redLantern() { // 進香道旁的高燈柱
    return group(at(cyl(0.04, 0.05, 2.0, "#5a3a22", 5), 0, 1.0, 0), at(box(0.4, 0.04, 0.04, "#5a3a22"), 0.15, 1.95, 0),
      at(scl(ball(0.18, glow("#e2453c", 0.9), 10), 1, 1.2, 1), 0.3, 1.7, 0), at(box(0.02, 0.2, 0.02, GOLD), 0.3, 1.42, 0));
  },
  burner(anim) { // 天公爐
    const g = group(at(cyl(0.5, 0.4, 0.6, "#7a5a2a", 10), 0, 0.5, 0), at(cyl(0.12, 0.14, 0.25, "#6a4a22", 6), 0, 0.12, 0),
      at(cone(0.6, 0.5, "#9a6e2c", 10), 0, 1.05, 0), at(ball(0.1, GOLD, 6), 0, 1.35, 0));
    const smoke = [];
    for (let i = 0; i < 3; i++) { const s = ball(0.12, mat("#ffffff", { transparent: true, opacity: 0.45 }), 6); g.add(s); smoke.push(s); }
    anim.push((t) => smoke.forEach((s, i) => { const k = (t * 0.35 + i / 3) % 1; s.position.set(Math.sin(t + i) * 0.1, 1.4 + k * 1.4, 0); s.scale.setScalar(0.6 + k * 1.4); }));
    return g;
  },
  incense() { // 小香爐
    return group(at(cyl(0.18, 0.14, 0.25, "#8a6a3a", 8), 0, 0.12, 0), at(cyl(0.006, 0.006, 0.25, "#c8433a", 3), 0, 0.36, 0));
  },
};
