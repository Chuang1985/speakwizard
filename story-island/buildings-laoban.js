/*
 * 故事柑仔店島：老闆的地盤（講古、碎碎念、藥街＋報刊樓）的建築、模板與裝飾
 * 原點在地磚中央、正面朝 +z。
 */
import * as THREE from "three";
import { mat, glow, mesh, box, cyl, ball, cone, at, group, rot, scl, sign, roof } from "./kit.js";

const WOOD = "#8a6a48", WOODD = "#5a3e2a", STONE = "#c9b088", GOLD = "#e2b33c", INK = "#2a2830", BRICK = "#a5523a";

function hall({ w = 1.8, d = 1.4, h = 1.0, wall = "#e8dcc0", roofC = "#3a3430", plaque, signBg = INK, signFg = "#efe8da" }) {
  const g = new THREE.Group();
  g.add(at(box(w + 0.25, 0.18, d + 0.25, STONE), 0, 0.09, 0), at(box(w, h, d, wall), 0, 0.18 + h / 2, -0.05));
  g.add(at(box(w * 0.35, h * 0.7, 0.05, WOODD), 0, 0.18 + h * 0.35, d / 2 - 0.03));
  for (const x of [-w / 2 + 0.1, w / 2 - 0.1]) g.add(at(cyl(0.06, 0.06, h, "#8a2a2a", 6), x, 0.18 + h / 2, d / 2 + 0.08));
  g.add(at(roof(w + 0.4, d + 0.5, roofC, "#2a2420", "#2a2420"), 0, 0.18 + h + 0.16, -0.05));
  if (plaque) g.add(at(sign(plaque, Math.min(w - 0.1, 0.27 * [...plaque].length + 0.2), 0.26, signBg, signFg), 0, 0.18 + h * 0.86, d / 2 + 0.03));
  return g;
}

export const LAOBAN_BUILDERS = {
  // 總建築：老闆的家，兩層透天厝，二樓書房亮著燈，屋頂水塔，門口一張藤椅和茶几
  bossHome(anim) {
    const g = new THREE.Group();
    g.add(at(cyl(3.3, 3.5, 0.3, STONE, 6), 0, 0.15, 0));
    g.add(at(box(3.4, 2.2, 2.6, "#e6d6b0"), 0, 1.4, -0.3), at(box(3.2, 1.8, 2.4, "#d8c8a0"), 0, 3.4, -0.4));
    g.add(at(box(3.6, 0.18, 2.9, BRICK), 0, 2.55, -0.25), at(box(3.4, 0.18, 2.6, BRICK), 0, 4.35, -0.4));
    g.add(at(box(1.0, 1.4, 0.05, WOODD), -0.6, 1.0, 1.01), at(box(0.9, 0.7, 0.05, glow("#ffd890", 0.5)), 0.8, 1.5, 1.01));
    const study = at(box(1.4, 0.9, 0.05, glow("#ffcf6b", 1.2)), 0.3, 3.4, 0.81);
    g.add(study);
    for (let i = 0; i < 5; i++) g.add(at(box(0.04, 0.95, 0.06, "#3a3e46"), -0.3 + i * 0.3, 3.4, 0.86)); // 鐵窗
    for (let i = 0; i < 4; i++) g.add(at(box(0.18, 0.5, 0.04, ["#c8433a", "#3d6fb6", "#4f8a3c", "#f2b33c"][i]), -0.15 + i * 0.2, 3.3, 0.79)); // 書架上的書
    g.add(at(cyl(0.45, 0.45, 0.8, "#5a8ab0", 10), 1.0, 4.85, -0.8), at(cyl(0.04, 0.04, 0.6, "#8a8a92", 4), 1.0, 4.4, -0.8));
    g.add(at(sign("老闆的家", 1.3, 0.32, "#c8433a", "#fff3d6"), 0, 2.2, 1.1));
    const chair = group(at(box(0.5, 0.06, 0.45, "#c9a86a"), 0, 0.42, 0), at(rot(box(0.5, 0.5, 0.06, "#c9a86a"), -0.2), 0, 0.7, -0.22));
    g.add(at(chair, 1.2, 0.3, 1.8), at(cyl(0.22, 0.22, 0.05, WOOD, 10), 0.5, 0.75, 1.9), at(cyl(0.05, 0.05, 0.45, WOODD, 4), 0.5, 0.52, 1.9));
    return g;
  },
  // 語巫報刊樓：四層樓，每一層一排報架，屋頂大招牌
  newsTower(anim) {
    const g = new THREE.Group();
    g.add(at(box(2.1, 0.2, 2.0, STONE), 0, 0.1, 0));
    const floors = 4;
    for (let f = 0; f < floors; f++) {
      const y = 0.2 + f * 1.15;
      g.add(at(box(1.9, 1.1, 1.8, f % 2 ? "#3f7d6a" : "#4a8a76"), 0, y + 0.55, 0));
      g.add(at(box(2.0, 0.08, 1.9, "#2f5e50"), 0, y + 1.12, 0));
      g.add(at(box(1.7, 0.7, 0.05, "#2a2420"), 0, y + 0.5, 0.91)); // 報架背板
      for (let i = 0; i < 6; i++) // 一份份報紙、雜誌封面
        g.add(rot(at(box(0.24, 0.32, 0.03, ["#f6f1e2", "#e2453c", "#f2b33c", "#3d6fb6", "#f6f1e2", "#4f8a3c"][(i + f) % 6]), -0.65 + i * 0.26, y + 0.5, 0.95), -0.15, 0, 0));
      g.add(at(sign(`第${["一", "二", "三", "四"][f]}層`, 0.5, 0.16, "#2f5e50", "#fff3d6"), 0.65, y + 0.98, 0.92));
    }
    const top = 0.2 + floors * 1.15;
    g.add(at(box(2.3, 0.6, 0.15, "#2f5e50"), 0, top + 0.4, 0.3), at(sign("語巫故事報", 2.1, 0.5, "#f6f1e2", "#2f5e50"), 0, top + 0.4, 0.39));
    const roll = rot(at(cyl(0.18, 0.18, 1.6, "#f6f1e2", 12), 0, top + 0.2, -0.4), 0, 0, Math.PI / 2);
    g.add(roll);
    anim.push((t, dt) => (roll.rotation.x += dt * 1.2));
    return g;
  },
  // 孔子杏壇：粉紅杏花樹下的講台
  xingtan() {
    const g = new THREE.Group();
    g.add(at(box(1.8, 0.3, 1.4, STONE), 0, 0.15, 0), at(box(1.2, 0.08, 0.8, "#c8433a"), 0, 0.34, 0.1));
    g.add(at(box(0.5, 0.3, 0.3, WOOD), 0, 0.5, -0.2), at(box(0.3, 0.02, 0.2, "#d8c28a"), 0, 0.66, -0.2));
    g.add(at(cyl(0.12, 0.18, 1.4, "#6e5a44", 6), -0.65, 0.95, -0.4));
    for (const [x, y, z, r] of [[-0.65, 1.8, -0.4, 0.6], [-0.2, 1.65, -0.5, 0.4], [-0.95, 1.6, -0.1, 0.4]]) g.add(at(scl(ball(r, "#f2b8c8", 7), 1, 0.8, 1), x, y, z));
    g.add(at(sign("杏壇", 0.5, 0.2, INK, "#efe8da"), 0.5, 0.5, 0.7));
    return g;
  },
  mengziHall() { // 孟子書院：門口兩座辯論台
    const g = hall({ plaque: "孟子書院" });
    for (const x of [-0.75, 0.75]) g.add(at(box(0.35, 0.6, 0.3, WOOD), x, 0.3, 1.05), at(box(0.4, 0.04, 0.35, WOODD), x, 0.62, 1.05));
    return g;
  },
  laoziPavilion() { // 老子青牛亭：涼亭＋一頭青牛＋葫蘆
    const g = new THREE.Group();
    g.add(at(cyl(0.95, 1.0, 0.15, STONE, 6), 0, 0.08, 0));
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + Math.PI / 4; g.add(at(cyl(0.05, 0.05, 1.3, "#5a3a2a", 6), Math.cos(a) * 0.68, 0.75, Math.sin(a) * 0.68)); }
    g.add(rot(at(cone(1.15, 0.6, "#2f5e50", 4), 0, 1.7, 0), 0, Math.PI / 4, 0));
    const ox = group(scl(at(ball(0.35, "#3a4a5a", 8), 0, 0.45, 0), 1.5, 0.9, 0.9), at(ball(0.2, "#3a4a5a", 8), 0.5, 0.6, 0));
    for (const z of [-0.12, 0.12]) ox.add(rot(at(cone(0.04, 0.2, "#e8e0c8", 4), 0.55, 0.8, z), z * 4, 0, -0.4));
    for (const [x, z] of [[-0.3, -0.15], [-0.3, 0.15], [0.3, -0.15], [0.3, 0.15]]) ox.add(at(cyl(0.05, 0.05, 0.3, "#3a4a5a", 5), x, 0.15, z));
    g.add(at(ox, 0.1, 0.15, 0.1));
    g.add(at(scl(ball(0.1, "#c9a86a", 8), 1, 1.2, 1), -0.5, 0.35, 0.4), at(ball(0.07, "#c9a86a", 6), -0.5, 0.5, 0.4));
    return g;
  },
  xunhanSchool() { // 荀韓學舍：兩間相連的學舍
    const g = hall({ w: 2.0, plaque: "荀韓學舍", wall: "#d8ccb0" });
    g.add(at(box(0.05, 1.0, 1.4, "#8a2a2a"), 0, 0.68, -0.05));
    return g;
  },
  zhuangziStall(anim) { // 莊子天橋說書攤：一座小拱橋，橋下一張說書桌，蝴蝶飛來飛去
    const g = new THREE.Group();
    g.add(rot(at(mesh(new THREE.TorusGeometry(1.0, 0.18, 6, 14, Math.PI), "#b4a890"), 0, 0, -0.3), 0, 0, 0));
    g.add(at(box(2.4, 0.12, 0.7, "#b4a890"), 0, 1.05, -0.3));
    g.add(at(box(0.7, 0.45, 0.4, WOOD), 0, 0.22, 0.4), at(box(0.15, 0.06, 0.08, WOODD), 0.15, 0.48, 0.4));
    g.add(at(sign("說書", 0.24, 0.5, "#c8433a", "#fff3d6", true), -0.5, 0.45, 0.6));
    const flies = [];
    for (let i = 0; i < 3; i++) {
      const b = group(rot(box(0.12, 0.01, 0.08, glow(["#8be9ff", "#ffcf4a", "#ff8ab0"][i], 0.8)), 0, 0, 0.5), rot(box(0.12, 0.01, 0.08, glow(["#8be9ff", "#ffcf4a", "#ff8ab0"][i], 0.8)), 0, 0, -0.5));
      g.add(b);
      flies.push(b);
    }
    anim.push((t) => flies.forEach((b, i) => {
      b.position.set(Math.sin(t * 0.8 + i * 2) * 0.8, 0.8 + Math.sin(t * 1.7 + i) * 0.3, 0.5 + Math.cos(t * 0.8 + i * 2) * 0.4);
      b.children[0].rotation.z = 0.2 + Math.abs(Math.sin(t * 12 + i)) * 0.8;
      b.children[1].rotation.z = -b.children[0].rotation.z;
    }));
    return g;
  },
  moziWorkshop(anim) { // 墨子機關工坊：木造工坊、兩個會轉的大齒輪、一座守城弩
    const g = hall({ w: 1.9, plaque: "墨家", wall: "#8a6a4a", roofC: "#4a3a2a", signBg: "#1d1418", signFg: GOLD });
    const gears = [];
    for (const [x, r, dir] of [[-0.9, 0.45, 1], [-0.25, 0.3, -1]]) {
      const gear = at(new THREE.Group(), x, 1.35, 0.85);
      gear.add(rot(cyl(r, r, 0.1, "#a87a4a", 12), Math.PI / 2));
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; gear.add(at(box(0.1, 0.1, 0.1, "#8a6a48"), Math.cos(a) * r, Math.sin(a) * r, 0)); }
      g.add(gear);
      gears.push([gear, dir]);
    }
    anim.push((t, dt) => gears.forEach(([gr, d]) => (gr.rotation.z += dt * d * 0.8)));
    const bow = group(at(box(0.8, 0.08, 0.1, WOODD), 0, 0.5, 0), at(rot(mesh(new THREE.TorusGeometry(0.45, 0.03, 4, 10, Math.PI), "#5a3a22"), 0, 0, -Math.PI / 2), 0.35, 0.5, 0),
      at(box(0.06, 0.5, 0.06, WOODD), 0, 0.25, 0));
    g.add(at(bow, 0.75, 0, 1.0, -0.5));
    return g;
  },
  zouyanObservatory(anim) { // 騶衍觀星台：石階台座上一座會轉的渾天儀
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) g.add(at(box(1.8 - i * 0.45, 0.3, 1.8 - i * 0.45, i % 2 ? "#a89c84" : STONE), 0, 0.15 + i * 0.3, 0));
    const sphere = at(new THREE.Group(), 0, 1.5, 0);
    for (let i = 0; i < 3; i++) { const ring = mesh(new THREE.TorusGeometry(0.45, 0.03, 4, 20), GOLD); ring.rotation.set(i * 1.0, i * 0.6, 0); sphere.add(ring); }
    sphere.add(ball(0.1, glow("#8ab0ff", 1.0), 8));
    g.add(sphere, at(cyl(0.04, 0.06, 0.4, GOLD, 5), 0, 1.0, 0));
    anim.push((t, dt) => { sphere.rotation.y += dt * 0.4; sphere.rotation.x = Math.sin(t * 0.3) * 0.3; });
    return g;
  },
  liziRange(anim) { // 列子射箭場：兩個箭靶、弓架，一條隨風飄的彩帶
    const g = new THREE.Group();
    for (const x of [-0.6, 0.6]) {
      g.add(at(cyl(0.03, 0.03, 0.9, WOODD, 4), x, 0.45, -0.4));
      for (const [r, c] of [[0.35, "#f6f1e2"], [0.25, "#e2453c"], [0.12, "#f2b33c"]]) g.add(rot(at(cyl(r, r, 0.05 + (0.35 - r) * 0.1, c, 14), x, 0.95, -0.4), Math.PI / 2));
    }
    g.add(at(box(0.7, 0.06, 0.15, WOOD), 0, 0.6, 0.7), at(box(0.06, 0.6, 0.15, WOODD), -0.3, 0.3, 0.7), at(box(0.06, 0.6, 0.15, WOODD), 0.3, 0.3, 0.7));
    g.add(at(cyl(0.02, 0.02, 1.8, WOODD, 4), 0.9, 0.9, 0.5));
    const ribbon = at(box(0.6, 0.1, 0.01, "#8be9ff"), 1.2, 1.7, 0.5);
    ribbon.geometry.translate(0.3, 0, 0);
    g.add(ribbon);
    anim.push((t) => { ribbon.rotation.y = Math.sin(t * 2) * 0.6; ribbon.rotation.z = Math.sin(t * 3) * 0.2; });
    return g;
  },
  kaimingGate() { // 開明獸門：石門，門頂一頭九個頭的開明獸
    const g = new THREE.Group();
    for (const s of [-1, 1]) g.add(at(box(0.4, 1.8, 0.5, "#8a8478"), s * 0.85, 0.9, 0));
    g.add(at(box(2.2, 0.35, 0.6, "#7a7468"), 0, 1.95, 0));
    const beast = group(scl(at(ball(0.4, "#c8a050", 8), 0, 0, 0), 1.4, 0.8, 0.9));
    for (let i = 0; i < 9; i++) {
      const a = -1.2 + (i / 8) * 2.4;
      beast.add(at(ball(0.12, "#d8b060", 8), Math.sin(a) * 0.45, 0.35 + Math.cos(a) * 0.2, 0.15), at(ball(0.025, "#1a1212", 4), Math.sin(a) * 0.45, 0.37 + Math.cos(a) * 0.2, 0.26));
    }
    g.add(at(beast, 0, 2.45, 0), at(sign("開明", 0.5, 0.2, INK, GOLD), 0, 1.95, 0.31));
    return g;
  },
  herbTreasure() { // 中藥行尋寶館：百子櫃、藥船、炒藥鍋
    const g = new THREE.Group();
    g.add(at(box(2.0, 1.8, 1.4, "#6b4a2f"), 0, 0.9, -0.3), at(box(2.3, 0.18, 1.7, "#3a3430"), 0, 1.9, -0.2));
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
      g.add(at(box(0.26, 0.24, 0.06, "#a87a4a"), -0.72 + c * 0.29, 0.35 + r * 0.3, 0.42));
      g.add(at(ball(0.025, GOLD, 4), -0.72 + c * 0.29, 0.35 + r * 0.3, 0.46));
    }
    g.add(at(sign("百子櫃", 1.0, 0.26, "#1d1a17", GOLD), 0, 1.6, 0.42));
    g.add(at(scl(box(0.9, 0.22, 0.3, "#5a5048"), 1, 1, 1), 0.3, 0.11, 1.0), rot(at(cyl(0.2, 0.2, 0.05, "#7a706a", 12), 0.3, 0.3, 1.0), Math.PI / 2));
    g.add(at(cyl(0.25, 0.2, 0.2, "#2a2a2a", 10), -0.6, 0.4, 1.0), at(cyl(0.12, 0.15, 0.3, "#8a6a48", 6), -0.6, 0.15, 1.0));
    return g;
  },
};

// ---------- 系列模板 ----------
const HOUSE = ["#5a6478", "#6a5a70", "#4a5a68", "#706058", "#586a6a"];
export const LAOBAN_TEMPLATES = {
  // 深夜小屋：窄窄的兩層小屋，一扇亮燈的窗，門邊一條直式小招牌
  nightWindow(anim, text, i) {
    const g = new THREE.Group();
    const h = 1.6 + (i % 3) * 0.35;
    g.add(at(box(1.1, h, 1.0, HOUSE[i % HOUSE.length]), 0, h / 2, -0.1));
    g.add(at(rot(box(1.25, 0.08, 0.75, "#3a3e46"), 0.45), 0, h + 0.15, 0.1), at(rot(box(1.25, 0.08, 0.75, "#3a3e46"), -0.45), 0, h + 0.15, -0.35));
    g.add(at(box(0.4, 0.4, 0.05, glow(["#ffcf6b", "#ffe0a0", "#ffb860"][i % 3], 1.1)), 0.15, h - 0.5, 0.41));
    for (let k = 0; k < 3; k++) g.add(at(box(0.03, 0.42, 0.04, "#2a2e36"), 0.05 + k * 0.1, h - 0.5, 0.44));
    g.add(at(box(0.3, 0.6, 0.05, "#3a2a22"), -0.3, 0.3, 0.41));
    g.add(at(sign(text, 0.2, 0.62, "#1d1a17", "#ffcf6b", true), -0.42, 1.0, 0.44));
    return g;
  },
  // 百年中藥行：木造店面、黑底金字匾額（寫地名）、一排藥櫃、門口掛藥草
  herbShop(anim, text, i, p) {
    const g = new THREE.Group();
    const place = (p?.t || text).match(/(高雄|宜蘭|迪化街|雙溪|新竹|內湖|嘉義|朴子|溪口)/)?.[0] || text.slice(0, 3);
    g.add(at(box(1.6, 1.4, 1.2, ["#6b4a2f", "#5a3e2a", "#7a5a3a"][i % 3]), 0, 0.7, -0.15));
    g.add(at(box(1.8, 0.14, 1.4, "#3a3430"), 0, 1.47, -0.1));
    g.add(at(box(1.3, 0.8, 0.05, "#3a2618"), 0, 0.55, 0.46));
    for (let c = 0; c < 4; c++) for (let r = 0; r < 2; r++) g.add(at(box(0.26, 0.2, 0.05, "#a87a4a"), -0.45 + c * 0.3, 0.35 + r * 0.25, 0.49));
    g.add(at(sign(place, 1.0, 0.26, "#1d1a17", GOLD), 0, 1.15, 0.47));
    for (const x of [-0.6, 0.6]) g.add(at(scl(ball(0.08, "#7a8a4a", 6), 1, 1.6, 1), x, 0.95, 0.6));
    return g;
  },
  // 神話大道雕像：石台座上一尊石像，手上拿著代表物
  heroMonument(anim, text, i, p) {
    const g = new THREE.Group();
    g.add(at(box(0.6, 0.35, 0.6, "#8a8478"), 0, 0.17, 0));
    g.add(at(cone(0.28, 0.9, "#b4ae9e", 8), 0, 0.8, 0), at(ball(0.16, "#b4ae9e", 8), 0, 1.35, 0));
    const t = p?.t || text;
    if (/后羿/.test(t)) g.add(at(rot(mesh(new THREE.TorusGeometry(0.3, 0.025, 4, 10, Math.PI), "#9a968c"), 0, 0, -Math.PI / 2), 0.2, 0.9, 0.1));
    else if (/夸父/.test(t)) g.add(at(ball(0.14, glow("#ffb04a", 1.0), 8), 0.3, 1.5, 0));
    else if (/蚩尤|刑天/.test(t)) g.add(at(box(0.06, 0.6, 0.04, "#9a968c"), 0.25, 0.9, 0.1));
    else if (/應龍/.test(t)) for (const s of [-1, 1]) g.add(rot(at(box(0.4, 0.04, 0.2, "#9a968c"), s * 0.3, 1.1, -0.1), 0, 0, s * 0.4));
    else if (/西王母/.test(t)) g.add(at(cone(0.14, 0.2, "#9a968c", 5), 0, 1.55, 0));
    const name = t.match(/(蚩尤|夸父|刑天|應龍|西王母|伏羲|神農|后羿|黃帝|開明獸)/)?.[0] || text.slice(0, 3);
    g.add(at(sign(name, 0.5, 0.16, "#5a5448", "#f6f1e2"), 0, 0.2, 0.31));
    return g;
  },
  // 講古書架（沒有歸類的故事）
  bookStand(anim, text, i) {
    return group(at(box(0.5, 0.7, 0.3, WOOD), 0, 0.35, 0), at(box(0.42, 0.04, 0.26, WOODD), 0, 0.45, 0.02),
      at(box(0.12, 0.22, 0.18, "#c8433a"), -0.12, 0.6, 0), at(box(0.1, 0.2, 0.18, "#3d6fb6"), 0.02, 0.59, 0), at(box(0.1, 0.24, 0.18, "#f2b33c"), 0.14, 0.61, 0));
  },
};

// ---------- 裝飾 ----------
export const LAOBAN_DECOR = {
  pine() { // 書院旁的松樹
    return group(at(cyl(0.07, 0.1, 0.7, "#6e5a44", 5), 0, 0.35, 0), at(cone(0.55, 0.7, "#3f6a45", 7), 0, 0.85, 0), at(cone(0.4, 0.6, "#4a7a50", 7), 0, 1.25, 0));
  },
  bambooPot() {
    const g = group(at(cyl(0.18, 0.14, 0.25, "#7a7468", 8), 0, 0.12, 0));
    for (let i = 0; i < 4; i++) g.add(at(cyl(0.02, 0.02, 0.9, "#8ab04a", 4), (i - 1.5) * 0.06, 0.6, (i % 2) * 0.05));
    return g;
  },
};
