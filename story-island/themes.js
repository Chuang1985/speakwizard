/*
 * 故事柑仔店島：舊版各區地景（還沒改成六角磚的區用這裡）
 */
import * as THREE from "three";
import { rand, mat, glow, mesh, box, cyl, ball, cone, at, group, sign } from "./kit.js";

// ---------- 各區地景 ----------
// 每個函式在島的區域座標（島面 y=0）擺東西，回傳障礙點讓居民繞開

export function placer(g, obstacles) {
  return (obj, ang, dist, rad = 1.2, face = true) => {
    const x = Math.cos(ang) * dist;
    const z = Math.sin(ang) * dist;
    obj.position.set(x, obj.position.y, z);
    if (face) obj.rotation.y = Math.atan2(-x, -z); // 正面朝島中央
    g.add(obj);
    obstacles.push({ x, z, rad });
    return obj;
  };
}

function lantern(color = "#e2453c") {
  return group(at(cyl(0.03, 0.03, 1.6, "#3a2a22"), 0, 0.8, 0), at(ball(0.2, glow(color, 0.6)), 0, 1.6, 0));
}
function palm() { // 檳榔樹
  const g = group(at(cyl(0.07, 0.1, 3.2, "#8a7a5e", 6), 0, 1.6, 0));
  for (let i = 0; i < 6; i++) {
    const leaf = at(box(0.12, 0.04, 1.2, "#4f8a3c"), 0, 3.2, 0, (i / 6) * Math.PI * 2);
    leaf.rotation.x = -0.5;
    leaf.geometry.translate(0, 0, 0.6);
    g.add(leaf);
  }
  return g;
}
function bush(color = "#4e7a3a", r = 0.6) {
  return at(ball(r, color, 7), 0, r * 0.6, 0);
}
function flowers(color, n = 7, spread = 0.7) { // 一叢花
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const x = rand(-spread, spread), z = rand(-spread, spread);
    g.add(at(cyl(0.02, 0.02, 0.5, "#3f6a35", 4), x, 0.25, z));
    g.add(at(cone(0.09, 0.22, color, 5), x, 0.55, z));
  }
  return g;
}

export const THEMES = {
  // 神明集郵冊：燕尾脊廟宇、金爐、土地公小廟
  temple(g, r, put) {
    const t = new THREE.Group();
    t.add(at(box(5, 0.4, 3.6, "#9b4a36"), 0, 0.2, 0));
    t.add(at(box(4, 1.7, 2.4, "#c4473a"), 0, 1.25, -0.3));
    t.add(at(box(1.2, 1.3, 0.1, "#3a1f17"), 0, 1.05, 0.92));
    t.add(at(box(1.0, 0.12, 0.12, "#e2b33c"), 0, 1.8, 0.95));
    for (const x of [-1.8, -0.9, 0.9, 1.8]) t.add(at(cyl(0.1, 0.1, 1.7, "#b2352c"), x, 1.25, 1.1));
    const roof = at(box(5.2, 0.35, 3.6, "#d9822b"), 0, 2.3, -0.1);
    t.add(roof);
    t.add(at(box(4.2, 0.28, 0.3, "#2f7a62"), 0, 2.6, -0.1));
    for (const s of [-1, 1]) { // 燕尾：屋脊兩端往上翹
      const tail = at(cone(0.16, 0.9, "#2f7a62", 5), s * 2.25, 2.85, -0.1);
      tail.rotation.z = s * -0.9;
      t.add(tail);
    }
    t.add(at(ball(0.2, glow("#ffcf4a", 0.8)), 0, 2.85, -0.1)); // 寶珠
    for (const x of [-1.4, 1.4]) t.add(at(ball(0.18, glow("#e2453c", 0.7)), x, 1.95, 1.2));
    put(t, -Math.PI / 2, r * 0.42, 2.6);

    const burner = group(at(cyl(0.45, 0.35, 0.7, "#7a5a2a", 8), 0, 0.35, 0), at(cone(0.55, 0.5, "#9a6e2c", 8), 0, 0.95, 0),
      at(ball(0.12, glow("#ff8a3c", 0.9)), 0, 0.72, 0.42));
    put(burner, -Math.PI / 2 + 0.05, r * 0.05 + 2.2, 0.8);

    const tudi = group(at(box(0.9, 0.8, 0.8, "#c9503e"), 0, 0.4, 0), at(cone(0.75, 0.5, "#d9822b", 4), 0, 1.05, 0),
      at(ball(0.12, glow("#ffcf4a", 0.6)), 0, 0.45, 0.42));
    put(tudi, 0.6, r * 0.62, 0.9);
    put(lantern(), Math.PI * 0.2, r * 0.55, 0.4);
    put(lantern(), Math.PI * 0.8, r * 0.55, 0.4);
    put(palm(), Math.PI * 0.95, r * 0.72, 0.5);
  },

  // 幽魂綿綿冰：望鄉臺、彼岸花、奈何橋、一大碗綿綿冰、鬼火
  underworld(g, r, put, floaters) {
    const tower = new THREE.Group();
    [[1.8, 0.8], [1.4, 0.8], [1.0, 0.8]].forEach(([w, h], i) => tower.add(at(box(w, h, w, i % 2 ? "#3c3654" : "#2d2940"), 0, 0.4 + i * 0.8, 0)));
    tower.add(at(cone(0.9, 0.7, "#231f33", 4), 0, 2.75, 0));
    tower.add(at(ball(0.22, glow("#7ff0d6", 1)), 0, 3.25, 0));
    put(tower, -Math.PI / 2, r * 0.5, 1.4);

    const pool = at(mesh(new THREE.CircleGeometry(1.3, 12), mat("#141428", { roughness: 0.2 })), 0, 0.02, 0);
    pool.rotation.x = -Math.PI / 2;
    const arch = at(mesh(new THREE.TorusGeometry(1.2, 0.12, 5, 12, Math.PI), "#6d3a3a"), 0, 0, 0);
    put(group(pool, arch), Math.PI * 0.15, r * 0.5, 1.4);

    // 綿綿冰：碗＋冰山＋糖漿
    const bowl = mesh(new THREE.SphereGeometry(0.9, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat("#d8e6f0", { side: THREE.DoubleSide }));
    bowl.position.y = 0.9;
    const ice = at(cone(0.85, 1.3, "#f4f8ff", 10), 0, 1.45, 0);
    const syrup = at(cone(0.45, 0.6, "#e2627a", 10), 0, 1.86, 0);
    put(group(at(cyl(0.3, 0.4, 0.3, "#b9c9d6"), 0, 0.15, 0), bowl, ice, syrup), Math.PI * 0.75, r * 0.5, 1.1);

    for (let i = 0; i < 6; i++) put(flowers("#d8302c", 6, 0.5), rand(0, Math.PI * 2), rand(r * 0.55, r * 0.75), 0.4, false);
    for (let i = 0; i < 5; i++) {
      const w = at(ball(0.14, glow("#8be9ff", 1.2), 8), rand(-r * 0.6, r * 0.6), rand(1.2, 2.4), rand(-r * 0.6, r * 0.6));
      w.userData.baseY = w.position.y;
      w.userData.phase = rand(0, 6);
      w.castShadow = false;
      g.add(w);
      floaters.push(w);
    }
  },

  // 妖怪作業簿：竹林、攤開的大作業簿、草叢裡的眼睛、香菇
  yokai(g, r, put) {
    const grove = new THREE.Group();
    for (let i = 0; i < 9; i++) {
      const h = rand(2.6, 4.2), x = rand(-1, 1), z = rand(-1, 1);
      grove.add(at(cyl(0.07, 0.08, h, "#7fa64a", 6), x, h / 2, z));
      for (let k = 1; k < 4; k++) grove.add(at(cyl(0.09, 0.09, 0.05, "#5d7f33", 6), x, (h * k) / 4, z));
      grove.add(at(cone(0.35, 0.8, "#4f8a3c", 5), x, h + 0.2, z));
    }
    put(grove, -Math.PI / 2, r * 0.5, 1.6);

    const book = new THREE.Group();
    for (const s of [-1, 1]) {
      const cover = at(box(1.4, 0.06, 1.9, "#3d6fb6"), s * 0.62, 0.55, 0);
      cover.rotation.z = s * -0.55;
      const page = at(box(1.3, 0.04, 1.8, "#f6f1e2"), s * 0.6, 0.6, 0);
      page.rotation.z = s * -0.55;
      book.add(cover, page);
    }
    book.add(at(box(0.9, 0.3, 0.02, "#3d6fb6"), 0, 0.2, 0.96));
    put(book, Math.PI * 0.15, r * 0.48, 1.3);

    for (let i = 0; i < 4; i++) {
      const b = group(bush("#3c6a32", 0.55));
      for (const x of [-0.13, 0.13]) b.add(at(ball(0.07, glow("#ffe14a", 1.4), 6), x, 0.45, 0.45));
      put(b, Math.PI * (0.5 + i * 0.35), r * 0.68, 0.7);
    }
    for (let i = 0; i < 4; i++) {
      const s = rand(0.7, 1.2);
      const m = group(at(cyl(0.1, 0.12, 0.4, "#efe6d2"), 0, 0.2, 0),
        at(mesh(new THREE.SphereGeometry(0.32, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#c63c32"), 0, 0.38, 0));
      m.scale.setScalar(s);
      put(m, rand(0, Math.PI * 2), rand(r * 0.3, r * 0.7), 0.3, false);
    }
  },

  // 長篇溜溜球：黃土路、大溜溜球、引渡人的渡船碼頭、玄墨行者的大毛筆
  longroad(g, r, put) {
    const road = at(box(r * 1.6, 0.03, 1.4, "#d6bb7a"), 0, 0.02, 0, 0.5);
    road.receiveShadow = true;
    g.add(road);

    const yoyo = new THREE.Group();
    yoyo.add(at(cyl(0.06, 0.06, 3.2, "#6b4a2b"), -0.9, 1.6, 0), at(box(1.2, 0.1, 0.1, "#6b4a2b"), -0.35, 3.2, 0));
    yoyo.add(at(cyl(0.01, 0.01, 1.3, "#f6f1e2", 4), 0.2, 2.55, 0));
    const toy = new THREE.Group();
    for (const z of [-0.18, 0.18]) {
      const d = at(cyl(0.6, 0.6, 0.2, z < 0 ? "#e2633c" : "#f2b33c", 14), 0, 0, z);
      d.rotation.x = Math.PI / 2;
      toy.add(d);
    }
    toy.position.set(0.2, 1.6, 0);
    yoyo.add(toy);
    yoyo.userData.spin = toy;
    put(yoyo, -Math.PI / 2, r * 0.45, 1.3);

    // 碼頭伸出島外，船頭一盞引渡燈
    const pier = new THREE.Group();
    for (let i = 0; i < 6; i++) pier.add(at(box(1.2, 0.1, 0.45, i % 2 ? "#8a6a48" : "#7a5c3e"), 0, 0.05, i * 0.5));
    pier.add(at(box(1.0, 0.4, 2.0, "#5a4632"), 1.4, -0.65, 2.4));
    pier.add(at(lantern("#ffd36b"), 1.4, -0.45, 1.6));
    const pierAng = Math.PI * 0.6;
    pier.position.set(Math.cos(pierAng) * r * 0.62, 0, Math.sin(pierAng) * r * 0.62);
    pier.rotation.y = Math.atan2(Math.cos(pierAng), Math.sin(pierAng));
    g.add(pier);

    const brush = new THREE.Group();
    const handle = at(cyl(0.12, 0.12, 3, "#b7955a", 8), 0, 2.1, 0);
    brush.add(handle, at(cone(0.28, 0.8, "#15131a", 8), 0, 0.55, 0));
    brush.children[1].rotation.x = Math.PI;
    brush.add(at(box(1.4, 0.18, 0.9, "#22202a"), 0, 0.09, 0));
    brush.rotation.z = 0.15;
    put(brush, Math.PI * 1.05, r * 0.5, 0.9, false);
    put(palm(), Math.PI * 0.25, r * 0.7, 0.5);
  },

  // 人物ㄤ仔標：老街街屋（亭仔腳）、茶攤、小吃攤、一疊ㄤ仔標
  oldstreet(g, r, put) {
    const colors = [["#a5523a", "#7d3b2a"], ["#e0cda4", "#b29b72"], ["#c98a5a", "#94613d"]];
    colors.forEach(([wall, trim], i) => {
      const h = new THREE.Group();
      h.add(at(box(2.1, 2.8, 2, wall), 0, 1.4, 0));
      h.add(at(box(1.8, 1.1, 0.3, "#3b2b24"), 0, 0.55, 0.88)); // 亭仔腳
      h.add(at(box(2.2, 0.5, 0.25, trim), 0, 3.05, 0.9)); // 牌樓
      h.add(at(cyl(0.35, 0.35, 0.25, trim, 10), 0, 3.3, 0.9));
      h.children[3].rotation.x = Math.PI / 2;
      h.add(at(box(0.6, 0.6, 0.05, glow("#ffd890", 0.5)), -0.45, 1.85, 1.01), at(box(0.6, 0.6, 0.05, glow("#ffd890", 0.5)), 0.45, 1.85, 1.01));
      put(h, -Math.PI / 2 + (i - 1) * 0.38, r * 0.6, 1.3);
    });

    const tea = group(at(box(1.2, 0.08, 0.8, "#8a6a48"), 0, 0.75, 0), at(cyl(0.04, 0.04, 0.75, "#5a4632"), 0, 0.37, 0),
      at(cyl(0.03, 0.03, 2, "#5a4632"), 0, 1, 0), at(cone(1.2, 0.5, "#e8e0c8", 8), 0, 2.1, 0),
      at(cyl(0.12, 0.1, 0.25, "#b0b8b0"), 0.3, 0.92, 0), at(cyl(0.2, 0.2, 0.4, "#8a6a48"), -0.9, 0.2, 0.3));
    put(tea, Math.PI * 0.2, r * 0.55, 1.1);

    const cart = group(at(box(1.6, 0.9, 0.9, "#c94a3a"), 0, 0.75, 0), at(box(1.8, 0.08, 1.1, "#f2e6c8"), 0, 1.75, 0),
      at(cyl(0.03, 0.03, 0.9, "#5a4632"), -0.8, 1.3, 0.45), at(cyl(0.03, 0.03, 0.9, "#5a4632"), 0.8, 1.3, 0.45),
      at(ball(0.14, glow("#ffd36b", 1)), 0, 1.5, 0.3));
    for (const x of [-0.6, 0.6]) {
      const w = at(cyl(0.28, 0.28, 0.08, "#2e2a26", 10), x, 0.28, 0.48);
      w.rotation.x = Math.PI / 2;
      cart.add(w);
    }
    put(cart, Math.PI * 0.62, r * 0.55, 1.1);

    // ㄤ仔標：一疊圓紙牌，旁邊立一張大的
    const ang = new THREE.Group();
    ["#e2453c", "#3d6fb6", "#f2b33c", "#4f8a3c", "#f2e6c8"].forEach((c, i) => ang.add(at(cyl(0.45, 0.45, 0.06, c, 14), rand(-0.05, 0.05), 0.03 + i * 0.06, 0)));
    const big = at(cyl(0.7, 0.7, 0.06, "#f2b33c", 16), 0.9, 0.72, 0);
    big.rotation.x = Math.PI / 2 - 0.2;
    ang.add(big, at(cyl(0.45, 0.45, 0.07, "#e2453c", 5), 0.9, 0.72, 0.05));
    ang.children[6].rotation.x = Math.PI / 2 - 0.2;
    put(ang, Math.PI * 1.0, r * 0.5, 1);
    put(palm(), Math.PI * 0.4, r * 0.75, 0.5);
    put(palm(), Math.PI * 0.85, r * 0.75, 0.5);
  },

  // 老闆講古：老榕樹、廟口講古台、長板凳、一捆捆竹簡
  storytelling(g, r, put) {
    const tree = new THREE.Group();
    tree.add(at(cyl(0.45, 0.7, 2.6, "#6e5a44", 7), 0, 1.3, 0));
    for (let i = 0; i < 6; i++) tree.add(at(cyl(0.04, 0.04, 2.4, "#7d6a52", 4), Math.cos(i) * 1.4, 1.2, Math.sin(i) * 1.4));
    [[0, 3.2, 0, 1.7], [1.2, 2.9, 0.5, 1.2], [-1.2, 2.9, -0.3, 1.3], [0.3, 3.0, -1.1, 1.1]].forEach(([x, y, z, s]) => {
      const c = at(ball(s, "#3f6e35", 7), x, y, z);
      c.scale.y = 0.6;
      tree.add(c);
    });
    put(tree, Math.PI * 0.7, r * 0.55, 1.8);

    const stage = new THREE.Group();
    stage.add(at(box(3.2, 0.5, 2, "#8a3a2c"), 0, 0.25, 0), at(box(3.2, 2.2, 0.15, "#b8322a"), 0, 1.6, -0.95),
      at(box(3.4, 0.15, 0.25, "#e2b33c"), 0, 2.75, -0.95), at(box(1, 0.6, 0.6, "#6b3a22"), 0, 0.8, 0),
      at(box(0.25, 0.1, 0.12, "#2e1d14"), 0.2, 1.15, 0));
    put(stage, -Math.PI / 2, r * 0.5, 1.8);
    for (let i = 0; i < 3; i++) {
      const bench = group(at(box(2.4, 0.08, 0.4, "#9a7a52"), 0, 0.42, 0), at(box(0.08, 0.42, 0.35, "#6e5a44"), -1, 0.21, 0), at(box(0.08, 0.42, 0.35, "#6e5a44"), 1, 0.21, 0));
      put(bench, -Math.PI / 2, r * 0.5 - 2.4 - i * 0.9, 0.8);
    }
    const scrolls = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const s = at(cyl(0.18, 0.18, 0.9, "#d8c28a", 8), (i % 3) * 0.38 - 0.38, 0.18 + Math.floor(i / 3) * 0.33, 0);
      s.rotation.z = Math.PI / 2;
      scrolls.add(s);
    }
    put(scrolls, Math.PI * 0.15, r * 0.6, 0.8);
  },

  // 老闆碎碎念：深夜亮著燈的小屋（鐵窗）、屋外書桌與檯燈
  latenight(g, r, put) {
    const house = new THREE.Group();
    house.add(at(box(2.6, 2.2, 2.2, "#c8c2b0"), 0, 1.1, 0));
    const roof = at(box(2.9, 0.15, 2.5, "#4a5a6a"), 0, 2.3, 0);
    roof.rotation.x = 0.12;
    house.add(roof, at(box(0.8, 0.8, 0.05, glow("#ffcf6b", 1.2)), 0.5, 1.3, 1.11), at(box(0.7, 1.4, 0.05, "#5a4632"), -0.6, 0.7, 1.11));
    for (let i = 0; i < 4; i++) house.add(at(box(0.04, 0.85, 0.06, "#2a2e36"), 0.2 + i * 0.2, 1.3, 1.15)); // 鐵窗
    put(house, -Math.PI / 2, r * 0.5, 1.8);

    const desk = group(at(box(1.4, 0.08, 0.8, "#7a5c3e"), 0, 0.8, 0), at(box(0.08, 0.8, 0.7, "#5a4632"), -0.6, 0.4, 0), at(box(0.08, 0.8, 0.7, "#5a4632"), 0.6, 0.4, 0),
      at(cyl(0.03, 0.03, 0.5, "#2a2e36"), 0.45, 1.05, -0.2), at(cone(0.2, 0.2, glow("#ffd36b", 1.2), 8), 0.45, 1.3, -0.2),
      at(box(0.5, 0.06, 0.35, "#f6f1e2"), -0.15, 0.87, 0), at(cyl(0.08, 0.07, 0.15, "#e2453c"), -0.5, 0.92, 0.15));
    put(desk, Math.PI * 0.25, r * 0.5, 1);
    put(lantern("#ffd36b"), Math.PI * 0.7, r * 0.6, 0.4);
    const bench = group(at(box(1.8, 0.08, 0.5, "#6e7c8a"), 0, 0.45, 0), at(box(0.1, 0.45, 0.4, "#3a4450"), -0.7, 0.22, 0), at(box(0.1, 0.45, 0.4, "#3a4450"), 0.7, 0.22, 0));
    put(bench, Math.PI * 0.95, r * 0.55, 0.9);
    put(bush("#3d5a4a", 0.5), Math.PI * 1.2, r * 0.7, 0.5);
  },

  // 語巫故事報：報攤、印刷機、彩旗、佈告欄
  newspaper(g, r, put) {
    const kiosk = new THREE.Group();
    kiosk.add(at(box(2.2, 1.9, 1.6, "#3f7d6a"), 0, 0.95, 0), at(box(2.6, 0.12, 2.1, "#2f5e50"), 0, 2.0, 0.2),
      at(box(2.2, 0.7, 0.6, "#c9b48a"), 0, 0.35, 1.0));
    for (let i = 0; i < 4; i++) kiosk.add(at(box(0.42, 0.06 + i * 0.05, 0.4, "#f6f1e2"), -0.75 + i * 0.5, 0.73 + i * 0.025, 1.0));
    kiosk.add(at(sign("故事報", 1.6, 0.45), 0, 1.6, 0.82));
    put(kiosk, -Math.PI / 2, r * 0.5, 1.6);

    const press = new THREE.Group();
    press.add(at(box(1.6, 1.1, 0.9, "#4a4a52"), 0, 0.55, 0));
    for (const y of [1.25, 1.55]) {
      const roller = at(cyl(0.16, 0.16, 1.5, "#2a2a30", 10), 0, y, 0);
      roller.rotation.z = Math.PI / 2;
      press.add(roller);
    }
    const sheet = at(box(1.3, 0.02, 1.2, "#f6f1e2"), 0, 1.1, 0.9);
    sheet.rotation.x = 0.4;
    press.add(sheet);
    put(press, Math.PI * 0.2, r * 0.55, 1.1);

    // 彩旗：兩根竿子拉一串三角旗
    const flags = new THREE.Group();
    flags.add(at(cyl(0.05, 0.05, 2.6, "#6b4a2b"), -1.8, 1.3, 0), at(cyl(0.05, 0.05, 2.6, "#6b4a2b"), 1.8, 1.3, 0));
    const fc = ["#e2453c", "#f2b33c", "#3d6fb6", "#4f8a3c", "#f2e6c8"];
    for (let i = 0; i < 8; i++) {
      const f = at(cone(0.15, 0.35, fc[i % 5], 3), -1.55 + i * 0.44, 2.3 - Math.sin((i / 7) * Math.PI) * 0.3, 0);
      f.rotation.x = Math.PI;
      flags.add(f);
    }
    put(flags, Math.PI * 0.75, r * 0.55, 0.6);
    const board = group(at(box(1.8, 1.2, 0.1, "#7a5c3e"), 0, 1.4, 0), at(cyl(0.05, 0.05, 1.4, "#5a4632"), -0.7, 0.7, 0), at(cyl(0.05, 0.05, 1.4, "#5a4632"), 0.7, 0.7, 0),
      at(box(0.5, 0.65, 0.02, "#f6f1e2"), -0.45, 1.45, 0.06), at(box(0.55, 0.45, 0.02, "#f2e0b0"), 0.4, 1.5, 0.06));
    put(board, Math.PI * 1.1, r * 0.6, 0.9);
  },

  // 地方文化紀錄：百年中藥行（藥櫃）、曬藥竹篩、藥碾
  herbshop(g, r, put) {
    const shop = new THREE.Group();
    shop.add(at(box(3.4, 2.4, 2.4, "#6b4a2f"), 0, 1.2, -0.2), at(box(3.8, 0.2, 2.9, "#3a3430"), 0, 2.5, 0));
    shop.add(at(box(3.0, 1.9, 0.1, "#3a2618"), 0, 1.1, 1.0)); // 店內深色背景
    for (let row = 0; row < 4; row++) // 藥櫃：一格一格小抽屜
      for (let col = 0; col < 6; col++) {
        shop.add(at(box(0.42, 0.36, 0.08, "#a87a4a"), -1.15 + col * 0.46, 0.45 + row * 0.42, 1.07));
        shop.add(at(ball(0.03, "#e2b33c", 4), -1.15 + col * 0.46, 0.45 + row * 0.42, 1.12));
      }
    shop.add(at(sign("中藥行", 1.8, 0.5, "#1d1a17", "#e2b33c"), 0, 2.15, 1.12));
    put(shop, -Math.PI / 2, r * 0.45, 2);

    const rack = new THREE.Group();
    [0.5, 1.0].forEach((y, i) => {
      rack.add(at(cyl(0.75, 0.75, 0.06, "#c9a86a", 14), 0, y, 0));
      for (let k = 0; k < 8; k++) rack.add(at(box(0.12, 0.05, 0.12, ["#8a5a2a", "#a63a2a", "#6a7a3a"][(k + i) % 3]), rand(-0.45, 0.45), y + 0.05, rand(-0.45, 0.45)));
    });
    rack.add(at(cyl(0.04, 0.04, 1.1, "#5a4632"), 0, 0.55, 0));
    put(rack, Math.PI * 0.2, r * 0.55, 0.9);

    const grinder = group(at(box(1.3, 0.3, 0.4, "#5a5048"), 0, 0.15, 0), at(cyl(0.28, 0.28, 0.06, "#7a706a", 12), 0, 0.42, 0));
    grinder.children[1].rotation.x = Math.PI / 2;
    put(grinder, Math.PI * 0.65, r * 0.5, 0.8);
    for (let i = 0; i < 3; i++) put(group(at(cyl(0.22, 0.28, 0.55, "#7d8a6a", 8), 0, 0.27, 0), at(cyl(0.14, 0.14, 0.1, "#3a3430"), 0, 0.6, 0)), Math.PI * (0.9 + i * 0.1), r * 0.6, 0.4);
    put(palm(), Math.PI * 1.25, r * 0.7, 0.5);
  },
};

