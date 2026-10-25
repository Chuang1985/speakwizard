/*
 * 故事柑仔店島：妖怪作業簿（會迷路的山徑）的地標、系列模板與裝飾
 * 原點在地磚中央、正面朝 +z（小徑那一側）。
 */
import * as THREE from "three";
import { mat, glow, mesh, box, cyl, ball, cone, at, group, rot, scl, sign, roof, rand } from "./kit.js";

const BARK = "#6e5a44", LEAF = "#4f8a3c", LEAF2 = "#3f6e35", WOOD = "#8a6a48", WOODD = "#5a3e2a", ROCK = "#7a7468", GOLD = "#e2b33c";

function blob(r, c, sx = 1, sy = 0.8, sz = 1) { return scl(ball(r, c, 7), sx, sy, sz); }

export const YAO_BUILDERS = {
  // 總建築：攤開的巨大作業簿，老樟樹從書頁中間長出來
  bookTree(anim) {
    const g = new THREE.Group();
    g.add(at(cyl(3.4, 3.6, 0.3, "#7a6a4a", 6), 0, 0.15, 0));
    for (const s of [-1, 1]) { // 封面＋書頁，像帳篷一樣立著
      const cover = rot(at(box(2.6, 0.12, 3.2, "#3d6fb6"), s * 1.15, 1.25, 0), 0, 0, s * -0.95);
      const page = rot(at(box(2.45, 0.08, 3.05, "#f6f1e2"), s * 1.08, 1.3, 0), 0, 0, s * -0.95);
      g.add(cover, page);
      for (let i = 0; i < 6; i++) g.add(rot(at(box(1.9, 0.02, 0.04, "#8ab0d8"), s * (0.85 + 0.02), 1.0 + i * 0.03, -1.2 + i * 0.45), 0, 0, s * -0.95));
    }
    for (let i = 0; i < 8; i++) g.add(rot(at(mesh(new THREE.TorusGeometry(0.12, 0.025, 4, 10), "#c8ccd4"), 0, 2.15, -1.4 + i * 0.4), 0, Math.PI / 2, 0)); // 線圈裝訂
    g.add(at(sign("妖怪作業簿", 1.6, 0.36, "#3d6fb6", "#fff3d6"), 0, 0.75, 1.62));
    // 樟樹
    g.add(at(cyl(0.35, 0.55, 3.6, BARK, 7), 0, 2.2, -0.2));
    for (let i = 0; i < 4; i++) g.add(rot(at(cyl(0.08, 0.14, 1.6, BARK, 5), Math.cos(i * 1.6) * 0.5, 3.6, Math.sin(i * 1.6) * 0.5 - 0.2), Math.sin(i * 1.6) * 0.7, 0, -Math.cos(i * 1.6) * 0.7));
    [[0, 4.6, -0.2, 1.8], [1.3, 4.1, 0.4, 1.2], [-1.3, 4.2, -0.6, 1.3], [0.4, 5.3, -0.4, 1.1], [-0.6, 4.0, 0.9, 1.0]].forEach(([x, y, z, r], i) => g.add(at(blob(r, i % 2 ? LEAF : LEAF2, 1, 0.7, 1), x, y, z)));
    const eyes = [];
    for (const [x, y, z] of [[1.0, 4.3, 1.2], [-1.2, 4.6, 0.6], [0.2, 5.0, 1.0]]) for (const dx of [-0.08, 0.08]) {
      const e = at(ball(0.06, glow("#ffe14a", 1.4), 6), x + dx, y, z);
      g.add(e);
      eyes.push(e);
    }
    anim.push((t) => eyes.forEach((e, i) => (e.visible = Math.sin(t * 0.7 + Math.floor(i / 2) * 2.1) > -0.7)));
    g.add(at(box(0.08, 2.6, 0.05, WOOD), 0.6, 1.4, 0.4), at(box(0.08, 2.6, 0.05, WOOD), 0.85, 1.4, 0.4));
    for (let i = 0; i < 6; i++) g.add(at(box(0.3, 0.05, 0.05, WOOD), 0.72, 0.4 + i * 0.4, 0.4)); // 爬上樹屋的梯子
    return g;
  },
  // 迷路告示牌：一根柱子上釘滿往四面八方的箭頭
  lostSign() {
    const g = new THREE.Group();
    g.add(at(cyl(0.07, 0.09, 2.2, WOODD, 6), 0, 1.1, 0));
    ["這邊", "那邊", "回頭", "不知道", "往上", "別去"].forEach((t, i) => {
      const arm = at(new THREE.Group(), 0, 0.8 + i * 0.25, 0, i * 1.1);
      arm.add(at(sign(t, 0.62, 0.18, "#e8d4a8", "#5a2a1a"), 0.38, 0, 0), rot(at(cone(0.1, 0.16, "#e8d4a8", 3), 0.76, 0, 0), 0, 0, -Math.PI / 2));
      arm.rotation.z = (i % 2 ? 1 : -1) * 0.08;
      g.add(arm);
    });
    g.add(at(box(0.9, 0.5, 0.6, "#8a5a3a"), 0.6, 0.25, 0.6), at(box(0.92, 0.06, 0.62, "#5a3a22"), 0.6, 0.35, 0.6));
    return g;
  },
  // 竹竿鬼竹林：很高的竹子，其中一根有眼睛
  bambooGrove(anim) {
    const g = new THREE.Group();
    for (let i = 0; i < 11; i++) {
      const h = 2.6 + (i % 4) * 0.7, x = Math.cos(i * 2.3) * (0.3 + (i % 3) * 0.3), z = Math.sin(i * 2.3) * (0.3 + (i % 3) * 0.3);
      g.add(at(cyl(0.06, 0.07, h, "#8ab04a", 6), x, h / 2, z));
      for (let k = 1; k < 5; k++) g.add(at(cyl(0.075, 0.075, 0.04, "#6a8a3a", 6), x, (h * k) / 5, z));
      g.add(at(cone(0.3, 0.7, LEAF, 5), x, h + 0.2, z));
    }
    const eye = group(at(ball(0.06, "#ffffff", 6), -0.05, 0, 0), at(ball(0.06, "#ffffff", 6), 0.05, 0, 0), at(ball(0.03, "#1a1212", 4), -0.05, 0, 0.05), at(ball(0.03, "#1a1212", 4), 0.05, 0, 0.05));
    g.add(at(eye, 0.3, 3.2, 0.37));
    anim.push((t) => (eye.visible = Math.sin(t * 0.5) > 0));
    return g;
  },
  // 魔神仔山洞：一大塊岩石，洞口透出紅光
  cave(anim) {
    const g = new THREE.Group();
    g.add(scl(at(mesh(new THREE.DodecahedronGeometry(1.15), ROCK), 0, 0.8, -0.2), 1.1, 0.95, 0.9));
    g.add(scl(at(mesh(new THREE.DodecahedronGeometry(0.6), "#6a6458"), 0.8, 0.45, 0.4), 1, 0.8, 1));
    g.add(scl(at(ball(0.42, "#140f0f", 10), 0, 0.5, 0.62), 1, 1.2, 0.4));
    const light = at(ball(0.16, glow("#ff4a3a", 1.2), 8), 0, 0.45, 0.6);
    g.add(light);
    anim.push((t) => light.scale.setScalar(0.8 + Math.abs(Math.sin(t * 1.3)) * 0.5));
    g.add(at(cone(0.12, 0.25, "#e2453c", 6), -0.3, 0.12, 0.95)); // 洞口遺落的小紅帽
    g.add(at(sign("魔神仔", 0.6, 0.2, "#3a2a22", "#ff8a5a"), 0.75, 0.95, 0.75));
    return g;
  },
  // 金魅罷工棚：帆布棚、抗議布條、舉牌
  strikeTent(anim) {
    const g = new THREE.Group();
    for (const [x, z] of [[-0.9, -0.5], [0.9, -0.5], [-0.9, 0.6], [0.9, 0.6]]) g.add(at(cyl(0.04, 0.04, 1.6, "#8a8a92", 5), x, 0.8, z));
    g.add(rot(at(box(2.0, 0.05, 0.75, "#3d6fb6"), 0, 1.75, -0.18), -0.25), rot(at(box(2.0, 0.05, 0.75, "#3d6fb6"), 0, 1.75, 0.3), 0.25));
    g.add(at(sign("我們要加薪", 1.7, 0.32, "#f6f1e2", "#c8433a"), 0, 1.35, 0.62));
    for (const [x, t] of [[-0.6, "加薪"], [0.6, "罷工"]]) {
      const p = group(at(cyl(0.02, 0.02, 0.9, WOOD, 4), 0, 0.45, 0), at(sign(t, 0.4, 0.3, "#f2b33c", "#1d1418"), 0, 0.95, 0));
      g.add(at(p, x, 0, 1.0));
    }
    g.add(at(box(0.6, 0.4, 0.4, "#c9a86a"), -0.3, 0.2, -0.2), at(cyl(0.12, 0.1, 0.25, "#e8e0d0", 8), 0.4, 0.12, -0.2));
    return g;
  },
  // 食夢貘夢枕屋：枕頭形屋頂、月亮燈，屋頂飄著被吃掉的夢
  dreamHouse(anim) {
    const g = new THREE.Group();
    g.add(at(cyl(0.95, 1.0, 1.0, "#c8b8e0", 10), 0, 0.5, 0));
    g.add(scl(at(ball(1.15, "#f6f1ff", 12), 0, 1.15, 0), 1.1, 0.42, 1.0));
    g.add(at(box(0.5, 0.7, 0.05, "#5a4a7a"), 0, 0.35, 0.96), at(cyl(0.18, 0.18, 0.04, glow("#fff1b0", 1.2), 10), 0.45, 0.65, 0.92));
    g.children.at(-1).rotation.x = Math.PI / 2;
    const dreams = [];
    for (let i = 0; i < 4; i++) {
      const d = ball(0.13, glow(["#ffb0e0", "#b0d8ff", "#fff1b0", "#c8ffb0"][i], 0.9), 8);
      g.add(d);
      dreams.push(d);
    }
    anim.push((t) => dreams.forEach((d, i) => {
      const k = (t * 0.25 + i / 4) % 1;
      d.position.set(Math.sin(t * 0.8 + i * 1.5) * 0.6, 1.6 + k * 1.6, Math.cos(t * 0.8 + i) * 0.4);
      d.scale.setScalar(1 - k * 0.6);
    }));
    return g;
  },
  // 虎姑婆小屋：虎紋屋頂、會冒煙的煙囪、窗台一罐糖
  tigerCottage(anim) {
    const g = new THREE.Group();
    g.add(at(box(1.6, 1.1, 1.3, "#d8c098"), 0, 0.55, -0.1));
    g.add(rot(at(box(1.8, 0.1, 0.85, "#e2843a"), 0, 1.38, 0.22), 0.6), rot(at(box(1.8, 0.1, 0.85, "#e2843a"), 0, 1.38, -0.42), -0.6));
    for (let i = 0; i < 4; i++) for (const s of [1, -1]) g.add(rot(at(box(0.12, 0.11, 0.86, "#2a2018"), -0.6 + i * 0.4, 1.39, s > 0 ? 0.22 : -0.42), s * 0.6));
    g.add(at(box(0.45, 0.65, 0.05, "#6a3a22"), -0.3, 0.33, 0.56), at(box(0.35, 0.3, 0.05, glow("#ffd890", 0.7)), 0.4, 0.7, 0.56));
    g.add(at(cyl(0.08, 0.08, 0.16, mat("#ffe0f0", { transparent: true, opacity: 0.7 }), 8), 0.4, 0.5, 0.65));
    g.add(at(box(0.25, 0.6, 0.25, "#8a6a5a"), 0.5, 1.6, -0.4));
    const smoke = [];
    for (let i = 0; i < 3; i++) { const s = ball(0.12, mat("#d8d8d8", { transparent: true, opacity: 0.55 }), 6); g.add(s); smoke.push(s); }
    anim.push((t) => smoke.forEach((s, i) => { const k = (t * 0.3 + i / 3) % 1; s.position.set(0.5 + k * 0.3, 2.0 + k * 1.1, -0.4); s.scale.setScalar(0.6 + k); }));
    return g;
  },
  // 牡丹燈籠亭：六角亭，簷下掛一圈粉紅牡丹燈籠
  peonyPavilion(anim) {
    const g = new THREE.Group();
    g.add(at(cyl(0.95, 1.0, 0.16, "#8a8070", 6), 0, 0.08, 0));
    const lamps = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      g.add(at(cyl(0.05, 0.05, 1.3, "#5a2a3a", 6), Math.cos(a) * 0.82, 0.73, Math.sin(a) * 0.82));
      const l = scl(at(ball(0.13, glow("#ff8ab0", 1.0), 8), Math.cos(a + 0.5) * 0.95, 1.15, Math.sin(a + 0.5) * 0.95), 1, 1.25, 1);
      g.add(l);
      lamps.push(l);
    }
    g.add(at(cone(1.25, 0.65, "#3a2a3a", 6), 0, 1.7, 0), at(ball(0.1, "#ff8ab0", 6), 0, 2.08, 0));
    anim.push((t) => lamps.forEach((l, i) => (l.rotation.z = Math.sin(t * 1.4 + i) * 0.15)));
    for (let i = 0; i < 5; i++) g.add(at(ball(0.1, "#e86a9a", 6), Math.cos(i * 1.3) * 0.5, 0.25, Math.sin(i * 1.3) * 0.5)); // 牡丹花
    return g;
  },
  // 青蛇水潭：一潭水、石頭上盤著一條青蛇、蘆葦
  snakePond(anim) {
    const g = new THREE.Group();
    const water = rot(at(mesh(new THREE.CircleGeometry(1.0, 14), mat("#3a9aa0", { roughness: 0.15, transparent: true, opacity: 0.85 })), 0, 0.06, 0), -Math.PI / 2);
    g.add(at(cyl(1.05, 1.05, 0.08, "#5a5448", 14), 0, 0.02, 0), water);
    g.add(scl(at(mesh(new THREE.DodecahedronGeometry(0.35), ROCK), 0.35, 0.2, -0.2), 1.2, 0.7, 1));
    const snake = at(new THREE.Group(), 0.35, 0.45, -0.2);
    for (let i = 0; i < 3; i++) snake.add(rot(at(mesh(new THREE.TorusGeometry(0.22 - i * 0.05, 0.06, 5, 12), "#4ab06a"), 0, i * 0.1, 0), Math.PI / 2));
    snake.add(at(ball(0.09, "#4ab06a", 8), 0.1, 0.32, 0.05), at(box(0.02, 0.01, 0.1, "#e2453c"), 0.12, 0.3, 0.16));
    g.add(snake);
    anim.push((t) => (snake.rotation.y = Math.sin(t * 0.6) * 0.5));
    for (let i = 0; i < 7; i++) g.add(at(cyl(0.015, 0.015, 0.7, "#7a9a4a", 3), -0.8 + (i % 3) * 0.12, 0.35, 0.5 + Math.floor(i / 3) * 0.15));
    return g;
  },
  // 金銀鬼寶庫：寶箱、金元寶銀元寶堆
  treasury(anim) {
    const g = new THREE.Group();
    g.add(at(box(0.9, 0.55, 0.6, "#7a4a2a"), 0, 0.28, -0.2), rot(at(box(0.92, 0.1, 0.62, "#5a3a22"), 0, 0.72, -0.45), -0.7));
    const ingot = (c, x, y, z) => at(scl(cyl(0.09, 0.15, 0.1, glow(c, 0.5), 8), 1.4, 1, 0.8), x, y, z);
    for (let i = 0; i < 9; i++) g.add(ingot(i % 2 ? "#e2b33c" : "#d8dce4", -0.5 + (i % 3) * 0.3, 0.06 + Math.floor(i / 3) * 0.1, 0.45 - Math.floor(i / 3) * 0.08));
    g.add(ingot("#e2b33c", 0.1, 0.62, -0.2), ingot("#d8dce4", -0.15, 0.62, -0.15));
    return g;
  },
  // 妖獸巢：樹枝圈成的大巢，幾顆斑點蛋
  beastNest(anim) {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) g.add(rot(at(mesh(new THREE.TorusGeometry(0.85 - i * 0.12, 0.16, 5, 14), i % 2 ? "#7a5a3a" : "#6a4a2a"), 0, 0.15 + i * 0.12, 0), Math.PI / 2));
    const eggs = [];
    for (let i = 0; i < 3; i++) {
      const e = scl(at(ball(0.2, "#e8e0c8", 8), Math.cos(i * 2.1) * 0.25, 0.3, Math.sin(i * 2.1) * 0.25), 1, 1.3, 1);
      e.add(at(ball(0.05, "#8a5a3a", 4), 0.12, 0.05, 0.12));
      g.add(e);
      eggs.push(e);
    }
    anim.push((t) => eggs.forEach((e, i) => (e.rotation.z = Math.max(0, Math.sin(t * 2 + i * 2) - 0.8) * 1.2)));
    for (let i = 0; i < 3; i++) g.add(rot(at(box(0.05, 0.6, 0.04, "#3a2a22"), 0.9 + i * 0.12, 0.5, -0.2), 0, 0, 0.3)); // 爪痕
    return g;
  },
  // 破破妖垃圾山：壞掉的傘、椅子、箱子堆成一座小山
  junkHill() {
    const g = new THREE.Group();
    [[0, 0.25, 0, 0.7, "#8a7a6a"], [0.3, 0.6, -0.1, 0.5, "#6a7a8a"], [-0.35, 0.55, 0.15, 0.45, "#9a6a4a"], [0.05, 0.95, 0, 0.35, "#7a8a6a"]].forEach(([x, y, z, s, c], i) =>
      g.add(rot(at(box(s, s * 0.7, s, c), x, y, z), i * 0.4, i * 0.7, i * 0.3)));
    g.add(rot(at(cone(0.45, 0.25, "#c8433a", 8), 0.5, 1.15, 0.3), 0.6, 0, 0.8), rot(at(cyl(0.015, 0.015, 0.7, "#2a2a2a", 3), 0.3, 0.95, 0.2), 0.6, 0, 0.8));
    g.add(at(box(0.4, 0.04, 0.4, "#c9a86a"), -0.7, 0.42, 0.5), at(box(0.04, 0.4, 0.04, "#c9a86a"), -0.85, 0.2, 0.35), at(box(0.04, 0.4, 0.04, "#c9a86a"), -0.55, 0.2, 0.65));
    return g;
  },
  // 百貨公司：森林邊的現代大樓，玻璃窗、特價布條
  deptStore(anim) {
    const g = new THREE.Group();
    g.add(at(box(2.1, 3.2, 1.7, "#e8e4dc"), 0, 1.6, -0.1));
    for (let f = 0; f < 3; f++) g.add(at(box(1.9, 0.6, 0.05, glow("#c8e8ff", 0.5)), 0, 0.6 + f * 0.95, 0.76));
    const banner = at(sign("全館特價", 0.35, 1.6, "#e2453c", "#fff3d6", true), 0.85, 1.9, 0.82);
    g.add(banner, at(sign("百貨公司", 1.2, 0.3, "#1d1a17", GOLD), 0, 3.35, 0.65));
    anim.push((t) => (banner.rotation.z = Math.sin(t * 2) * 0.03));
    return g;
  },
  // 收費站：遮雨棚、小收費亭、會升降的柵欄
  tollBooth(anim) {
    const g = new THREE.Group();
    g.add(at(box(2.0, 0.12, 1.2, "#e8e4dc"), 0, 2.0, 0));
    for (const x of [-0.9, 0.9]) g.add(at(cyl(0.06, 0.06, 2.0, "#8a8a92", 6), x, 1.0, 0));
    g.add(at(box(0.6, 1.0, 0.6, "#f6f1e2"), -0.3, 0.5, 0), at(box(0.45, 0.35, 0.05, glow("#fff1d0", 0.6)), -0.3, 0.75, 0.31));
    const bar = at(new THREE.Group(), 0.05, 0.75, 0.35);
    bar.add(at(box(1.0, 0.06, 0.06, "#e2453c"), 0.5, 0, 0));
    g.add(bar);
    anim.push((t) => (bar.rotation.z = Math.max(0, Math.sin(t * 0.6)) * 1.3));
    g.add(at(sign("收費站", 0.9, 0.24, "#2a5aa8", "#ffffff"), 0, 2.15, 0.61));
    return g;
  },
};

// ---------- 系列模板 ----------
export const YAO_TEMPLATES = {
  // 觀察紀錄牌：木樁上釘一頁作業簿，旁邊一支放大鏡
  obsPost(anim, text, i) {
    const g = new THREE.Group();
    g.add(at(cyl(0.035, 0.04, 1.0, WOODD, 5), 0, 0.5, 0));
    g.add(at(box(0.5, 0.62, 0.03, "#f6f1e2"), 0, 0.95, 0.04));
    for (let k = 0; k < 4; k++) g.add(at(box(0.4, 0.01, 0.01, "#8ab0d8"), 0, 0.75 + k * 0.1, 0.06));
    g.add(at(sign(text, 0.44, 0.14, "#f6f1e2", "#3d6fb6"), 0, 1.18, 0.06));
    g.add(rot(at(mesh(new THREE.TorusGeometry(0.1, 0.02, 4, 10), "#2a2a2a"), 0.3, 0.6, 0.1), 0, 0, 0), rot(at(box(0.03, 0.2, 0.03, "#5a3a22"), 0.38, 0.45, 0.1), 0, 0, 0.6));
    return g;
  },
  // 地方古樹：粗樹幹綁一圈紅布，掛一塊牌
  oldTree(anim, text, i) {
    const g = new THREE.Group();
    g.add(at(cyl(0.22, 0.32, 1.6, BARK, 7), 0, 0.8, 0));
    g.add(at(blob(0.9, LEAF2, 1, 0.75, 1), 0, 2.0, 0), at(blob(0.55, LEAF, 1, 0.8, 1), 0.5, 1.8, 0.3));
    g.add(at(cyl(0.25, 0.27, 0.12, "#c8433a", 10), 0, 1.0, 0));
    g.add(at(sign(text, 0.2, 0.6, "#c8433a", "#fff3d6", true), 0, 0.7, 0.3));
    return g;
  },
  // 妖怪出沒注意：黃色三角警告牌
  warning(anim, text, i) {
    const g = new THREE.Group();
    g.add(at(cyl(0.03, 0.03, 1.1, "#8a8a92", 4), 0, 0.55, 0));
    g.add(rot(at(cyl(0.32, 0.32, 0.04, "#f2c43a", 3), 0, 1.15, 0), Math.PI / 2, 0, Math.PI / 6));
    g.add(at(sign("!", 0.12, 0.2, "#f2c43a", "#1d1418"), 0, 1.12, 0.03), at(sign(text, 0.5, 0.13, "#f2c43a", "#1d1418"), 0, 0.85, 0.03));
    return g;
  },
};

// ---------- 裝飾 ----------
export const YAO_DECOR = {
  forestTree(rng) { // 三種樹輪流：圓樹、尖樹、竹叢
    const k = rng();
    if (k < 0.4) return group(at(cyl(0.08, 0.12, 0.9, BARK, 5), 0, 0.45, 0), at(blob(0.55 + rng() * 0.25, rng() < 0.5 ? LEAF : LEAF2), 0, 1.2, 0));
    if (k < 0.75) return group(at(cyl(0.07, 0.1, 0.5, BARK, 5), 0, 0.25, 0), at(cone(0.6, 1.4, "#3a6a3a", 7), 0, 1.1, 0), at(cone(0.45, 1.0, "#4a7a44", 7), 0, 1.7, 0));
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) { const h = 1.6 + rng(); g.add(at(cyl(0.04, 0.05, h, "#8ab04a", 5), (rng() - 0.5) * 0.6, h / 2, (rng() - 0.5) * 0.6)); }
    return g;
  },
  mushroom(rng) {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const s = 0.6 + rng() * 0.6, x = (rng() - 0.5) * 0.8, z = (rng() - 0.5) * 0.8;
      g.add(at(cyl(0.05 * s, 0.06 * s, 0.25 * s, "#efe6d2", 5), x, 0.12 * s, z),
        at(mesh(new THREE.SphereGeometry(0.16 * s, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), rng() < 0.5 ? "#c63c32" : "#d8a03a"), x, 0.24 * s, z));
    }
    return g;
  },
  deadEnd() { // 支線盡頭：什麼都沒有，只有一塊「回頭」
    return group(at(cyl(0.025, 0.025, 0.8, WOODD, 4), 0, 0.4, 0), at(sign("回頭", 0.42, 0.18, "#e8d4a8", "#8a2a1a"), 0, 0.72, 0.02));
  },
};
