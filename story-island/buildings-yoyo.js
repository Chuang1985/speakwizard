/*
 * 故事柑仔店島：長篇溜溜球（溜溜球線般的長路）的地標、路標模板與裝飾
 * 原點在地磚中央、正面朝 +z。
 */
import * as THREE from "three";
import { mat, glow, mesh, box, cyl, ball, cone, at, group, rot, scl, sign, roof } from "./kit.js";

const WOOD = "#8a6a48", WOODD = "#5a3e2a", INK = "#2a2830", GOLD = "#e2b33c", SAND = "#c9b088";

export const YOYO_BUILDERS = {
  // 總建築：溜溜球塔。高架子吊著一顆大溜溜球，一邊轉一邊上下（一放一收）
  yoyoTower(anim) {
    const g = new THREE.Group();
    g.add(at(cyl(3.3, 3.5, 0.3, SAND, 6), 0, 0.15, 0));
    for (const s of [-1, 1]) g.add(at(box(0.35, 7.0, 0.35, WOODD), s * 2.2, 3.5, 0), at(box(0.7, 0.3, 0.7, "#4a3424"), s * 2.2, 0.3, 0));
    g.add(at(box(5.0, 0.4, 0.45, WOODD), 0, 7.1, 0), at(sign("長篇溜溜球", 2.4, 0.5, "#c8433a", "#fff3d6"), 0, 7.1, 0.25));
    const string = at(cyl(0.02, 0.02, 1, "#f6f1e2", 4), 0, 0, 0);
    const yoyo = new THREE.Group();
    for (const [z, c] of [[-0.35, "#e2633c"], [0.35, "#f2b33c"]]) {
      yoyo.add(rot(at(cyl(1.5, 1.5, 0.5, c, 24), 0, 0, z), Math.PI / 2));
      yoyo.add(rot(at(cyl(0.6, 0.6, 0.52, z < 0 ? "#f2b33c" : "#e2633c", 16), 0, 0, z * 1.02), Math.PI / 2));
    }
    yoyo.add(rot(cyl(0.25, 0.25, 0.3, "#f6f1e2", 10), Math.PI / 2));
    for (let i = 0; i < 8; i++) { // 外圈一圈小燈
      const a = (i / 8) * Math.PI * 2;
      yoyo.add(at(ball(0.09, glow(i % 2 ? "#ffd36b" : "#fff3d6", 1.2), 6), Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0.62));
    }
    g.add(yoyo, string);
    anim.push((t, dt) => {
      const y = 3.6 + Math.sin(t * 0.6) * 1.4;
      yoyo.position.y = y;
      yoyo.rotation.z -= dt * (1.5 + Math.cos(t * 0.6) * 1.2);
      string.scale.y = 6.9 - y;
      string.position.y = (6.9 + y) / 2;
    });
    return g;
  },
  // 引渡人渡口：碼頭、渡船、高高的引渡燈
  ferryStart(anim) {
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) g.add(at(box(1.0, 0.1, 0.4, i % 2 ? "#7a5c3e" : "#6a4e34"), 0, 0.12, 0.8 - i * 0.45));
    const boat = group(scl(at(mesh(new THREE.SphereGeometry(0.45, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat("#5a3e2a", { side: THREE.DoubleSide })), 0, 0.2, 0), 1, 0.5, 2.0),
      at(cyl(0.02, 0.02, 1.0, WOODD, 4), 0, 0.7, -0.5), at(cyl(0.1, 0.1, 0.2, glow("#ffd36b", 1.4), 8), 0, 1.15, -0.5));
    g.add(at(boat, 0.85, 0, -0.2));
    anim.push((t) => (boat.rotation.z = Math.sin(t * 1.2) * 0.06));
    g.add(at(cyl(0.04, 0.04, 2.0, WOODD, 5), -0.6, 1.0, 0.6), at(cyl(0.14, 0.14, 0.3, glow("#ffb04a", 1.3), 8), -0.6, 1.9, 0.6));
    g.add(at(sign("day1", 0.5, 0.2, "#1d1418", "#ffd36b"), -0.6, 1.4, 0.65));
    return g;
  },
  // 老鬼的家：黃土路盡頭的老屋、搖椅、一盞還亮著的燈
  oldGhostHome(anim) {
    const g = new THREE.Group();
    g.add(at(box(1.5, 1.0, 1.2, "#8a7a6a"), 0, 0.5, -0.2), at(roof(1.8, 1.5, "#4a3a2a", "#3a2a1a", "#3a2a1a"), 0, 1.15, -0.2));
    g.add(at(box(0.4, 0.6, 0.05, "#3a2a1a"), -0.3, 0.3, 0.41), at(box(0.3, 0.3, 0.05, glow("#ffd890", 0.8)), 0.35, 0.6, 0.41));
    const chair = group(at(box(0.4, 0.05, 0.35, WOOD), 0, 0.3, 0), at(box(0.4, 0.4, 0.05, WOOD), 0, 0.5, -0.17),
      rot(at(mesh(new THREE.TorusGeometry(0.25, 0.02, 4, 10, Math.PI), WOODD), 0, 0.05, 0), 0, Math.PI / 2, Math.PI));
    g.add(at(chair, 0.6, 0, 0.75));
    anim.push((t) => (chair.rotation.x = Math.sin(t * 1.2) * 0.12));
    g.add(at(sign("多年之後", 0.3, 0.9, "#3a2a1a", "#ffd36b", true), -0.85, 0.55, 0.5));
    return g;
  },
  // 玄墨書院：白牆黑瓦、墨池、筆架上插滿毛筆
  inkAcademy(anim) {
    const g = new THREE.Group();
    g.add(at(box(1.8, 1.1, 1.3, "#efe8da"), 0, 0.55, -0.2), at(roof(2.1, 1.6, INK, "#1a1a20", "#1a1a20"), 0, 1.25, -0.2));
    g.add(at(box(0.5, 0.75, 0.05, INK), 0, 0.38, 0.46), at(sign("玄墨書院", 1.0, 0.24, INK, "#efe8da"), 0, 0.95, 0.47));
    g.add(at(cyl(0.45, 0.45, 0.1, "#3a3a40", 12), 0.6, 0.06, 0.85), at(cyl(0.4, 0.4, 0.02, mat("#0a0a10", { roughness: 0.1 }), 12), 0.6, 0.12, 0.85));
    const rack = group(at(box(0.6, 0.06, 0.12, WOODD), 0, 0.7, 0));
    for (let i = 0; i < 5; i++) rack.add(at(cyl(0.02, 0.02, 0.5, "#c9a86a", 4), -0.24 + i * 0.12, 0.45, 0), at(cone(0.03, 0.08, INK, 5), -0.24 + i * 0.12, 0.16, 0));
    rack.children.filter((_, i) => i > 0 && i % 2 === 0).forEach((c) => (c.rotation.x = Math.PI));
    g.add(at(rack, -0.6, 0, 0.8));
    return g;
  },
  // 下山山門：石階＋牌坊，墨色匾額
  mountainGate() {
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) g.add(at(box(1.6 - i * 0.15, 0.15, 0.4, "#8a8478"), 0, 0.07 + i * 0.15, 0.6 - i * 0.35));
    for (const s of [-1, 1]) g.add(at(cyl(0.11, 0.13, 2.2, "#4a4850", 8), s * 0.8, 1.1, -0.3));
    g.add(at(box(2.0, 0.18, 0.25, INK), 0, 2.15, -0.3), at(roof(2.3, 0.6, INK, "#1a1a20", "#1a1a20"), 0, 2.4, -0.3));
    g.add(at(sign("下山", 0.7, 0.28, INK, "#efe8da"), 0, 1.85, -0.16));
    return g;
  },
  // 序章亭：小涼亭裡一本攤開的書，旁邊一盞夕陽色的燈
  prologue() {
    const g = new THREE.Group();
    g.add(at(cyl(0.9, 0.95, 0.15, SAND, 6), 0, 0.08, 0));
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + Math.PI / 4; g.add(at(cyl(0.05, 0.05, 1.3, "#a5523a", 6), Math.cos(a) * 0.65, 0.75, Math.sin(a) * 0.65)); }
    g.add(at(cone(1.1, 0.6, "#c8433a", 4), 0, 1.7, 0), at(box(0.5, 0.5, 0.4, WOOD), 0, 0.4, 0));
    g.children.at(-2).rotation.y = Math.PI / 4;
    for (const s of [-1, 1]) g.add(rot(at(box(0.25, 0.02, 0.32, "#f6f1e2"), s * 0.12, 0.67, 0), 0, 0, s * -0.2));
    g.add(at(ball(0.14, glow("#ff9a4a", 1.2), 8), 0.55, 1.25, 0.55), at(sign("Opening", 0.6, 0.18, "#c8433a", "#fff3d6"), 0, 1.25, 0.7));
    return g;
  },
  // 靈行者石像：披斗篷、拄長杖的行者
  spiritStatue() {
    const g = new THREE.Group();
    g.add(at(box(0.9, 0.35, 0.9, "#8a8478"), 0, 0.17, 0));
    g.add(at(cone(0.45, 1.5, "#a8a49a", 10), 0, 1.1, 0), at(ball(0.25, "#a8a49a", 10), 0, 1.95, 0), at(cone(0.3, 0.45, "#9a968c", 10), 0, 2.15, -0.02));
    g.add(at(cyl(0.035, 0.035, 2.0, "#9a968c", 5), 0.4, 1.2, 0.15), at(ball(0.08, glow("#bff0ff", 1.0), 6), 0.4, 2.25, 0.15));
    return g;
  },
  // 白無常日記亭：白色小亭，桌上一本日記、一頂高帽
  wuchangDiary() {
    const g = new THREE.Group();
    g.add(at(box(1.5, 0.15, 1.3, "#e8e4dc"), 0, 0.08, 0));
    for (const [x, z] of [[-0.6, -0.5], [0.6, -0.5], [-0.6, 0.5], [0.6, 0.5]]) g.add(at(cyl(0.05, 0.05, 1.3, "#f6f6f2", 6), x, 0.8, z));
    g.add(at(roof(1.7, 1.5, "#f6f6f2", "#d8d8d0", "#c8433a"), 0, 1.6, 0));
    g.add(at(box(0.7, 0.05, 0.45, "#c8c4b8"), 0, 0.6, 0), at(box(0.04, 0.45, 0.04, "#c8c4b8"), 0, 0.35, 0));
    g.add(at(box(0.3, 0.04, 0.22, "#f6f1e2"), -0.12, 0.65, 0), at(cyl(0.08, 0.16, 0.4, "#fbfbf6", 8), 0.2, 0.83, 0));
    g.add(at(sign("白無常日記", 1.0, 0.22, "#f6f6f2", "#2a2633"), 0, 1.3, 0.66));
    return g;
  },
};

// ---------- 路標模板（每篇一個，照連載順序沿路排） ----------
export const YOYO_TEMPLATES = {
  // 引渡燈：一根竿子掛一盞暖色紙燈，竿上一塊小牌寫第幾天
  ferryLamp(anim, text, i, p) {
    const g = new THREE.Group();
    g.add(at(cyl(0.025, 0.03, 1.2, WOODD, 4), 0, 0.6, 0), at(box(0.3, 0.03, 0.03, WOODD), 0.12, 1.18, 0));
    const lamp = at(scl(ball(0.12, glow(["#ffb04a", "#ffd36b", "#ff9a4a"][i % 3], 1.1), 8), 1, 1.3, 1), 0.24, 1.0, 0);
    const day = (p?.t || text).match(/day\s*\d+/i)?.[0].replace(/\s/g, "") || text.slice(0, 4);
    g.add(lamp, at(sign(day, 0.32, 0.12, "#3a2a1a", "#ffd36b"), 0, 0.72, 0.03));
    const ph = i * 0.7;
    anim.push((t) => (lamp.rotation.z = Math.sin(t * 1.3 + ph) * 0.12));
    return g;
  },
  // 玄墨碑：黑色石碑、白字
  inkStele(anim, text, i, p) {
    const g = new THREE.Group();
    g.add(at(box(0.5, 0.12, 0.3, "#4a4850"), 0, 0.06, 0));
    const n = (p?.t || text).match(/（([^）]+)）/)?.[1] || text.slice(-3);
    g.add(at(sign(n, 0.34, 0.75, INK, "#efe8da", true), 0, 0.5, 0), at(cone(0.24, 0.12, INK, 4), 0, 0.93, 0));
    g.children.at(-1).rotation.y = Math.PI / 4;
    return g;
  },
  // 溜溜球路標：沒有歸類的故事
  yoyoMarker(anim, text, i) {
    const g = group(at(cyl(0.02, 0.02, 0.8, WOODD, 4), 0, 0.4, 0));
    g.add(rot(at(cyl(0.18, 0.18, 0.12, ["#e2633c", "#f2b33c", "#3d6fb6"][i % 3], 12), 0, 0.95, 0), Math.PI / 2));
    return g;
  },
};

// ---------- 裝飾：荒煙蔓草的黃土地 ----------
export const YOYO_DECOR = {
  grass(rng) {
    const g = new THREE.Group();
    for (let i = 0; i < 6; i++) g.add(rot(at(cone(0.06, 0.5 + rng() * 0.4, rng() < 0.5 ? "#9a9a58" : "#b4a868", 3), (rng() - 0.5) * 1.2, 0.25, (rng() - 0.5) * 1.2), (rng() - 0.5) * 0.5, 0, (rng() - 0.5) * 0.5));
    return g;
  },
  lone(rng) { // 路邊孤零零的一棵樹或一塊大石
    if (rng() < 0.5) return group(at(cyl(0.07, 0.1, 1.0, "#6e5a44", 5), 0, 0.5, 0), at(scl(ball(0.5, "#7a8a4a", 7), 1, 0.7, 1), 0, 1.2, 0));
    return scl(at(mesh(new THREE.DodecahedronGeometry(0.4), "#9a8e78"), 0, 0.25, 0), 1.2, 0.7, 1);
  },
};
