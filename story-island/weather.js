/*
 * 故事柑仔店島：天氣與海上生態
 *
 * 天氣有四種：晴、多雲、下雨（偶爾打雷）、起霧。「自動」會依序輪流，每種大約 45 秒。
 * 每一種天氣其實是三個數值（雲量、雨量、霧量）慢慢變過去，所以換天氣時是漸變的。
 * 海上：島邊的浪花、繞著群島航行的小帆船、偶爾跳出水面的魚、下雨時海面的漣漪。
 */
import * as THREE from "three";
import { mat, glow, mesh, box, cyl, ball, cone, at, group, rot, scl, rand } from "./kit.js";

const WEATHER = {
  clear: { cloud: 0.15, rain: 0, fog: 0 },
  cloudy: { cloud: 0.85, rain: 0, fog: 0.1 },
  rain: { cloud: 1, rain: 1, fog: 0.25 },
  fog: { cloud: 0.4, rain: 0, fog: 1 },
};
const AUTO_ORDER = ["clear", "cloudy", "rain", "clear", "fog", "cloudy"];
export const WEATHER_LABEL = { clear: "晴", cloudy: "多雲", rain: "下雨", fog: "起霧" };

export function createWeather(scene) {
  let mode = "auto";
  let autoIdx = 0, autoT = 0;
  const w = { cloud: 0.15, rain: 0, fog: 0, flash: 0, current: "clear" };

  // ---- 雲：幾團低多邊形的雲，在群島上空慢慢飄 ----
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true, transparent: true, opacity: 0.5, depthWrite: false });
  const clouds = [];
  for (let i = 0; i < 16; i++) {
    const c = new THREE.Group();
    const n = 4 + Math.floor(Math.random() * 4);
    for (let k = 0; k < n; k++) {
      const s = rand(3, 6.5);
      const b = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), cloudMat);
      b.position.set((k - n / 2) * s * 0.9, rand(-1, 1.5), rand(-2, 2));
      b.scale.y = 0.6;
      c.add(b);
    }
    // 雲排在群島外圍的海上空，不會擋住俯瞰的視線
    c.userData = { a: rand(0, Math.PI * 2), r: rand(75, 160), sp: rand(0.006, 0.014) * (Math.random() < 0.5 ? 1 : -1), y: rand(30, 48) };
    scene.add(c);
    clouds.push(c);
  }

  // ---- 雨：一大片細線，跟著鏡頭看的地方下 ----
  const DROPS = 1600, BOX = 90, H = 50;
  const rainPos = new Float32Array(DROPS * 6);
  const seeds = new Float32Array(DROPS * 3);
  for (let i = 0; i < DROPS; i++) {
    seeds[i * 3] = rand(-BOX, BOX);
    seeds[i * 3 + 1] = rand(0, H);
    seeds[i * 3 + 2] = rand(-BOX, BOX);
  }
  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
  const rainMat = new THREE.LineBasicMaterial({ color: 0xbfd8ff, transparent: true, opacity: 0, depthWrite: false });
  const rain = new THREE.LineSegments(rainGeo, rainMat);
  rain.frustumCulled = false;
  scene.add(rain);

  // ---- 星星：晴朗的夜晚才看得到 ----
  const STARS = 900;
  const starPos = new Float32Array(STARS * 3);
  for (let i = 0; i < STARS; i++) {
    const a = Math.random() * Math.PI * 2, e = Math.acos(rand(0.12, 1));
    starPos.set([Math.cos(a) * Math.sin(e) * 420, Math.cos(e) * 420, Math.sin(a) * Math.sin(e) * 420], i * 3);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xfff6e0, size: 2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
  scene.add(new THREE.Points(starGeo, starMat));

  let flashT = rand(4, 9);
  return {
    get state() { return w; },
    setMode(m) { mode = m; autoT = 0; },
    update(dt, t, night, center, camDist = 124) {
      // 目標天氣
      if (mode === "auto") {
        autoT += dt;
        if (autoT > 45) { autoT = 0; autoIdx = (autoIdx + 1) % AUTO_ORDER.length; }
      }
      w.current = mode === "auto" ? AUTO_ORDER[autoIdx] : mode;
      const goal = WEATHER[w.current];
      const k = 1 - Math.exp(-dt * 0.6); // 大約 4 秒換到位
      for (const key of ["cloud", "rain", "fog"]) w[key] += (goal[key] - w[key]) * k;

      // 雲
      cloudMat.opacity = 0.25 + w.cloud * 0.65;
      cloudMat.color.setRGB(1 - w.rain * 0.45 - night * 0.35, 1 - w.rain * 0.42 - night * 0.33, 1 - w.rain * 0.35 - night * 0.25);
      const spread = Math.max(1, camDist / 124); // 鏡頭拉很遠時（手機俯瞰），雲也往外推，不擋在島前面
      clouds.forEach((c, i) => {
        const u = c.userData;
        u.a += u.sp * dt * (1 + w.rain);
        c.position.set(Math.cos(u.a) * u.r * spread, (u.y - w.rain * 8) * spread, Math.sin(u.a) * u.r * spread);
        c.scale.setScalar(spread);
        c.visible = i < 5 + w.cloud * 11; // 晴天只剩幾朵
      });

      // 雨
      rain.visible = w.rain > 0.03;
      rainMat.opacity = w.rain * 0.85;
      if (rain.visible) {
        const fall = t * 42;
        for (let i = 0; i < DROPS; i++) {
          const x = center.x + seeds[i * 3], z = center.z + seeds[i * 3 + 2];
          const y = H - ((seeds[i * 3 + 1] + fall) % H);
          rainPos.set([x, y, z, x - 0.35, y - 1.8, z], i * 6);
        }
        rainGeo.attributes.position.needsUpdate = true;
      }

      // 閃電：大雨時偶爾閃一下
      w.flash = Math.max(0, w.flash - dt * 4);
      if (w.rain > 0.7) {
        flashT -= dt;
        if (flashT < 0) { w.flash = 1; flashT = rand(5, 14); }
      }

      starMat.opacity = Math.max(0, night - 0.3) * 1.4 * (1 - w.cloud * 0.9) * (1 - w.fog);
      return w;
    },
  };
}

// ---- 海上生態 ----
export function createSeaLife(scene, zones, waveAt) {
  const list = [...zones.values()];
  const anims = [];

  // 島邊的浪花：每座島外圍一圈白色、會一呼一吸
  const foamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false });
  for (const z of list) {
    const r = z.r + 0.3;
    const foam = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.6, 6, 1), foamMat);
    foam.rotation.set(-Math.PI / 2, 0, Math.PI / 6 + (z.rotY || 0));
    foam.position.set(z.pos[0], 0.06, z.pos[1]);
    scene.add(foam);
    const ph = Math.random() * 6;
    anims.push((t) => foam.scale.setScalar(1 + Math.sin(t * 1.1 + ph) * 0.025));
  }

  // 小帆船：繞著群島外圍航行
  const far = Math.max(...list.map((z) => Math.hypot(z.pos[0], z.pos[1]) + z.r));
  const boats = [];
  const sails = ["#f6f1e2", "#e2633c", "#f2b33c", "#8ab0d8", "#f6f1e2", "#c8433a"];
  for (let i = 0; i < 6; i++) {
    const b = new THREE.Group();
    b.add(scl(at(mesh(new THREE.SphereGeometry(0.7, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat(["#7a5c3e", "#3d6fb6", "#c8433a"][i % 3], { side: THREE.DoubleSide })), 0, 0.3, 0), 0.8, 0.5, 2.0));
    b.add(at(cyl(0.04, 0.04, 2.6, "#5a3e2a", 4), 0, 1.5, 0.1));
    const sail = at(mesh(new THREE.ConeGeometry(0.9, 2.2, 3), sails[i]), 0.02, 1.6, 0.4);
    sail.scale.set(0.05, 1, 1);
    b.add(sail, at(ball(0.08, glow("#ffd36b", 1.3), 6), 0, 2.85, 0.1));
    b.userData = { a: (i / 6) * Math.PI * 2, r: far + 6 + (i % 3) * 5, sp: rand(0.012, 0.02) * (i % 2 ? 1 : -1) };
    scene.add(b);
    boats.push(b);
  }

  // 跳出水面的魚：每隔幾秒，鏡頭附近某處跳一條
  const fishMat = mat("#c8d8e0");
  const fish = [];
  for (let i = 0; i < 3; i++) {
    const f = group(scl(ball(0.25, fishMat, 8), 1.8, 0.7, 0.6), rot(at(cone(0.18, 0.3, fishMat, 4), -0.55, 0, 0), 0, 0, Math.PI / 2));
    f.visible = false;
    f.userData = { t: -1, x: 0, z: 0, dir: 0 };
    scene.add(f);
    fish.push(f);
  }
  const splashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
  // 漣漪：魚落水、下雨時用的白色小圈
  const ripples = [];
  for (let i = 0; i < 36; i++) {
    const r = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.42, 16), splashMat.clone());
    r.rotation.x = -Math.PI / 2;
    r.visible = false;
    r.userData = { t: 1 };
    scene.add(r);
    ripples.push(r);
  }
  const ripple = (x, z) => {
    const r = ripples.find((q) => q.userData.t >= 1);
    if (!r) return;
    r.position.set(x, waveAt(x, z) + 0.05, z);
    r.userData.t = 0;
    r.visible = true;
  };
  // 這一點是海、而且不在島上
  const isSea = (x, z) => list.every((zn) => Math.hypot(x - zn.pos[0], z - zn.pos[1]) > zn.r + 2);
  let fishT = 3;

  return {
    update(dt, t, w, center, night) {
      anims.forEach((fn) => fn(t));
      foamMat.opacity = 0.16 + w.rain * 0.14 + Math.sin(t * 1.3) * 0.05;
      boats.forEach((b, i) => {
        const u = b.userData;
        u.a += u.sp * dt * (1 + w.rain * 0.8);
        const x = Math.cos(u.a) * u.r, z = Math.sin(u.a) * u.r;
        b.position.set(x, waveAt(x, z) - 0.05, z);
        const s = Math.sign(u.sp); // 船頭朝前進方向（圓的切線），浪大時左右搖得比較厲害
        b.lookAt(x - Math.sin(u.a) * s, b.position.y, z + Math.cos(u.a) * s);
        b.rotateZ(Math.sin(t * 1.4 + i) * (0.05 + w.rain * 0.12));
      });
      // 魚
      fishT -= dt;
      if (fishT < 0 && w.rain < 0.5) {
        fishT = rand(2.5, 6);
        const f = fish.find((q) => q.userData.t < 0);
        if (f) for (let k = 0; k < 12; k++) {
          const a = rand(0, Math.PI * 2), d = rand(12, 45);
          const x = center.x + Math.cos(a) * d, z = center.z + Math.sin(a) * d;
          if (!isSea(x, z)) continue;
          Object.assign(f.userData, { t: 0, x, z, dir: rand(0, Math.PI * 2) });
          f.visible = true;
          ripple(x, z);
          break;
        }
      }
      fish.forEach((f) => {
        const u = f.userData;
        if (u.t < 0) return;
        u.t += dt / 1.1;
        if (u.t >= 1) { u.t = -1; f.visible = false; ripple(u.x + Math.cos(u.dir) * 2.4, u.z + Math.sin(u.dir) * 2.4); return; }
        const x = u.x + Math.cos(u.dir) * u.t * 2.4, z = u.z + Math.sin(u.dir) * u.t * 2.4;
        f.position.set(x, Math.sin(u.t * Math.PI) * 2.2 - 0.1, z);
        f.rotation.set(0, -u.dir, Math.cos(u.t * Math.PI) * 1.1);
      });
      // 雨滴打在海上的漣漪
      if (w.rain > 0.2) for (let k = 0; k < Math.ceil(w.rain * 3); k++) {
        const x = center.x + rand(-40, 40), z = center.z + rand(-40, 40);
        if (isSea(x, z)) ripple(x, z);
      }
      ripples.forEach((r) => {
        const u = r.userData;
        if (u.t >= 1) return;
        u.t += dt / 1.2;
        r.scale.setScalar(1 + u.t * 4);
        r.material.opacity = (1 - u.t) * 0.6;
        if (u.t >= 1) r.visible = false;
      });
    },
  };
}
