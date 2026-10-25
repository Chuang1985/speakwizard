/*
 * 故事柑仔店島：場景與互動
 *
 * 流程：載入故事資料 → 依 island-config.js 蓋島（六角磚區或舊版區）、搭橋 → 放語巫、居民與本店
 * → 每幀更新走路、日夜、標籤。所有建模都用基本幾何形狀組成，不需要外部 3D 檔案。
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { OUTLINE, ZONES, BRIDGES, WIZARDS, SHOP, RESIDENTS } from "./island-config.js";
import { rand, pick, seeded, glowMats, mat, glow, mesh, box, cyl, ball, cone, at, group, rot, addOutline, sign, bakeDeep, bakeShallow } from "./kit.js";
import { THEMES, placer } from "./themes.js";
import { MODELS, animate } from "./characters.js";
import { BUILDERS, TEMPLATES, DECOR, gate, roadLamp } from "./buildings.js";
import { TOWN_BUILDERS, TOWN_TEMPLATES, TOWN_DECOR } from "./buildings-town.js";
import { SHEN_BUILDERS, SHEN_TEMPLATES, SHEN_DECOR } from "./buildings-shen.js";
import { YAO_BUILDERS, YAO_TEMPLATES, YAO_DECOR } from "./buildings-yao.js";
import { YOYO_BUILDERS, YOYO_TEMPLATES, YOYO_DECOR } from "./buildings-yoyo.js";
import { LAOBAN_BUILDERS, LAOBAN_TEMPLATES, LAOBAN_DECOR } from "./buildings-laoban.js";
import { createWeather, createSeaLife } from "./weather.js";

const ALL_BUILDERS = [BUILDERS, TOWN_BUILDERS, SHEN_BUILDERS, YAO_BUILDERS, YOYO_BUILDERS, LAOBAN_BUILDERS];
const ALL_TEMPLATES = [TEMPLATES, TOWN_TEMPLATES, SHEN_TEMPLATES, YAO_TEMPLATES, YOYO_TEMPLATES, LAOBAN_TEMPLATES];
const ANY_BUILDER = (model) => ALL_BUILDERS.find((b) => b[model])?.[model];
const ANY_TEMPLATE = (name) => ALL_TEMPLATES.find((b) => b[name])?.[name];

let ALL_POSTS = new Map(); // 全部故事，地標可以收別區的故事
const PROXY_MAT = new THREE.MeshBasicMaterial({ visible: false }); // 看不見的點選方塊

const TOP = 1.2; // 島面高度（水面是 0）
const SQ3 = Math.sqrt(3);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- 故事資料 ----------

function loadScript(src) {
  return new Promise((res) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => res(true);
    s.onerror = () => res(false);
    document.head.appendChild(s);
  });
}

async function loadPosts() {
  // 放在網站裡時讀即時資料；其他地方用快照
  if (location.hostname === "chuang1985.github.io") await loadScript("../data/index.js");
  if (typeof POSTS === "undefined") await loadScript("posts-snapshot.js");
  // eslint-disable-next-line no-undef
  return typeof POSTS === "undefined" ? [] : POSTS;
}

// ---------- 六角磚 ----------

const HEX_DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
const hexDist = (q, r) => (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2;
const hkey = (q, r) => q + "," + r;
function hexRound(fq, fr) {
  const fs = -fq - fr;
  let q = Math.round(fq), r = Math.round(fr);
  const s = Math.round(fs);
  const dq = Math.abs(q - fq), dr = Math.abs(r - fr), ds = Math.abs(s - fs);
  if (dq > dr && dq > ds) q = -r - s;
  else if (dr > ds) r = -q - s;
  return [q, r];
}
const angDiff = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));

// 各區專屬的道路規劃：設定哪些磚是路、門口朝哪條路、路邊的位置
// 每個規劃回傳 { stationFilter, door, slots }，slots 是 { 名稱: [路邊位置] }
const ROAD_PLANS = {
  // 地府旅程：路環一圈隔一圈，每圈在一側斷開（立石牆），旁邊開一格轉進內圈，走起來像一條往內盤旋的路
  spiral({ tiles, N, S, ang, riverA }) {
    const roadRings = [];
    for (let R = N - 1; R >= 2; R -= 2) roadRings.push(R);
    for (const t of tiles.values()) {
      if (t.d <= 1) t.type = "main";
      else if (roadRings.includes(t.d) && t.type === "ground") Object.assign(t, { type: "road", ring: t.d, style: t.d });
    }
    const nearest = (list, a) => list.reduce((best, t) => (!best || angDiff(ang(t), a) < angDiff(ang(best), a) ? t : best), null);
    let a = riverA;
    for (let i = 0; i < roadRings.length - 1; i++) {
      const R = roadRings[i];
      const brk = nearest([...tiles.values()].filter((t) => t.d === R && t.type === "road"), a);
      brk.type = "wall";
      const conn = nearest([...tiles.values()].filter((t) => t.d === R - 1 && t.type === "ground"), a + 1.6 * ((Math.PI * 2) / (6 * R)));
      Object.assign(conn, { type: "road", ring: roadRings[i + 1], style: roadRings[i + 1], connector: true });
      a += Math.PI;
    }
    const lotRings = roadRings.map((R) => R - 1).filter((d) => d >= 2);
    const side = (t) => {
      const a = ang(t);
      return { t, ring: t.ring, x: t.x + Math.cos(a) * S * 0.72, z: t.z + Math.sin(a) * S * 0.72 };
    };
    return {
      journey: true,
      stationFilter: (l) => lotRings.includes(l.t.d) && l.door.d === l.t.d + 1,
      door: (t, nbs) => nbs.find((n) => n.d === t.d + 1) || nbs[0],
      slots: (roads, jd) => {
        const all = roads.filter((t) => !t.exit && !t.connector && t.ring).sort((a, b) => jd(a) - jd(b)).map(side);
        const out = { side: all };
        for (const R of roadRings) out[`side:${R}`] = all.filter((s) => s.ring === R);
        return out;
      },
    };
  },

  // 老街棋盤巷弄：幾條橫巷（同一列）加兩條直巷（同一欄、上下交錯），中間是戲院前的廣場
  grid({ tiles, N, S, L }) {
    const rows = Object.keys(L.rows).map(Number);
    const cols = L.cols || [];
    for (const t of tiles.values()) {
      if (t.d <= 1) { t.type = "main"; continue; }
      if (t.d === 2) Object.assign(t, { type: "road", style: "plaza", plaza: true });
      if (rows.includes(t.r) && t.type !== "water") Object.assign(t, { type: "road", row: t.r, style: t.plaza ? "plaza" : L.rows[t.r] });
      const xi = t.q + t.r / 2; // 這一格在橫向的位置（以格寬為單位）
      for (const c of cols) if (xi >= c - 0.5 && xi < c + 0.5 && t.type !== "water") {
        Object.assign(t, { type: "road", col: c });
        if (t.row === undefined && !t.plaza) t.style = "alley";
      }
    }
    return {
      mirror: !!L.mirror,
      stationFilter: (l) => l.t.d < N && (!L.mirror || (l.door.row !== undefined && !l.door.plaza)),
      door: (t, nbs) => nbs.find((n) => n.row !== undefined && !n.plaza) || nbs.find((n) => n.col !== undefined) || nbs[0],
      slots: (roads) => {
        const out = { side: [] };
        // 橫巷：路的上下兩邊各一個位置，照由西到東排
        for (const R of rows) {
          const list = roads.filter((t) => t.row === R && t.col === undefined && !t.exit && !t.plaza).sort((a, b) => a.x - b.x);
          out[`row:${R}`] = list.flatMap((t, i) => [{ t, x: t.x, z: t.z - S * 0.72 }, { t, x: t.x, z: t.z + S * 0.72 }].map((s) => ({ ...s, k: i })));
        }
        // 直巷：左右兩邊
        out.side = roads.filter((t) => t.col !== undefined && t.row === undefined && !t.exit && !t.plaza).sort((a, b) => a.z - b.z)
          .flatMap((t) => [{ t, x: t.x - S * 0.75, z: t.z }, { t, x: t.x + S * 0.75, z: t.z }]);
        return out;
      },
      decorate(g, roads, anim) {
        // 進香道：兩旁成對的紅燈柱，廟前一座天公爐
        const A = Object.keys(L.rows).find((k) => L.rows[k] === "axis");
        if (A !== undefined) {
          roads.filter((t) => t.row === +A && !t.plaza && !t.exit && t.col === undefined).forEach((t, i) => {
            if (i % 2) return;
            for (const s of [-1, 1]) g.add(rot(at(SHEN_DECOR.redLantern(), t.x, t.h, t.z + s * S * 0.78), 0, s > 0 ? -Math.PI / 2 : Math.PI / 2, 0));
          });
          const front = roads.filter((t) => t.plaza && t.r === 0).sort((a, b) => b.x - a.x)[0];
          if (front) g.add(at(SHEN_DECOR.burner(anim), front.x + S * 0.2, front.h, front.z));
        }
        // 夜市：整條巷子頭上拉一串燈泡
        const R = Object.keys(L.rows).find((k) => L.rows[k] === "night");
        if (R === undefined) return;
        const list = roads.filter((t) => t.row === +R).sort((a, b) => a.x - b.x);
        if (list.length < 2) return;
        const a = list[0], b = list.at(-1), y = a.h + 2.5;
        for (const t of [a, b]) g.add(at(cyl(0.05, 0.05, 2.5, "#3a2a22", 5), t.x, t.h + 1.25, t.z));
        g.add(at(rot(cyl(0.01, 0.01, b.x - a.x, "#2a2a2a", 3), 0, 0, Math.PI / 2), (a.x + b.x) / 2, y, a.z));
        const n = Math.floor((b.x - a.x) / 0.7);
        const bulbs = [];
        for (let i = 1; i < n; i++) {
          const x = a.x + (i / n) * (b.x - a.x);
          const bulb = at(ball(0.08, glow(["#ffd36b", "#ff8aa0", "#8be9ff", "#9cf08a"][i % 4], 1.4), 6), x, y - 0.12 - Math.sin((i / n) * Math.PI) * 0.4, a.z);
          bulb.castShadow = false;
          g.add(bulb);
          bulbs.push(bulb);
        }
        anim.push((t) => bulbs.forEach((bl, i) => bl.scale.setScalar(0.85 + Math.max(0, Math.sin(t * 3 + i)) * 0.35)));
      },
    };
  },
};

// 會迷路的山徑：每個路口一條往中央蜿蜒的小徑，再岔出很多走到底就沒路的支線；地形高高低低
ROAD_PLANS.trails = function ({ tiles, N, S, nbs, rng, exits, L }) {
  const pickW = (opts) => { // 依權重隨機挑一個
    const sum = opts.reduce((s, o) => s + o.w, 0);
    let k = rng() * sum;
    for (const o of opts) if ((k -= o.w) <= 0) return o.t;
    return opts.at(-1).t;
  };
  for (const t of tiles.values()) {
    // 平滑起伏的地形，外緣高一點像山
    t.h = Math.max(0.05, 0.3 + 0.32 * (Math.sin(t.x * 0.42 + L.seed) + Math.cos(t.z * 0.37 - L.seed * 0.5)) + (t.d / N) * 0.35);
    t.hSet = true;
    if (t.d <= 1) t.type = "main";
    else if (t.d === 2 && t.type === "ground") Object.assign(t, { type: "road", style: "clearing", h: 0.15 });
  }
  for (const ex of exits.values()) ex.h = 0.1;
  // 主徑：從路口往中央走，可以往內或橫著走，不回頭
  for (const ex of exits.values()) {
    let cur = ex;
    const seen = new Set([ex]);
    for (let guard = 0; cur.d > 2 && guard < 60; guard++) {
      const opts = nbs(cur).filter((n) => n.type !== "main" && n.type !== "water" && !seen.has(n) && n.d <= cur.d)
        .map((n) => ({ t: n, w: n.d < cur.d ? 1 : 1.5 }));
      if (!opts.length) break;
      cur = pickW(opts);
      seen.add(cur);
      if (cur.type === "ground") Object.assign(cur, { type: "road", style: "trail" });
    }
  }
  // 支線：從主徑隨便一點岔出去，不能碰到別條路，走到底就是盡頭
  const tips = [];
  const trail = () => [...tiles.values()].filter((t) => t.type === "road" && t.d >= 3 && t.d <= N - 1 && !t.exit);
  for (let tries = 0; tries < 300 && tips.length < (L.branches || 12); tries++) {
    const start = trail()[Math.floor(rng() * trail().length)];
    if (!start) break;
    const path = [];
    let cur = start;
    const len = 2 + Math.floor(rng() * 4);
    for (let k = 0; k < len; k++) {
      const opts = nbs(cur).filter((n) => n.type === "ground" && n.d >= 2 && n.d <= N - 1 && !path.includes(n) &&
        nbs(n).every((m) => m === cur || path.includes(m) || m.type !== "road"));
      if (!opts.length) break;
      cur = opts[Math.floor(rng() * opts.length)];
      path.push(cur);
    }
    if (path.length < 2) continue;
    path.forEach((t) => Object.assign(t, { type: "road", style: "branch" }));
    path.at(-1).tip = true;
    tips.push(path.at(-1));
  }
  return {
    stationFilter: (l) => l.door.tip,
    door: (t, rn) => rn.find((n) => n.tip) || rn[0],
    // 路邊：往旁邊那塊空地偏一點
    slots: (roads) => ({
      side: roads.filter((t) => !t.exit && t.style !== "clearing").map((t) => {
        const gnd = nbs(t).find((n) => n.type === "ground");
        return gnd && { t, x: t.x + (gnd.x - t.x) * 0.5, z: t.z + (gnd.z - t.z) * 0.5 };
      }).filter(Boolean),
    }),
    // 沒人住的支線盡頭插一塊「回頭」
    decorate(g, roads, anim, items) {
      for (const tip of tips) if (!items.some((it) => it.door === tip)) g.add(at(YAO_DECOR.deadEnd(), tip.x, tip.h, tip.z, rng() * 6));
    },
  };
};

// 溜溜球線：中央一顆溜溜球，每條「線」從中央往外，在指定的幾列之間來回折（像一放一收的線）
// 路邊位置照線的順序排，連載就能從第一篇排到最後一篇
ROAD_PLANS.string = function ({ tiles, N, S, nbs, L }) {
  for (const t of tiles.values()) {
    if (t.d <= 1) t.type = "main";
    else if (t.d === 2 && t.type === "ground") Object.assign(t, { type: "road", style: "plaza" });
  }
  const seqs = {};
  for (const [name, spec] of Object.entries(L.strings)) {
    const seq = [];
    spec.rows.forEach((R, i) => {
      let row = [...tiles.values()].filter((t) => t.r === R && t.type !== "water" && !t.exit && t.type !== "main").sort((a, b) => a.x - b.x);
      if (i === 0) row = row.filter((t) => (spec.dir > 0 ? t.x >= -S : t.x <= S)); // 第一列只從中央往一邊放
      if ((i % 2 === 0 ? spec.dir : -spec.dir) < 0) row.reverse();
      if (seq.length && row.length) { // 用中間那一列的一格把兩列接起來
        const prev = seq.at(-1);
        const mid = nbs(prev).find((n) => nbs(n).includes(row[0]) && n.type !== "water" && n.type !== "main");
        if (mid) seq.push(mid);
      }
      seq.push(...row);
    });
    seq.forEach((t) => Object.assign(t, { type: "road", style: spec.style, string: name }));
    seqs[name] = seq;
  }
  // 沿著線的方向，每格路兩邊各兩個位置
  const sideSlots = (seq) => seq.flatMap((t, i) => {
    const a = seq[Math.max(0, i - 1)], b = seq[Math.min(seq.length - 1, i + 1)];
    let dx = b.x - a.x, dz = b.z - a.z;
    const len = Math.hypot(dx, dz) || 1;
    dx /= len; dz /= len;
    const out = [];
    for (const along of [-0.38, 0.38]) for (const side of [1, -1])
      out.push({ t, x: t.x + dx * along * S + -dz * side * S * 0.72, z: t.z + dz * along * S + dx * side * S * 0.72 });
    return out;
  });
  const slots = {};
  for (const [name, seq] of Object.entries(seqs)) slots[`string:${name}`] = sideSlots(seq);
  return {
    anchors: Object.fromEntries(Object.entries(seqs).flatMap(([n, s]) => [[`start:${n}`, s[0]], [`end:${n}`, s.at(-1)]])),
    stationFilter: (l) => l.t.d < N,
    door: (t, rn) => rn.find((n) => n.string) || rn[0],
    slots: (roads) => ({ ...slots, side: roads.filter((t) => !t.string && !t.exit).flatMap((t) => {
      const gnd = nbs(t).find((n) => n.type === "ground");
      return gnd ? [{ t, x: t.x + (gnd.x - t.x) * 0.5, z: t.z + (gnd.z - t.z) * 0.5 }] : [];
    }) }),
    // 線：沿路中間拉一條會發光的細線，一路接回中央的溜溜球
    decorate(g) {
      for (const [name, seq] of Object.entries(seqs)) {
        if (seq.length < 2) continue;
        const pts = [new THREE.Vector3(0, 1.0, 0), ...seq.map((t) => new THREE.Vector3(t.x, t.h + 0.08, t.z))];
        const line = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.2), pts.length * 4, 0.035, 4), glow(L.strings[name].line, 0.9));
        g.add(line);
      }
    },
  };
};

// 分區塊：整座島切成幾個扇形，每一塊用自己的路型，中央一圈廣場把它們接起來
//   grid9  方正棋盤（講古）＋外圈一段神話大道
//   alleys 彎彎曲曲的窄巷（碎碎念）
//   street 一條筆直的老街（藥街）
ROAD_PLANS.sectors = function ({ tiles, N, S, nbs, ang, rng, exits, L, z }) {
  const secs = z.sectors;
  const span = (Math.PI * 2) / secs.length;
  const entry = exits.get(L.entry) || exits.values().next().value;
  const a0 = ang(entry) - span / 2; // 入口落在第一塊的正中間
  const secOf = (t) => secs[Math.floor((((ang(t) - a0) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / span) % secs.length];
  const mod = (n, m) => ((n % m) + m) % m;
  for (const t of tiles.values()) {
    if (t.d <= 1) { t.type = "main"; continue; }
    t.sector = secOf(t).id;
    if (t.d === 2 && t.type === "ground") Object.assign(t, { type: "road", style: "plaza" });
  }
  const free = (t) => t.type === "ground" && t.d >= 3;
  secs.forEach((s, k) => {
    const mine = [...tiles.values()].filter((t) => t.sector === s.id);
    if (s.plan === "grid9") {
      for (const t of mine) if (free(t) && t.d < N && (mod(t.r, 3) === 0 || mod(t.q, 3) === 0)) Object.assign(t, { type: "road", style: "grid" });
      for (const t of mine) if (t.d === N - 1 && t.type !== "water") Object.assign(t, { type: "road", style: "myth" });
    } else if (s.plan === "street") {
      const b = a0 + (k + 0.5) * span;
      const end = mine.filter((t) => t.d === N - 1).reduce((best, t) => (!best || angDiff(ang(t), b) < angDiff(ang(best), b) ? t : best), null);
      for (let i = 2; i <= N - 1; i++) {
        const [q, r] = hexRound((end.q * i) / (N - 1), (end.r * i) / (N - 1));
        const t = tiles.get(hkey(q, r));
        if (t && (free(t) || t.type === "road")) Object.assign(t, { type: "road", style: "herb" });
      }
    } else { // alleys：幾條從廣場出發、在這一塊裡亂鑽的窄巷
      const starts = mine.filter((t) => t.d === 2);
      for (let w = 0; w < 6; w++) {
        let cur = starts[Math.floor(rng() * starts.length)];
        const len = 4 + Math.floor(rng() * 6);
        for (let i = 0; i < len && cur; i++) {
          const opts = nbs(cur).filter((n) => n.sector === s.id && n.d >= 3 && n.d < N && n.type !== "water" && n.type !== "main" && n.style !== "plaza");
          if (!opts.length) break;
          const outward = opts.filter((n) => n.d >= cur.d);
          const pool = outward.length && rng() < 0.75 ? outward : opts; // 多半往外鑽，偶爾橫著拐
          cur = pool[Math.floor(rng() * pool.length)];
          if (cur.type === "ground") Object.assign(cur, { type: "road", style: "night" });
        }
      }
    }
  });
  const toward = (t) => {
    const gnd = nbs(t).find((n) => n.type === "ground");
    return gnd && { t, x: t.x + (gnd.x - t.x) * 0.5, z: t.z + (gnd.z - t.z) * 0.5 };
  };
  const centers = {};
  for (const s of secs) {
    const mine = [...tiles.values()].filter((t) => t.sector === s.id && t.d >= 3);
    centers[s.id] = { x: mine.reduce((a, t) => a + t.x, 0) / mine.length, z: mine.reduce((a, t) => a + t.z, 0) / mine.length, h: 0 };
  }
  return {
    centers,
    stationFilter: (l) => l.t.d < N,
    door: (t, rn) => rn.find((n) => n.style !== "plaza") || rn[0],
    slots: (roads) => {
      const out = { side: roads.filter((t) => !t.exit).map(toward).filter(Boolean) };
      for (const t of roads) if (t.sector && !t.exit) {
        const key = `sectorRoad:${t.sector}:${t.style}`;
        const s = toward(t);
        if (s) (out[key] = out[key] || []).push(s);
      }
      return out;
    },
  };
};

const CIRCLED = (n) => (n >= 1 && n <= 20 ? String.fromCharCode(0x245f + n) : `${n}.`);

// 每區的空地裝飾
const ZONE_DECOR = {
  scholar: { // 老闆的地盤：松樹、盆竹、石燈
    flower: (g, t, S, rng) => {
      for (let k = 0; k < 3; k++) g.add(at(ball(0.2 + rng() * 0.12, rng() < 0.5 ? "#6a9a4a" : "#5d8a46", 6), t.x + (rng() - 0.5) * S, t.h + 0.12, t.z + (rng() - 0.5) * S));
    },
    free: (rng) => (rng() < 0.45 ? LAOBAN_DECOR.pine() : rng() < 0.5 ? LAOBAN_DECOR.bambooPot() : DECOR.stoneLantern()),
  },
  underworld: {
    flower: (g, t, S, rng) => {
      for (let k = 0; k < 6; k++) {
        const x = t.x + (rng() - 0.5) * S * 1.1, zz = t.z + (rng() - 0.5) * S * 1.1;
        g.add(at(cyl(0.015, 0.015, 0.4, "#3f6a35", 3), x, t.h + 0.2, zz), rot(at(cone(0.08, 0.18, glow("#e8302c", 0.2), 5), x, t.h + 0.45, zz), Math.PI));
      }
    },
    free: (rng) => (rng() < 0.5 ? DECOR.deadTree() : DECOR.stoneLantern()),
  },
  town: {
    flower: (g, t, S, rng) => {
      for (let k = 0; k < 3; k++) g.add(at(ball(0.25 + rng() * 0.15, rng() < 0.5 ? "#5d9a46" : "#4f8a3c", 6), t.x + (rng() - 0.5) * S, t.h + 0.15, t.z + (rng() - 0.5) * S));
    },
    free: (rng) => (rng() < 0.45 ? TOWN_DECOR.tree() : rng() < 0.6 ? TOWN_DECOR.scooter() : TOWN_DECOR.potted()),
  },
  wild: { // 長篇區：荒煙蔓草的黃土地，零星幾棵樹和大石
    flower: (g, t, S, rng) => g.add(at(YOYO_DECOR.grass(rng), t.x, t.h, t.z)),
    free: (rng) => (rng() < 0.5 ? YOYO_DECOR.lone(rng) : YOYO_DECOR.grass(rng)),
  },
  forest: { // 妖怪區：空地塞滿樹、香菇、蕨類，看不清林子裡有什麼
    flower: (g, t, S, rng) => {
      g.add(at(YAO_DECOR.mushroom(rng), t.x, t.h, t.z));
      for (let k = 0; k < 3; k++) g.add(rot(at(cone(0.12, 0.45, "#5a9a46", 3), t.x + (rng() - 0.5) * S, t.h + 0.2, t.z + (rng() - 0.5) * S), 0.4, rng() * 6, 0));
    },
    free: (rng) => {
      const gr = YAO_DECOR.forestTree(rng);
      if (rng() < 0.6) gr.add(at(YAO_DECOR.forestTree(rng), (rng() - 0.5) * 1.2, 0, (rng() - 0.5) * 1.2));
      return gr;
    },
  },
  temple: {
    flower: (g, t, S, rng) => {
      for (let k = 0; k < 3; k++) g.add(at(ball(0.22 + rng() * 0.12, rng() < 0.5 ? "#5d8a46" : "#6a9a4a", 6), t.x + (rng() - 0.5) * S, t.h + 0.13, t.z + (rng() - 0.5) * S));
    },
    free: (rng) => (rng() < 0.4 ? TOWN_DECOR.tree() : rng() < 0.5 ? SHEN_DECOR.incense() : DECOR.stoneLantern()),
  },
};

// 蓋一座六角磚島：鋪磚、依道路規劃開路，再把這一區每一篇故事放到地標、系列街坊或路標上
function buildTileZone(z, g, nbAngles, anim, zonePosts) {
  const L = z.layout, N = L.rings, S = L.size, W = SQ3 * S, C = L.colors;
  const rng = seeded(L.seed);
  const tiles = new Map();
  for (let q = -N; q <= N; q++) for (let r = -N; r <= N; r++) {
    const d = hexDist(q, r);
    if (d <= N) tiles.set(hkey(q, r), { q, r, d, x: W * (q + r / 2), z: 1.5 * S * r, type: "ground", h: 0 });
  }
  const T = (q, r) => tiles.get(hkey(q, r));
  const nbs = (t) => HEX_DIRS.map(([dq, dr]) => T(t.q + dq, t.r + dr)).filter(Boolean);
  const ang = (t) => Math.atan2(t.z, t.x);
  const all = () => [...tiles.values()];

  // 路口：往每個鄰區的那一格
  const exits = new Map();
  for (const [nid, a] of nbAngles) {
    const best = all().filter((t) => t.d === N && !t.exit).reduce((b, t) => (!b || angDiff(ang(t), a) < angDiff(ang(b), a) ? t : b), null);
    Object.assign(best, { type: "road", exit: nid, style: "exit" });
    exits.set(nid, best);
  }
  // 河：在路口最少的那一側外緣
  let sx = 0, sz = 0;
  for (const a of nbAngles.values()) { sx += Math.cos(a); sz += Math.sin(a); }
  const riverA = Math.atan2(-sz, -sx);
  for (const t of all()) if (t.d === N && t.type === "ground" && angDiff(ang(t), riverA) < 0.8) t.type = "water";

  const plan = ROAD_PLANS[L.plan]({ tiles, N, S, ang, riverA, L, z, nbs, exits, rng: seeded(L.seed + 1) });
  // 路口如果沒接到路，往島中央開一條小路接上
  for (const ex of exits.values()) {
    for (let i = N - 1; i >= 0; i--) {
      const [q, r] = hexRound((ex.q * i) / N, (ex.r * i) / N);
      const t = T(q, r);
      if (!t || t.type === "main") break;
      if (t.type === "road") break;
      Object.assign(t, { type: "road", style: t.style || "alley", spur: true });
    }
  }
  const roads = all().filter((t) => t.type === "road");
  roads.forEach((t) => (t.links = nbs(t).filter((n) => n.type === "road")));

  // 旅程距離：從入口沿路走幾步
  const start = exits.get(L.entry) || exits.values().next().value;
  const dist = new Map([[start, 0]]);
  for (const q = [start]; q.length;) {
    const t = q.shift();
    for (const n of t.links) if (!dist.has(n)) { dist.set(n, dist.get(t) + 1); q.push(n); }
  }
  const jd = (t) => dist.get(t) ?? 999;
  const roadNb = (t) => nbs(t).filter((n) => n.type === "road");
  const byJourney = (a, b) => jd(a.door) - jd(b.door) || ang(a.t) - ang(b.t);

  // 可以蓋的地方
  const lots = all().filter((t) => t.type === "ground" && t.d >= 2).map((t) => {
    const rn = roadNb(t);
    return rn.length ? { t, door: plan.door(t, rn) } : null;
  }).filter(Boolean).sort(byJourney);
  const outerLots = lots.filter((l) => l.t.d === N);
  const waterLots = all().filter((t) => t.type === "water").map((t) => ({ t, door: roadNb(t)[0] })).filter((l) => l.door)
    .sort((a, b) => angDiff(ang(a.t), riverA) - angDiff(ang(b.t), riverA));
  const slots = plan.slots(roads, jd);

  const used = new Set();
  const isFree = (s) => !used.has(s.t) && !used.has(s) && !(s.x !== undefined && used.has(`${s.x.toFixed(2)},${s.z.toFixed(2)}`));
  const spread = (arr, n) => {
    const free = arr.filter(isFree);
    return Array.from({ length: Math.min(n, free.length) }, (_, i) => free[Math.floor(((i + 0.5) * free.length) / n)]);
  };
  const items = [];
  const addAt = (info, obj, lot) => {
    if (lot.x === undefined) { // 蓋在一整格上，正面朝門口
      obj.position.set(lot.t.x, lot.t.h, lot.t.z);
      obj.rotation.y = Math.atan2(lot.door.x - lot.t.x, lot.door.z - lot.t.z);
      used.add(lot.t);
    } else { // 路邊，正面朝路
      obj.position.set(lot.x, lot.t.h, lot.z);
      obj.rotation.y = Math.atan2(lot.t.x - lot.x, lot.t.z - lot.z);
      used.add(lot);
      used.add(`${lot.x.toFixed(2)},${lot.z.toFixed(2)}`);
    }
    obj.traverse((o) => { if (o.isMesh) o.userData.building = info; });
    g.add(obj);
    // 區塊：地標用自己指定的；街坊與路標跟著所在的那一塊；報刊樓這種不屬於任何一塊
    items.push(Object.assign(info, { zone: z.id, sector: info.sector || (info.tier > 1 ? lot.t.sector : undefined), tile: lot.t, door: lot.door || lot.t, group: obj, lx: obj.position.x, lz: obj.position.z }));
  };
  // 建造時有登記動畫的（會轉、會晃、會閃），標成 dynamic，之後合併網格時跳過
  const markDyn = (fn) => { const n = anim.length; const o = fn(); if (anim.length > n) o.userData.dynamic = true; return o; };
  const build = (model) => markDyn(() => ANY_BUILDER(model)(anim));
  const template = (name) => (...args) => markDyn(() => ANY_TEMPLATE(name)(...args));
  const byId = new Map(zonePosts.map((p) => [p.id, p]));
  const postsOf = (ids) => (ids || []).map((id) => byId.get(id) || ALL_POSTS.get(id)).filter(Boolean);
  const inCat = (p, c) => (p.cats || [p.cat]).includes(c);
  // storiesCat：整個分類都收進這一棟（例如報刊樓收全部的語巫故事報，新的一期也會自動進來）
  const bPosts = (b) => (b.storiesCat ? zonePosts.filter((p) => inCat(p, b.storiesCat)) : postsOf(b.stories));
  const poolOf = (where) => {
    if (where === "outer" || where === "entrance") return outerLots;
    if (where === "water") return waterLots;
    if (where === "inner") return lots.filter((l) => l.t.d === 3).sort((a, b) => ang(a.t) - ang(b.t));
    if (where.startsWith("sector:")) { const s = where.slice(7); return lots.filter((l) => l.t.sector === s && l.t.d < N).sort((a, b) => ang(a.t) - ang(b.t) || a.t.d - b.t.d); }
    if (where.startsWith("lots:")) { const R = +where.slice(5); return lots.filter((l) => l.door.row === R && !l.door.plaza); }
    if (where.startsWith("anchor:")) { // 離某條線的起點或終點最近的空地
      const a = plan.anchors?.[where.slice(7)];
      if (a) return lots.filter((l) => l.t.d < N).sort((p, q) => Math.hypot(p.t.x - a.x, p.t.z - a.z) - Math.hypot(q.t.x - a.x, q.t.z - a.z));
    }
    return slots[where] || slots.side;
  };

  // 1. 指定位置的地標（河上、外緣、入口）
  for (const b of z.buildings.filter((x) => x.where)) {
    const lot = poolOf(b.where).find(isFree);
    if (lot) addAt({ ...b, tier: 1, label: b.name, posts: bPosts(b) }, build(b.model), lot);
  }
  // 2. 分到系列街坊、路標的故事
  const taken = new Set([...z.buildings.flatMap((b) => bPosts(b).map((p) => p.id)), ...(z.main?.stories || [])]);
  let rest = zonePosts.filter((p) => !taken.has(p.id)).sort((a, b) => (a.d || "").localeCompare(b.d || ""));
  const groups = (z.series || []).map((rule) => {
    // match 比系列名稱；matchTitle 比篇名（例如沒標系列、但篇名寫著「引渡人日記 day…」的）
    // matchCat 比分類（例如老闆碎碎念整個分類）
    const hit = rule.matchTitle ? ((re) => (p) => re.test(p.t))(new RegExp(rule.matchTitle))
      : rule.matchCat ? (p) => inCat(p, rule.matchCat) : (p) => (p.g || "") === rule.match;
    const list = rest.filter(hit);
    rest = rest.filter((p) => !list.includes(p));
    return { rule, list };
  });
  if (z.fallback) groups.push({ rule: z.fallback, list: rest });
  const placeGroup = ({ rule, list }) => {
    let spots = spread(poolOf(rule.where), list.length);
    if (spots.length < list.length) spots = spots.concat(spread(slots.side, list.length - spots.length)); // 不夠就借別的路邊
    list.forEach((p, i) => {
      if (!spots[i]) return console.warn("沒有位置放：", p.t);
      const short = p.t.replace(/[〈〉《》]/g, "").split(/[：:｜/]/).filter(Boolean).at(-1).slice(0, 6);
      // 名牌去掉系列名稱，只留能分辨的那一段（例如「學道（五）」「day30」）
      const prefix = rule.match || rule.matchTitle?.split("|")[0] || "";
      const tag = (p.t.replace(prefix, "").replace(/^[\s．・、：:（）()日記]+/, "").trim() || p.t).slice(0, 12);
      addAt({ id: "p" + p.id, name: p.t, label: tag, tier: rule.template === (z.fallback?.template) ? 3 : 2, series: rule.label, desc: rule.desc, posts: [p] },
        template(rule.template)(anim, short, i, p), spots[i]);
    });
  };
  // 先放要整格的街坊（例如亭仔腳店面），再放旅程地標，最後放路邊的
  groups.filter((gr) => gr.rule.where.startsWith("lots:")).forEach(placeGroup);
  // 3. 旅程（或散布）地標
  // 有指定區塊（sector）的地標，各自散布在自己那一塊裡
  for (const sid of new Set(z.buildings.filter((b) => b.sector && !b.where).map((b) => b.sector))) {
    const list = z.buildings.filter((b) => b.sector === sid && !b.where);
    spread(poolOf(`sector:${sid}`), list.length).forEach((lot, i) => addAt({ ...list[i], tier: 1, label: list[i].name, posts: bPosts(list[i]) }, build(list[i].model), lot));
  }
  const stations = z.buildings.filter((b) => !b.where && !b.sector);
  let chosen;
  if (plan.mirror) {
    // 中軸對稱：找左右鏡像的一對建築地，從入口（+x）往裡排，每對放兩座
    const pairs = [];
    for (const l of lots.filter(plan.stationFilter).filter((l) => l.t.r < 0 && isFree(l))) {
      const m = lots.find((o) => o.t === T(l.t.q + l.t.r, -l.t.r) && isFree(o));
      if (m && plan.stationFilter(m)) pairs.push([l, m]);
    }
    pairs.sort((a, b) => b[0].t.x - a[0].t.x);
    const n = Math.ceil(stations.length / 2);
    chosen = Array.from({ length: Math.min(n, pairs.length) }, (_, i) => pairs[Math.floor(((i + 0.5) * pairs.length) / n)]).flat();
  } else {
    const stationLots = plan.journey ? lots.filter(plan.stationFilter) : lots.filter(plan.stationFilter).sort((a, b) => ang(a.t) - ang(b.t));
    chosen = spread(stationLots, stations.length);
  }
  // 指定的位置不夠時（例如支線盡頭太少），剩下的地標散到其他空地，確保每一篇都上島
  if (chosen.length < stations.length) {
    const taken2 = new Set(chosen.map((l) => l.t));
    const more = lots.filter((l) => isFree(l) && !taken2.has(l.t) && l.t.d < N).sort((a, b) => ang(a.t) - ang(b.t));
    chosen = chosen.concat(spread(more, stations.length - chosen.length).filter((l) => !taken2.has(l.t)));
  }
  chosen.slice(0, stations.length).forEach((lot, i) => {
    const b = stations[i];
    addAt({ ...b, tier: 1, step: plan.journey ? i + 1 : null, label: plan.journey ? `${CIRCLED(i + 1)} ${b.name}` : b.name, posts: bPosts(b) }, build(b.model), lot);
  });
  groups.filter((gr) => !gr.rule.where.startsWith("lots:")).forEach(placeGroup);

  // 鋪磚與裝飾
  const deco = ZONE_DECOR[L.decor || "underworld"];
  // 磚柱高度依地形不同：底部一律到 -0.7，頂面在 h（同高度共用一份幾何）
  const geoCache = new Map();
  const tileGeoFor = (h) => {
    const k = Math.round((h + 0.7) * 20) / 20;
    if (!geoCache.has(k)) geoCache.set(k, new THREE.CylinderGeometry(S * 0.97, S * 0.97, k, 6));
    return geoCache.get(k);
  };
  const inset = new THREE.CylinderGeometry(S * 0.8, S * 0.8, 0.06, 6);
  for (const t of all()) {
    if (!t.hSet && (t.type === "ground" || t.type === "wall")) t.h = rng() * (L.decor === "town" ? 0.05 : 0.12) + 0.06;
    if (t.type === "water") t.h = -0.32;
    if (t.type === "main") t.h = 0.2;
    const free = t.type === "ground" && !used.has(t);
    if (free && rng() < 0.45) t.type = "flower";
    const color = { ground: rng() < 0.5 ? C.ground : C.ground2, wall: C.ground, flower: C.flower, road: C.roadEdge, water: C.water, main: C.main }[t.type];
    const m = t.type === "water" ? new THREE.MeshStandardMaterial({ color, emissive: "#0f4a58", emissiveIntensity: 0.6, roughness: 0.25, flatShading: true }) : mat(color);
    const tile = new THREE.Mesh(tileGeoFor(t.h), m);
    tile.position.set(t.x, (t.h - 0.7) / 2, t.z);
    tile.receiveShadow = true;
    g.add(tile);
    if (t.type === "road") g.add(at(mesh(inset, C.roads?.[t.style] || C.roads?.alley || C.road || C.roadEdge), t.x, t.h + 0.01, t.z));
    if (t.type === "wall") g.add(rot(at(DECOR.wall(), t.x, t.h, t.z), 0, Math.atan2(t.x, t.z) + Math.PI / 2, 0));
    if (t.type === "flower") deco.flower(g, t, S, rng);
    else if (free) g.add(at(deco.free(rng), t.x + (rng() - 0.5) * 0.6, t.h, t.z + (rng() - 0.5) * 0.6, rng() * 6));
    if (t.d === N && t.type !== "road" && rng() < 0.5)
      g.add(at(mesh(new THREE.DodecahedronGeometry(rand(0.2, 0.4)), "#6a6478"), t.x + (rng() - 0.5), t.h + 0.1, t.z + (rng() - 0.5)));
  }
  // 沒用到的路邊每隔幾格一盞路燈
  (slots.side || []).filter(isFree).forEach((s, i) => {
    if (i % 4) return;
    g.add(rot(at(roadLamp(), s.x, s.t.h, s.z), 0, -ang(s.t), 0));
  });
  const nKids = g.children.length, nAnim = anim.length;
  plan.decorate?.(g, roads, anim, items);
  if (anim.length > nAnim) g.children.slice(nKids).forEach((c) => (c.userData.dynamic = true));
  // 牌坊：每個路口
  for (const t of exits.values()) g.add(rot(at(gate(L.gate, L.gateStyle), t.x, t.h, t.z), 0, Math.atan2(t.x, t.z) + Math.PI / 2, 0));
  // 島身
  const baseR = N * W + S * 0.6;
  g.add(rot6(mesh(new THREE.CylinderGeometry(baseR, baseR * 0.85, 1.4, 6), L.decor === "town" ? "#6a5a40" : "#2e2a3e"), -1.1));
  const rock = mesh(new THREE.ConeGeometry(baseR * 0.85, baseR * 0.6, 6), L.decor === "town" ? "#5a5668" : "#3e3a50");
  rock.rotation.set(Math.PI, Math.PI / 6, 0);
  rock.position.y = -1.8 - baseR * 0.3;
  g.add(rock);

  // 效能：每棟建築先放一個看不見的點選方塊，再把整座島不會動的零件合併成少數幾個網格
  g.updateMatrixWorld(true);
  const box3 = new THREE.Box3(), size = new THREE.Vector3(), center = new THREE.Vector3();
  for (const it of items) {
    box3.setFromObject(it.group);
    if (box3.isEmpty()) continue;
    box3.getSize(size);
    box3.getCenter(center);
    const proxy = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), PROXY_MAT);
    proxy.position.copy(g.worldToLocal(center));
    proxy.rotation.y = -(g.rotation.y || 0);
    proxy.visible = false;
    proxy.userData = { proxy: true, building: it };
    g.add(proxy);
  }
  bakeDeep(g, (o) => o.userData.dynamic || o.userData.proxy || o.isCSS2DObject);

  // 檢查：這一區每一篇都有位置
  const placedIds = new Set([...items.flatMap((it) => it.posts.map((p) => p.id)), ...(z.main?.stories || [])]);
  const missing = zonePosts.filter((p) => !placedIds.has(p.id));
  console.info(`[${z.name}] ${zonePosts.length} 篇，已上島 ${zonePosts.length - missing.length} 篇`, missing.map((p) => p.t));

  return { tiles, roads, exits, items, S, outer: baseR, N, centers: plan.centers };
}
function rot6(m, y) {
  m.rotation.y = Math.PI / 6;
  m.position.y = y;
  return m;
}
function tilePath(from, to) {
  if (from === to) return [];
  const prev = new Map([[from, null]]);
  const q = [from];
  while (q.length) {
    const t = q.shift();
    if (t === to) break;
    for (const n of t.links) if (!prev.has(n)) { prev.set(n, t); q.push(n); }
  }
  if (!prev.has(to)) return [];
  const out = [];
  for (let t = to; t !== from; t = prev.get(t)) out.push(t);
  return out.reverse();
}

// ---------- 本店：推車上的柑仔店 ----------

function lantern(color = "#e2453c") {
  return group(at(cyl(0.03, 0.03, 1.6, "#3a2a22"), 0, 0.8, 0), at(ball(0.2, glow(color, 0.6)), 0, 1.6, 0));
}
function buildShop() {
  const g = new THREE.Group();
  const s = new THREE.Group();
  s.add(at(box(2.8, 0.25, 2.1, "#7a5c3e"), 0, 0.5, 0));
  for (const [x, z] of [[-1.1, 0.95], [1.1, 0.95], [-1.1, -0.95], [1.1, -0.95]]) {
    const w = at(cyl(0.32, 0.32, 0.12, "#3a2e26", 10), x, 0.32, z);
    w.rotation.z = Math.PI / 2;
    w.userData.wheel = true;
    s.add(w);
  }
  s.add(at(box(2.5, 1.9, 1.8, "#efe0bf"), 0, 1.6, -0.05));
  s.add(at(box(2.1, 1.3, 0.1, "#4a3424"), 0, 1.45, 0.86));
  for (let row = 0; row < 2; row++)
    for (let col = 0; col < 4; col++) {
      const c = ["#8be9ff", "#ffcf4a", "#ff8aa0", "#9cf08a"][(row + col) % 4];
      s.add(at(cyl(0.14, 0.14, 0.38, mat("#e8f4ff", { transparent: true, opacity: 0.45 }), 8), -0.72 + col * 0.48, 1.12 + row * 0.6, 0.95));
      s.add(at(cyl(0.09, 0.09, 0.22, glow(c, 0.9), 6), -0.72 + col * 0.48, 1.08 + row * 0.6, 0.95));
    }
  for (let i = 0; i < 7; i++) {
    const strip = at(box(0.38, 0.06, 0.9, i % 2 ? "#f6f1e2" : "#d9443a"), -1.15 + i * 0.38, 2.42, 1.15);
    strip.rotation.x = 0.35;
    s.add(strip);
  }
  s.add(at(box(2.7, 0.15, 2.0, "#5a4632"), 0, 2.6, -0.05));
  s.add(at(sign("故事柑仔店", 2.6, 0.62, "#c8433a", "#fff3d6"), 0, 3.05, 0.4));
  s.add(at(lantern("#ffd36b"), 1.45, 0.6, 1.0));
  g.add(s);
  g.scale.setScalar(0.8);
  return { g, body: s, kind: "shop" };
}

// ---------- 場景 ----------

export async function start({ stage, ui }) {
  const posts = (await loadPosts()).filter((p) => p && p.t);
  posts.sort((a, b) => (b.d || "").localeCompare(a.d || ""));
  ALL_POSTS = new Map(posts.map((p) => [p.id, p]));

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  // 手機：解析度與陰影細節降一點，換取順暢
  const isPhone = Math.min(innerWidth, innerHeight) <= 720;
  renderer.setPixelRatio(Math.min(devicePixelRatio, isPhone ? 1.5 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  stage.appendChild(renderer.domElement);
  const labels = new CSS2DRenderer();
  labels.domElement.className = "labels";
  labels.domElement.style.pointerEvents = "none"; // 標籤本身可點，其餘交給畫布
  stage.appendChild(labels.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 700);
  camera.position.set(0, 78, 96);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = 1.28;
  controls.minDistance = 10;
  controls.maxDistance = 180;
  controls.target.set(0, 0, 4);

  // 天空：上下兩色漸層，日落與入夜之間轉換
  const skyU = { top: { value: new THREE.Color() }, bottom: { value: new THREE.Color() } };
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(450, 24, 12), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: skyU,
    vertexShader: "varying float h; void main(){ h = normalize(position).y; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }",
    fragmentShader: "uniform vec3 top; uniform vec3 bottom; varying float h; void main(){ gl_FragColor = vec4(mix(bottom, top, smoothstep(-0.05, 0.5, h)), 1.); }",
  })));
  scene.fog = new THREE.Fog(0x000000, 140, 380);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444466, 1);
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(isPhone ? 1024 : 2048, isPhone ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 1, far: 300 });
  sun.shadow.bias = -0.0008;
  scene.add(hemi, sun, sun.target);
  const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(9, 16, 10), new THREE.MeshBasicMaterial({ color: 0xffa04a, fog: false, transparent: true }));
  const moonDisc = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 10), new THREE.MeshBasicMaterial({ color: 0xfff6d8, fog: false, transparent: true }));
  scene.add(sunDisc, moonDisc);

  // 水面：低多邊形波浪
  const waterGeo = new THREE.PlaneGeometry(460, 460, 70, 70);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x3d6f8f, roughness: 0.35, metalness: 0.1, flatShading: true });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.receiveShadow = true;
  scene.add(water);
  const waterBase = waterGeo.attributes.position.array.slice();

  // ---- 島 ----
  const zones = new Map();
  const floaters = [];
  const spinners = [];
  const anim = []; // 建築的動態零件
  const pickables = [];
  const buildingLabels = [];
  const subTags = []; // 合併區的區塊名牌：靠近那座島才顯示
  const nbAnglesOf = (z) => new Map(BRIDGES.filter((b) => b.includes(z.id)).map((b) => {
    const o = ZONES.find((x) => x.id === (b[0] === z.id ? b[1] : b[0]));
    return [o.id, Math.atan2(o.pos[1] - z.pos[1], o.pos[0] - z.pos[0])];
  }));

  for (const z of ZONES) {
    const zcats = z.cats || [z.cat]; // 合併區一次收好幾個分類
    const zp = posts.filter((p) => (p.cats || [p.cat]).some((c) => zcats.includes(c)));
    const g = new THREE.Group();
    g.position.set(z.pos[0], TOP, z.pos[1]);
    const zone = { ...z, group: g, posts: zp, obstacles: [], nb: [], buildings: [] };

    if (z.layout?.kind === "tiles") {
      // align: "entry" 把整座島轉向入口那一區，讓中軸線（第 0 列）筆直對著它
      let nb = nbAnglesOf(z);
      zone.rotY = 0;
      if (z.layout.align === "entry" && nb.has(z.layout.entry)) {
        zone.rotY = -nb.get(z.layout.entry);
        g.rotation.y = zone.rotY;
        nb = new Map([...nb].map(([id, a]) => [id, a + zone.rotY]));
      }
      const tz = buildTileZone(z, g, nb, anim, zp);
      Object.assign(zone, { tiles: tz.tiles, roads: tz.roads, exits: tz.exits, S: tz.S, r: tz.outer, N: tz.N, centers: tz.centers });
      // 區塊名牌：浮在每一塊的中間，點了飛過去
      for (const s of z.sectors || []) {
        const c = tz.centers[s.id];
        const el = document.createElement("button");
        el.className = "zone-tag sub";
        el.innerHTML = `<b>${s.name}</b><small>${zp.filter((p) => (p.cats || [p.cat]).includes(s.cat)).length} 瓶</small>`;
        el.addEventListener("click", () => openSector(z.id, s.id));
        const lbl = new CSS2DObject(el);
        lbl.position.set(c.x, 4.2, c.z);
        g.add(lbl);
        subTags.push({ el, zone });
      }
      // 總建築
      const main = ANY_BUILDER(z.main.model)(anim);
      main.position.y = 0.2;
      main.scale.setScalar(0.9);
      main.rotation.y = z.layout.mainFace ?? Math.PI / 2 + 0.52; // 正門朝向入口或大部分鏡頭
      main.traverse((o) => { if (o.isMesh) o.userData.main = z.id; });
      g.add(main);
      // 總建築自己也收故事時，當成一棟地標（居民可以住在裡面）
      if (z.main.stories) {
        const center = tz.tiles.get(hkey(0, 0));
        const entry = tz.exits.get(z.layout.entry) || center;
        const door = tz.roads.filter((t) => t.d === 2).sort((a, b) => Math.hypot(a.x - entry.x, a.z - entry.z) - Math.hypot(b.x - entry.x, b.z - entry.z))[0];
        zone.buildings.push({ id: "main", name: z.main.name, label: z.main.name, desc: z.main.desc, tier: 1, zone: z.id, tile: center, door, group: main,
          posts: z.main.stories.map((id) => ALL_POSTS.get(id)).filter(Boolean), isMain: true });
      }
      // 名牌：地標高一點；街坊與路燈矮一點、字小一點
      for (const info of tz.items) {
        const el = document.createElement("button");
        el.className = `bld-tag tier${info.tier}`;
        el.textContent = info.label;
        el.hidden = true;
        el.addEventListener("click", () => openBuilding(info));
        const lbl = new CSS2DObject(el);
        lbl.position.set(info.lx, info.tile.h + (info.tier === 1 ? 2.7 : 1.9), info.lz);
        g.add(lbl);
        info.el = el;
        buildingLabels.push(info);
        zone.buildings.push(info);
      }
    } else {
      const r = 6.2 + Math.sqrt(zp.length || 1) * 0.42;
      zone.r = r;
      const top = mesh(new THREE.CylinderGeometry(r, r, 0.5, 6), z.ground);
      top.position.y = -0.25;
      const dirt = mesh(new THREE.CylinderGeometry(r * 0.98, r * 0.78, 1.4, 6), "#7a5a40");
      dirt.position.y = -1.2;
      const rock = mesh(new THREE.ConeGeometry(r * 0.78, r * 0.7, 6), "#5a5668");
      rock.rotation.x = Math.PI;
      rock.position.y = -1.9 - r * 0.35;
      g.add(top, dirt, rock);
      for (let i = 0; i < 7; i++) {
        const a = rand(0, Math.PI * 2);
        g.add(at(mesh(new THREE.DodecahedronGeometry(rand(0.2, 0.45)), "#8a8478"), Math.cos(a) * r * 0.82, 0.1, Math.sin(a) * r * 0.82));
      }
      THEMES[z.theme](g, r, placer(g, zone.obstacles), floaters);
      g.traverse((o) => o.userData.spin && spinners.push(o.userData.spin));
    }
    g.traverse((o) => { if (o.isMesh && !o.userData.building && !o.userData.main) o.userData.zone = z.id; });
    pickables.push(g);
    scene.add(g);

    const tag = document.createElement("button");
    tag.className = "zone-tag";
    tag.innerHTML = `<b>${z.name}</b><small>${zp.length} 瓶</small>`;
    tag.addEventListener("click", () => openZone(z.id));
    const lbl = new CSS2DObject(tag);
    lbl.position.set(0, zone.tiles ? 8.6 : 5.2, 0);
    g.add(lbl);
    zones.set(z.id, zone);
  }
  // 磚的區域座標 → 世界座標（島有轉向時一起轉）
  const tileWorld = (zone, t, lane = 0) => {
    const c = Math.cos(zone.rotY || 0), s = Math.sin(zone.rotY || 0);
    return new THREE.Vector3(zone.pos[0] + t.x * c + t.z * s + lane, TOP + t.h, zone.pos[1] - t.x * s + t.z * c + lane * 0.6);
  };

  // ---- 橋 ----
  const bridgeGroup = new THREE.Group(); // 橋的木板、欄杆最後合併成幾個網格
  scene.add(bridgeGroup);
  for (const [a, b] of BRIDGES) {
    const A = zones.get(a), B = zones.get(b);
    if (!A || !B) continue;
    const end = (Z, O) => {
      const c = new THREE.Vector3(Z.pos[0], TOP, Z.pos[1]);
      if (Z.exits?.has(O.id)) {
        const p = tileWorld(Z, Z.exits.get(O.id));
        const out = p.clone().sub(c).setY(0).normalize().multiplyScalar(Z.S * 0.95);
        return p.add(out).setY(TOP);
      }
      const dir = new THREE.Vector3(O.pos[0] - Z.pos[0], 0, O.pos[1] - Z.pos[1]).normalize();
      return c.addScaledVector(dir, Z.r * 0.8);
    };
    const s = end(A, B), e = end(B, A);
    const mid = s.clone().lerp(e, 0.5);
    mid.y += 1.4;
    const curve = new THREE.QuadraticBezierCurve3(s, mid, e);
    const red = a === "hun" || b === "hun"; // 通往地府的是紅色奈何橋
    const plankMat = mat(red ? "#8a3a34" : "#9a7650");
    const n = Math.ceil(curve.getLength() / 0.5);
    for (let i = 0; i <= n; i++) {
      const p = curve.getPoint(i / n);
      const t = curve.getTangent(i / n);
      const plank = mesh(new THREE.BoxGeometry(1.7, 0.12, 0.42), plankMat);
      plank.position.copy(p).y -= 0.06;
      plank.lookAt(p.clone().add(t));
      bridgeGroup.add(plank);
      if (i % 4 === 0) for (const side of [-1, 1]) {
        const off = new THREE.Vector3(-t.z, 0, t.x).normalize().multiplyScalar(0.85 * side);
        bridgeGroup.add(at(cyl(0.05, 0.05, 0.7, red ? "#5a1f1f" : "#6b4a2b", 5), p.x + off.x, p.y + 0.3, p.z + off.z));
        if (red && i % 8 === 0) bridgeGroup.add(at(ball(0.11, glow("#ff6a4a", 0.8), 6), p.x + off.x, p.y + 0.72, p.z + off.z));
      }
    }
    for (const side of [-1, 1]) {
      const pts = curve.getPoints(24).map((p, i, arr) => {
        const t = curve.getTangent(i / (arr.length - 1));
        return p.clone().add(new THREE.Vector3(-t.z, 0, t.x).normalize().multiplyScalar(0.85 * side)).setY(p.y + 0.62);
      });
      bridgeGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.03, 4), mat(red ? "#c8433a" : "#d8c28a")));
    }
    A.nb.push({ to: b, curve, rev: false });
    B.nb.push({ to: a, curve, rev: true });
  }
  bakeDeep(bridgeGroup);

  // 水燈：幽魂區旁邊漂幾盞
  const hun = zones.get("hun");
  const waterLanterns = [];
  if (hun) for (let i = 0; i < 9; i++) {
    const l = group(box(0.5, 0.25, 0.5, "#f2e6c8"), at(ball(0.12, glow("#ffb04a", 1.2), 6), 0, 0.22, 0));
    l.userData = { cx: hun.pos[0], cz: hun.pos[1], rad: hun.r + rand(1.2, 3), a: rand(0, 6.28), sp: rand(0.02, 0.05) };
    scene.add(l);
    waterLanterns.push(l);
  }

  // ---- 海浪、天氣、海上生態 ----
  // 海面高度：兩層小浪加一層長浪，天氣越差浪越大（帆船、魚、漣漪都照這個高度浮）
  let waveAmp = 1, waveT = 0;
  const waveAt = (x, z) => (Math.sin(x * 0.12 + waveT) * 0.18 + Math.cos(z * 0.15 + waveT * 0.8) * 0.18
    + Math.sin((x + z) * 0.045 + waveT * 0.5) * 0.3) * waveAmp - 0.1;
  const weather = createWeather(scene);
  const sea = createSeaLife(scene, zones, waveAt);
  ui.onWeather = (m) => weather.setMode(m);

  // ---- 角色 ----
  function randomSpot(zone, keepCenter = true) {
    for (let k = 0; k < 30; k++) {
      const a = rand(0, Math.PI * 2), d = Math.sqrt(Math.random()) * zone.r * 0.72;
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (keepCenter && d < 2.2) continue; // 中央廣場留給本店
      if (zone.obstacles.some((o) => Math.hypot(o.x - x, o.z - z) < o.rad)) continue;
      return new THREE.Vector3(zone.pos[0] + x, TOP, zone.pos[1] + z);
    }
    return new THREE.Vector3(zone.pos[0] + zone.r * 0.3, TOP, zone.pos[1]);
  }
  function nearestRoad(zone, p) {
    let best = null, bd = Infinity;
    for (const t of zone.roads) {
      const w = tileWorld(zone, t);
      const d = Math.hypot(w.x - p.x, w.z - p.z);
      if (d < bd) { bd = d; best = t; }
    }
    return best;
  }

  const agents = [];
  function makeAgent(def, kind) {
    const fig = kind === "shop" ? buildShop() : (MODELS[def.model] || MODELS.xiaoer)();
    const root = new THREE.Group();
    root.add(fig.g);
    // 效能：頭、手、腳、身體各自把零件合併；被動畫單獨抓著的零件（火焰、蒸氣、輪子…）不合
    const keep = new Set();
    for (const v of Object.values(fig)) {
      if (v?.isMesh) keep.add(v);
      if (Array.isArray(v)) v.forEach((x) => x?.isMesh && keep.add(x));
    }
    fig.g.traverse((o) => o.userData.wheel && keep.add(o));
    bakeShallow(fig.g, keep);
    if (kind !== "shop") {
      const oc = kind === "wizard" ? OUTLINE.wizard : OUTLINE[def.type] || OUTLINE.人;
      addOutline(fig.g, oc);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.66, 24), new THREE.MeshBasicMaterial({ color: oc, transparent: true, opacity: 0.8 }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.03;
      root.add(ring);
    }
    const home = zones.get(def.home) || zones.values().next().value;
    const ag = { def, kind, root, fig, zone: home.id, path: [], wait: rand(0.5, 3), walking: false, t: rand(0, 10), seed: rand(0, 6),
      blink: rand(1, 4), hop: 0, nextLine: rand(6, 20), lastZone: null, tile: null, lane: kind === "shop" ? 0 : rand(-0.35, 0.35), face: null };
    if (home.tiles) {
      const hb = home.buildings.find((b) => b.id === def.homeB);
      ag.tile = hb?.door || pick(home.roads);
      if (kind === "shop") ag.tile = [...home.roads].filter((t) => t.d === home.N - 1)[0];
      root.position.copy(tileWorld(home, ag.tile, ag.lane));
    } else root.position.copy(kind === "shop" ? new THREE.Vector3(home.pos[0], TOP, home.pos[1]) : randomSpot(home));
    scene.add(root);

    const tag = document.createElement("button");
    tag.className = `agent-tag ${kind}`;
    tag.hidden = kind === "resident"; // 居民名牌靠近才出現
    if (kind === "resident") tag.style.setProperty("--oc", OUTLINE[def.type] || OUTLINE.人);
    tag.innerHTML = kind === "shop" ? `<b>${def.name}</b>` : `<small>${def.role || def.type}</small><b>${def.name}</b>`;
    const lbl = new CSS2DObject(tag);
    lbl.position.set(0, kind === "shop" ? 3.6 : 2.15, 0);
    root.add(lbl);
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.hidden = true;
    const bl = new CSS2DObject(bubble);
    bl.position.set(0, kind === "shop" ? 4.6 : 2.85, 0);
    root.add(bl);
    Object.assign(ag, { tag, bubble });
    root.traverse((o) => { if (o.isMesh) o.userData.agent = ag; });
    tag.addEventListener("click", () => openAgent(ag));
    pickables.push(root);
    agents.push(ag);
    return ag;
  }

  // 在某區選一個目的地：六角磚區走到建築門口或路上；舊版區隨便走
  function pickGoal(zone, ag) {
    if (!zone.tiles) return { p: randomSpot(zone) };
    const r = Math.random();
    let b = null;
    if (zone.id === ag.def.home && ag.def.homeB && r < 0.3) b = zone.buildings.find((x) => x.id === ag.def.homeB);
    else if (r < 0.75 && zone.buildings.length) b = pick(zone.buildings);
    if (b?.door) return { tile: b.door, face: tileWorld(zone, b.tile) };
    return { tile: pick(zone.roads) };
  }
  const steps = (zone, ag, from, to) => tilePath(from, to).map((t) => ({ p: tileWorld(zone, t, ag.lane), tile: t }));

  function plan(ag) {
    const zone = zones.get(ag.zone);
    const isShop = ag.kind === "shop";
    const cross = isShop ? 1 : ag.def.cross ?? 0.3;
    const here = zone.tiles ? ag.tile || nearestRoad(zone, ag.root.position) : null;
    ag.face = null;
    if (zone.nb.length && Math.random() < cross) {
      // 跨區：沿路走到路口 → 過橋 → 進下一區
      let options = zone.nb;
      if (options.length > 1 && ag.lastZone) options = options.filter((n) => n.to !== ag.lastZone);
      if (!isShop && ag.zone !== ag.def.home && Math.random() < 0.4) {
        const back = zone.nb.find((n) => n.to === ag.def.home);
        if (back) options = [back];
      }
      const link = pick(options);
      const next = zones.get(link.to);
      const pre = zone.tiles ? steps(zone, ag, here, zone.exits.get(link.to)) : [];
      const pts = link.curve.getPoints(28);
      if (link.rev) pts.reverse();
      const bridge = pts.map((p) => ({ p }));
      const entry = next.tiles ? next.exits.get(zone.id) : null;
      bridge[bridge.length - 1].zone = link.to;
      bridge[bridge.length - 1].tile = entry;
      let post;
      if (next.tiles) {
        // 本店停在一進路口的外圈路上，不必繞完整條路
        const goal = isShop ? { tile: [...next.roads].filter((t) => t.d === next.N - 1).sort((a, b) => Math.hypot(a.x - entry.x, a.z - entry.z) - Math.hypot(b.x - entry.x, b.z - entry.z))[0] } : pickGoal(next, ag);
        post = steps(next, ag, entry, goal.tile);
        ag.face = goal.face || null;
      } else post = [{ p: isShop ? new THREE.Vector3(next.pos[0], TOP, next.pos[1]) : randomSpot(next) }];
      ag.path = [...pre, ...bridge, ...post];
      ag.lastZone = ag.zone;
      if (ag.def.id === "cat" && Math.random() < 0.6) say(ag, "迷路中……");
    } else if (zone.tiles) {
      const goal = pickGoal(zone, ag);
      ag.path = steps(zone, ag, here, goal.tile);
      ag.face = goal.face || null;
      if (!ag.path.length) ag.wait = rand(1, 3);
    } else ag.path = [{ p: randomSpot(zone) }];
  }

  function say(ag, text) {
    ag.bubble.textContent = text;
    ag.bubble.hidden = false;
    ag.hop = 0.5;
    clearTimeout(ag.bubbleTimer);
    ag.bubbleTimer = setTimeout(() => (ag.bubble.hidden = true), 3800);
  }

  const shop = makeAgent(SHOP, "shop");
  WIZARDS.forEach((w) => makeAgent(w, "wizard"));
  RESIDENTS.forEach((r) => makeAgent(r, "resident"));

  function turnTo(ag, dx, dz, dt) {
    let diff = Math.atan2(dx, dz) - ag.root.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    ag.root.rotation.y += diff * Math.min(1, dt * 8);
  }
  function updateAgent(ag, dt) {
    ag.t += dt;
    if (ag.wait > 0) {
      ag.wait -= dt;
      ag.walking = false;
      if (ag.face) turnTo(ag, ag.face.x - ag.root.position.x, ag.face.z - ag.root.position.z, dt);
      if (ag.wait <= 0) plan(ag);
    } else if (ag.path.length) {
      const step = ag.path[0];
      const pos = ag.root.position;
      const to = step.p;
      const d = Math.hypot(to.x - pos.x, to.z - pos.z) + Math.abs(to.y - pos.y);
      const sp = (ag.def.speed || 2) * dt;
      if (d <= sp) {
        pos.copy(to);
        if (step.tile !== undefined) ag.tile = step.tile;
        if (step.zone) {
          ag.zone = step.zone;
          if (ag === shop) ui.shopMoved(zones.get(ag.zone));
        }
        ag.path.shift();
        if (!ag.path.length) ag.wait = ag.kind === "shop" ? rand(...SHOP.stay) : ag.face ? rand(3, 8) : rand(1.5, 5);
      } else {
        pos.x += ((to.x - pos.x) / d) * sp;
        pos.z += ((to.z - pos.z) / d) * sp;
        pos.y += ((to.y - pos.y) / d) * sp;
        turnTo(ag, to.x - pos.x, to.z - pos.z, dt);
      }
      ag.walking = true;
    } else plan(ag);

    const f = ag.fig;
    if (f.kind === "shop") {
      f.body.position.y = Math.abs(Math.sin(ag.t * 5)) * 0.06 * (ag.walking ? 1 : 0);
      if (ag.walking) f.body.children.forEach((c) => c.userData.wheel && (c.rotation.x += dt * 3));
    } else animate(f, ag, dt);

    if (ag.def.lines) {
      ag.nextLine -= dt;
      if (ag.nextLine <= 0) {
        // 鏡頭離得近才冒對話泡泡，俯瞰時不會滿畫面都是字
        if (camera.position.distanceTo(ag.root.position) < 70) say(ag, pick(ag.def.lines));
        ag.nextLine = rand(16, 34);
      }
    }
  }

  // ---- 日夜 ----
  const SUNSET = { top: "#4a4f9a", bottom: "#f7a35c", sun: "#ffbe7a", sunI: 3.2, hemiSky: "#ffe0bd", hemiGround: "#6a5a78", hemiI: 1.6, water: "#4a86a6", glow: 0.5 };
  const NIGHT = { top: "#0b1230", bottom: "#3a3d6e", sun: "#c4cdf0", sunI: 1.3, hemiSky: "#9a9cc0", hemiGround: "#3a3448", hemiI: 0.9, water: "#22385e", glow: 1.8 };
  const cA = new THREE.Color(), cB = new THREE.Color();
  const mixC = (a, b, u) => cA.set(a).lerp(cB.set(b), u).clone();
  let dayMode = "auto";
  let night = 0;
  // 陰天、雨天時天空往灰色靠；霧天把能見度拉近；打雷時整片亮一下
  const STORM = { top: "#5a6070", bottom: "#8a8e96", water: "#4a6070" };
  const STORM_NIGHT = { top: "#14161e", bottom: "#2a2e3a", water: "#1a2434" };
  const gray = new THREE.Color();
  function applyLight(u, w = { cloud: 0, rain: 0, fog: 0, flash: 0 }) {
    const dim = Math.min(1, w.cloud * 0.55 + w.rain * 0.4); // 天空變灰的程度
    skyU.top.value.copy(mixC(SUNSET.top, NIGHT.top, u)).lerp(gray.set(STORM.top).lerp(cB.set(STORM_NIGHT.top), u), dim);
    skyU.bottom.value.copy(mixC(SUNSET.bottom, NIGHT.bottom, u)).lerp(gray.set(STORM.bottom).lerp(cB.set(STORM_NIGHT.bottom), u), Math.max(dim, w.fog * 0.8));
    if (w.flash > 0) { skyU.top.value.lerp(gray.set("#dfe6ff"), w.flash * 0.7); skyU.bottom.value.lerp(gray.set("#dfe6ff"), w.flash * 0.5); }
    // 霧：顏色往白（夜裡往深灰藍）靠，距離拉近，遠處的島會淡進霧裡
    scene.fog.color.copy(skyU.bottom.value).lerp(gray.set("#d4d8dc").lerp(cB.set("#3a4050"), u), w.fog * 0.85);
    skyU.bottom.value.lerp(scene.fog.color, w.fog * 0.7);
    // 霧的遠近跟著鏡頭距離走：拉遠俯瞰（例如手機直式）時島不會整片消失在霧裡
    const cd = camera.position.distanceTo(controls.target);
    scene.fog.near = THREE.MathUtils.lerp(cd + 40, cd * 0.25, Math.max(w.fog, w.rain * 0.45));
    scene.fog.far = THREE.MathUtils.lerp(cd + 280, cd + 35, Math.max(w.fog, w.rain * 0.4));
    sun.color.copy(mixC(SUNSET.sun, NIGHT.sun, u));
    sun.intensity = THREE.MathUtils.lerp(SUNSET.sunI, NIGHT.sunI, u) * (1 - w.cloud * 0.5 - w.rain * 0.25 - w.fog * 0.2) + w.flash * 4;
    const a = THREE.MathUtils.lerp(-0.35, 0.9, u);
    sun.position.set(Math.cos(a) * -100, THREE.MathUtils.lerp(32, 80, u), Math.sin(a) * 45 - 30);
    hemi.color.copy(mixC(SUNSET.hemiSky, NIGHT.hemiSky, u));
    hemi.groundColor.copy(mixC(SUNSET.hemiGround, NIGHT.hemiGround, u));
    hemi.intensity = THREE.MathUtils.lerp(SUNSET.hemiI, NIGHT.hemiI, u) * (1 - w.cloud * 0.2) + w.flash * 1.5;
    waterMat.color.copy(mixC(SUNSET.water, NIGHT.water, u)).lerp(gray.set(STORM.water).lerp(cB.set(STORM_NIGHT.water), u), dim * 0.8);
    // 陰天、霧天時燈也要早一點亮
    const gm = THREE.MathUtils.lerp(SUNSET.glow, NIGHT.glow, Math.min(1, u + dim * 0.35 + w.fog * 0.25));
    glowMats.forEach((m) => (m.emissiveIntensity = m.userData.base * gm));
    sunDisc.position.set(-280, THREE.MathUtils.lerp(22, -40, u), -170);
    sunDisc.material.opacity = (1 - u) * (1 - dim * 0.85) * (1 - w.fog * 0.8);
    moonDisc.position.set(210, THREE.MathUtils.lerp(-30, 115, u), -230);
    moonDisc.material.opacity = u * (1 - w.cloud * 0.6) * (1 - w.fog * 0.7);
  }
  ui.onDayMode = (m) => (dayMode = m);

  // ---- 點選與滑過 ----
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const canvas = renderer.domElement;
  function hitAt(e) {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const h = ray.intersectObjects(pickables, true)[0];
    if (!h) return null;
    const u = h.object.userData;
    if (u.agent) return { agent: u.agent };
    if (u.building) return { building: u.building };
    if (u.main) return { zone: u.main };
    if (u.zone) return { zone: u.zone, ground: true };
    return null;
  }
  let down = null;
  canvas.addEventListener("pointerdown", (e) => (down = { x: e.clientX, y: e.clientY }));
  canvas.addEventListener("pointerup", (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
    const h = hitAt(e);
    if (!h) return;
    if (h.agent) openAgent(h.agent);
    else if (h.building) openBuilding(h.building);
    else if (h.zone) openZone(h.zone);
  });
  let hover = null, hoverEvt = null;
  canvas.addEventListener("pointermove", (e) => (hoverEvt = e));
  canvas.addEventListener("pointerleave", () => (hoverEvt = null, hover = null));
  function updateHover() {
    if (!hoverEvt || hoverEvt.buttons) return;
    const h = hitAt(hoverEvt);
    hoverEvt = null;
    hover = h?.agent ? h.agent.root : h?.building ? h.building.group : null;
    canvas.style.cursor = h ? "pointer" : "grab";
  }

  // 鏡頭移動
  let focus = null; // {target, dist, age}：飛過去的頭 1.5 秒會調整距離，之後交給使用者縮放
  let follow = null;
  function flyTo(v, dist = 34) {
    focus = { target: v.clone(), dist, age: 0 };
  }
  controls.addEventListener("start", () => {
    if (follow && focus) focus.age = 99;
    else focus = null;
  });

  const residentsOf = (b) => agents.filter((a) => a.kind === "resident" && a.def.homeB === b.id && a.def.home === b.zone);
  function openZone(id) {
    const z = zones.get(id);
    follow = null;
    flyTo(new THREE.Vector3(z.pos[0], TOP, z.pos[1]), 18 + z.r * 1.35);
    ui.showZone(z, agents.filter((a) => a.zone === id), { open: openAgent, openBuilding });
  }
  // 合併區的一個區塊：飛到那一塊，卡片只列那一塊的故事與建築；towers（例如報刊樓）直接開那一棟
  function openSector(zid, sid) {
    const z = zones.get(zid);
    const tower = (z.towers || []).find((t) => t.id === sid);
    if (tower) {
      const b = z.buildings.find((x) => x.id === tower.building);
      if (b) openBuilding(b);
      return;
    }
    const s = z.sectors.find((x) => x.id === sid);
    const c = z.centers[sid];
    follow = null;
    flyTo(tileWorld(z, c), 30);
    const sub = { ...z, name: s.name, tagline: s.tagline, page: s.page, parent: z.name, main: null, sectors: null, towers: null,
      posts: z.posts.filter((p) => (p.cats || [p.cat]).includes(s.cat)), buildings: z.buildings.filter((b) => b.sector === sid) };
    ui.showZone(sub, agents.filter((a) => a.zone === zid && (a.def.homeB ? z.buildings.find((b) => b.id === a.def.homeB)?.sector === sid : false)), { open: openAgent, openBuilding });
  }
  function openBuilding(b) {
    follow = null;
    const z = zones.get(b.zone);
    flyTo(tileWorld(z, b.tile), 18);
    ui.showBuilding(b, z, residentsOf(b), { open: openAgent, openZone });
  }
  function openAgent(ag) {
    follow = ag;
    flyTo(ag.root.position, ag.kind === "shop" ? 24 : 16);
    if (ag.kind === "shop") ui.showShop(ag.def, zones.get(ag.zone), posts);
    else {
      const ids = new Set(ag.def.stories || []);
      const alias = ag.def.alias || [];
      const mine = posts.filter((p) => ids.has(p.id) || (p.a || []).some((n) => alias.includes(n)));
      const zone = zones.get(ag.zone);
      const homeB = zones.get(ag.def.home)?.buildings.find((b) => b.id === ag.def.homeB);
      ui.showAgent(ag.def, zone, mine, ag.kind, homeB, { openBuilding });
    }
  }
  ui.api = {
    openZone, openSector, openShop: () => openAgent(shop),
    closed: () => { follow = null; },
    // 全島俯瞰：回到開場的角度與距離
    overview: () => { follow = null; focus = { target: new THREE.Vector3(0, 0, 4), dist: overviewDist(), age: 0, dur: 2.6, dir: OVERVIEW_DIR }; },
    zones: [...zones.values()], postsTotal: posts.length,
  };
  ui.shopMoved(zones.get(shop.zone));

  // ---- 迴圈 ----
  // 全島俯瞰的距離：依螢幕比例算，手機直式螢幕比較窄，要拉遠一點才放得下整座群島
  const MAP_R = Math.max(...[...zones.values()].map((z) => Math.hypot(z.pos[0], z.pos[1]) + z.r));
  const OVERVIEW_DIR = new THREE.Vector3(0, 78, 92).normalize();
  function overviewDist() {
    const aspect = stage.clientWidth / Math.max(1, stage.clientHeight);
    const halfW = Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * aspect);
    return Math.max(124, (MAP_R * 0.85) / Math.tan(halfW));
  }
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h);
    labels.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    controls.maxDistance = Math.max(180, overviewDist() * 1.25);
  }
  new ResizeObserver(resize).observe(stage);
  resize();
  camera.position.copy(controls.target).addScaledVector(OVERVIEW_DIR, overviewDist()); // 開場就是全島俯瞰

  const clock = new THREE.Clock();
  let elapsed = 0, frame = 0, viewOff = 0, viewOffY = 0;
  const tmp = new THREE.Vector3();
  const wp = new THREE.Vector3();
  renderer.setAnimationLoop(() => {
    const raw = clock.getDelta();
    const dt = Math.min(raw, 0.05); // 走路、動畫用：卡頓時不要一次跳太遠
    const realDt = Math.min(raw, 1); // 天氣漸變用真實時間，電腦慢也一樣幾秒換好
    elapsed += dt;
    frame++;
    const goal = dayMode === "night" ? 1 : dayMode === "sunset" ? 0 : 0.5 - 0.5 * Math.cos((elapsed / 150) * Math.PI * 2);
    night += (goal - night) * Math.min(1, dt * (dayMode === "auto" ? 10 : 1.5));
    const w = weather.update(realDt, elapsed, night, controls.target, camera.position.distanceTo(controls.target));
    applyLight(night, w);
    waveAmp += (0.8 + w.cloud * 0.4 + w.rain * 1.3 - w.fog * 0.3 - waveAmp) * Math.min(1, dt * 0.5);
    waveT += dt * (1 + w.rain * 0.6);
    sea.update(dt, elapsed, w, controls.target, night);

    agents.forEach((a) => updateAgent(a, dt));
    anim.forEach((fn) => fn(elapsed, dt));
    floaters.forEach((f) => (f.position.y = f.userData.baseY + Math.sin(elapsed * 1.6 + f.userData.phase) * 0.3));
    spinners.forEach((s) => (s.rotation.z += dt * 2));
    waterLanterns.forEach((l) => {
      const u = l.userData;
      u.a += u.sp * dt;
      l.position.set(u.cx + Math.cos(u.a) * u.rad, 0.15 + Math.sin(elapsed * 2 + u.a * 5) * 0.08, u.cz + Math.sin(u.a) * u.rad);
    });
    if (!reduceMotion) {
      const arr = waterGeo.attributes.position.array;
      for (let i = 0; i < arr.length; i += 3) arr[i + 1] = waveAt(waterBase[i], waterBase[i + 2]);
      waterGeo.attributes.position.needsUpdate = true;
    }

    // 滑過放大一點；靠近時才顯示建築與居民名牌，避免畫面太擠
    if (frame % 3 === 0) updateHover();
    for (const b of buildingLabels) {
      const k = hover === b.group ? 1.07 : 1;
      b.group.scale.setScalar(b.group.scale.x + (k - b.group.scale.x) * 0.25);
      if (frame % 10 === 0) {
        b.group.getWorldPosition(wp);
        // 地標靠近就顯示名牌；街坊與路標要更近才顯示，避免整片都是字
        b.el.hidden = !(hover === b.group || camera.position.distanceTo(wp) < (b.tier === 1 ? 34 : 20));
      }
    }
    for (const a of agents) {
      const k = hover === a.root ? 1.15 : 1;
      a.root.scale.setScalar(a.root.scale.x + (k - a.root.scale.x) * 0.25);
      if (a.kind === "resident" && frame % 10 === 0) a.tag.hidden = !(hover === a.root || follow === a || camera.position.distanceTo(a.root.position) < 40);
    }

    if (frame % 10 === 0) for (const s of subTags) {
      s.zone.group.getWorldPosition(wp);
      s.el.hidden = camera.position.distanceTo(wp) > 85;
    }

    // 開著卡片時，畫面挪開讓主角不被蓋住：桌機卡片在右邊，往左挪；手機卡片在下面，往上挪
    const vw = stage.clientWidth, vh = stage.clientHeight;
    const wantOff = ui.panelOpen && vw > 720 ? Math.min(210, vw * 0.2) : 0;
    const wantOffY = ui.panelOpen && vw <= 720 ? vh * 0.24 : 0;
    if (Math.abs(wantOff - viewOff) > 0.5 || Math.abs(wantOffY - viewOffY) > 0.5 || frame === 1) {
      viewOff += (wantOff - viewOff) * Math.min(1, dt * 6);
      viewOffY += (wantOffY - viewOffY) * Math.min(1, dt * 6);
      camera.setViewOffset(vw, vh, viewOff, viewOffY, vw, vh);
    }

    if (follow && focus) focus.target.copy(follow.root.position);
    if (focus) {
      focus.age += dt;
      const prev = controls.target.clone();
      controls.target.lerp(focus.target, Math.min(1, dt * 3));
      camera.position.add(tmp.copy(controls.target).sub(prev));
      if (focus.age < (focus.dur || 1.5)) {
        const off = camera.position.clone().sub(controls.target);
        const len = off.length();
        if (focus.dir) off.normalize().lerp(focus.dir, Math.min(1, dt * 2.5));
        off.setLength(len + (focus.dist - len) * Math.min(1, dt * 2.5));
        camera.position.copy(controls.target).add(off);
      } else if (!follow && controls.target.distanceTo(focus.target) < 0.05) focus = null;
    }
    controls.update();
    renderer.render(scene, camera);
    labels.render(scene, camera);
  });
}
