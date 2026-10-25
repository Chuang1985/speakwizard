/*
 * 故事柑仔店島：共用建模工具
 * 所有造型都是用這裡的方塊、圓柱、球、圓錐組出來的。
 */
import * as THREE from "three";

export const rand = (a, b) => a + Math.random() * (b - a);
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 固定種子的亂數：同一區每次載入長得一樣
export function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const matCache = new Map();
export const glowMats = []; // 入夜會變亮的材質
export function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...opts }));
  return matCache.get(key);
}
// 發光材質：同顏色、同亮度共用一份（合併網格時才合得起來）
const glowCache = new Map();
export function glow(color, base = 1) {
  const key = color + "|" + base;
  if (glowCache.has(key)) return glowCache.get(key);
  const m = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: base, roughness: 0.6 });
  m.userData.base = base;
  glowMats.push(m);
  glowCache.set(key, m);
  return m;
}
export function mesh(geo, m) {
  const o = new THREE.Mesh(geo, typeof m === "string" ? mat(m) : m);
  o.castShadow = true;
  o.receiveShadow = true;
  return o;
}
export const box = (w, h, d, m) => mesh(new THREE.BoxGeometry(w, h, d), m);
export const cyl = (rt, rb, h, m, seg = 8) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
export const ball = (r, m, seg = 10) => mesh(new THREE.SphereGeometry(r, seg, Math.max(6, (seg * 0.7) | 0)), m);
export const cone = (r, h, m, seg = 8) => mesh(new THREE.ConeGeometry(r, h, seg), m);
export function at(o, x, y, z, ry = 0) {
  o.position.set(x, y, z);
  o.rotation.y = ry;
  return o;
}
export function group(...kids) {
  const g = new THREE.Group();
  kids.forEach((k) => g.add(k));
  return g;
}
export function rot(o, x = 0, y = 0, z = 0) {
  o.rotation.set(x, y, z);
  return o;
}
export function scl(o, x, y = x, z = x) {
  o.scale.set(x, y, z);
  return o;
}

// 招牌字：用 canvas 畫成貼圖（vertical 為直式匾額）
export function signTexture(text, bg, fg, w = 512, h = 128, vertical = false) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const x = c.getContext("2d");
  x.fillStyle = bg;
  x.fillRect(0, 0, w, h);
  x.strokeStyle = fg;
  x.lineWidth = 6;
  x.strokeRect(8, 8, w - 16, h - 16);
  x.fillStyle = fg;
  x.textAlign = "center";
  x.textBaseline = "middle";
  const fam = `"LXGW WenKai TC","Noto Sans TC","Microsoft JhengHei",sans-serif`;
  if (vertical) {
    const chars = [...text];
    const size = Math.min(w * 0.62, (h * 0.84) / chars.length);
    x.font = `bold ${Math.floor(size)}px ${fam}`;
    chars.forEach((ch, i) => x.fillText(ch, w / 2, h * 0.08 + size * (i + 0.5) + 4));
  } else {
    x.font = `bold ${Math.floor(Math.min(h * 0.55, (w * 0.86) / [...text].length))}px ${fam}`;
    x.fillText(text, w / 2, h / 2 + 4);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
export function sign(text, w, h, bg = "#1d1a17", fg = "#f2c14e", vertical = false) {
  const tw = vertical ? 128 : 512, th = vertical ? Math.round((128 * h) / w) : 128;
  const face = new THREE.MeshStandardMaterial({ map: signTexture(text, bg, fg, tw, th, vertical), roughness: 0.7 });
  return mesh(new THREE.BoxGeometry(w, h, 0.08), [mat(bg), mat(bg), mat(bg), mat(bg), face, mat(bg)]);
}

// 卡通外框：把零件複製一份、沿著法線往外推一點、只畫背面
// （用法線外推而不是放大，合併過的零件也能正確描邊）
const outlineMats = new Map();
function outlineMat(color, thick) {
  const key = color + thick;
  if (!outlineMats.has(key)) {
    const m = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
    m.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>\ntransformed += normalize(normal) * ${thick.toFixed(3)};`);
    };
    m.customProgramCacheKey = () => "outline" + thick;
    outlineMats.set(key, m);
  }
  return outlineMats.get(key);
}
export function addOutline(root, color, thick = 0.035) {
  const m = outlineMat(color, thick);
  const targets = [];
  root.traverse((o) => o.isMesh && !o.userData.noOutline && o.material && !o.material.transparent && targets.push(o));
  for (const o of targets) {
    o.geometry.computeBoundingSphere();
    if ((o.geometry.boundingSphere.radius || 0) < 0.035) continue; // 眼睛反光這類小零件不描邊
    const shell = new THREE.Mesh(o.geometry, m);
    shell.userData.noOutline = true;
    shell.raycast = () => {};
    o.add(shell);
  }
}

// ---------- 效能：把不會動的零件合併成少數幾個網格 ----------
// 不透明、沒有發光的一般材質，改用「頂點顏色」合併成一個網格；其他材質（發光、透明、雙面）同材質的合併在一起。
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
const vcMats = new Map();
function vcMat(rough, metal) {
  const key = rough + "|" + metal;
  if (!vcMats.has(key)) vcMats.set(key, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: rough, metalness: metal, flatShading: true }));
  return vcMats.get(key);
}
const canVC = (m) => m.isMeshStandardMaterial && !m.vertexColors && !m.transparent && !m.map && m.side === THREE.FrontSide && m.emissive.getHex() === 0;
function prepGeo(mesh, matrix) {
  let g = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
  for (const k of Object.keys(g.attributes)) if (k !== "position" && k !== "normal") g.deleteAttribute(k);
  if (!g.attributes.normal) g.computeVertexNormals();
  g.applyMatrix4(matrix);
  return g;
}
function mergeInto(parent, meshes, matrixOf) {
  const buckets = new Map();
  for (const o of meshes) {
    const m = o.material;
    const key = canVC(m) ? `vc|${m.roughness}|${m.metalness}` : `m|${m.uuid}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(o);
  }
  const made = [];
  for (const [key, list] of buckets) {
    if (list.length < 2 && !key.startsWith("vc")) continue; // 只有一個就不用合
    const geos = list.map((o) => {
      const g = prepGeo(o, matrixOf(o));
      if (key.startsWith("vc")) {
        const c = o.material.color, n = g.attributes.position.count, arr = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
        g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
      }
      return g;
    });
    const merged = mergeGeometries(geos, false);
    if (!merged) continue;
    const mat0 = list[0].material;
    const mm = new THREE.Mesh(merged, key.startsWith("vc") ? vcMat(mat0.roughness, mat0.metalness) : mat0);
    mm.castShadow = list.some((o) => o.castShadow);
    mm.receiveShadow = true;
    parent.add(mm);
    list.forEach((o) => o.parent && o.parent.remove(o));
    made.push(mm);
  }
  return made;
}
// 整棵樹裡不會動的零件合併到 root（島嶼用）；skip(o) 回傳 true 的整個子樹跳過
export function bakeDeep(root, skip = () => false) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const list = [];
  (function walk(o) {
    for (const c of o.children) {
      if (skip(c)) continue;
      if (c.isMesh && !Array.isArray(c.material) && !c.isInstancedMesh && c.children.length === 0) list.push(c);
      else walk(c);
    }
  })(root);
  return mergeInto(root, list, (o) => new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
}
// 每個群組只合併自己的直接子網格（角色用：頭、手、腳各自還能動）；keep 裡的零件不合
export function bakeShallow(root, keep = new Set()) {
  const groups = [];
  root.traverse((o) => !o.isMesh && groups.push(o));
  for (const gr of groups) {
    const list = gr.children.filter((c) => c.isMesh && !keep.has(c) && !Array.isArray(c.material) && c.children.length === 0);
    if (list.length > 1) mergeInto(gr, list, (o) => { o.updateMatrix(); return o.matrix.clone(); });
  }
}

// 傳統屋頂：屋面＋屋脊＋四角起翹（燕尾），w×d 為屋面大小
export function roof(w, d, color = "#2a2633", ridge = "#3a3448", tip = "#c8433a") {
  const g = new THREE.Group();
  const left = at(box(w, 0.12, d * 0.62, color), 0, 0, d * 0.22);
  left.rotation.x = 0.5;
  const right = at(box(w, 0.12, d * 0.62, color), 0, 0, -d * 0.22);
  right.rotation.x = -0.5;
  g.add(left, right, at(box(w * 0.9, 0.16, 0.18, ridge), 0, 0.17, 0));
  for (const s of [-1, 1]) {
    const tail = at(cone(0.09, 0.55, ridge, 5), s * w * 0.47, 0.35, 0);
    tail.rotation.z = s * -1.0;
    g.add(tail);
    for (const zs of [-1, 1]) {
      const corner = at(cone(0.06, 0.35, tip, 4), s * w * 0.5, -0.05, zs * d * 0.46);
      corner.rotation.z = s * -1.1;
      g.add(corner);
    }
  }
  return g;
}
