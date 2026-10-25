/*
 * 故事柑仔店島：群島外圍的風景
 *
 * 1. 遠方一圈山：梯田、檳榔樹、相思樹、紅磚三合院、半山腰的土地公廟；入夜後山上有零星燈火。
 * 2. 海上的風景小島（純裝飾）：燈塔礁岩、蚵棚、鹽田、白鷺鷥沙洲、竹筏、水燈浮台。
 * 3. 漂流故事瓶：海上漂著發光的玻璃瓶，點到就隨機開一篇故事，像在海邊撿到一封信。
 *
 * 山和不會動的小島最後合併成少數幾個網格（bakeDeep），不太影響速度。
 */
import * as THREE from "three";
import { mat, glow, mesh, box, cyl, ball, cone, at, group, rot, scl, seeded, bakeDeep, roof } from "./kit.js";

const rng = seeded(2025);
const R = (a, b) => a + rng() * (b - a);

// ---------- 遠方的山 ----------
function hill(r, h, color) {
  const m = mesh(new THREE.ConeGeometry(r, h, 7, 2), color);
  // 讓山形不要太規則：每個頂點隨機推一點
  const pos = m.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    if (pos.getY(i) > -h / 2 + 0.01) {
      pos.setX(i, pos.getX(i) * R(0.85, 1.15));
      pos.setZ(i, pos.getZ(i) * R(0.85, 1.15));
      pos.setY(i, pos.getY(i) + R(-h * 0.06, h * 0.06));
    }
  }
  m.geometry.computeVertexNormals();
  m.castShadow = false;
  return m;
}
function terraces(w, steps, color) { // 一疊一疊的梯田
  const g = new THREE.Group();
  for (let i = 0; i < steps; i++) {
    const s = box(w - i * 1.6, 0.9, w * 0.6 - i * 1.0, i % 2 ? color : "#8fb55a");
    s.position.y = i * 0.9;
    s.castShadow = false;
    g.add(s, at(box(w - i * 1.6 + 0.1, 0.12, w * 0.6 - i * 1.0 + 0.1, "#cfe3a0"), 0, i * 0.9 + 0.5, 0));
  }
  return g;
}
function betelPalm() {
  const g = group(at(cyl(0.12, 0.16, 5, "#9a8a6a", 5), 0, 2.5, 0));
  for (let i = 0; i < 5; i++) g.add(rot(at(box(0.25, 0.08, 2.2, "#5a8a3c"), Math.sin(i * 1.26) * 0.8, 5, Math.cos(i * 1.26) * 0.8), -0.5, i * 1.26, 0));
  return g;
}
function acacia() { return group(at(cyl(0.2, 0.3, 2.2, "#6e5a44", 5), 0, 1.1, 0), at(scl(ball(1.8, "#4f7a3c", 6), 1.2, 0.7, 1.2), 0, 3.0, 0)); }
function sanheyuan() { // 紅磚三合院：正身加兩邊護龍，中間一片曬穀場
  const g = new THREE.Group();
  const brick = "#b25a3c", tile = "#7a3a2a";
  g.add(at(box(7, 2.2, 2.4, brick), 0, 1.1, -2.2), at(box(7.6, 0.4, 3.0, tile), 0, 2.5, -2.2));
  for (const s of [-1, 1]) g.add(at(box(2.2, 1.8, 5, brick), s * 3.4, 0.9, 1), at(box(2.7, 0.35, 5.5, tile), s * 3.4, 2.0, 1));
  g.add(at(box(4.4, 0.08, 4.2, "#d8c8a0"), 0, 0.04, 1.2));
  for (const x of [-1.5, 0, 1.5]) g.add(at(box(0.7, 0.7, 0.05, glow("#ffd890", 0.7)), x, 1.2, -0.98));
  return g;
}
function tudiShrine() {
  return group(at(box(1.6, 1.4, 1.4, "#c4473a"), 0, 0.7, 0), at(roof(2.2, 2.0, "#d9822b", "#2f7a62", "#2f7a62"), 0, 1.6, 0),
    at(ball(0.18, glow("#ffcf4a", 1.2), 6), 0, 0.7, 0.72));
}

export function buildMountains(scene, mapR) {
  const g = new THREE.Group();
  const inner = mapR + 55; // 拉近一點，全島俯瞰時畫面上緣看得到山
  // 三層山：越遠越高、越灰藍，看起來有遠近
  const layers = [
    { r: inner, n: 26, h: [16, 32], w: [18, 30], c: ["#5d8a46", "#6a9650", "#4f7a3c"] },
    { r: inner + 35, n: 22, h: [30, 52], w: [26, 40], c: ["#4f7050", "#5a7a5a"] },
    { r: inner + 75, n: 18, h: [45, 75], w: [40, 60], c: ["#5a6a78", "#66748a"] },
  ];
  for (const L of layers) for (let i = 0; i < L.n; i++) {
    const a = (i / L.n) * Math.PI * 2 + R(-0.08, 0.08);
    const d = L.r + R(-8, 8), h = R(...L.h);
    const m = hill(R(...L.w), h, L.c[i % L.c.length]);
    m.position.set(Math.cos(a) * d, h / 2 - 3, Math.sin(a) * d);
    g.add(m);
  }
  // 最近那層山腳：梯田、檳榔樹、相思樹、三合院、土地公廟、零星燈火
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + R(0, 0.3), d = inner - R(14, 22);
    const x = Math.cos(a) * d, z = Math.sin(a) * d, face = Math.atan2(-x, -z);
    const kind = i % 4;
    let obj;
    if (kind === 0) obj = terraces(R(10, 14), 4, "#7aa04a");
    else if (kind === 1) obj = sanheyuan();
    else if (kind === 2) { obj = new THREE.Group(); for (let k = 0; k < 6; k++) obj.add(at(betelPalm(), R(-5, 5), 0, R(-3, 3))); }
    else { obj = new THREE.Group(); for (let k = 0; k < 4; k++) obj.add(at(acacia(), R(-6, 6), 0, R(-3, 3))); }
    obj.position.set(x, 0.2, z);
    obj.rotation.y = face;
    obj.add(at(cyl(Math.max(6, 8), 9, 1.2, "#7a8a50", 8), 0, -0.4, 0)); // 山腳的土台，接住海面
    g.add(obj);
  }
  // 半山腰的土地公廟（面向群島）
  {
    const a = 1.9, d = inner + 6;
    const t = at(tudiShrine(), Math.cos(a) * d, 13, Math.sin(a) * d);
    t.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a));
    t.scale.setScalar(2);
    g.add(t);
  }
  // 入夜後山上的燈火（發光材質會跟著日夜自動變亮）
  const lamp = glow("#ffcf7a", 0.9);
  for (let i = 0; i < 40; i++) {
    const a = R(0, Math.PI * 2), d = inner + R(-5, 40);
    const s = ball(0.5, lamp, 5);
    s.position.set(Math.cos(a) * d, R(4, 24), Math.sin(a) * d);
    s.castShadow = false;
    g.add(s);
  }
  scene.add(g);
  bakeDeep(g);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; o.raycast = () => {}; } });
  return g;
}

// ---------- 海上的風景小島 ----------
function islet(r, h, color) { // 小小的底座：一圈石頭＋上面一層地
  return group(at(cyl(r, r * 1.15, h, "#8a8478", 9), 0, h / 2 - 0.6, 0), at(cyl(r * 0.92, r, 0.4, color, 9), 0, h - 0.4, 0));
}
const ISLETS = {
  lighthouse(anim, nightRef) { // 燈塔礁岩：入夜後光束旋轉掃過海面
    const g = islet(4, 1.6, "#9a9a8a");
    for (let i = 0; i < 4; i++) g.add(at(mesh(new THREE.DodecahedronGeometry(R(0.8, 1.4)), "#7a7468"), R(-3, 3), 1.2, R(-3, 3)));
    for (let i = 0; i < 5; i++) g.add(at(cyl(0.9 - i * 0.08, 0.95 - i * 0.08, 1.4, i % 2 ? "#f6f1e6" : "#c8433a", 10), 0, 1.9 + i * 1.4, 0));
    g.add(at(cyl(0.7, 0.7, 0.9, mat("#e8f4ff", { transparent: true, opacity: 0.5 }), 10), 0, 9.3, 0), at(cone(0.9, 0.9, "#2a2a30", 10), 0, 10.2, 0));
    const lamp = at(ball(0.45, glow("#fff1b0", 1.6), 8), 0, 9.3, 0);
    const beam = new THREE.Mesh(new THREE.ConeGeometry(2.6, 26, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff1b0, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
    beam.rotation.z = Math.PI / 2;
    beam.position.x = 13;
    const pivot = at(new THREE.Group(), 0, 9.3, 0);
    pivot.add(beam);
    g.add(lamp, pivot);
    g.userData.dynamic = true;
    anim.push((t, dt) => { pivot.rotation.y += dt * 0.6; beam.material.opacity = Math.max(0, nightRef.v - 0.35) * 0.35; });
    return g;
  },
  oyster(anim) { // 蚵棚：一排竹竿、浮在水上的蚵架，隨浪起伏
    const g = new THREE.Group();
    const rack = new THREE.Group();
    for (let i = 0; i < 6; i++) for (let k = 0; k < 3; k++) rack.add(at(cyl(0.07, 0.07, 3, "#b7955a", 4), -6 + i * 2.4, 0.6, -2.4 + k * 2.4));
    for (let k = 0; k < 3; k++) rack.add(at(box(13, 0.12, 0.12, "#a8844a"), 0, 1.5, -2.4 + k * 2.4));
    for (let i = 0; i < 6; i++) rack.add(at(box(0.12, 0.12, 5, "#a8844a"), -6 + i * 2.4, 1.5, 0));
    for (let i = 0; i < 10; i++) rack.add(at(cyl(0.35, 0.35, 0.5, "#f6f1e6", 8), -5 + i * 1.1, 0.25, R(-2, 2))); // 保麗龍浮球
    g.add(rack);
    g.userData.dynamic = true;
    anim.push((t) => { rack.position.y = Math.sin(t * 0.9) * 0.15; rack.rotation.z = Math.sin(t * 0.7) * 0.02; });
    return g;
  },
  saltfield() { // 鹽田小島：白色方格鹽田、一座小鹽山
    const g = islet(6, 1.2, "#cdbf9a");
    for (let i = 0; i < 3; i++) for (let k = 0; k < 3; k++) g.add(at(box(2.4, 0.06, 2.4, mat("#f2f6f8", { roughness: 0.15 })), -2.8 + i * 2.8, 1.25, -2.8 + k * 2.8));
    g.add(at(cone(1.4, 1.6, "#ffffff", 8), 4.2, 2.0, 3.6), at(box(0.1, 1.4, 2.2, "#8a6a48"), -4.6, 1.8, 0));
    return g;
  },
  egrets(anim) { // 白鷺鷥沙洲：偶爾有一隻飛起來繞一圈
    const g = islet(4.5, 0.9, "#e2d2a8");
    const bird = () => group(scl(ball(0.32, "#ffffff", 8), 1, 0.8, 1.6), at(cyl(0.05, 0.05, 0.6, "#ffffff", 4), 0, 0.4, 0.4), at(ball(0.14, "#ffffff", 6), 0, 0.72, 0.55),
      at(cone(0.04, 0.3, "#e2b33c", 4), 0, 0.7, 0.8), at(cyl(0.025, 0.025, 0.6, "#2a2a2a", 3), 0.1, -0.4, 0), at(cyl(0.025, 0.025, 0.6, "#2a2a2a", 3), -0.1, -0.4, 0));
    for (let i = 0; i < 4; i++) g.add(at(bird(), R(-2.5, 2.5), 1.4, R(-2.5, 2.5), R(0, 6)));
    const flyer = bird();
    g.add(flyer);
    g.userData.dynamic = true;
    anim.push((t) => {
      const k = (t * 0.08) % 1; // 大約 12 秒一輪：一半時間停著，一半時間飛一圈
      if (k < 0.5) flyer.position.set(1.5, 1.4, -1);
      else {
        const a = (k - 0.5) * 2 * Math.PI * 2;
        flyer.position.set(Math.cos(a) * 8, 1.4 + Math.sin((k - 0.5) * 2 * Math.PI) * 6, Math.sin(a) * 8);
        flyer.rotation.y = -a;
      }
    });
    return g;
  },
  raft(anim) { // 竹筏：斗笠漁夫，慢慢漂
    const g = new THREE.Group();
    const r = new THREE.Group();
    for (let i = 0; i < 7; i++) r.add(rot(at(cyl(0.22, 0.22, 6, "#c9a86a", 6), 0, 0.2, -1.4 + i * 0.46), 0, 0, Math.PI / 2));
    const man = group(at(cyl(0.35, 0.45, 1.0, "#4a5a6a", 8), 0, 0.9, 0), at(ball(0.35, "#e8b58f", 8), 0, 1.65, 0), at(cone(0.8, 0.4, "#c9a86a", 10), 0, 2.0, 0),
      rot(at(cyl(0.04, 0.04, 4, "#6b4a2b", 4), 0.8, 1.2, 0), 0, 0, 0.5));
    r.add(at(man, 1.5, 0.3, 0), at(box(0.8, 0.5, 0.6, "#8a6a48"), -1.6, 0.6, 0));
    g.add(r);
    g.userData.dynamic = true;
    anim.push((t) => { r.rotation.z = Math.sin(t * 1.1) * 0.05; r.rotation.x = Math.sin(t * 0.8) * 0.04; });
    return g;
  },
  lanterns(anim) { // 水燈浮台：一串放水燈、廟會燈籠
    const g = new THREE.Group();
    g.add(at(box(6, 0.4, 3, "#8a3a2a"), 0, 0.2, 0), at(box(6.2, 0.1, 3.2, "#e2b33c"), 0, 0.45, 0));
    for (const x of [-2.6, 2.6]) g.add(at(cyl(0.08, 0.08, 3, "#5a2a22", 5), x, 1.9, 0));
    g.add(rot(at(cyl(0.03, 0.03, 5.2, "#2a2a2a", 3), 0, 3.3, 0), 0, 0, Math.PI / 2));
    const lamps = [];
    for (let i = 0; i < 5; i++) { const l = at(scl(ball(0.32, glow(i % 2 ? "#ffb04a" : "#e2453c", 1.1), 8), 1, 1.2, 1), -2 + i, 2.85, 0); g.add(l); lamps.push(l); }
    for (let i = 0; i < 6; i++) g.add(at(group(box(0.6, 0.3, 0.6, "#f2e6c8"), at(ball(0.15, glow("#ffb04a", 1.2), 6), 0, 0.25, 0)), R(-5, 5), 0.15, R(-4, 4)));
    g.userData.dynamic = true;
    anim.push((t) => lamps.forEach((l, i) => (l.rotation.z = Math.sin(t * 1.5 + i) * 0.15)));
    return g;
  },
};

// 小島排在群島外圍、帆船航道再外面一點，不會擋到島，也不會被船撞到
export function buildIslets(scene, mapR, anim, nightRef, waveAt) {
  const order = ["lighthouse", "oyster", "saltfield", "egrets", "raft", "lanterns", "lighthouse", "egrets"];
  const placed = [];
  order.forEach((k, i) => {
    const a = (i / order.length) * Math.PI * 2 + 0.35;
    const d = mapR + 22 + (i % 2) * 6;
    const g = ISLETS[k](anim, nightRef);
    g.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
    g.rotation.y = R(0, Math.PI * 2);
    scene.add(g);
    // 漂在水上的那幾種跟著浪浮動
    if (k === "oyster" || k === "raft" || k === "lanterns") anim.push(() => (g.position.y = waveAt(g.position.x, g.position.z) + 0.1));
    if (k === "raft") anim.push((t) => { const b = a + Math.sin(t * 0.03) * 0.25; g.position.x = Math.cos(b) * d; g.position.z = Math.sin(b) * d; });
    placed.push(g);
  });
  return placed;
}

// ---------- 漂流故事瓶 ----------
// 海上漂著幾個發光的故事瓶；點到一個就開一篇隨機故事，那個瓶子沉下去，過一會兒在別處浮上來
export function buildBottles(scene, { count = 5, isSea, waveAt, mapR }) {
  const bottles = [];
  const glass = mat("#bfe6ff", { transparent: true, opacity: 0.55, roughness: 0.15 });
  const inner = ["#ffcf4a", "#8be9ff", "#ff8aa0", "#9cf08a", "#c8a0ff"];
  // 瓶子只漂在群島之間、俯瞰時看得到的那片海（太靠鏡頭那一側會跑到畫面下緣之外）
  const visible = (x, z) => Math.hypot(x, z) < mapR - 4 && z < mapR * 0.45;
  const spot = () => {
    for (let k = 0; k < 60; k++) {
      const a = Math.random() * Math.PI * 2, d = 12 + Math.random() * (mapR - 16);
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (isSea(x, z) && visible(x, z)) return [x, z];
    }
    return [0, -mapR * 0.5];
  };
  for (let i = 0; i < count; i++) {
    const g = new THREE.Group();
    const body = rot(group(at(cyl(0.35, 0.35, 1.1, glass, 10), 0, 0, 0), at(cyl(0.16, 0.3, 0.4, glass, 10), 0, 0.7, 0), at(cyl(0.15, 0.15, 0.25, "#a8784a", 8), 0, 1.0, 0),
      at(cyl(0.22, 0.22, 0.7, glow(inner[i % inner.length], 1.6), 8), 0, -0.05, 0)), 0, 0, Math.PI / 2 - 0.25);
    body.scale.setScalar(1.8);
    const halo = new THREE.Mesh(new THREE.RingGeometry(2.0, 3.4, 28), new THREE.MeshBasicMaterial({ color: inner[i % inner.length], transparent: true, opacity: 0.45, depthWrite: false }));
    halo.rotation.x = -Math.PI / 2;
    const hit = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); // 瓶子很小，放一顆看不見的大球方便點
    g.add(body, halo, hit);
    const [x, z] = spot();
    g.userData = { x, z, phase: Math.random() * 6, sink: 0, drift: Math.random() * Math.PI * 2 };
    g.position.set(x, 0, z);
    g.traverse((o) => { if (o.isMesh) o.userData.bottle = g; });
    scene.add(g);
    bottles.push({ g, body, halo });
  }
  return {
    bottles,
    pickables: bottles.map((b) => b.g),
    // 被撿走：沉下去，3 秒後在別處浮上來
    take(g) { g.userData.sink = 0.001; },
    update(t, dt) {
      for (const { g, body, halo } of bottles) {
        const u = g.userData;
        if (u.sink > 0) {
          u.sink += dt;
          g.position.y = waveAt(g.position.x, g.position.z) - u.sink * 1.5;
          if (u.sink > 3) { const [x, z] = spot(); Object.assign(u, { x, z, sink: 0 }); }
          continue;
        }
        u.x += Math.cos(u.drift) * dt * 0.25;
        u.z += Math.sin(u.drift) * dt * 0.25;
        if (!isSea(u.x, u.z) || !visible(u.x, u.z)) { // 碰到島或漂出看得到的範圍就轉向
          u.x -= Math.cos(u.drift) * dt * 0.5;
          u.z -= Math.sin(u.drift) * dt * 0.5;
          u.drift += Math.PI * 0.7;
        }
        g.position.set(u.x, waveAt(u.x, u.z) + 0.15, u.z);
        body.rotation.x = Math.sin(t * 1.3 + u.phase) * 0.25;
        halo.scale.setScalar(1 + Math.sin(t * 2 + u.phase) * 0.15);
        halo.material.opacity = 0.35 + Math.sin(t * 2 + u.phase) * 0.15;
      }
    },
  };
}
