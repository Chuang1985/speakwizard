/*
 * 故事柑仔店島：角色造型與動作
 *
 * 每個角色都是 chibi()（大頭身）加上各自的帽子、衣服、道具。
 * 動作在 animate()：走路會彈跳、壓扁拉長、左右晃；停下來會呼吸、東張西望、眨眼；說話時跳一下揮手。
 */
import * as THREE from "three";
import { rand, mat, glow, mesh, box, cyl, ball, cone, at, group, rot, scl, sign } from "./kit.js";

const SKIN = "#f4c9a4";

// ---------- 大頭身基本體 ----------
// face: normal | fierce（兇） | old（老） | sleepy（瞇眼）
export function chibi({ skin = SKIN, robe = "#8a7a6a", robe2 = null, shape = "robe", legs = "#3a3030", face = "normal",
  float = false, ghostly = false, headR = 0.42, belly = false } = {}) {
  const M = (c) => (ghostly ? mat(c, { transparent: true, opacity: 0.86 }) : mat(c));
  const g = new THREE.Group(); // 彈跳、壓扁都作用在這一層
  const f = { g, legs: [], arms: [], kind: "chibi", float };

  if (!float) for (const x of [-0.12, 0.12]) {
    const p = at(new THREE.Group(), x, 0.32, 0);
    p.add(at(cyl(0.075, 0.065, 0.28, M(legs), 7), 0, -0.14, 0));
    p.add(scl(at(ball(0.09, M("#2a2222"), 8), 0, -0.29, 0.04), 1, 0.6, 1.35));
    g.add(p);
    f.legs.push(p);
  }

  let body;
  if (float) body = rot(at(mesh(new THREE.ConeGeometry(0.34, 0.8, 12), M(robe)), 0, 0.5, 0), Math.PI);
  else if (belly || shape === "round") body = scl(at(ball(0.34, M(robe), 12), 0, 0.56, 0.02), 1, 0.95, 0.92);
  else if (shape === "slim") body = at(cyl(0.18, 0.25, 0.5, M(robe), 10), 0, 0.56, 0);
  else body = at(cyl(0.19, 0.36, 0.56, M(robe), 10), 0, 0.55, 0);
  g.add(body);
  if (robe2) g.add(at(box(0.08, 0.5, 0.05, M(robe2)), 0, 0.56, shape === "robe" ? 0.27 : 0.22)); // 前襟
  f.body = body;

  for (const s of [-1, 1]) {
    const p = at(new THREE.Group(), s * (belly ? 0.33 : 0.26), 0.78, 0);
    p.rotation.z = s * 0.25;
    p.add(at(cyl(0.06, 0.055, 0.3, M(robe), 6), 0, -0.14, 0));
    p.add(at(ball(0.075, M(skin), 8), 0, -0.31, 0));
    g.add(p);
    f.arms.push(p);
  }

  const head = at(new THREE.Group(), 0, 1.1, 0);
  head.add(scl(ball(headR, M(skin), 16), 1, 0.94, 0.96));
  const eyes = at(new THREE.Group(), 0, 0, 0);
  const zf = headR * 0.86;
  const eyeR = face === "old" ? 0.075 : 0.095;
  for (const s of [-1, 1]) {
    const x = s * headR * 0.36;
    if (face === "sleepy") eyes.add(rot(at(box(0.13, 0.025, 0.03, "#1a1212"), x, 0.02, zf + 0.03), 0, 0, s * 0.1));
    else {
      eyes.add(scl(at(ball(eyeR, "#ffffff", 10), x, 0.02, zf - 0.02), 1, 1.15, 0.5));
      eyes.add(scl(at(ball(eyeR * 0.64, "#1d1418", 10), x, 0.0, zf + 0.02), 1, 1.1, 0.5));
      eyes.add(at(ball(0.022, "#ffffff", 6), x + 0.025, 0.045, zf + 0.05));
    }
  }
  head.add(eyes);
  f.eyes = eyes;
  if (face === "fierce" || face === "old") for (const s of [-1, 1]) {
    const brow = at(box(0.15, 0.035, 0.03, face === "old" ? "#f2f2f2" : "#1d1418"), s * headR * 0.36, 0.15, zf + 0.02);
    brow.rotation.z = face === "fierce" ? s * -0.4 : s * 0.25;
    head.add(brow);
  }
  if (face !== "fierce") for (const s of [-1, 1]) head.add(scl(at(ball(0.065, "#f2989a", 8), s * headR * 0.6, -0.1, zf - 0.08), 1, 0.55, 0.3));
  const mouth = face === "fierce"
    ? at(box(0.12, 0.03, 0.03, "#5a1a1a"), 0, -0.15, zf + 0.02)
    : rot(at(mesh(new THREE.TorusGeometry(0.045, 0.014, 4, 8, Math.PI), "#6a2a2a"), 0, -0.13, zf + 0.02), 0, 0, Math.PI);
  head.add(mouth);
  g.add(head);
  f.head = head;
  f.headR = headR;
  return f;
}

// 手上拿東西：掛在右手（arms[1]）掌心
function hold(f, obj, side = 1) {
  obj.position.y += -0.31;
  f.arms[side].add(obj);
  f.holding = side;
  return obj;
}
// 官帽（烏紗帽）：帽身＋兩側帽翅
function officialHat(f, color = "#1d1a22", wing = "#1d1a22") {
  const r = f.headR;
  const h = group(at(cyl(r * 0.82, r * 0.88, 0.3, color, 12), 0, r * 0.72, -0.02), at(cyl(r * 0.6, r * 0.66, 0.22, color, 12), 0, r * 0.98, -0.12));
  for (const s of [-1, 1]) h.add(rot(at(box(0.42, 0.1, 0.03, wing), s * (r + 0.12), r * 0.85, -0.12), 0, 0, s * 0.15));
  f.head.add(h);
}
function beard(f, color = "#1d1418", long = 0.35) {
  f.head.add(at(cone(0.2, long, color, 8), 0, -f.headR * 0.55 - long / 2 + 0.05, f.headR * 0.55));
  f.head.children.at(-1).rotation.x = Math.PI;
}
function hairCap(f, color, extra = 0) {
  f.head.add(at(mesh(new THREE.SphereGeometry(f.headR * 1.04, 16, 8, 0, Math.PI * 2, 0, Math.PI * (0.48 + extra)), color), 0, 0.02, -0.02));
}

// ---------- 造型目錄 ----------
export const MODELS = {
  // ===== 語巫 =====
  boss() { // 老闆：汗衫、啤酒肚、圓眼鏡、蒲扇
    const f = chibi({ robe: "#f4f1e6", legs: "#6a5240", belly: true });
    for (const s of [-1, 1]) f.head.add(scl(at(ball(0.13, "#3a3030", 8), s * 0.36, 0.08, -0.08), 0.7, 1, 1));
    for (const s of [-1, 1]) f.head.add(at(mesh(new THREE.TorusGeometry(0.1, 0.018, 4, 12), "#2a2424"), s * 0.15, 0.02, 0.4));
    f.head.add(at(box(0.08, 0.02, 0.02, "#2a2424"), 0, 0.03, 0.41));
    const fan = group(at(cyl(0.015, 0.015, 0.25, "#8a6a48", 4), 0, -0.12, 0.05), rot(at(cyl(0.2, 0.2, 0.02, "#e0c07c", 12), 0, -0.32, 0.06), Math.PI / 2));
    hold(f, fan);
    f.fan = fan;
    return f;
  },
  bossy() { // 老闆娘：紅洋裝、白圍裙、高髮髻、雞毛撢子
    const f = chibi({ robe: "#c23a4e", legs: "#3a2a2a" });
    f.g.add(at(box(0.3, 0.42, 0.05, "#fbf3e4"), 0, 0.52, 0.3));
    hairCap(f, "#2a1e1e", 0.06);
    f.head.add(at(ball(0.17, "#2a1e1e", 10), 0, 0.42, -0.1), at(ball(0.05, "#f2b33c", 6), 0.12, 0.42, -0.05));
    const duster = group(at(cyl(0.015, 0.015, 0.5, "#8a6a48", 4), 0, 0.1, 0.04), at(cone(0.12, 0.38, "#8a3a6a", 7), 0, 0.5, 0.04));
    hold(f, duster);
    return f;
  },
  xiaoer() { // 店小二：鴨舌帽、綠背心、抱一箱故事瓶
    const f = chibi({ robe: "#3f8a72", legs: "#2e3b4e", shape: "slim" });
    hairCap(f, "#2a2222");
    f.head.add(at(cyl(0.4, 0.43, 0.14, "#e2633c", 14), 0, 0.3, 0), at(box(0.38, 0.04, 0.26, "#e2633c"), 0, 0.24, 0.4));
    const crate = group(box(0.5, 0.34, 0.36, "#c79a5b"));
    for (const x of [-0.14, 0.02, 0.16]) crate.add(at(cyl(0.055, 0.055, 0.16, glow(["#8be9ff", "#ffcf4a", "#ff8aa0"][(x * 10 + 2) % 3 | 0], 0.8), 6), x, 0.23, 0));
    f.g.add(at(crate, 0, 0.66, 0.34));
    f.arms.forEach((a) => (a.rotation.x = -1.2));
    f.carry = true;
    return f;
  },
  jianliu() { // 剪溜：半透明小偷鬼、黑眼罩、剪刀、偷來的故事袋
    const f = chibi({ robe: "#dde8f2", skin: "#e8f0f8", float: true, ghostly: true });
    f.head.add(at(cyl(f.headR * 1.02, f.headR * 1.02, 0.13, "#1a1a24", 16), 0, 0.02, 0));
    const sc = new THREE.Group();
    for (const s of [-1, 1]) sc.add(rot(at(box(0.035, 0.34, 0.02, "#c8ccd4"), s * 0.03, -0.18, 0.05), 0, 0, s * 0.25),
      at(mesh(new THREE.TorusGeometry(0.05, 0.014, 4, 8), "#e2453c"), s * 0.05, 0.02, 0.05));
    hold(f, sc);
    f.g.add(at(ball(0.25, "#8a6a48", 8), 0, 0.8, -0.38), at(cyl(0.05, 0.07, 0.08, "#5a4632"), 0, 1.05, -0.38));
    return f;
  },
  cat() { // 黑貓：尾巴會搖、耳朵會抖，停下來蹲在舊行李箱上
    const g = new THREE.Group();
    const body = new THREE.Group();
    body.add(scl(at(ball(0.3, "#1d1b22", 12), 0, 0.38, 0), 0.85, 0.78, 1.3));
    const head = at(new THREE.Group(), 0, 0.72, 0.36);
    head.add(ball(0.3, "#1d1b22", 14));
    const ears = [];
    for (const s of [-1, 1]) {
      const ear = rot(at(cone(0.1, 0.2, "#1d1b22", 4), s * 0.15, 0.27, 0), 0, 0, s * -0.35);
      ear.add(at(cone(0.05, 0.1, "#e88a9a", 4), 0, -0.02, 0.03));
      head.add(ear);
      ears.push(ear);
    }
    const eyes = new THREE.Group();
    for (const s of [-1, 1]) {
      eyes.add(scl(at(ball(0.085, glow("#ffd93c", 1.2), 10), s * 0.12, 0.03, 0.24), 1, 1.15, 0.5));
      eyes.add(scl(at(ball(0.03, "#1a1212", 6), s * 0.12, 0.03, 0.28), 0.6, 1.6, 0.5));
    }
    head.add(eyes, at(ball(0.035, "#e88a9a", 6), 0, -0.06, 0.29));
    for (const s of [-1, 1]) for (const y of [-0.04, -0.09]) head.add(rot(at(box(0.18, 0.01, 0.01, "#bbbbbb"), s * 0.2, y, 0.22), 0, 0, s * (y < -0.05 ? 0.15 : -0.1)));
    body.add(head);
    const tail = at(new THREE.Group(), 0, 0.45, -0.35);
    tail.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.15, -0.3), new THREE.Vector3(0, 0.55, -0.35), new THREE.Vector3(0.1, 0.75, -0.2),
    ]), 10, 0.05, 6), "#1d1b22"));
    body.add(tail);
    const legs = [];
    for (const [x, z] of [[-0.13, 0.22], [0.13, 0.22], [-0.13, -0.22], [0.13, -0.22]]) {
      const p = at(new THREE.Group(), x, 0.28, z);
      p.add(at(cyl(0.05, 0.05, 0.28, "#1d1b22", 6), 0, -0.14, 0));
      body.add(p);
      legs.push(p);
    }
    const suitcase = group(at(box(0.95, 0.5, 0.6, "#8a5a3a"), 0, 0.25, 0), at(box(0.97, 0.06, 0.62, "#5a3a22"), 0, 0.35, 0),
      at(box(0.3, 0.05, 0.05, "#3a2a1a"), 0, 0.53, 0.2), at(box(0.2, 0.2, 0.01, "#f2e6c8"), 0.25, 0.25, 0.31));
    suitcase.visible = false;
    g.add(suitcase, body);
    return { g, kind: "cat", body, head, ears, eyes, tail, legs, suitcase, arms: [] };
  },

  // ===== 地府居民 =====
  baiwuchang() { // 白無常：高白帽、白袍、長舌、無常扇
    const f = chibi({ robe: "#f4f4f0", robe2: "#d8d8d0", skin: "#f2ece4", legs: "#e8e8e0", headR: 0.4 });
    f.head.add(at(cyl(0.18, 0.36, 0.9, "#fbfbf6", 10), 0, 0.72, -0.02));
    f.head.add(at(box(0.1, 0.42, 0.02, "#c8433a"), 0, 0.72, 0.28));
    f.head.add(rot(at(box(0.08, 0.2, 0.03, "#e2627a"), 0, -0.24, 0.36), 0.3));
    const fan = group(at(cyl(0.015, 0.015, 0.2, "#6a5a4a", 4), 0, -0.1, 0.05));
    for (let i = 0; i < 5; i++) fan.add(rot(at(box(0.07, 0.36, 0.01, "#fbfbf6"), 0, -0.36, 0.05), 0, 0, (i - 2) * 0.28));
    hold(f, fan);
    return f;
  },
  heiwuchang() { // 黑無常：黑高帽、黑袍、兇臉、無常傘
    const f = chibi({ robe: "#2a2830", robe2: "#4a4650", skin: "#6a6078", legs: "#1d1b22", face: "fierce", headR: 0.4 });
    f.head.add(at(cyl(0.3, 0.36, 0.5, "#1d1b22", 10), 0, 0.56, -0.02), at(box(0.1, 0.32, 0.02, "#f2c14e"), 0, 0.55, 0.32));
    const um = group(at(cyl(0.015, 0.015, 1.1, "#3a2a22", 4), 0, 0.2, 0.05), at(cone(0.55, 0.32, "#2a2830", 10), 0, 0.85, 0.05));
    hold(f, um);
    return f;
  },
  mengpo() { // 孟婆：灰白髮髻、皺眉笑、端一碗會冒煙的湯
    const f = chibi({ robe: "#8a6a52", robe2: "#c9a86a", face: "old" });
    hairCap(f, "#d0ccc8", 0.05);
    f.head.add(at(ball(0.15, "#d0ccc8", 8), 0, 0.4, -0.12), at(cyl(0.02, 0.02, 0.3, "#c9a86a", 4), 0, 0.42, -0.12));
    f.head.children.at(-1).rotation.z = Math.PI / 2;
    const bowl = group(mesh(new THREE.SphereGeometry(0.16, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat("#e8e0d0", { side: THREE.DoubleSide })),
      at(cyl(0.14, 0.14, 0.02, "#9a6a3a", 10), 0, -0.03, 0));
    const steam = [];
    for (let i = 0; i < 3; i++) {
      const s = at(ball(0.05, mat("#ffffff", { transparent: true, opacity: 0.6 }), 6), (i - 1) * 0.06, 0.1 + i * 0.1, 0);
      bowl.add(s);
      steam.push(s);
    }
    f.g.add(at(bowl, 0, 0.82, 0.38));
    f.arms.forEach((a) => (a.rotation.x = -1.0));
    f.carry = true;
    f.steam = steam;
    return f;
  },
  niutou() { // 牛頭將軍：牛頭、牛角、鼻環、盔甲、鋼叉
    const f = chibi({ robe: "#5a4a3a", robe2: "#c9a86a", skin: "#7a4a2a", legs: "#3a2a22", face: "fierce", shape: "round" });
    f.head.add(scl(at(ball(0.22, "#c9a88a", 10), 0, -0.14, 0.32), 1.2, 0.8, 0.9));
    f.head.add(at(mesh(new THREE.TorusGeometry(0.07, 0.018, 4, 10), "#f2c14e"), 0, -0.22, 0.52));
    for (const s of [-1, 1]) {
      f.head.add(rot(at(cone(0.08, 0.42, "#f2ead8", 6), s * 0.42, 0.3, 0), 0, 0, s * -1.1));
      f.head.add(rot(scl(at(ball(0.1, "#7a4a2a", 6), s * 0.44, 0.05, 0), 1, 0.5, 0.8), 0, 0, s * 0.4));
    }
    f.g.add(at(box(0.5, 0.12, 0.42, "#8a8a92"), 0, 0.82, 0));
    const fork = group(at(cyl(0.02, 0.02, 1.4, "#5a4632", 4), 0, 0.3, 0.05), at(box(0.3, 0.04, 0.03, "#c8ccd4"), 0, 1.0, 0.05));
    for (const x of [-0.14, 0, 0.14]) fork.add(at(cone(0.03, 0.2, "#c8ccd4", 4), x, 1.12, 0.05));
    hold(f, fork);
    return f;
  },
  guizu() { // 火爆鬼卒：紅臉、頭上冒火、令牌
    const f = chibi({ robe: "#2e3a4e", robe2: "#c8433a", skin: "#d8604a", legs: "#1d1b22", face: "fierce" });
    const flames = [];
    for (let i = 0; i < 5; i++) {
      const fl = at(cone(0.1, 0.35, glow(i % 2 ? "#ff8a3c" : "#ffcf4a", 1.2), 5), (i - 2) * 0.12, 0.42, -0.04);
      f.head.add(fl);
      flames.push(fl);
    }
    hold(f, group(at(box(0.16, 0.26, 0.04, "#f2c14e"), 0, -0.1, 0.06), at(box(0.04, 0.12, 0.05, "#c8433a"), 0, -0.1, 0.07)));
    f.flames = flames;
    return f;
  },
  yanluo() { // 閻羅王：黑臉、烏紗帽、紅金官袍、大鬍子
    const f = chibi({ robe: "#a8322a", robe2: "#f2c14e", skin: "#4a3a3a", legs: "#1d1b22", face: "fierce", belly: true, headR: 0.45 });
    officialHat(f);
    beard(f, "#1d1418", 0.4);
    f.g.add(at(box(0.62, 0.08, 0.5, "#f2c14e"), 0, 0.5, 0));
    hold(f, at(box(0.2, 0.08, 0.1, "#5a3a22"), 0, -0.04, 0.06));
    return f;
  },
  qinguang() { // 秦廣王：綠官袍、烏紗帽、手持孽鏡
    const f = chibi({ robe: "#2f6b5c", robe2: "#f2c14e", skin: "#e8c0a0", legs: "#1d1b22", headR: 0.44 });
    officialHat(f);
    beard(f, "#3a2a2a", 0.2);
    hold(f, group(rot(at(cyl(0.16, 0.16, 0.04, "#c9a86a", 14), 0, -0.12, 0.08), Math.PI / 2), rot(at(cyl(0.13, 0.13, 0.05, glow("#bff0ff", 1), 14), 0, -0.12, 0.09), Math.PI / 2)));
    return f;
  },
  wenpan() { // 閻羅文判：藍官袍、判官筆、生死簿
    const f = chibi({ robe: "#3a5a8a", robe2: "#e8e0c8", skin: "#eac8a8", legs: "#1d1b22", headR: 0.42 });
    officialHat(f);
    hold(f, group(at(cyl(0.025, 0.025, 0.5, "#8a2a2a", 6), 0, 0.05, 0.06), rot(at(cone(0.035, 0.1, "#1a1a1a", 6), 0, -0.24, 0.06), Math.PI)));
    f.arms[0].add(at(box(0.26, 0.34, 0.06, "#e8c86a"), 0, -0.34, 0.08));
    return f;
  },
  dizang() { // 地藏王：光頭金冠、袈裟、錫杖
    const f = chibi({ robe: "#d9822b", robe2: "#c8433a", skin: "#f2d2b0", legs: "#8a4a2a", face: "sleepy", headR: 0.44 });
    f.head.add(at(cyl(0.46, 0.46, 0.1, "#f2c14e", 16), 0, 0.2, 0));
    for (let i = 0; i < 5; i++) f.head.add(at(cone(0.06, 0.16, "#f2c14e", 4), (i - 2) * 0.16, 0.32, 0.3 - Math.abs(i - 2) * 0.06));
    f.g.add(rot(at(box(0.08, 0.7, 0.05, "#c8433a"), 0.06, 0.58, 0.27), 0, 0, 0.5));
    hold(f, group(at(cyl(0.02, 0.02, 1.5, "#c9a86a", 4), 0, 0.35, 0.05), at(mesh(new THREE.TorusGeometry(0.12, 0.02, 4, 10), "#f2c14e"), 0, 1.15, 0.05)));
    return f;
  },
  zhongkui() { // 鍾馗：大黑鬍、紅袍、官帽、寶劍
    const f = chibi({ robe: "#b8322a", robe2: "#1d1418", skin: "#c8906a", legs: "#1d1b22", face: "fierce", belly: true, headR: 0.44 });
    officialHat(f, "#1d1a22", "#f2c14e");
    beard(f, "#1d1418", 0.5);
    for (const s of [-1, 1]) f.head.add(scl(at(ball(0.12, "#1d1418", 6), s * 0.38, -0.12, 0.2), 0.6, 1.2, 0.8));
    hold(f, group(at(box(0.05, 0.75, 0.02, "#d8dce4"), 0, 0.3, 0.05), at(box(0.2, 0.04, 0.05, "#f2c14e"), 0, -0.08, 0.05)));
    return f;
  },
  touqi() { // 頭七阿嬤：微透明、花上衣、灰髮髻、提菜籃回家
    const f = chibi({ robe: "#7a9ac8", robe2: "#f2e6c8", legs: "#3a3a48", face: "old", ghostly: true });
    hairCap(f, "#c8c4c0", 0.05);
    f.head.add(at(ball(0.14, "#c8c4c0", 8), 0, 0.36, -0.16));
    for (let i = 0; i < 6; i++) f.g.add(at(ball(0.035, "#f2e6c8", 5), Math.cos(i) * 0.24, 0.45 + (i % 3) * 0.1, Math.sin(i) * 0.24 + 0.05));
    hold(f, group(at(cyl(0.16, 0.12, 0.16, "#c9a86a", 8), 0, -0.1, 0.06), rot(at(mesh(new THREE.TorusGeometry(0.13, 0.015, 4, 10, Math.PI), "#8a6a48"), 0, -0.02, 0.06), 0, 0, 0),
      at(ball(0.06, "#5a9a3a", 6), 0.05, 0.0, 0.06)), 0);
    f.ghost = true;
    return f;
  },
  yinduren() { // 老鳥引渡人：斗笠、深色蓑衣、長竿燈籠
    const f = chibi({ robe: "#4a4a3a", robe2: "#8a8a6a", legs: "#2a2a22" });
    f.head.add(at(cone(0.72, 0.32, "#c9a86a", 12), 0, 0.42, 0), at(cyl(0.12, 0.12, 0.04, "#8a6a48", 8), 0, 0.6, 0));
    for (let i = 0; i < 8; i++) f.g.add(rot(at(box(0.06, 0.4, 0.04, "#6a6a4a"), Math.cos(i * 0.8) * 0.28, 0.6, Math.sin(i * 0.8) * 0.28), 0, -i * 0.8, 0.15));
    const pole = group(at(cyl(0.02, 0.02, 1.4, "#6b4a2b", 4), 0, 0.3, 0.05), at(box(0.3, 0.03, 0.03, "#6b4a2b"), 0.12, 1.0, 0.05),
      at(cyl(0.008, 0.008, 0.15, "#3a2a22", 3), 0.26, 0.92, 0.05), at(cyl(0.09, 0.09, 0.18, glow("#ffd36b", 1.4), 8), 0.26, 0.78, 0.05));
    hold(f, pole);
    return f;
  },
  feixia() { // 黃衣小飛俠：連帽黃雨衣、雨鞋
    const f = chibi({ robe: "#f2c43a", robe2: "#d8a82a", legs: "#3a5a8a", ghostly: true });
    // 帽兜前面留開口，露出臉
    f.head.add(at(mesh(new THREE.SphereGeometry(0.47, 14, 8, Math.PI / 2 + 0.9, Math.PI * 2 - 1.8, 0, Math.PI * 0.7),
      mat("#f2c43a", { transparent: true, opacity: 0.92, side: THREE.DoubleSide })), 0, 0.02, -0.03));
    return f;
  },
};

// ===== 人物ㄤ仔標居民 =====
Object.assign(MODELS, {
  laoli() { // 茶攤老李：灰髮、白汗衫、藍短褲、提一壺茶
    const f = chibi({ robe: "#f4f1e6", legs: "#3d5a8a", face: "old", shape: "slim" });
    hairCap(f, "#bdb8b0");
    const pot = group(scl(ball(0.13, "#b0b8b0", 8), 1, 0.8, 1), rot(at(cyl(0.02, 0.015, 0.14, "#b0b8b0", 4), 0.14, 0.02, 0), 0, 0, -1), at(mesh(new THREE.TorusGeometry(0.08, 0.012, 4, 8, Math.PI), "#3a2a22"), 0, 0.1, 0));
    hold(f, at(pot, 0, -0.12, 0.05));
    return f;
  },
  zhouyeye() { // 鹹粥爺爺：白廚帽、白圍裙、大湯杓
    const f = chibi({ robe: "#8a6a52", legs: "#3a3030", face: "old", belly: true });
    f.g.add(at(box(0.36, 0.42, 0.05, "#fbf3e4"), 0, 0.5, 0.33));
    f.head.add(at(cyl(0.3, 0.26, 0.3, "#fbfbf6", 10), 0, 0.42, 0), at(ball(0.3, "#fbfbf6", 8), 0, 0.6, 0));
    beard(f, "#e8e4dc", 0.16);
    hold(f, group(at(cyl(0.015, 0.015, 0.45, "#8a6a48", 4), 0, 0.05, 0.05), scl(at(ball(0.08, "#c8ccd4", 6), 0, -0.2, 0.05), 1, 0.5, 1)));
    return f;
  },
  xuetu() { // 老藥房學徒：學徒帽、藍布衫、捧著藥碾
    const f = chibi({ robe: "#3a5a8a", robe2: "#e8e0c8", legs: "#2a2a30", face: "sleepy" });
    f.head.add(at(cyl(0.3, 0.36, 0.14, "#2a2a30", 10), 0, 0.36, 0), at(ball(0.05, "#c8433a", 6), 0, 0.45, 0));
    f.g.add(at(group(at(box(0.42, 0.14, 0.18, "#5a5048"), 0, 0, 0), rot(at(cyl(0.1, 0.1, 0.03, "#7a706a", 10), 0, 0.1, 0), Math.PI / 2)), 0, 0.72, 0.36));
    f.arms.forEach((a) => (a.rotation.x = -1.1));
    f.carry = true;
    return f;
  },
  kongzi() { // 孔子：儒巾、長白鬍、長袍、竹簡
    const f = chibi({ robe: "#8a7a5a", robe2: "#c9b088", legs: "#3a3030", face: "old" });
    f.head.add(at(box(0.5, 0.26, 0.42, "#2a2a30"), 0, 0.42, -0.02));
    beard(f, "#f2f2f2", 0.42);
    hold(f, rot(at(group(...Array.from({ length: 5 }, (_, i) => at(box(0.04, 0.3, 0.02, "#d8c28a"), (i - 2) * 0.045, 0, 0))), 0, -0.1, 0.06), 0, 0, 0.3));
    return f;
  },
  tugong() { // 土公仔：斗笠、工作服、鏟子
    const f = chibi({ robe: "#6a7a5a", legs: "#4a4a3a" });
    f.head.add(at(cone(0.62, 0.28, "#c9a86a", 12), 0, 0.42, 0));
    hold(f, group(at(cyl(0.02, 0.02, 0.9, "#8a6a48", 4), 0, 0.1, 0.06), at(box(0.18, 0.22, 0.02, "#8a8a92"), 0, -0.42, 0.06)));
    return f;
  },
  jitong() { // 乩童：赤膊、紅肚兜、紅頭巾、令旗
    const f = chibi({ robe: "#e8b08a", legs: "#2a2a30", skin: "#e8b08a", face: "fierce" });
    f.g.add(at(box(0.34, 0.36, 0.04, "#c8433a"), 0, 0.6, 0.27), at(sign("令", 0.18, 0.18, "#c8433a", GOLD_C), 0, 0.62, 0.3));
    f.head.add(at(cyl(f.headR * 1.02, f.headR * 1.02, 0.1, "#c8433a", 14), 0, 0.2, 0));
    hold(f, group(at(cyl(0.015, 0.015, 0.6, "#5a3a22", 4), 0, 0.2, 0.06), at(cone(0.14, 0.3, "#f2b33c", 3), 0.05, 0.42, 0.06)));
    return f;
  },
  yanhuo(anim) { // 煙火師傅：頭巾、帆布圍裙、手上一支會冒火花的煙火筒
    const f = chibi({ robe: "#5a6a7a", legs: "#3a3030" });
    f.g.add(at(box(0.36, 0.44, 0.05, "#a88a5a"), 0, 0.5, 0.3));
    f.head.add(at(cyl(f.headR * 1.02, f.headR * 1.02, 0.12, "#e2453c", 14), 0, 0.22, 0));
    const spark = at(ball(0.07, glow("#ffd36b", 1.8), 6), 0, 0.22, 0.06);
    hold(f, group(at(cyl(0.05, 0.05, 0.3, "#3d6fb6", 6), 0, 0.02, 0.06), spark));
    f.sparkle = spark;
    return f;
  },
  shoumu() { // 守墓人：深色外套、帽子、提燈
    const f = chibi({ robe: "#3a3a48", robe2: "#5a5a6a", legs: "#2a2a30", face: "sleepy" });
    f.head.add(at(cyl(0.26, 0.3, 0.2, "#2a2a30", 10), 0, 0.4, 0), at(cyl(0.48, 0.48, 0.03, "#2a2a30", 12), 0, 0.3, 0));
    hold(f, group(at(cyl(0.01, 0.01, 0.15, "#2a2a2a", 3), 0, -0.05, 0.06), at(cyl(0.08, 0.08, 0.18, glow("#ffd36b", 1.3), 6), 0, -0.2, 0.06)));
    return f;
  },
  bapu() { // 叭噗伯：鴨舌帽、推著冰淇淋車、按喇叭
    const f = chibi({ robe: "#f2e6c8", legs: "#5a4a3a", face: "old" });
    f.head.add(at(cyl(0.4, 0.43, 0.14, "#3d6fb6", 14), 0, 0.3, 0), at(box(0.36, 0.04, 0.24, "#3d6fb6"), 0, 0.24, 0.4));
    const cart = group(at(box(0.6, 0.4, 0.45, "#e2453c"), 0, 0, 0), at(cyl(0.16, 0.16, 0.12, "#c8ccd4", 10), 0, 0.26, 0));
    for (const x of [-0.24, 0.24]) cart.add(rot(at(cyl(0.12, 0.12, 0.05, "#2e2a26", 8), x, -0.24, 0), 0, 0, Math.PI / 2));
    cart.add(rot(at(cone(0.08, 0.2, GOLD_C, 6), 0.34, 0.22, 0.1), 0, 0, -Math.PI / 2), at(ball(0.08, "#2a2a2a", 6), 0.48, 0.22, 0.1)); // 叭噗喇叭
    f.g.add(at(cart, 0, 0.55, 0.55));
    f.arms.forEach((a) => (a.rotation.x = -1.2));
    f.carry = true;
    return f;
  },
  shangban() { // 上班族：白襯衫、紅領帶、公事包
    const f = chibi({ robe: "#f4f6f8", legs: "#2a2e3a", shape: "slim" });
    hairCap(f, "#2a2222");
    f.g.add(at(box(0.07, 0.36, 0.03, "#c8433a"), 0, 0.6, 0.24));
    hold(f, at(box(0.34, 0.24, 0.08, "#3a2a1a"), 0, -0.12, 0.04));
    return f;
  },
});
const GOLD_C = "#e2b33c";

// ===== 神明集郵冊居民 =====
function crown(f, color = GOLD_C, beads = "#e2453c") { // 鳳冠：一圈金冠、前面垂珠
  const r = f.headR;
  f.head.add(at(cyl(r * 0.85, r * 0.95, 0.22, color, 14), 0, r * 0.62, 0), at(cone(0.12, 0.3, color, 6), 0, r * 0.95, 0));
  for (const s of [-1, 1]) f.head.add(rot(at(cone(0.06, 0.28, color, 5), s * r * 0.75, r * 0.8, 0), 0, 0, s * -0.7));
  for (let i = 0; i < 5; i++) f.head.add(at(ball(0.025, beads, 5), (i - 2) * 0.09, r * 0.4, r * 0.88));
}
Object.assign(MODELS, {
  mazu() { // 媽祖：鳳冠垂珠、紅金袍、手持笏板，安詳瞇眼
    const f = chibi({ robe: "#c23a2e", robe2: GOLD_C, legs: "#8a2a2a", face: "sleepy", headR: 0.44 });
    hairCap(f, "#1d1418");
    crown(f);
    f.g.add(at(box(0.5, 0.06, 0.42, GOLD_C), 0, 0.75, 0));
    hold(f, at(box(0.06, 0.36, 0.03, "#f2e6c8"), 0, -0.05, 0.08));
    return f;
  },
  tudigong() { // 土地公：員外帽、白長鬍、紅袍、拐杖、元寶
    const f = chibi({ robe: "#b8402e", robe2: GOLD_C, legs: "#5a2a22", face: "old", belly: true });
    f.head.add(at(cyl(0.34, 0.4, 0.22, "#2a2a30", 10), 0, 0.36, -0.02), at(box(0.5, 0.1, 0.06, GOLD_C), 0, 0.3, 0.36));
    beard(f, "#f6f6f2", 0.45);
    hold(f, group(at(cyl(0.025, 0.025, 1.1, "#8a6a48", 5), 0, 0.15, 0.06), at(ball(0.06, "#8a6a48", 6), 0, 0.72, 0.06)));
    f.arms[0].add(at(scl(cyl(0.08, 0.13, 0.12, GOLD_C, 8), 1.3, 1, 0.8), 0, -0.36, 0.06));
    return f;
  },
  yuelao() { // 月老：白鬍、紅袍、一捲紅線、姻緣簿
    const f = chibi({ robe: "#d8443a", robe2: "#f6e6c8", legs: "#8a2a2a", face: "old" });
    hairCap(f, "#e8e4dc");
    f.head.add(at(ball(0.13, "#e8e4dc", 8), 0, 0.42, -0.08));
    beard(f, "#f2f2f2", 0.36);
    hold(f, group(rot(at(cyl(0.08, 0.08, 0.12, "#e2453c", 10), 0, -0.05, 0.07), Math.PI / 2), at(cyl(0.005, 0.005, 0.5, "#e2453c", 3), 0.05, -0.3, 0.08)));
    f.arms[0].add(at(box(0.22, 0.3, 0.05, "#8a2a2a"), 0, -0.34, 0.08));
    return f;
  },
  zhusheng() { // 註生娘娘：髮髻金簪、粉袍、抱著嬰孩
    const f = chibi({ robe: "#e28a9a", robe2: "#fbe6c8", legs: "#a85a6a" });
    hairCap(f, "#1d1418", 0.05);
    f.head.add(at(ball(0.15, "#1d1418", 8), 0, 0.42, -0.12), rot(at(cyl(0.015, 0.015, 0.36, GOLD_C, 4), 0, 0.44, -0.12), 0, 0, Math.PI / 2));
    const baby = group(scl(ball(0.16, "#f6f1e2", 10), 1, 0.9, 1.3), at(ball(0.1, SKIN, 8), 0, 0.06, 0.15), at(ball(0.015, "#1a1212", 4), 0.03, 0.08, 0.24), at(ball(0.015, "#1a1212", 4), -0.03, 0.08, 0.24));
    f.g.add(at(baby, 0, 0.72, 0.34));
    f.arms.forEach((a) => (a.rotation.x = -1.1));
    f.carry = true;
    return f;
  },
  qianliyan() { // 千里眼：綠臉、頭上一支角、手搭眉頭遠望
    const f = chibi({ robe: "#3a6a4a", robe2: "#c8433a", skin: "#5ab07a", legs: "#2a3a2a", face: "fierce" });
    f.head.add(rot(at(cone(0.07, 0.3, GOLD_C, 5), 0, f.headR * 0.95, 0), -0.3));
    f.head.add(at(mesh(new THREE.TorusGeometry(f.headR * 0.9, 0.05, 4, 16), "#c8433a"), 0, 0.2, 0));
    f.head.children.at(-1).rotation.x = Math.PI / 2;
    f.pose = { 0: { x: -2.5, z: 0.9 } }; // 左手搭在眉頭
    return f;
  },
  wenchang() { // 文昌帝君：金冠、綠袍、大毛筆、書卷
    const f = chibi({ robe: "#2f7a62", robe2: "#f2e6c8", legs: "#1d1b22", headR: 0.43 });
    officialHat(f, "#1d1a22", GOLD_C);
    beard(f, "#1d1418", 0.22);
    hold(f, group(at(cyl(0.03, 0.03, 0.55, "#8a2a2a", 6), 0, 0.05, 0.06), rot(at(cone(0.045, 0.12, "#1a1a1a", 6), 0, -0.27, 0.06), Math.PI)));
    f.arms[0].add(rot(at(cyl(0.06, 0.06, 0.32, "#f2e6c8", 8), 0, -0.34, 0.08), 0, 0, Math.PI / 2));
    return f;
  },
  guanping() { // 關平：綠盔紅纓、盔甲、捧著黃布包的印
    const f = chibi({ robe: "#3a6a4a", robe2: GOLD_C, legs: "#2a2a30", face: "normal" });
    f.head.add(at(mesh(new THREE.SphereGeometry(f.headR * 1.06, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.42), "#2f6a4a"), 0, 0.03, 0));
    f.head.add(at(cone(0.08, 0.22, "#e2453c", 6), 0, f.headR * 1.05, 0));
    f.g.add(at(box(0.5, 0.3, 0.4, "#8a8a92"), 0, 0.72, 0));
    f.g.add(at(group(box(0.3, 0.25, 0.25, "#f2c43a"), at(ball(0.06, "#f2c43a", 6), 0, 0.15, 0)), 0, 0.78, 0.36));
    f.arms.forEach((a) => (a.rotation.x = -1.1));
    f.carry = true;
    return f;
  },
  xiaoluo() { // 王船小鑼：小個子、紅背心、提銅鑼和鑼槌
    const f = chibi({ robe: "#e2453c", legs: "#2a2a30", headR: 0.4, shape: "slim" });
    hairCap(f, "#1d1418");
    f.head.add(at(cyl(0.41, 0.41, 0.1, "#f2b33c", 14), 0, 0.15, 0));
    f.arms[0].add(rot(at(cyl(0.2, 0.2, 0.03, GOLD_C, 14), 0, -0.4, 0.12), Math.PI / 2));
    hold(f, group(at(cyl(0.015, 0.015, 0.3, "#8a6a48", 4), 0, -0.05, 0.06), at(ball(0.05, "#c8433a", 6), 0, -0.2, 0.06)));
    f.drum = true;
    return f;
  },
  shanshen() { // 山神：樹葉冠、褐綠斗篷、帶葉的木杖
    const f = chibi({ robe: "#5a6a3a", robe2: "#8a6a48", legs: "#3a3020", face: "old" });
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      f.head.add(rot(at(cone(0.08, 0.26, i % 2 ? "#4f8a3c" : "#6a9a4a", 4), Math.cos(a) * 0.3, 0.34, Math.sin(a) * 0.3), Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6));
    }
    beard(f, "#c8c4b8", 0.32);
    hold(f, group(at(cyl(0.03, 0.035, 1.2, "#6e5a44", 5), 0, 0.2, 0.06), at(ball(0.12, "#4f8a3c", 6), 0, 0.82, 0.06)));
    return f;
  },
  chenghuang() { // 城隍爺：烏紗帽、紅袍、黑鬍、算盤
    const f = chibi({ robe: "#a8322a", robe2: GOLD_C, legs: "#1d1b22", face: "fierce", headR: 0.44 });
    officialHat(f);
    beard(f, "#1d1418", 0.34);
    const abacus = group(box(0.34, 0.18, 0.04, "#5a3a22"));
    for (let i = 0; i < 5; i++) abacus.add(at(ball(0.025, "#2a1a14", 4), -0.12 + i * 0.06, 0, 0.03));
    hold(f, at(abacus, 0, -0.06, 0.07));
    return f;
  },
  heshen() { // 河神：藍臉、浪花冠、魚鱗披風、手上一條魚
    const f = chibi({ robe: "#3a7aa0", robe2: "#8be0e8", skin: "#7ab8d0", legs: "#2a4a6a" });
    for (let i = 0; i < 5; i++) f.head.add(rot(at(cone(0.08, 0.24, "#e8f8ff", 5), (i - 2) * 0.14, 0.4, -0.05), 0, 0, (i - 2) * -0.25));
    for (let i = 0; i < 6; i++) f.g.add(scl(at(ball(0.07, "#5a9ac0", 5), Math.cos(i) * 0.25, 0.45 + (i % 3) * 0.12, -0.2), 1, 0.5, 0.5));
    hold(f, group(scl(at(ball(0.1, "#e2c36a", 8), 0, -0.08, 0.07), 1.6, 0.7, 0.6), rot(at(cone(0.07, 0.12, "#e2c36a", 4), -0.2, -0.08, 0.07), 0, 0, Math.PI / 2)));
    return f;
  },
  riyou(anim) { // 日遊神：黃袍、太陽冠，走到哪泡泡飄到哪
    const f = chibi({ robe: "#f2b33c", robe2: "#fff3d6", legs: "#8a6a2a" });
    f.head.add(at(cyl(0.35, 0.4, 0.1, "#ff8a3c", 12), 0, 0.36, 0), at(ball(0.12, glow("#ffb04a", 1.2), 8), 0, 0.5, 0));
    hold(f, group(at(cyl(0.012, 0.012, 0.3, "#8a6a48", 3), 0, -0.05, 0.06), at(mesh(new THREE.TorusGeometry(0.06, 0.012, 4, 10), "#8be9ff"), 0, -0.24, 0.06)));
    const bubbles = [];
    for (let i = 0; i < 4; i++) {
      const b = ball(0.07, mat("#c8f4ff", { transparent: true, opacity: 0.55 }), 8);
      f.g.add(b);
      bubbles.push(b);
    }
    f.bubbles = bubbles;
    return f;
  },
  yeyou() { // 夜遊神：深藍袍，頭髮上長滿眼睛
    const f = chibi({ robe: "#2a3a6a", robe2: "#8a9ad0", skin: "#c8c0d8", legs: "#1d1b2a", face: "sleepy" });
    hairCap(f, "#1d1b2a", 0.08);
    const eyes = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const e = group(scl(ball(0.065, "#ffffff", 8), 1, 1, 0.6), at(ball(0.035, "#1a1212", 6), 0, 0, 0.04));
      e.position.set(Math.cos(a) * 0.28, 0.34 + (i % 2) * 0.06, Math.sin(a) * 0.28);
      e.lookAt(Math.cos(a) * 2, 0.6, Math.sin(a) * 2);
      f.head.add(e);
      eyes.push(e);
    }
    f.hairEyes = eyes;
    return f;
  },
});

// ===== 妖怪作業簿居民 =====
Object.assign(MODELS, {
  jinmei() { // 金魅：淡金膚色、女傭圍裙、髮髻，舉著「加薪」牌
    const f = chibi({ robe: "#5a4a6a", robe2: "#f6f1e2", skin: "#f0d890", legs: "#3a3040" });
    f.g.add(at(box(0.32, 0.42, 0.05, "#f6f1e2"), 0, 0.52, 0.3));
    hairCap(f, "#2a1e1e", 0.05);
    f.head.add(at(ball(0.14, "#2a1e1e", 8), 0, 0.4, -0.12));
    hold(f, group(at(cyl(0.015, 0.015, 0.7, "#8a6a48", 4), 0, 0.25, 0.06), at(sign("加薪", 0.36, 0.26, "#f2b33c", "#1d1418"), 0, 0.62, 0.07)));
    f.pose = { 1: { x: -2.2, z: 0.3 } }; // 牌子一直舉高
    return f;
  },
  hugupo() { // 虎姑婆：虎耳、虎尾、橘色虎紋外衣、灰髮髻
    const f = chibi({ robe: "#e2843a", robe2: "#2a2018", legs: "#5a3a22", face: "old", skin: "#f0c8a0" });
    for (let i = 0; i < 3; i++) f.g.add(at(box(0.5, 0.05, 0.42, "#2a2018"), 0, 0.42 + i * 0.12, 0));
    hairCap(f, "#c8c4c0", 0.05);
    f.head.add(at(ball(0.13, "#c8c4c0", 8), 0, 0.42, -0.1));
    for (const s of [-1, 1]) f.head.add(rot(at(cone(0.1, 0.18, "#e2843a", 4), s * 0.28, 0.36, -0.02), 0, 0, s * -0.4));
    const tail = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.35, -0.28), new THREE.Vector3(0, 0.3, -0.55), new THREE.Vector3(0.1, 0.55, -0.7)]), 8, 0.05, 5), "#e2843a");
    f.g.add(tail);
    hold(f, at(cyl(0.07, 0.07, 0.12, mat("#ffe0f0", { transparent: true, opacity: 0.8 }), 8), 0, -0.08, 0.06));
    return f;
  },
  moshenzai() { // 魔神仔：小個子、深色皮膚、大眼睛、紅帽子
    const f = chibi({ robe: "#4a5a3a", legs: "#3a3020", skin: "#8a6a4a", headR: 0.46 });
    f.head.add(at(cone(0.36, 0.42, "#e2453c", 10), 0, 0.42, -0.02), at(ball(0.07, "#f6f1e2", 6), 0, 0.64, -0.02));
    f.baseScale = [0.82, 0.82, 0.82];
    return f;
  },
  zhuganggui() { // 竹竿鬼：又高又瘦，身上一節一節像竹子
    const f = chibi({ robe: "#a8c870", legs: "#7a9a4a", skin: "#d8e8c0", face: "sleepy", shape: "slim" });
    f.baseScale = [0.85, 1.7, 0.85];
    for (let i = 0; i < 3; i++) f.g.add(at(cyl(0.2, 0.2, 0.03, "#6a8a3a", 8), 0, 0.38 + i * 0.13, 0));
    f.head.add(at(cone(0.2, 0.35, "#4f8a3c", 5), 0, 0.42, 0));
    return f;
  },
  shimengmo() { // 食夢貘：黑白身體、長鼻子、抱著枕頭、瞇眼
    const f = chibi({ robe: "#f2f2f2", legs: "#2a2a2a", skin: "#3a3a40", face: "sleepy", shape: "round" });
    f.g.add(at(box(0.62, 0.22, 0.5, "#2a2a2a"), 0, 0.75, 0));
    f.head.add(rot(at(cyl(0.07, 0.11, 0.28, "#3a3a40", 8), 0, -0.08, 0.48), Math.PI / 2 - 0.4));
    for (const s of [-1, 1]) f.head.add(at(ball(0.1, "#3a3a40", 6), s * 0.3, 0.32, -0.05));
    f.g.add(at(scl(ball(0.22, "#f6f1ff", 8), 1.3, 0.6, 0.8), 0, 0.62, 0.36));
    f.arms.forEach((a) => (a.rotation.x = -1.0));
    f.carry = true;
    return f;
  },
  gunv() { // 骨女：骨白的臉、深眼窩、粉紅長衫、提牡丹燈籠
    const f = chibi({ robe: "#e8a0b8", robe2: "#c8607a", skin: "#f2f0e8", legs: "#d8d0c8", face: "sleepy", ghostly: true });
    for (const s of [-1, 1]) f.head.add(scl(at(ball(0.08, "#4a4048", 6), s * 0.15, 0.03, 0.34), 1, 1, 0.4));
    hairCap(f, "#1d1418", 0.1);
    hold(f, group(at(cyl(0.01, 0.01, 0.15, "#2a2a2a", 3), 0, -0.05, 0.06), scl(at(ball(0.12, glow("#ff8ab0", 1.2), 8), 0, -0.22, 0.06), 1, 1.3, 1)));
    f.ghost = true;
    return f;
  },
  maimaiyao() { // 買買妖：影子身體、發光的眼睛、舉著折扣牌
    const f = chibi({ robe: "#2a2438", skin: "#3a3248", legs: "#1d1828", ghostly: true, float: true });
    f.eyes.children.forEach((e, i) => i % 3 === 1 && (e.material = glow("#ff5ab0", 1.4)));
    hold(f, group(at(cyl(0.012, 0.012, 0.5, "#8a6a48", 3), 0, 0.15, 0.06), at(sign("買一送一", 0.5, 0.2, "#e2453c", "#fff3d6"), 0, 0.45, 0.07)));
    return f;
  },
  yujing() { // 蘭潭魚精：魚頭、鱗片、魚鰭手
    const f = chibi({ robe: "#5aa0c0", robe2: "#d8f0ff", skin: "#7ac0d8", legs: "#3a7a9a" });
    f.head.add(rot(at(cone(0.16, 0.3, "#5aa0c0", 4), 0, 0.42, -0.1), -0.4));
    for (const s of [-1, 1]) f.head.add(rot(at(cone(0.08, 0.22, "#5aa0c0", 3), s * 0.42, 0, -0.05), 0, 0, s * 1.2));
    for (let i = 0; i < 8; i++) f.g.add(scl(at(ball(0.06, "#8ad0e8", 5), Math.cos(i) * 0.22, 0.4 + (i % 4) * 0.1, Math.sin(i) * 0.22 + 0.05), 1, 0.5, 0.5));
    return f;
  },
  qingshe() { // 青蛇：上半身是人，下半身是盤起來的蛇尾
    const f = chibi({ robe: "#3a9a5a", robe2: "#c8f0a0", skin: "#e8f0d0", float: true });
    hairCap(f, "#1d3a2a", 0.1);
    f.head.add(at(ball(0.12, "#1d3a2a", 8), 0, 0.38, -0.14));
    const tail = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.3, 0), new THREE.Vector3(0.3, 0.1, -0.2), new THREE.Vector3(0, 0.05, -0.45), new THREE.Vector3(-0.3, 0.1, -0.2), new THREE.Vector3(-0.1, 0.15, 0.2)]), 14, 0.11, 6), "#4ab06a");
    f.g.add(tail);
    return f;
  },
  jinyingui() { // 金銀鬼：左半金、右半銀，抱著一個大元寶
    const f = chibi({ robe: "#e2b33c", skin: "#f2d890", legs: "#c8ccd4", float: true });
    f.g.add(at(mesh(new THREE.ConeGeometry(0.345, 0.81, 12, 1, false, 0, Math.PI), mat("#c8ccd4")), 0, 0.5, 0));
    f.g.children.at(-1).rotation.x = Math.PI;
    f.head.add(at(mesh(new THREE.SphereGeometry(0.425, 14, 8, 0, Math.PI), mat("#e0e4ec")), 0, 0, 0));
    f.g.add(at(scl(cyl(0.12, 0.2, 0.14, glow("#e2b33c", 0.6), 8), 1.4, 1, 0.8), 0, 0.65, 0.36));
    f.arms.forEach((a) => (a.rotation.x = -1.0));
    f.carry = true;
    return f;
  },
});

// ===== 長篇溜溜球居民 =====
Object.assign(MODELS, {
  xuanmo() { // 玄墨行者：一身墨色長袍、束髮、背著一支大毛筆
    const f = chibi({ robe: "#2a2830", robe2: "#efe8da", legs: "#1d1b22" });
    hairCap(f, "#1d1418");
    f.head.add(at(ball(0.11, "#1d1418", 8), 0, 0.42, -0.05), at(cyl(0.02, 0.02, 0.18, "#efe8da", 4), 0, 0.42, -0.05));
    f.head.children.at(-1).rotation.z = Math.PI / 2;
    f.g.add(rot(at(group(at(cyl(0.035, 0.035, 0.9, "#c9a86a", 6), 0, 0, 0), at(cone(0.06, 0.18, "#1a1a20", 6), 0, -0.52, 0)), 0.1, 0.75, -0.3), 0, 0, 0.5));
    f.g.children.at(-1).children[1].rotation.x = Math.PI;
    return f;
  },
  laogui() { // 老鬼：半透明的老人家、駝背、拄拐杖、提一盞舊燈
    const f = chibi({ robe: "#8a8a9a", robe2: "#c8c8d0", skin: "#e0e4ec", legs: "#5a5a6a", face: "old", ghostly: true });
    hairCap(f, "#e8e8ec", -0.1);
    beard(f, "#f2f2f2", 0.22);
    f.head.position.z += 0.08;
    hold(f, group(at(cyl(0.02, 0.02, 0.8, "#6e5a44", 4), 0, 0.1, 0.06)));
    f.arms[0].add(at(cyl(0.07, 0.07, 0.14, glow("#ffd36b", 1.1), 6), 0, -0.42, 0.06));
    f.ghost = true;
    return f;
  },
});

// ===== 老闆的地盤居民 =====
Object.assign(MODELS, {
  zhuangzi() { // 莊子：寬袍、束髮、手上一把扇，身邊一直有一隻蝴蝶繞
    const f = chibi({ robe: "#7a9a8a", robe2: "#efe8da", legs: "#3a4a40", face: "sleepy" });
    hairCap(f, "#1d1418");
    f.head.add(at(ball(0.11, "#1d1418", 8), 0, 0.42, -0.06));
    beard(f, "#3a2a2a", 0.18);
    const fan = group(at(cyl(0.012, 0.012, 0.18, "#8a6a48", 3), 0, -0.08, 0.05));
    for (let i = 0; i < 5; i++) fan.add(rot(at(box(0.06, 0.3, 0.01, "#efe8da"), 0, -0.3, 0.05), 0, 0, (i - 2) * 0.28));
    hold(f, fan);
    f.fan = fan;
    const wings = [rot(box(0.12, 0.01, 0.08, glow("#ffcf4a", 1.0)), 0, 0, 0.5), rot(box(0.12, 0.01, 0.08, glow("#ffcf4a", 1.0)), 0, 0, -0.5)];
    const fly = group(...wings);
    f.g.add(fly);
    f.butterfly = fly;
    f.wings = wings; // 兩片翅膀各自拍動，合併網格時要留著
    return f;
  },
  mozi() { // 墨子：短打粗布衣、工具腰帶、扛著一個木齒輪
    const f = chibi({ robe: "#5a5048", robe2: "#8a6a48", legs: "#3a3020", face: "fierce" });
    hairCap(f, "#1d1418");
    f.head.add(at(cyl(f.headR * 1.02, f.headR * 1.02, 0.08, "#3a3020", 14), 0, 0.2, 0));
    f.g.add(at(cyl(0.3, 0.3, 0.08, "#8a6a48", 10), 0, 0.42, 0));
    for (const x of [-0.18, 0.05, 0.2]) f.g.add(at(box(0.04, 0.16, 0.04, "#a8a8b0"), x, 0.36, 0.28));
    const gear = group(rot(cyl(0.2, 0.2, 0.06, "#a87a4a", 10), Math.PI / 2));
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; gear.add(at(box(0.07, 0.07, 0.07, "#8a6a48"), Math.cos(a) * 0.2, Math.sin(a) * 0.2, 0)); }
    hold(f, at(gear, 0, -0.1, 0.1));
    f.gear = gear;
    return f;
  },
  laozi() { // 老子：長白眉、長白鬍、腰上一個葫蘆、慢慢走
    const f = chibi({ robe: "#c8c0a8", robe2: "#8a7a5a", legs: "#6a5a4a", face: "old" });
    f.head.add(at(ball(0.36, "#f2f2f2", 10), 0, 0.12, -0.08));
    for (const s of [-1, 1]) f.head.add(rot(at(box(0.2, 0.04, 0.03, "#f6f6f2"), s * 0.2, 0.12, 0.38), 0, 0, s * 0.5));
    beard(f, "#f6f6f2", 0.5);
    f.g.add(at(scl(ball(0.09, "#c9a86a", 8), 1, 1.2, 1), 0.28, 0.42, 0.1), at(ball(0.06, "#c9a86a", 6), 0.28, 0.55, 0.1));
    hold(f, group(at(cyl(0.022, 0.025, 1.0, "#6e5a44", 5), 0, 0.15, 0.06)));
    return f;
  },
  kuafu() { // 夸父：比別人高大的巨人、赤膊、拄著木杖追太陽
    const f = chibi({ robe: "#c8906a", robe2: "#8a4a2a", skin: "#c8906a", legs: "#6a3a22", face: "fierce", shape: "round" });
    f.baseScale = [1.25, 1.35, 1.25];
    f.head.add(at(cyl(f.headR * 1.02, f.headR * 1.02, 0.1, "#e2453c", 14), 0, 0.22, 0));
    for (let i = 0; i < 2; i++) f.head.add(at(ball(0.03, "#a8e8ff", 4), 0.3 - i * 0.12, 0.05 - i * 0.05, 0.3));
    hold(f, group(at(cyl(0.03, 0.04, 1.2, "#6e5a44", 5), 0, 0.2, 0.06)));
    return f;
  },
  houyi() { // 后羿：武將頭巾、皮甲、背著大弓和箭筒
    const f = chibi({ robe: "#6a4a3a", robe2: "#c9a86a", legs: "#3a2a22", face: "fierce" });
    hairCap(f, "#1d1418");
    f.head.add(at(cyl(f.headR * 1.02, f.headR * 1.02, 0.1, "#2f6a4a", 14), 0, 0.22, 0));
    f.g.add(rot(at(mesh(new THREE.TorusGeometry(0.45, 0.03, 4, 12, Math.PI), "#5a3a22"), 0, 0.75, -0.3), 0, 0, -Math.PI / 2));
    f.g.add(at(cyl(0.08, 0.08, 0.5, "#8a6a48", 6), 0.2, 0.75, -0.32));
    for (const x of [0.16, 0.2, 0.24]) f.g.add(at(cone(0.025, 0.08, "#e2453c", 3), x, 1.05, -0.32));
    return f;
  },
  toujia() { // 藥行頭家：圓眼鏡、深色背心、捧著一包藥草
    const f = chibi({ robe: "#f2ece0", robe2: "#3a3430", legs: "#3a3430", face: "old" });
    hairCap(f, "#5a5048");
    f.g.add(at(box(0.5, 0.42, 0.42, "#3a3430"), 0, 0.6, 0));
    for (const s of [-1, 1]) f.head.add(at(mesh(new THREE.TorusGeometry(0.09, 0.015, 4, 10), "#2a2424"), s * 0.15, 0.02, 0.4));
    f.g.add(at(group(box(0.3, 0.2, 0.22, "#e8dcc0"), at(box(0.32, 0.02, 0.02, "#c8433a"), 0, 0, 0.12)), 0, 0.72, 0.36));
    f.arms.forEach((a) => (a.rotation.x = -1.1));
    f.carry = true;
    return f;
  },
});

// ---------- 動作 ----------
// st 是角色自己的狀態：t 計時、walking、hop（說話時跳）、blink
export function animate(f, st, dt) {
  const w = st.walking ? 1 : 0;
  const ph = st.t * 10;
  // 眨眼
  st.blink -= dt;
  if (st.blink < 0) st.blink = rand(2, 5);
  const eyeY = st.blink < 0.12 ? 0.15 : 1;
  if (f.eyes) f.eyes.scale.y += (eyeY - f.eyes.scale.y) * 0.6;
  // 說話時跳一下
  st.hop = Math.max(0, (st.hop || 0) - dt);
  const hopY = st.hop > 0 ? Math.sin((1 - st.hop / 0.5) * Math.PI) * 0.35 : 0;

  if (f.kind === "cat") {
    f.legs.forEach((l, i) => (l.rotation.x = (i % 3 === 0 ? 1 : -1) * Math.sin(ph) * 0.7 * w));
    f.suitcase.visible = !st.walking;
    f.body.position.y = (st.walking ? Math.abs(Math.sin(ph)) * 0.08 : 0.5) + hopY;
    f.tail.rotation.z = Math.sin(st.t * (st.walking ? 6 : 2.2)) * 0.5;
    f.ears.forEach((e, i) => (e.rotation.x = Math.max(0, Math.sin(st.t * 3 + i * 2) - 0.85) * 3));
    f.head.rotation.y = st.walking ? 0 : Math.sin(st.t * 0.8 + st.seed) * 0.6;
    return;
  }
  if (f.float) {
    f.g.position.y = 0.3 + Math.sin(st.t * 2.4) * 0.12 + hopY;
    f.g.rotation.z = Math.sin(st.t * 1.6) * 0.08 + Math.sin(ph * 0.5) * 0.06 * w;
    f.g.rotation.x = 0.18 * w;
  } else {
    // 走路：彈跳＋壓扁拉長＋左右晃
    const b = Math.abs(Math.sin(ph));
    f.g.position.y = b * 0.13 * w + hopY + (f.ghost ? 0.15 + Math.sin(st.t * 2) * 0.05 : 0);
    const sq = w ? 1 + (b - 0.5) * 0.1 : 1 + Math.sin(st.t * 2.4) * 0.02;
    const [bx, by, bz] = f.baseScale || [1, 1, 1]; // 有些角色天生比較矮或比較高
    f.g.scale.set(bx / Math.sqrt(sq), by * sq, bz / Math.sqrt(sq));
    f.g.rotation.z = Math.sin(ph) * 0.07 * w;
    f.legs.forEach((l, i) => (l.rotation.x = (i ? 1 : -1) * Math.sin(ph) * 0.85 * w));
  }
  // 手
  if (!f.carry) f.arms.forEach((a, i) => {
    const s = i ? 1 : -1;
    const holding = f.holding === i;
    let x = (i ? -1 : 1) * Math.sin(ph) * 0.9 * w + (holding ? -0.5 : 0);
    let z = s * 0.25;
    if (st.hop > 0 && i === (f.holding === 1 ? 0 : 1)) { x = -2.6; z = s * (0.4 + Math.sin(st.t * 18) * 0.3); } // 揮手
    if (f.pose?.[i]) ({ x, z } = f.pose[i]); // 固定姿勢（例如千里眼手搭眉頭）
    if (f.drum && i === 1) x = -0.6 - Math.max(0, Math.sin(st.t * 8)) * 1.0; // 敲鑼
    a.rotation.x += (x - a.rotation.x) * 0.3;
    a.rotation.z += (z - a.rotation.z) * 0.3;
  });
  // 頭：走路點頭，停下來東張西望
  f.head.rotation.z = Math.sin(ph) * 0.06 * w;
  f.head.rotation.y += ((st.walking ? 0 : Math.sin(st.t * 0.7 + st.seed) * 0.55) - f.head.rotation.y) * 0.1;
  if (f.fan) f.fan.rotation.z = Math.sin(st.t * 5) * 0.4;
  if (f.flames) f.flames.forEach((fl, i) => (fl.scale.y = 1 + Math.sin(st.t * 12 + i * 1.7) * 0.25));
  if (f.sparkle) f.sparkle.scale.setScalar(0.6 + Math.abs(Math.sin(st.t * 17)) * 0.9);
  if (f.bubbles) f.bubbles.forEach((b, i) => { // 日遊神的泡泡往上飄
    const k = (st.t * 0.4 + i / 4) % 1;
    b.position.set(Math.sin(st.t + i * 2) * 0.4 + 0.3, 1.0 + k * 1.4, Math.cos(st.t + i) * 0.3);
    b.scale.setScalar(0.6 + k);
  });
  if (f.butterfly) { // 莊子的蝴蝶繞著他飛
    f.butterfly.position.set(Math.sin(st.t * 1.3) * 0.6, 1.7 + Math.sin(st.t * 2.1) * 0.2, Math.cos(st.t * 1.3) * 0.6);
    f.wings[0].rotation.z = 0.2 + Math.abs(Math.sin(st.t * 14)) * 0.8;
    f.wings[1].rotation.z = -f.wings[0].rotation.z;
  }
  if (f.gear) f.gear.rotation.z += dt * 1.5;
  if (f.hairEyes) f.hairEyes.forEach((e, i) => (e.scale.y = Math.sin(st.t * 0.9 + i * 1.7) > 0.95 ? 0.15 : 1)); // 夜遊神頭髮上的眼睛各自眨
  if (f.steam) f.steam.forEach((s, i) => {
    const k = (st.t * 0.6 + i / 3) % 1;
    s.position.y = 0.08 + k * 0.35;
    s.scale.setScalar(0.6 + k);
  });
}
