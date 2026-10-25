/*
 * 故事柑仔店島：人物ㄤ仔標（老街）的建築、系列模板與裝飾
 * 原點在地磚中央、正面朝 +z（門口那條路）。
 */
import * as THREE from "three";
import { mat, glow, mesh, box, cyl, ball, cone, at, group, rot, scl, sign, roof } from "./kit.js";

const BRICK = "#a5523a", CREAM = "#e6d6b0", WOODD = "#5a3e2a", WOOD = "#8a6a48", TILE = "#b8603a", GOLD = "#e2b33c";

// 亭仔腳街屋：一樓騎樓兩根柱子，二樓窗，女兒牆上招牌
function shopfront({ w = 1.9, d = 1.7, h = 2.5, wall = BRICK, trim = "#7d3b2a", text, signBg = "#1d1a17", signFg = GOLD, win = "#ffd890" }) {
  const g = new THREE.Group();
  g.add(at(box(w, h, d, wall), 0, h / 2, -0.1));
  g.add(at(box(w - 0.3, 1.05, 0.5, "#3b2b24"), 0, 0.52, d / 2 - 0.3)); // 騎樓陰影
  for (const x of [-w / 2 + 0.12, w / 2 - 0.12]) g.add(at(box(0.18, 1.1, 0.18, trim), x, 0.55, d / 2 - 0.05));
  g.add(at(box(w + 0.05, 0.14, 0.3, trim), 0, 1.12, d / 2 - 0.1));
  for (const x of [-0.42, 0.42]) g.add(at(box(0.5, 0.55, 0.05, glow(win, 0.5)), x, 1.7, d / 2 - 0.08));
  g.add(at(box(w + 0.1, 0.42, 0.22, trim), 0, h + 0.15, d / 2 - 0.15)); // 女兒牆
  if (text) g.add(at(sign(text, Math.min(w - 0.1, 0.32 * [...text].length + 0.25), 0.34, signBg, signFg), 0, h + 0.15, d / 2 - 0.02));
  return g;
}

export const TOWN_BUILDERS = {
  // 總建築：ㄤ仔標戲院，三層樓高，屋頂一張會轉的大ㄤ仔標
  theaterMain(anim) {
    const g = new THREE.Group();
    g.add(at(cyl(3.5, 3.7, 0.3, "#c9b088", 6), 0, 0.15, 0));
    g.add(at(box(4.6, 4.2, 3.2, "#e8d4a8"), 0, 2.4, -0.3));
    g.add(at(box(5.0, 0.4, 3.5, "#a5523a"), 0, 4.6, -0.3));
    for (const x of [-1.8, -0.6, 0.6, 1.8]) g.add(at(box(0.3, 3.6, 0.3, "#c8a878"), x, 2.1, 1.35));
    g.add(at(box(1.4, 1.6, 0.06, "#2a1a14"), 0, 1.1, 1.31));
    // 跑馬燈招牌
    const marquee = at(new THREE.Group(), 0, 3.1, 1.6);
    marquee.add(box(3.8, 0.8, 0.3, "#c8433a"), at(sign("ㄤ仔標戲院", 3.4, 0.56, "#c8433a", "#fff3d6"), 0, 0, 0.16));
    const bulbs = [];
    for (let i = 0; i < 18; i++) {
      const b = at(ball(0.06, glow(i % 2 ? "#ffd36b" : "#fff3d6", 1.2), 6), -1.85 + (i % 9) * 0.46, i < 9 ? 0.42 : -0.42, 0.17);
      marquee.add(b);
      bulbs.push(b);
    }
    g.add(marquee);
    anim.push((t) => bulbs.forEach((b, i) => (b.visible = Math.floor(t * 4 + i) % 3 !== 0)));
    // 電影海報
    for (const [x, c] of [[-1.2, "#3d6fb6"], [1.2, "#4f8a3c"]]) g.add(at(box(0.7, 1.0, 0.05, c), x, 1.2, 1.31), at(box(0.55, 0.3, 0.06, "#f6f1e2"), x, 1.45, 1.32));
    // 屋頂大ㄤ仔標
    g.add(at(cyl(0.06, 0.06, 1.2, "#3a2a22", 5), 0, 5.4, -0.3));
    const card = at(new THREE.Group(), 0, 6.5, -0.3);
    card.add(rot(cyl(1.0, 1.0, 0.1, "#f2b33c", 20), Math.PI / 2), rot(at(cyl(0.8, 0.8, 0.11, "#e2453c", 20), 0, 0, 0.01), Math.PI / 2));
    card.add(rot(at(cyl(0.45, 0.45, 0.12, "#fff3d6", 5), 0, 0, 0.02), Math.PI / 2));
    g.add(card);
    anim.push((t, dt) => (card.rotation.y += dt * 0.8));
    // 兩側小樓
    for (const s of [-1, 1]) g.add(at(box(1.3, 2.6, 2.4, "#d8c098"), s * 2.9, 1.3, -0.5), at(box(1.4, 0.2, 2.5, "#a5523a"), s * 2.9, 2.7, -0.5));
    return g;
  },
  teahouse() {
    const g = new THREE.Group();
    g.add(at(box(1.3, 0.08, 0.8, WOOD), 0, 0.75, 0.1), at(box(0.08, 0.75, 0.7, WOODD), -0.55, 0.37, 0.1), at(box(0.08, 0.75, 0.7, WOODD), 0.55, 0.37, 0.1));
    g.add(at(cyl(0.035, 0.035, 2.2, WOODD, 5), 0, 1.1, -0.2), at(cone(1.3, 0.55, "#e8e0c8", 10), 0, 2.3, -0.2));
    g.add(at(cyl(0.14, 0.12, 0.22, "#b0b8b0", 10), 0.3, 0.9, 0.1), rot(at(cyl(0.025, 0.02, 0.18, "#b0b8b0", 4), 0.46, 0.94, 0.1), 0, 0, -1));
    for (const x of [-0.4, -0.15]) g.add(at(cyl(0.05, 0.04, 0.08, "#f6f1e2", 6), x, 0.83, 0.15));
    for (const [x, z] of [[-0.8, 0.6], [0.8, 0.6], [0, 0.85]]) g.add(at(cyl(0.18, 0.18, 0.4, "#c94a3a", 8), x, 0.2, z));
    g.add(at(sign("老李茶攤", 0.3, 1.0, "#c94a3a", "#fff3d6", true), -0.75, 1.1, -0.2));
    return g;
  },
  herb() {
    const g = shopfront({ w: 2.0, wall: "#6b4a2f", trim: "#3a2618", text: "老藥房", win: "#ffc870" });
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) g.add(at(box(0.3, 0.22, 0.05, "#a87a4a"), -0.5 + c * 0.33, 0.3 + r * 0.27, 0.62));
    return g;
  },
  spice() {
    const g = shopfront({ w: 2.0, wall: CREAM, trim: "#8a6a3a", text: "香料行" });
    ["#4f8a3c", "#7a4a2a", "#c8433a", "#c9a86a", "#6a9a4a", "#2a2a2a"].forEach((c, i) => {
      const x = -0.75 + (i % 3) * 0.75, z = 1.05 + Math.floor(i / 3) * 0.35;
      g.add(at(cyl(0.18, 0.22, 0.4, "#c9b088", 8), x, 0.2, z), at(cyl(0.17, 0.17, 0.06, c, 8), x, 0.42, z));
    });
    return g;
  },
  fireworks(anim) {
    const g = new THREE.Group();
    g.add(at(box(1.8, 1.5, 1.5, "#7a5a4a"), 0, 0.75, -0.2), at(roof(2.1, 1.8, "#5a3a2a", "#3a2a1a", "#c8433a"), 0, 1.65, -0.2));
    g.add(at(sign("煙火", 0.8, 0.3, "#c8433a", "#fff3d6"), 0, 1.2, 0.56));
    for (let i = 0; i < 5; i++) g.add(at(cyl(0.07, 0.07, 0.5 + (i % 3) * 0.15, ["#e2453c", "#3d6fb6", "#f2b33c"][i % 3], 6), -0.6 + i * 0.3, 0.3, 0.85));
    const sparks = [];
    for (let i = 0; i < 6; i++) {
      const s = ball(0.08, glow(["#ffd36b", "#ff8aa0", "#8be9ff"][i % 3], 1.6), 5);
      g.add(s);
      sparks.push(s);
    }
    anim.push((t) => {
      const k = (t * 0.5) % 1;
      sparks.forEach((s, i) => {
        const a = (i / 6) * Math.PI * 2;
        s.position.set(Math.cos(a) * k * 1.2, 2.6 + k * 1.4 - k * k * 1.2, -0.2 + Math.sin(a) * k * 1.2);
        s.visible = k < 0.85;
      });
    });
    return g;
  },
  hospital(anim) {
    const g = new THREE.Group();
    g.add(at(box(2.1, 2.8, 1.7, "#eef0ee"), 0, 1.4, -0.1));
    for (let f = 0; f < 2; f++) for (const x of [-0.6, 0, 0.6]) g.add(at(box(0.4, 0.45, 0.05, glow("#d8f0ff", 0.4)), x, 1.0 + f * 1.0, 0.76));
    g.add(at(box(0.6, 0.85, 0.06, "#7ac0c8"), 0, 0.42, 0.76));
    const cross = group(box(0.5, 0.16, 0.08, glow("#e2453c", 1.2)), box(0.16, 0.5, 0.08, glow("#e2453c", 1.2)));
    g.add(at(cross, 0, 3.1, 0.6));
    anim.push((t) => cross.scale.setScalar(1 + Math.sin(t * 3) * 0.05));
    return g;
  },
  smallTemple() {
    const g = new THREE.Group();
    g.add(at(box(2.0, 0.25, 1.8, "#a5523a"), 0, 0.12, 0));
    g.add(at(box(1.5, 1.2, 1.2, "#c4473a"), 0, 0.85, -0.2), at(box(0.6, 0.85, 0.05, "#3a1f17"), 0, 0.68, 0.41));
    g.add(at(roof(2.0, 1.8, "#d9822b", "#2f7a62", "#2f7a62"), 0, 1.6, -0.2));
    g.add(at(sign("福德祠", 0.8, 0.24, "#1d1418", GOLD), 0, 1.3, 0.42));
    g.add(at(cyl(0.28, 0.22, 0.4, "#7a5a2a", 8), 0, 0.45, 0.8), at(cone(0.32, 0.3, "#9a6e2c", 8), 0, 0.8, 0.8));
    for (const x of [-0.7, 0.7]) g.add(at(ball(0.13, glow("#e2453c", 0.8), 8), x, 1.25, 0.5));
    return g;
  },
  stage() { // 老劇場：紅布幕、海報
    const g = new THREE.Group();
    g.add(at(box(2.1, 2.4, 1.7, "#5a3a4a"), 0, 1.2, -0.1));
    g.add(at(box(1.7, 1.3, 0.1, "#b8322a"), 0, 0.95, 0.76));
    for (let i = 0; i < 6; i++) g.add(at(box(0.04, 1.3, 0.05, "#8a2222"), -0.7 + i * 0.28, 0.95, 0.82));
    g.add(at(box(2.2, 0.35, 0.25, GOLD), 0, 1.75, 0.8), at(sign("老劇場", 1.0, 0.3, "#2a1a24", GOLD), 0, 2.15, 0.76));
    for (const x of [-1.15, 1.15]) g.add(at(box(0.05, 0.8, 0.5, "#f6f1e2"), x, 0.9, 0.4));
    return g;
  },
  storyhall() { // 說書茶樓：兩層樓、陽台、燈籠
    const g = new THREE.Group();
    g.add(at(box(2.0, 1.2, 1.6, "#8a5a3a"), 0, 0.6, -0.1), at(box(1.8, 1.0, 1.4, "#9a6a4a"), 0, 1.75, -0.2));
    g.add(at(box(2.1, 0.08, 0.5, WOODD), 0, 1.25, 0.75), at(box(2.1, 0.3, 0.04, WOODD), 0, 1.4, 0.98));
    g.add(at(roof(2.3, 1.9, "#3a3430", "#2a2420", "#c8433a"), 0, 2.4, -0.2));
    g.add(at(sign("說書茶樓", 1.2, 0.28, "#1d1a17", GOLD), 0, 0.95, 0.72));
    for (const x of [-0.8, 0.8]) g.add(at(cyl(0.12, 0.12, 0.28, glow("#e2453c", 0.9), 8), x, 1.0, 0.95));
    return g;
  },
  apartment() { // 城市公寓：四樓、鐵窗、冷氣機、晾衣服
    const g = new THREE.Group();
    g.add(at(box(2.0, 4.0, 1.6, "#c8c2b0"), 0, 2.0, -0.1));
    for (let f = 0; f < 4; f++) {
      for (const x of [-0.5, 0.5]) {
        const lit = (f + (x > 0 ? 1 : 0)) % 2 === 0;
        g.add(at(box(0.55, 0.5, 0.05, lit ? glow("#ffd890", 0.8) : mat("#4a5060")), x, 0.6 + f * 0.95, 0.71));
        g.add(at(box(0.62, 0.55, 0.12, mat("#3a3e46", { wireframe: true })), x, 0.6 + f * 0.95, 0.78));
      }
      g.add(at(box(0.35, 0.25, 0.22, "#e8e8e8"), 0.95, 0.4 + f * 0.95, 0.65));
    }
    g.add(at(cyl(0.2, 0.2, 0.4, "#5a8ab0", 8), 0.5, 4.2, -0.4)); // 屋頂水塔
    g.add(at(box(0.9, 0.02, 0.02, "#d8d8d8"), -0.3, 3.6, 0.95));
    ["#e2453c", "#3d6fb6", "#f6f1e2"].forEach((c, i) => g.add(at(box(0.18, 0.3, 0.02, c), -0.6 + i * 0.3, 3.42, 0.95)));
    return g;
  },
  backyard() { // 柑仔店後院：竹籬、晾衣繩、板凳、舊行李箱
    const g = new THREE.Group();
    for (let i = 0; i < 9; i++) g.add(at(box(0.06, 0.8, 0.06, "#b7955a"), -1.0 + i * 0.25, 0.4, -0.85));
    g.add(at(box(2.1, 0.04, 0.04, "#8a6a48"), 0, 0.65, -0.85));
    for (const x of [-0.9, 0.9]) g.add(at(cyl(0.03, 0.03, 1.4, WOODD, 4), x, 0.7, -0.3));
    g.add(at(box(1.8, 0.01, 0.01, "#e8e8e8"), 0, 1.35, -0.3));
    ["#c23a4e", "#f4f1e6", "#3f8a72", "#2e3b4e"].forEach((c, i) => g.add(at(box(0.3, 0.42, 0.02, c), -0.6 + i * 0.4, 1.12, -0.3)));
    g.add(at(box(1.0, 0.08, 0.3, WOOD), -0.3, 0.4, 0.5), at(box(0.08, 0.4, 0.26, WOODD), -0.7, 0.2, 0.5), at(box(0.08, 0.4, 0.26, WOODD), 0.1, 0.2, 0.5));
    g.add(at(box(0.6, 0.35, 0.4, "#8a5a3a"), 0.6, 0.18, 0.5));
    g.add(at(sign("柑仔店後院", 0.3, 1.0, "#c8433a", "#fff3d6", true), 1.0, 0.5, -0.8));
    return g;
  },
  cemetery() { // 老墓園：墓龜、墓碑、守墓小屋
    const g = new THREE.Group();
    [[-0.6, -0.4], [0.5, -0.5], [-0.1, 0.3], [0.7, 0.5]].forEach(([x, z], i) => {
      g.add(scl(at(ball(0.35, "#7a8a5a", 8), x, 0.05, z), 1.2, 0.5, 1));
      g.add(at(box(0.32, 0.45, 0.08, "#9a96a0"), x, 0.25, z + 0.3));
    });
    g.add(at(box(0.7, 0.7, 0.6, "#6a5a4a"), -0.8, 0.35, 0.7), at(cone(0.6, 0.35, "#4a3a2a", 4), -0.8, 0.88, 0.7));
    g.add(at(cyl(0.08, 0.08, 0.16, glow("#ffd36b", 1), 6), -0.45, 0.6, 0.95));
    return g;
  },
  mountain() { // 山溪口：小山、溪水、救火隊瞭望台
    const g = new THREE.Group();
    g.add(at(cone(1.1, 1.8, "#4f7a3c", 7), -0.4, 0.9, -0.4), at(cone(0.8, 1.3, "#5d8a46", 7), 0.6, 0.65, -0.6));
    g.add(at(box(0.35, 0.04, 2.0, mat("#5ab0d0", { roughness: 0.2 })), 0.2, 0.03, 0.2, 0.4));
    for (const [x, z] of [[-0.9, 0.5], [-0.6, 0.6]]) g.add(at(cyl(0.04, 0.04, 1.6, WOODD, 4), x, 0.8, z));
    g.add(at(box(0.6, 0.06, 0.4, WOOD), -0.75, 1.6, 0.55), at(cone(0.45, 0.35, "#c8433a", 4), -0.75, 1.9, 0.55));
    return g;
  },
  harbor(anim) { // 漁港：碼頭、彩色漁船
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) g.add(at(box(0.8, 0.1, 0.4, i % 2 ? "#7a5c3e" : "#6a4e34"), 0, 0.35, 0.9 - i * 0.45));
    const boat = new THREE.Group();
    boat.add(at(box(0.7, 0.35, 1.6, "#3d6fb6"), 0, 0.15, 0), at(box(0.72, 0.1, 1.62, "#e2453c"), 0, 0.36, 0));
    boat.add(at(box(0.45, 0.4, 0.5, "#f6f1e2"), 0, 0.6, -0.2), at(cyl(0.02, 0.02, 0.9, WOODD, 4), 0, 0.95, 0.4));
    for (let i = 0; i < 3; i++) boat.add(at(ball(0.06, glow("#ffd36b", 1.3), 6), 0, 1.3 - i * 0.15, 0.4 + i * 0.1));
    g.add(at(boat, 0.9, -0.1, -0.2));
    anim.push((t) => {
      boat.position.y = -0.1 + Math.sin(t * 1.4) * 0.05;
      boat.rotation.z = Math.sin(t * 1.1) * 0.05;
    });
    return g;
  },
};

// ---------- 系列模板 ----------
const STALL = ["#c94a3a", "#3d6fb6", "#f2a03a", "#4f8a3c", "#8a4a8a"];
const HOUSES = [[BRICK, "#7d3b2a"], [CREAM, "#b29b72"], ["#c98a5a", "#94613d"], ["#7aa8a0", "#4a7a72"], ["#d8a8a0", "#a87a72"]];
export const TOWN_TEMPLATES = {
  // 夜市小吃攤：推車、遮雨棚、燈泡、直式招牌
  stall(anim, text, i) {
    const g = new THREE.Group();
    const c = STALL[i % STALL.length];
    g.add(at(box(0.9, 0.6, 0.5, c), 0, 0.42, 0), at(box(0.95, 0.04, 0.55, "#f2e6c8"), 0, 0.74, 0));
    for (const x of [-0.4, 0.4]) g.add(at(cyl(0.02, 0.02, 0.9, "#5a4632", 4), x, 1.15, -0.2));
    g.add(rot(at(box(1.05, 0.04, 0.6, i % 2 ? "#f6f1e2" : c), 0, 1.6, 0), 0.2));
    g.add(at(ball(0.08, glow("#ffd36b", 1.3), 6), 0, 1.45, 0.1));
    g.add(at(sign(text, 0.26, 0.7, "#fff3d6", "#8a2a2a", true), 0.36, 1.05, 0.28));
    g.add(at(cyl(0.12, 0.12, 0.08, ["#f2e6c8", "#8a5a2a", "#e2c36a"][i % 3], 8), -0.18, 0.8, 0));
    for (const x of [-0.3, 0.3]) g.add(at(cyl(0.12, 0.12, 0.3, "#c94a3a", 6), x, 0.15, 0.55));
    for (const x of [-0.3, 0.3]) {
      const w = rot(at(cyl(0.12, 0.12, 0.05, "#2e2a26", 8), x, 0.12, -0.27), Math.PI / 2);
      g.add(w);
    }
    return g;
  },
  // 亭仔腳店面：每一間顏色不同，招牌寫篇名
  shophouse(anim, text, i) {
    const [wall, trim] = HOUSES[i % HOUSES.length];
    const g = shopfront({ wall, trim, text, h: 2.2 + (i % 3) * 0.35 });
    return g;
  },
  // 廟埕民俗桌：紅桌巾、香爐、水果、紅紙直條
  folk(anim, text, i) {
    const g = new THREE.Group();
    g.add(at(box(0.8, 0.5, 0.5, "#c8433a"), 0, 0.25, 0), at(box(0.85, 0.04, 0.55, "#8a2a2a"), 0, 0.52, 0));
    g.add(at(cyl(0.08, 0.07, 0.1, "#9a6e2c", 8), 0, 0.6, -0.08));
    for (const x of [-0.02, 0.02]) g.add(at(cyl(0.006, 0.006, 0.22, "#c8433a", 3), x, 0.74, -0.08));
    g.add(at(ball(0.06, "#f2a03a", 6), -0.25, 0.6, 0.05), at(ball(0.06, "#e2453c", 6), 0.25, 0.6, 0.05));
    g.add(at(cyl(0.02, 0.02, 1.0, "#5a3a22", 4), 0.45, 0.5, -0.15), at(sign(text, 0.24, 0.7, "#c8433a", "#fff3d6", true), 0.45, 1.05, -0.1));
    return g;
  },
  // 節慶燈架：一根竿子、一盞大紅燈籠、一面直式旗
  festival(anim, text, i) {
    const g = new THREE.Group();
    g.add(at(cyl(0.035, 0.04, 1.9, "#5a3a22", 5), 0, 0.95, 0), at(box(0.5, 0.04, 0.04, "#5a3a22"), 0.2, 1.85, 0));
    const lamp = at(new THREE.Group(), 0.42, 1.55, 0);
    lamp.add(scl(ball(0.22, glow(["#e2453c", "#f2b33c", "#ff8aa0"][i % 3], 1.0), 12), 1, 0.85, 1));
    lamp.add(at(cyl(0.1, 0.1, 0.05, GOLD, 8), 0, 0.2, 0), at(cyl(0.1, 0.1, 0.05, GOLD, 8), 0, -0.2, 0), at(box(0.02, 0.3, 0.02, GOLD), 0, -0.38, 0));
    g.add(lamp);
    g.add(at(sign(text, 0.24, 0.6, "#c8433a", GOLD, true), -0.15, 1.2, 0.03));
    const ph = i * 0.9;
    anim.push((t) => (lamp.rotation.z = Math.sin(t * 1.3 + ph) * 0.1));
    return g;
  },
  // 鐵道站牌：白底藍條的站名牌
  station(anim, text, i) {
    const g = new THREE.Group();
    for (const x of [-0.45, 0.45]) g.add(at(cyl(0.03, 0.03, 1.3, "#2a3a5a", 4), x, 0.65, 0));
    g.add(at(box(1.1, 0.5, 0.05, "#f6f6f2"), 0, 1.2, 0), at(box(1.1, 0.08, 0.06, "#2a5aa8"), 0, 0.98, 0));
    g.add(at(sign(text, 1.0, 0.32, "#f6f6f2", "#1a1a1a"), 0, 1.24, 0.03));
    return g;
  },
  // ㄤ仔標：立在巷口的一張大圓牌（沒有歸類的故事）
  angbiao(anim, text, i) {
    const g = new THREE.Group();
    g.add(at(cyl(0.03, 0.03, 0.9, "#5a3a22", 4), 0, 0.45, 0));
    const c = ["#f2b33c", "#3d6fb6", "#4f8a3c", "#e2453c"][i % 4];
    g.add(rot(at(cyl(0.38, 0.38, 0.05, c, 16), 0, 1.15, 0), Math.PI / 2), rot(at(cyl(0.3, 0.3, 0.06, "#fff3d6", 16), 0, 1.15, 0.01), Math.PI / 2));
    g.add(at(sign(text, 0.5, 0.16, "#fff3d6", "#2a2118"), 0, 1.15, 0.05));
    return g;
  },
};

// ---------- 裝飾 ----------
export const TOWN_DECOR = {
  tree() {
    const g = group(at(cyl(0.08, 0.11, 0.9, "#6e5a44", 5), 0, 0.45, 0));
    g.add(scl(at(ball(0.55, "#4f8a3c", 7), 0, 1.15, 0), 1, 0.85, 1), at(ball(0.35, "#5d9a46", 6), 0.25, 1.4, 0.1));
    return g;
  },
  scooter() { // 停在路邊的機車
    const c = ["#e2453c", "#3d6fb6", "#f6f1e2", "#2e2e2e"][Math.floor(Math.random() * 4)];
    const g = new THREE.Group();
    g.add(at(box(0.25, 0.25, 0.75, c), 0, 0.3, 0), at(box(0.22, 0.12, 0.3, "#1a1a1a"), 0, 0.48, -0.12), at(cyl(0.02, 0.02, 0.4, "#5a5a5a", 4), 0, 0.55, 0.32));
    for (const z of [-0.3, 0.3]) g.add(rot(at(cyl(0.14, 0.14, 0.08, "#1a1a1a", 10), 0, 0.14, z), 0, 0, Math.PI / 2));
    return g;
  },
  potted() {
    return group(at(cyl(0.16, 0.12, 0.25, "#b8603a", 8), 0, 0.12, 0), at(ball(0.22, "#5d9a46", 6), 0, 0.38, 0));
  },
};
