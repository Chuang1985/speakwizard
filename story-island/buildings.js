/*
 * 故事柑仔店島：特色建築
 *
 * 每個函式蓋一棟建築，原點在地磚中央、正面朝 +z（門口那條路）。
 * 一般建築佔一格（約 2.2 寬）；總建築（main）佔中央七格。
 * 有動態的零件放進 anim 陣列，island.js 每幀呼叫。
 */
import * as THREE from "three";
import { mat, glow, mesh, box, cyl, ball, cone, at, group, rot, scl, sign, roof } from "./kit.js";

const STONE = "#3a3550", STONE2 = "#4c4666", WOOD = "#5a2a2a", PILLAR = "#9a2a2a", GOLD = "#e2b33c";

function hall({ w = 1.9, d = 1.5, h = 1.1, wall = "#6a2a2a", plaque, roofColor = "#1f1c2a", lamp = "#7ff0d6" }) {
  const g = new THREE.Group();
  g.add(at(box(w + 0.3, 0.22, d + 0.3, STONE2), 0, 0.11, 0));
  g.add(at(box(w, h, d, wall), 0, 0.22 + h / 2, 0));
  g.add(at(box(w * 0.36, h * 0.72, 0.05, "#140f18"), 0, 0.22 + h * 0.36, d / 2 + 0.01));
  for (const x of [-w / 2 + 0.08, w / 2 - 0.08]) g.add(at(cyl(0.07, 0.07, h, PILLAR, 8), x, 0.22 + h / 2, d / 2 + 0.12));
  g.add(at(roof(w + 0.5, d + 0.6, roofColor, "#2e2a3c", "#c8433a"), 0, 0.22 + h + 0.18, 0));
  if (plaque) g.add(at(sign(plaque, Math.min(1.1, 0.3 * [...plaque].length + 0.2), 0.32, "#1d1418", GOLD), 0, 0.22 + h * 0.85, d / 2 + 0.06));
  for (const x of [-w / 2 + 0.15, w / 2 - 0.15]) g.add(at(ball(0.11, glow(lamp, 1.1), 8), x, 0.22 + h - 0.05, d / 2 + 0.25));
  return g;
}

export const BUILDERS = {
  // 總建築：酆都森羅殿，三重簷，最高
  main(anim) {
    const g = new THREE.Group();
    [[5.6, 0.35], [4.8, 0.35], [4.0, 0.3]].forEach(([s, h], i) => g.add(at(cyl(s * 0.62, s * 0.66, h, i % 2 ? STONE : STONE2, 6), 0, 0.17 + i * 0.33, 0)));
    const base = 1.0;
    g.add(at(box(3.0, 1.8, 2.4, "#7a2a2a"), 0, base + 0.9, 0));
    for (const x of [-1.3, -0.45, 0.45, 1.3]) g.add(at(cyl(0.11, 0.11, 1.8, PILLAR, 8), x, base + 0.9, 1.35));
    g.add(at(box(1.0, 1.3, 0.05, "#140f18"), 0, base + 0.65, 1.21));
    g.add(at(roof(3.9, 3.4), 0, base + 2.0, 0));
    g.add(at(box(2.2, 1.1, 1.7, "#7a2a2a"), 0, base + 2.75, 0));
    g.add(at(sign("森羅殿", 1.5, 0.45, "#1d1418", GOLD), 0, base + 2.85, 0.88));
    g.add(at(roof(3.0, 2.6), 0, base + 3.45, 0));
    g.add(at(box(1.3, 0.8, 1.0, "#7a2a2a"), 0, base + 4.0, 0));
    g.add(at(roof(2.0, 1.7), 0, base + 4.55, 0));
    g.add(at(cyl(0.05, 0.12, 0.9, GOLD, 6), 0, base + 5.1, 0));
    const orb = at(ball(0.28, glow("#7ff0d6", 1.4), 12), 0, base + 5.7, 0);
    g.add(orb);
    anim.push((t) => (orb.position.y = base + 5.7 + Math.sin(t * 1.5) * 0.12));
    // 前庭兩座大香爐、兩盞青燈
    for (const s of [-1, 1]) {
      g.add(at(cyl(0.3, 0.24, 0.5, "#5a4a3a", 8), s * 1.9, 0.75, 1.9), at(cone(0.36, 0.3, "#6a5a3a", 8), s * 1.9, 1.15, 1.9));
      g.add(at(cyl(0.04, 0.04, 1.5, "#2a2633", 5), s * 2.4, 1.25, 0.6), at(cyl(0.16, 0.16, 0.32, glow("#7ff0d6", 1.1), 8), s * 2.4, 2.05, 0.6));
    }
    return g;
  },

  // 第一殿・秦廣王殿：殿前一面孽鏡
  qinguang(anim) {
    const g = hall({ plaque: "第一殿" });
    const mirror = group(at(cyl(0.04, 0.04, 0.8, "#2a2633", 5), 0, 0.4, 0), rot(at(cyl(0.38, 0.38, 0.08, GOLD, 16), 0, 1.0, 0), Math.PI / 2),
      rot(at(cyl(0.32, 0.32, 0.1, glow("#bff0ff", 1.1), 16), 0, 1.0, 0.01), Math.PI / 2));
    g.add(at(mirror, 0.75, 0, 1.15));
    return g;
  },

  // 第五殿・閻羅殿：比第一殿大，殿前兩面令旗
  yanluo(anim) {
    const g = hall({ w: 2.0, d: 1.6, h: 1.3, plaque: "第五殿", wall: "#5a1f22" });
    for (const s of [-1, 1]) {
      const flag = at(box(0.42, 0.6, 0.02, s < 0 ? "#c8433a" : "#2a2633"), s * 0.95 + 0.2, 1.75, 1.2);
      flag.geometry.translate(0.2, 0, 0);
      g.add(at(cyl(0.025, 0.025, 2.0, "#2a2633", 4), s * 0.95, 1.0, 1.2), flag);
      anim.push((t) => (flag.rotation.y = Math.sin(t * 2 + s) * 0.35));
    }
    return g;
  },

  // 審判等待室：叫號燈、長椅、等號碼牌的人龍
  waiting(anim) {
    const g = new THREE.Group();
    g.add(at(box(2.0, 1.2, 1.4, "#5c5a72"), 0, 0.6, -0.1), at(box(2.2, 0.1, 1.6, "#3a3850"), 0, 1.25, -0.1));
    g.add(at(box(1.4, 0.6, 0.05, glow("#ffd36b", 0.4)), 0, 0.65, 0.61));
    const num = at(box(0.6, 0.3, 0.06, "#140f18"), 0, 1.55, 0.4);
    const digits = at(sign("〇四四", 0.55, 0.22, "#140f18", "#ff5a4a"), 0, 1.55, 0.44);
    g.add(at(cyl(0.03, 0.03, 0.4, "#2a2633", 4), 0, 1.4, 0.4), num, digits);
    for (const z of [0.95]) g.add(at(box(1.8, 0.08, 0.35, "#8a7a6a"), 0, 0.35, z), at(box(1.8, 0.35, 0.06, "#8a7a6a"), 0, 0.5, z - 0.16));
    anim.push((t) => (digits.visible = Math.sin(t * 2.4) > -0.6));
    return g;
  },

  // 望鄉臺：三層石台，頂上一盞望鄉燈
  wangxiang(anim) {
    const g = new THREE.Group();
    [[1.9, 0.7], [1.5, 0.7], [1.1, 0.7]].forEach(([s, h], i) => g.add(at(box(s, h, s, i % 2 ? STONE2 : STONE), 0, h / 2 + i * h, 0)));
    for (let i = 0; i < 5; i++) g.add(at(box(0.5, 0.14, 0.24, "#5c5672"), 0, 0.07 + i * 0.14, 0.95 + 0.24 * (4 - i)));
    g.add(at(roof(1.3, 1.3), 0, 2.35, 0));
    for (const [x, z] of [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]]) g.add(at(cyl(0.05, 0.05, 0.5, PILLAR, 5), x, 2.35, z));
    const lamp = at(ball(0.2, glow("#7ff0d6", 1.3), 10), 0, 2.4, 0);
    g.add(lamp);
    anim.push((t) => lamp.scale.setScalar(1 + Math.sin(t * 2) * 0.12));
    return g;
  },

  // 枉死城：四面城牆、城門、兩座角樓
  wangsi(anim) {
    const g = new THREE.Group();
    const wall = "#4a4058";
    g.add(at(box(2.2, 0.9, 0.25, wall), 0, 0.45, -0.95), at(box(0.25, 0.9, 2.1, wall), -1.0, 0.45, 0), at(box(0.25, 0.9, 2.1, wall), 1.0, 0.45, 0));
    g.add(at(box(0.75, 0.9, 0.25, wall), -0.72, 0.45, 0.95), at(box(0.75, 0.9, 0.25, wall), 0.72, 0.45, 0.95), at(box(0.8, 0.3, 0.3, wall), 0, 0.9, 0.95));
    for (let i = 0; i < 6; i++) g.add(at(box(0.18, 0.15, 0.27, "#5c5270"), -0.9 + i * 0.36, 0.97, -0.95));
    for (const s of [-1, 1]) g.add(at(box(0.55, 1.4, 0.55, wall), s * 1.0, 0.7, 0.95), at(roof(0.8, 0.8), s * 1.0, 1.55, 0.95),
      at(ball(0.08, glow("#ff8a5a", 1), 6), s * 1.0, 1.1, 1.24));
    g.add(at(sign("枉死城", 0.8, 0.24, "#1d1418", GOLD), 0, 0.9, 1.11));
    g.add(at(box(0.9, 0.9, 0.9, "#3a3448"), 0, 0.45, -0.2), at(roof(1.2, 1.1), 0, 1.05, -0.2));
    return g;
  },

  // 孟婆亭：六角亭、一口冒煙的大湯鍋
  mengpo(anim) {
    const g = new THREE.Group();
    g.add(at(cyl(1.05, 1.1, 0.18, STONE2, 6), 0, 0.09, 0));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      g.add(at(cyl(0.06, 0.06, 1.3, PILLAR, 6), Math.cos(a) * 0.9, 0.83, Math.sin(a) * 0.9));
    }
    g.add(at(cone(1.35, 0.8, "#2a2633", 6), 0, 1.85, 0), at(ball(0.12, GOLD, 6), 0, 2.3, 0));
    g.add(at(cyl(0.45, 0.35, 0.45, "#2a2a2a", 10), 0, 0.42, 0), at(cyl(0.4, 0.4, 0.03, glow("#9aa86a", 0.6), 10), 0, 0.64, 0));
    const steam = [];
    for (let i = 0; i < 4; i++) {
      const s = ball(0.14, mat("#ffffff", { transparent: true, opacity: 0.45 }), 6);
      g.add(s);
      steam.push(s);
    }
    anim.push((t) => steam.forEach((s, i) => {
      const k = (t * 0.4 + i / 4) % 1;
      s.position.set(Math.sin(i * 2 + t) * 0.12, 0.7 + k * 1.0, Math.cos(i * 2) * 0.1);
      s.scale.setScalar(0.5 + k * 1.2);
    }));
    g.add(at(sign("孟婆湯", 0.3, 0.9, "#c8433a", "#fff3d6", true), 0.95, 0.7, 0.7));
    return g;
  },

  // 轉劫所：一座直立轉動的輪迴大輪
  zhuanjie(anim) {
    const g = new THREE.Group();
    g.add(at(box(2.0, 0.3, 0.8, STONE2), 0, 0.15, 0));
    for (const s of [-1, 1]) g.add(at(box(0.18, 1.6, 0.3, "#2a2633"), s * 0.95, 1.05, 0));
    const wheel = at(new THREE.Group(), 0, 1.2, 0);
    wheel.add(mesh(new THREE.TorusGeometry(0.8, 0.07, 6, 24), GOLD));
    for (let i = 0; i < 6; i++) wheel.add(rot(box(0.05, 1.55, 0.05, "#c9a86a"), 0, 0, (i / 6) * Math.PI));
    ["#ff8aa0", "#8be9ff", "#ffcf4a", "#9cf08a", "#c8a0ff", "#ffffff"].forEach((c, i) => {
      const a = (i / 6) * Math.PI * 2;
      wheel.add(at(ball(0.12, glow(c, 1), 8), Math.cos(a) * 0.8, Math.sin(a) * 0.8, 0.05));
    });
    wheel.add(at(cyl(0.16, 0.16, 0.2, "#2a2633", 10), 0, 0, 0));
    wheel.children.at(-1).rotation.x = Math.PI / 2;
    g.add(wheel);
    anim.push((t, dt) => (wheel.rotation.z -= dt * 0.5));
    return g;
  },

  // 饑渴廠：鋸齒屋頂工廠、會冒煙的煙囪
  jike(anim) {
    const g = new THREE.Group();
    g.add(at(box(2.0, 0.9, 1.5, "#5a5560"), 0, 0.45, 0));
    for (let i = 0; i < 3; i++) g.add(rot(at(box(0.66, 0.08, 1.5, "#3a3640"), -0.66 + i * 0.66, 1.05, 0), 0, 0, 0.45));
    g.add(at(box(1.6, 0.25, 0.04, glow("#ffb04a", 0.6)), 0, 0.6, 0.76));
    g.add(at(cyl(0.15, 0.2, 1.4, "#4a3a3a", 8), 0.75, 1.3, -0.4));
    const puffs = [];
    for (let i = 0; i < 4; i++) {
      const p = ball(0.16, mat("#8a8098", { transparent: true, opacity: 0.6 }), 6);
      g.add(p);
      puffs.push(p);
    }
    anim.push((t) => puffs.forEach((p, i) => {
      const k = (t * 0.35 + i / 4) % 1;
      p.position.set(0.75 + k * 0.4, 2.0 + k * 1.3, -0.4);
      p.scale.setScalar(0.6 + k);
    }));
    g.add(at(sign("饑渴廠", 0.9, 0.24, "#1d1418", GOLD), -0.4, 0.95, 0.77));
    return g;
  },

  // 供養閣：紙紮屋、一桌供品、香
  gongyang(anim) {
    const g = hall({ w: 1.6, d: 1.3, h: 0.9, wall: "#8a3a3a", plaque: "供養閣", lamp: "#ffcf4a" });
    const table = group(at(box(0.9, 0.06, 0.45, "#6a2a2a"), 0, 0.5, 0), at(box(0.06, 0.5, 0.4, "#5a2222"), -0.4, 0.25, 0), at(box(0.06, 0.5, 0.4, "#5a2222"), 0.4, 0.25, 0),
      at(ball(0.09, "#f2a03a", 6), -0.25, 0.6, 0), at(ball(0.09, "#e2453c", 6), -0.1, 0.6, 0.05), at(cyl(0.12, 0.12, 0.08, "#e8e0d0", 8), 0.2, 0.57, 0));
    for (const x of [0.3, 0.36, 0.42]) table.add(at(cyl(0.008, 0.008, 0.3, "#c8433a", 3), x, 0.68, -0.1));
    g.add(at(table, 0, 0, 1.15));
    const paper = group(at(box(0.35, 0.3, 0.3, "#f2e6c8"), 0, 0.15, 0), at(cone(0.3, 0.2, "#e2453c", 4), 0, 0.4, 0)); // 紙紮屋
    g.add(at(paper, -0.85, 0, 1.0, 0.785));
    return g;
  },

  // 三途河渡口：伸進河裡的碼頭、一艘渡船、引渡燈（蓋在河磚上）
  ferry(anim) {
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) g.add(at(box(0.8, 0.1, 0.4, i % 2 ? "#6a4a32" : "#5a3e2a"), 0, 0.35, 0.9 - i * 0.45));
    for (const [x, z] of [[-0.35, 0.9], [0.35, 0.9], [-0.35, -0.4], [0.35, -0.4]]) g.add(at(cyl(0.05, 0.05, 0.7, "#3a2a1a", 5), x, 0.1, z));
    const boat = new THREE.Group();
    boat.add(scl(at(mesh(new THREE.SphereGeometry(0.5, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat("#5a3e2a", { side: THREE.DoubleSide })), 0, 0.2, 0), 1, 0.5, 2.2));
    boat.add(at(cyl(0.02, 0.02, 1.0, "#3a2a1a", 4), 0, 0.7, -0.6), at(cyl(0.1, 0.1, 0.2, glow("#ffd36b", 1.4), 8), 0, 1.15, -0.6));
    g.add(at(boat, 0.9, -0.05, -0.2));
    anim.push((t) => {
      boat.position.y = -0.05 + Math.sin(t * 1.6) * 0.05;
      boat.rotation.z = Math.sin(t * 1.2) * 0.06;
    });
    g.add(at(sign("渡", 0.3, 0.4, "#1d1418", GOLD, true), -0.45, 0.85, 0.9), at(cyl(0.03, 0.03, 0.9, "#3a2a1a", 4), -0.45, 0.45, 0.85));
    return g;
  },

  // 彼岸花田：一整格紅花，中間一塊木牌
  bianhua(anim) {
    const g = new THREE.Group();
    const stem = new THREE.CylinderGeometry(0.015, 0.015, 0.45, 3);
    const petal = new THREE.ConeGeometry(0.09, 0.2, 5);
    const n = 46;
    const stems = new THREE.InstancedMesh(stem, mat("#3f6a35"), n);
    const heads = new THREE.InstancedMesh(petal, glow("#e8302c", 0.25), n);
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      const a = i * 2.4, r = Math.sqrt(i / n) * 1.0;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      m4.makeTranslation(x, 0.22, z);
      stems.setMatrixAt(i, m4);
      m4.makeRotationX(Math.PI).setPosition(x, 0.5, z);
      heads.setMatrixAt(i, m4);
    }
    g.add(stems, heads);
    g.add(at(cyl(0.03, 0.03, 0.7, "#5a4632", 4), 0.2, 0.35, 0.75), at(sign("彼岸花", 0.7, 0.22, "#f2e6c8", "#8a2a2a"), 0.2, 0.72, 0.78));
    anim.push((t) => (heads.rotation.y = Math.sin(t * 0.6) * 0.04));
    return g;
  },

  // 觀落陰壇：紅布供桌、符令、蒙眼紅巾、香爐
  luoyin(anim) {
    const g = new THREE.Group();
    g.add(at(cyl(0.95, 1.0, 0.16, STONE2, 8), 0, 0.08, 0));
    g.add(at(box(1.1, 0.6, 0.55, "#c8433a"), 0, 0.46, -0.2), at(box(1.2, 0.05, 0.6, "#7a2a2a"), 0, 0.78, -0.2));
    for (const x of [-0.3, 0, 0.3]) g.add(rot(at(box(0.14, 0.34, 0.01, "#f2d24a"), x, 1.0, -0.42), 0.15, 0, 0));
    g.add(at(cyl(0.12, 0.09, 0.14, "#8a6a3a", 8), 0, 0.88, -0.1));
    const smoke = at(ball(0.07, mat("#ffffff", { transparent: true, opacity: 0.5 }), 6), 0, 1.1, -0.1);
    g.add(smoke);
    anim.push((t) => {
      const k = (t * 0.5) % 1;
      smoke.position.y = 1.0 + k * 0.8;
      smoke.scale.setScalar(0.6 + k * 1.5);
    });
    for (const s of [-1, 1]) g.add(at(cyl(0.12, 0.12, 0.3, glow("#ff8a3c", 0.9), 8), s * 0.75, 0.31, 0.45));
    g.add(at(box(0.5, 0.06, 0.08, "#c8433a"), 0.4, 0.83, 0.05)); // 蒙眼紅巾
    return g;
  },

  // 鬼卒營：營房、刀槍架、操練用的木樁
  guizu(anim) {
    const g = new THREE.Group();
    g.add(at(box(1.8, 0.9, 1.2, "#3a4458"), 0, 0.45, -0.3), at(roof(2.1, 1.5, "#2a2633"), 0, 1.05, -0.3));
    g.add(at(sign("鬼卒營", 0.9, 0.26, "#1d1418", "#ff8a5a"), 0, 0.72, 0.31));
    const rack = group(at(box(0.9, 0.06, 0.1, "#5a3a22"), 0, 0.6, 0), at(box(0.06, 0.6, 0.1, "#5a3a22"), -0.42, 0.3, 0), at(box(0.06, 0.6, 0.1, "#5a3a22"), 0.42, 0.3, 0));
    for (const x of [-0.25, 0, 0.25]) rack.add(at(cyl(0.015, 0.015, 1.0, "#8a7a6a", 4), x, 0.6, 0.06), at(cone(0.04, 0.14, "#c8ccd4", 4), x, 1.15, 0.06));
    g.add(at(rack, -0.55, 0, 0.75));
    const post = at(new THREE.Group(), 0.6, 0, 0.75);
    post.add(at(cyl(0.12, 0.14, 0.9, "#8a6a48", 8), 0, 0.45, 0), at(box(0.5, 0.06, 0.06, "#8a6a48"), 0, 0.7, 0));
    g.add(post);
    anim.push((t) => (post.rotation.z = Math.max(0, Math.sin(t * 3)) * 0.12));
    return g;
  },

  // 綿綿冰攤：本區的招牌冰店（裝飾，點了看全部故事）
  ice(anim) {
    const g = new THREE.Group();
    g.add(at(box(1.4, 0.8, 0.8, "#8be0e8"), 0, 0.4, 0), at(box(1.6, 0.06, 1.0, "#f6f1e2"), 0, 1.55, 0.05));
    for (const x of [-0.7, 0.7]) g.add(at(cyl(0.03, 0.03, 0.75, "#5a4632", 4), x, 1.17, 0.45));
    const bowl = mesh(new THREE.SphereGeometry(0.4, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat("#d8e6f0", { side: THREE.DoubleSide }));
    bowl.position.y = 1.2;
    g.add(bowl, at(cone(0.38, 0.6, "#f4f8ff", 10), 0, 1.45, 0), at(cone(0.2, 0.28, "#e2627a", 10), 0, 1.66, 0));
    g.add(at(sign("綿綿冰", 1.0, 0.26, "#e2627a", "#ffffff"), 0, 0.5, 0.41));
    return g;
  },
};

// ---------- 系列模板：同一系列共用造型，招牌寫篇名 ----------
// 每個模板收 (anim, 篇名, 序號)，序號用來讓同系列的每一間顏色、大小略有不同
const SHRINE_WALLS = ["#b8463a", "#a83a3a", "#c25a3a", "#9a3a4a"];
export const TEMPLATES = {
  // 有應公小祠：一間一篇地方鬼話
  shrine(anim, text, i) {
    const g = new THREE.Group();
    const s = 0.9 + (i % 3) * 0.08;
    g.add(at(box(1.2, 0.18, 1.0, STONE2), 0, 0.09, 0));
    g.add(at(box(0.9, 0.75, 0.75, SHRINE_WALLS[i % 4]), 0, 0.55, -0.05));
    g.add(at(box(0.36, 0.5, 0.04, "#1d1418"), 0, 0.45, 0.34));
    g.add(at(roof(1.25, 1.1, "#2a2633", "#3a3448", "#c8433a"), 0, 1.05, -0.05));
    g.add(at(sign(text, 0.9, 0.22, "#1d1418", GOLD), 0, 0.9, 0.34));
    g.add(at(cyl(0.12, 0.1, 0.12, "#8a6a3a", 8), 0, 0.24, 0.45));
    for (const x of [-0.03, 0.03]) g.add(at(cyl(0.006, 0.006, 0.2, "#c8433a", 3), x, 0.38, 0.45));
    g.add(at(ball(0.07, glow("#ff8a5a", 0.9), 6), 0.36, 0.78, 0.4));
    g.scale.setScalar(s);
    return g;
  },
  // 禁忌告示牌：木牌加紅色「禁」字
  notice(anim, text, i) {
    const g = new THREE.Group();
    g.add(at(cyl(0.035, 0.035, 1.2, "#5a3a22", 4), -0.28, 0.6, 0), at(cyl(0.035, 0.035, 1.2, "#5a3a22", 4), 0.28, 0.6, 0));
    g.add(at(sign(text, 0.32, 0.8, "#efe2c2", "#3a1a1a", true), 0, 0.72, 0.03));
    g.add(at(sign("禁", 0.3, 0.3, "#c8433a", "#fff3d6"), 0, 1.28, 0.03));
    g.rotation.z = ((i % 3) - 1) * 0.05;
    return g;
  },
  // 劫數石碑：灰石直碑
  stele(anim, text, i) {
    const g = new THREE.Group();
    g.add(at(box(0.7, 0.2, 0.45, "#4c4666"), 0, 0.1, 0));
    g.add(at(sign(text, 0.42, 1.1, "#8a86a0", "#2a2633", true), 0, 0.75, 0));
    g.add(at(cone(0.3, 0.18, "#8a86a0", 4), 0, 1.38, 0));
    g.children.at(-1).rotation.y = Math.PI / 4;
    return g;
  },
  // 紙燈籠：黃泉路邊一盞，夜裡會亮
  lantern(anim, text, i) {
    const g = new THREE.Group();
    g.add(at(cyl(0.03, 0.035, 1.5, "#3a2a22", 5), 0, 0.75, 0), at(box(0.42, 0.04, 0.04, "#3a2a22"), 0.16, 1.48, 0));
    const lamp = at(new THREE.Group(), 0.34, 1.28, 0);
    lamp.add(scl(ball(0.17, glow(i % 2 ? "#fff1d0" : "#ffe0b0", 1.0), 10), 1, 1.3, 1));
    lamp.add(at(cyl(0.08, 0.08, 0.04, "#1d1418", 8), 0, 0.22, 0), at(cyl(0.08, 0.08, 0.04, "#1d1418", 8), 0, -0.22, 0));
    lamp.add(at(box(0.01, 0.24, 0.01, "#c8433a"), 0, -0.36, 0));
    g.add(lamp);
    const ph = i * 1.3;
    anim.push((t) => (lamp.rotation.z = Math.sin(t * 1.4 + ph) * 0.12));
    return g;
  },
};

// ---------- 裝飾（不連故事） ----------
export const DECOR = {
  wall() { // 黃泉路斷開處的石牆
    return group(at(box(1.8, 0.8, 0.4, "#3a3550"), 0, 0.4, 0), at(box(1.9, 0.12, 0.5, "#2a2633"), 0, 0.86, 0),
      at(sign("此路不通", 0.9, 0.24, "#1d1418", "#ff8a5a"), 0, 0.45, 0.21));
  },
  deadTree() {
    const g = group(at(cyl(0.08, 0.14, 1.4, "#3a3040", 5), 0, 0.7, 0));
    for (let i = 0; i < 3; i++) g.add(rot(at(cyl(0.03, 0.05, 0.7, "#3a3040", 4), 0, 1.1 + i * 0.12, 0), 0, i * 2.1, 0.8));
    return g;
  },
  stoneLantern() {
    return group(at(box(0.3, 0.1, 0.3, "#5c5672"), 0, 0.05, 0), at(cyl(0.06, 0.08, 0.5, "#5c5672", 6), 0, 0.35, 0),
      at(box(0.32, 0.26, 0.32, "#6a6480"), 0, 0.72, 0), at(box(0.16, 0.14, 0.34, glow("#7ff0d6", 0.8)), 0, 0.72, 0), at(cone(0.3, 0.22, "#5c5672", 4), 0, 0.96, 0));
  },
};

// 牌坊：放在通往其他區的路口
// style: underworld（黑瓦青燈）| town（紅柱橘瓦，老街牌樓）
export function gate(text, style = "underworld") {
  const town = style === "town";
  const g = new THREE.Group();
  if (style === "forest") { // 森林口：兩根原木、一根橫木、木板招牌，柱上纏藤
    for (const s of [-1, 1]) {
      g.add(at(cyl(0.12, 0.15, 2.1, "#6e5a44", 7), s * 0.95, 1.05, 0));
      for (let i = 0; i < 3; i++) g.add(at(mesh(new THREE.TorusGeometry(0.15, 0.03, 4, 8), "#4f8a3c"), s * 0.95, 0.5 + i * 0.5, 0));
      g.children.slice(-3).forEach((r) => (r.rotation.x = Math.PI / 2 + 0.3));
    }
    g.add(at(rot(cyl(0.1, 0.1, 2.5, "#5a4632", 7), 0, 0, Math.PI / 2), 0, 2.0, 0));
    g.add(at(sign(text, 1.4, 0.34, "#c9a86a", "#3a2a1a"), 0, 1.65, 0.12), at(sign(text, 1.4, 0.34, "#c9a86a", "#3a2a1a"), 0, 1.65, -0.12, Math.PI));
    return g;
  }
  for (const s of [-1, 1]) g.add(at(cyl(0.1, 0.12, 2.2, town ? "#c8433a" : PILLAR, 8), s * 0.95, 1.1, 0), at(box(0.32, 0.25, 0.32, town ? "#c9b088" : STONE2), s * 0.95, 0.12, 0));
  g.add(at(box(2.3, 0.16, 0.2, town ? "#2f7a62" : "#2a2633"), 0, 1.95, 0));
  g.add(at(town ? roof(2.6, 0.7, "#d9822b", "#2f7a62", "#2f7a62") : roof(2.6, 0.7, "#1f1c2a", "#2e2a3c", "#c8433a"), 0, 2.25, 0));
  const [bg, fg] = town ? ["#c8433a", "#fff3d6"] : ["#1d1418", GOLD];
  g.add(at(sign(text, 1.5, 0.32, bg, fg), 0, 1.62, 0.12));
  g.add(at(sign(text, 1.5, 0.32, bg, fg), 0, 1.62, -0.12, Math.PI));
  return g;
}
// 路燈：青色鬼火燈籠
export function roadLamp() {
  return group(at(cyl(0.035, 0.04, 1.2, "#2a2633", 5), 0, 0.6, 0), at(box(0.3, 0.04, 0.04, "#2a2633"), 0.12, 1.18, 0),
    at(cyl(0.1, 0.1, 0.22, glow("#7ff0d6", 1.1), 6), 0.24, 1.02, 0));
}
