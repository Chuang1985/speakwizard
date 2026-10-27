// 島上的聲音：全部用 Web Audio 即時合成，不用載任何音檔
// 全島共用：沒有一直響的底音（合成的海浪、風聲聽久了像沙沙的雜訊），
//   改成大部分時間安靜、偶爾點綴一下：輕輕拍岸的浪、遠處的海鷗、帆船的小鈴；下雨是一滴一滴的滴答；打雷；夜裡的蟲鳴蛙叫
// 各島自己的聲音（鏡頭靠近才聽得到）：
//   人物ㄤ仔標：機車騎過去、偶爾按喇叭、街上的低鳴
//   神明集郵冊：悠悠的廟鼓與鐘聲
//   幽魂綿綿冰：只有風鈴
//   妖怪作業簿：白天蟬鳴，入夜貓頭鷹與更多的蟲
//   老闆的地盤：翻書頁
//   長篇溜溜球：安靜
// 拉近到任何一座島時，海上的點綴就不出現，只留那座島自己的聲音（下雨、打雷照常）
// 瀏覽器不准網頁自己出聲，所以要等讀者按下聲音按鈕（或之前開過、這次第一次點畫面）才開始

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const rand = (a, b) => a + Math.random() * (b - a);

function noiseBuffer(ctx, kind, sec = 4) {
  const n = ctx.sampleRate * sec, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < n; i++) {
    const w = Math.random() * 2 - 1;
    if (kind === "brown") { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } // 低沉的布朗噪音：海浪、雷、鼓
    else d[i] = w; // 白噪音：風、雨、書頁
  }
  return buf;
}

export function createSoundscape() {
  let ctx = null, master, L, on = false, vol = 0.7;
  let lastFlash = 0;
  const timer = { cricket: 0, frog: 0, chime: 0, scooter: 2, horn: 6, temple: 1, page: 1, owl: 3, wave: 1, gull: 8, boat: 14, drip: 0 };
  let templeStep = 0;

  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ctx.createDynamicsCompressor();
    comp.connect(ctx.destination);
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(comp);
    const white = noiseBuffer(ctx, "white"), brown = noiseBuffer(ctx, "brown", 6);
    // 一條持續的噪音層：噪音 → 濾波 →（可選的抖動）→ 音量
    const bed = (buf, type, freq, q = 0.7, am) => {
      const src = ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      src.playbackRate.value = rand(0.95, 1.05);
      const f = ctx.createBiquadFilter();
      f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = ctx.createGain();
      g.gain.value = 0;
      let tail = src.connect(f);
      if (am) { // 用一個低頻振盪器讓音量快速抖動（蟬鳴那種嗡嗡嗡）
        const a = ctx.createGain(); a.gain.value = 0.5;
        const lfo = ctx.createOscillator(), depth = ctx.createGain();
        lfo.frequency.value = am; depth.gain.value = 0.5;
        lfo.connect(depth).connect(a.gain); lfo.start();
        tail = tail.connect(a);
      }
      tail.connect(g).connect(master);
      src.start(0, Math.random() * 2);
      return { f, g };
    };
    L = {
      street: bed(brown, "lowpass", 160), // 人物區：遠遠的街道低鳴
      cicada: bed(white, "bandpass", 5200, 5, 13), // 妖怪區白天的蟬
      brown, white,
    };
  }

  const set = (param, v, t = 0.4) => param.setTargetAtTime(v, ctx.currentTime, t);
  const out = (node, pan = 0) => { // 接到總音量，順便左右擺位
    const p = ctx.createStereoPanner?.();
    if (p) { p.pan.value = pan; node.connect(p).connect(master); return p; }
    node.connect(master); return null;
  };
  const noiseSrc = (buf, t0, dur, rate = 1) => {
    const s = ctx.createBufferSource();
    s.buffer = buf; s.playbackRate.value = rate;
    s.start(t0, Math.random() * 2); s.stop(t0 + dur);
    return s;
  };

  // ---- 全島共用的一次性聲音 ----
  function thunder(strength) {
    const t0 = ctx.currentTime + rand(0.4, 1.6); // 先看到閃電，過一下才聽到雷
    const src = noiseSrc(L.brown, t0, 6, rand(0.5, 0.75));
    const f = ctx.createBiquadFilter();
    f.type = "lowpass"; f.frequency.value = 260;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.6 * strength, t0 + 0.08);
    g.gain.setTargetAtTime(0.3 * strength, t0 + 0.3, 0.3);
    g.gain.setTargetAtTime(0, t0 + 1.2, 0.9);
    src.connect(f).connect(g); out(g);
  }
  function cricket(level) { // 一隻蟋蟀唧唧唧三下
    const t0 = ctx.currentTime + rand(0, 0.2);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = rand(4200, 5200);
    g.gain.value = 0;
    for (let k = 0; k < 3; k++) {
      const s = t0 + k * 0.07;
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(0.05 * level, s + 0.01);
      g.gain.linearRampToValueAtTime(0, s + 0.045);
    }
    o.connect(g); out(g, rand(-0.8, 0.8));
    o.start(t0); o.stop(t0 + 0.3);
  }
  function frog(level) { // 呱呱：低音鋸齒波加上快速抖動
    const t0 = ctx.currentTime, n = Math.random() < 0.5 ? 2 : 3, base = rand(150, 240);
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = "sawtooth"; o.frequency.value = base;
    f.type = "bandpass"; f.frequency.value = base * 3; f.Q.value = 3;
    g.gain.value = 0;
    for (let k = 0; k < n; k++) {
      const s = t0 + k * 0.22;
      o.frequency.setValueAtTime(base * 0.9, s);
      o.frequency.linearRampToValueAtTime(base * 1.15, s + 0.12);
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(0.1 * level, s + 0.02);
      g.gain.linearRampToValueAtTime(0, s + 0.14);
    }
    o.connect(f).connect(g); out(g, rand(-0.6, 0.6));
    o.start(t0); o.stop(t0 + n * 0.22 + 0.2);
  }

  // ---- 海上的點綴 ----
  function wave(level) { // 一道浪輕輕拍上岸：嘩——慢慢退掉，尾巴帶一點細沙聲
    const t0 = ctx.currentTime, dur = rand(2.2, 3.2), pan = rand(-0.5, 0.5);
    const n = noiseSrc(L.brown, t0, dur), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = "lowpass"; f.Q.value = 0.3;
    f.frequency.setValueAtTime(250, t0);
    f.frequency.linearRampToValueAtTime(rand(700, 1000), t0 + dur * 0.35);
    f.frequency.linearRampToValueAtTime(300, t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.09 * level, t0 + dur * 0.35);
    g.gain.linearRampToValueAtTime(0, t0 + dur);
    n.connect(f).connect(g); out(g, pan);
    const z = noiseSrc(L.white, t0 + dur * 0.3, dur * 0.6), zf = ctx.createBiquadFilter(), zg = ctx.createGain();
    zf.type = "bandpass"; zf.frequency.value = 3000; zf.Q.value = 0.6;
    zg.gain.setValueAtTime(0, t0 + dur * 0.3);
    zg.gain.linearRampToValueAtTime(0.012 * level, t0 + dur * 0.45);
    zg.gain.linearRampToValueAtTime(0, t0 + dur * 0.9);
    z.connect(zf).connect(zg); out(zg, pan);
  }
  function gull(level) { // 遠處的海鷗：啊—啊—啊，音高往上滑再落下
    const t0 = ctx.currentTime, n = 2 + Math.floor(Math.random() * 2), pan = rand(-0.8, 0.8), base = rand(1300, 1600);
    for (let k = 0; k < n; k++) {
      const s = t0 + k * rand(0.28, 0.36), d = 0.22;
      const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(base * 0.85, s);
      o.frequency.linearRampToValueAtTime(base * 1.25, s + d * 0.3);
      o.frequency.linearRampToValueAtTime(base * 0.9, s + d);
      f.type = "bandpass"; f.frequency.value = base * 1.3; f.Q.value = 4;
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(0.03 * level, s + 0.03);
      g.gain.linearRampToValueAtTime(0, s + d);
      o.connect(f).connect(g); out(g, pan);
      o.start(s); o.stop(s + d + 0.05);
    }
  }
  function boatBell(level) { // 帆船上的小銅鈴：叮——（有時兩下）
    const t0 = ctx.currentTime, pan = rand(-0.7, 0.7), times = Math.random() < 0.4 ? 2 : 1;
    for (let k = 0; k < times; k++) {
      const s = t0 + k * 0.55;
      [[1180, 1, 1.4], [2950, 0.35, 0.6], [4400, 0.12, 0.3]].forEach(([hz, a, decay]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = hz;
        g.gain.setValueAtTime(0, s);
        g.gain.linearRampToValueAtTime(0.03 * a * level, s + 0.004);
        g.gain.setTargetAtTime(0, s + 0.01, decay / 3);
        o.connect(g); out(g, pan);
        o.start(s); o.stop(s + decay * 2);
      });
    }
  }
  function drip(level) { // 一滴雨打在東西上：很短的「滴」
    const t0 = ctx.currentTime + Math.random() * 0.05, hz = rand(1800, 4200);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(hz, t0);
    o.frequency.exponentialRampToValueAtTime(hz * 0.6, t0 + 0.04);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(rand(0.008, 0.025) * level, t0 + 0.002);
    g.gain.setTargetAtTime(0, t0 + 0.004, 0.012);
    o.connect(g); out(g, rand(-0.9, 0.9));
    o.start(t0); o.stop(t0 + 0.08);
  }

  // ---- 幽魂：風鈴 ----
  function chime(level) { // 幾個不成調的泛音，慢慢消失
    const t0 = ctx.currentTime, base = [880, 1046, 1175, 1318, 1568][Math.floor(Math.random() * 5)], pan = rand(-0.4, 0.4);
    [1, 2.76, 5.4].forEach((m, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = base * m;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime((0.07 / (i + 1)) * level, t0 + 0.005);
      g.gain.setTargetAtTime(0, t0 + 0.01, 0.9 / (i + 1));
      o.connect(g); out(g, pan);
      o.start(t0); o.stop(t0 + 4);
    });
  }

  // ---- 人物：機車騎過去、喇叭 ----
  function scooter(level) {
    const t0 = ctx.currentTime, dur = rand(2.8, 4), dir = Math.random() < 0.5 ? -1 : 1, base = rand(85, 115);
    const eng = ctx.createOscillator(), eng2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    eng.type = "sawtooth"; eng2.type = "square";
    // 都卜勒：靠近時音高略高，經過面前之後掉下來
    for (const [o, m] of [[eng, 1], [eng2, 2.01]]) {
      o.frequency.setValueAtTime(base * 1.12 * m, t0);
      o.frequency.linearRampToValueAtTime(base * 1.08 * m, t0 + dur * 0.45);
      o.frequency.linearRampToValueAtTime(base * 0.86 * m, t0 + dur * 0.6);
      o.frequency.linearRampToValueAtTime(base * 0.82 * m, t0 + dur);
    }
    f.type = "lowpass"; f.frequency.value = 700; f.Q.value = 2;
    const g2 = ctx.createGain(); g2.gain.value = 0.35;
    eng2.connect(g2).connect(f); eng.connect(f);
    // 輪胎和風切的沙沙聲
    const road = noiseSrc(L.white, t0, dur);
    const rf = ctx.createBiquadFilter(); rf.type = "bandpass"; rf.frequency.value = 700; rf.Q.value = 0.8;
    const rg = ctx.createGain(); rg.gain.value = 0.25;
    road.connect(rf).connect(rg).connect(f);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.24 * level, t0 + dur * 0.5);
    g.gain.linearRampToValueAtTime(0, t0 + dur);
    f.connect(g);
    const p = out(g, -dir);
    if (p) { p.pan.setValueAtTime(-0.9 * dir, t0); p.pan.linearRampToValueAtTime(0.9 * dir, t0 + dur); }
    eng.start(t0); eng2.start(t0); eng.stop(t0 + dur); eng2.stop(t0 + dur);
  }
  function horn(level) { // 叭叭
    const t0 = ctx.currentTime, pan = rand(-0.7, 0.7), twice = Math.random() < 0.5;
    for (let k = 0; k < (twice ? 2 : 1); k++) {
      const s = t0 + k * 0.22;
      const f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = "lowpass"; f.frequency.value = 1800;
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(0.05 * level, s + 0.02);
      g.gain.setValueAtTime(0.05 * level, s + 0.15);
      g.gain.linearRampToValueAtTime(0, s + 0.19);
      f.connect(g); out(g, pan);
      for (const hz of [415, 523]) { const o = ctx.createOscillator(); o.type = "square"; o.frequency.value = hz; o.connect(f); o.start(s); o.stop(s + 0.2); }
    }
  }

  // ---- 神明：悠悠的廟鼓與鐘 ----
  function drum(level, t0) { // 廟鼓：鼓身「咚」要落在一般喇叭放得出來的音域，再加上鼓棒敲下去那一下
    const pan = rand(-0.15, 0.15);
    [[150, 92, 0.5, 0.5], [345, 210, 0.18, 0.25], [520, 330, 0.08, 0.15]].forEach(([f0, f1, a, decay]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(f0, t0);
      o.frequency.exponentialRampToValueAtTime(f1, t0 + 0.25);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(a * level, t0 + 0.006);
      g.gain.setTargetAtTime(0, t0 + 0.02, decay);
      o.connect(g); out(g, pan);
      o.start(t0); o.stop(t0 + 2.5);
    });
    // 鼓棒打在鼓皮上的「啪」
    const n = noiseSrc(L.white, t0, 0.12), f = ctx.createBiquadFilter(), ng = ctx.createGain();
    f.type = "bandpass"; f.frequency.value = 1400; f.Q.value = 0.9;
    ng.gain.setValueAtTime(0.22 * level, t0); ng.gain.setTargetAtTime(0, t0, 0.02);
    n.connect(f).connect(ng); out(ng, pan);
    // 鼓腔裡的悶響
    const b = noiseSrc(L.brown, t0, 0.5), bf = ctx.createBiquadFilter(), bg = ctx.createGain();
    bf.type = "lowpass"; bf.frequency.value = 600;
    bg.gain.setValueAtTime(0.3 * level, t0); bg.gain.setTargetAtTime(0, t0, 0.12);
    b.connect(bf).connect(bg); out(bg, pan);
  }
  function bell(level) { // 大鐘：不和諧的泛音、兩兩微微走音互相拍動，嗡——很久才散
    const t0 = ctx.currentTime, base = 98;
    [[0.5, 0.5, 9], [1, 1, 7], [1.19, 0.5, 5], [1.56, 0.35, 4], [2, 0.3, 3.5], [2.74, 0.18, 2.5], [3.76, 0.1, 1.8]].forEach(([m, a, decay]) => {
      for (const det of [0, 0.6]) {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = base * m + det;
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(0.05 * a * level, t0 + 0.01);
        g.gain.setTargetAtTime(0, t0 + 0.02, decay / 3);
        o.connect(g); out(g);
        o.start(t0); o.stop(t0 + decay * 1.5);
      }
    });
  }
  function temple(level) { // 鼓、鼓、鼓……再一聲鐘，輪流來
    const t0 = ctx.currentTime;
    if (templeStep % 2 === 0) { for (let k = 0; k < 3; k++) drum(level * (k === 2 ? 1 : 0.75), t0 + k * 1.3); }
    else bell(level);
    templeStep++;
  }

  // ---- 老闆：翻書頁 ----
  function page(level) {
    const t0 = ctx.currentTime, dur = rand(0.35, 0.55), pan = rand(-0.3, 0.3);
    const n = noiseSrc(L.white, t0, dur + 0.1), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = "bandpass"; f.Q.value = 1.2;
    f.frequency.setValueAtTime(1200, t0);
    f.frequency.linearRampToValueAtTime(3800, t0 + dur * 0.6);
    f.frequency.linearRampToValueAtTime(1800, t0 + dur);
    g.gain.setValueAtTime(0, t0);
    // 紙張刷過去時沙沙的顫動
    for (let k = 0; k < 6; k++) g.gain.linearRampToValueAtTime((0.08 + Math.random() * 0.08) * level, t0 + (k + 1) * dur / 7);
    g.gain.linearRampToValueAtTime(0, t0 + dur);
    n.connect(f).connect(g); out(g, pan);
    // 書頁落下的輕輕一拍
    const tap = noiseSrc(L.white, t0 + dur, 0.12), tf = ctx.createBiquadFilter(), tg = ctx.createGain();
    tf.type = "lowpass"; tf.frequency.value = 900;
    tg.gain.setValueAtTime(0.12 * level, t0 + dur); tg.gain.setTargetAtTime(0, t0 + dur, 0.03);
    tap.connect(tf).connect(tg); out(tg, pan);
  }

  // ---- 妖怪：夜裡的貓頭鷹 ----
  function owl(level) { // 咕——咕咕
    const t0 = ctx.currentTime, pan = rand(-0.7, 0.7);
    [[0, 0.45], [0.7, 0.18], [0.95, 0.4]].forEach(([s, d]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(390, t0 + s);
      o.frequency.linearRampToValueAtTime(350, t0 + s + d);
      g.gain.setValueAtTime(0, t0 + s);
      g.gain.linearRampToValueAtTime(0.07 * level, t0 + s + 0.06);
      g.gain.linearRampToValueAtTime(0, t0 + s + d);
      o.connect(g); out(g, pan);
      o.start(t0 + s); o.stop(t0 + s + d + 0.05);
    });
  }

  // 計時器：時間到而且條件成立就觸發，然後重新抽下一次的間隔
  const every = (k, dt, ok, fire, gap) => { timer[k] -= dt; if (timer[k] < 0) { if (ok) fire(); timer[k] = gap(); } };

  return {
    get on() { return on; },
    // 一定要在使用者點擊時呼叫，瀏覽器才肯出聲
    enable(v) {
      on = v;
      if (on && !ctx) build();
      if (!ctx) return;
      if (on) ctx.resume();
      set(master.gain, on ? vol : 0, 0.3);
      if (!on) setTimeout(() => !on && ctx.suspend(), 1500);
    },
    setVolume(v) { vol = clamp(v); if (ctx && on) set(master.gain, vol, 0.1); },
    // s: { t, dt, night, w:{cloud,rain,fog,flash}, zoomOut 0~1, near:{ang,shen,hun,yao,yoyo,laoban} 0~1 }
    update(s) {
      if (!ctx || !on || ctx.state !== "running") return;
      const { t, dt, night, w, zoomOut, near } = s;
      const n = (id) => near[id] || 0;
      const quiet = 1 - n("yoyo") * 0.85; // 長篇溜溜球：靠近就安靜下來
      const calm = 1 - n("hun"); // 幽魂：只留風鈴，蟲蛙都不叫
      const away = 1 - Math.max(0, ...Object.values(near)); // 拉近到任何一座島：海上的點綴就不出現，只聽那座島
      const gust = 0.5 + 0.5 * Math.sin(t * 0.23) * Math.sin(t * 0.61 + 2); // 風的強弱，只拿來決定風鈴響得勤不勤
      // 海上的點綴：拉遠俯瞰時才有，大部分時間安靜
      const sea = away * quiet * (0.4 + 0.6 * zoomOut);
      every("wave", dt, sea > 0.1, () => wave(sea), () => rand(5, 10));
      every("gull", dt, sea > 0.2 && night < 0.5 && w.rain < 0.3, () => gull(sea), () => rand(14, 30));
      every("boat", dt, sea > 0.2, () => boatBell(sea), () => rand(18, 40));
      // 下雨：一滴一滴的滴答，雨越大越密
      const rain = w.rain * quiet;
      every("drip", dt, rain > 0.05, () => { const k = 1 + Math.floor(rain * 3); for (let i = 0; i < k; i++) drip(rain); }, () => rand(0.04, 0.16) / Math.max(0.2, rain));
      // 打雷：天氣那邊閃一下，這邊晚一點打雷
      if (w.flash > 0.9 && lastFlash < 0.9) thunder((0.6 + Math.random() * 0.4) * quiet);
      lastFlash = w.flash;
      // 夜裡的蟲鳴、蛙叫：靠近島比較清楚，下雨時變少；妖怪區特別多
      const close = 1 - zoomOut * 0.7;
      const bug = night * close * (1 - w.rain * 0.8) * (1 + n("yao") * 1.2) * quiet * calm;
      every("cricket", dt, bug > 0.05, () => cricket(Math.min(1, bug)), () => rand(0.15, 0.6) / Math.max(0.3, bug));
      every("frog", dt, night > 0.4 && Math.random() < close * (0.6 + w.rain) * quiet * calm, () => frog(Math.min(1, night * close)), () => rand(1.5, 5));

      // ---- 各島自己的聲音 ----
      const ang = n("ang"), shen = n("shen"), hun = n("hun"), yao = n("yao"), laoban = n("laoban");
      // 人物：白天車多、晚上少一點
      const traffic = ang * (1 - night * 0.5);
      set(L.street.g.gain, ang * 0.08, 0.6);
      every("scooter", dt, traffic > 0.1, () => scooter(Math.min(1, ang * 1.2)), () => rand(1.8, 5) / Math.max(0.4, traffic));
      every("horn", dt, traffic > 0.2 && Math.random() < 0.5, () => horn(ang), () => rand(6, 14));
      // 神明：鼓三聲、鐘一聲，輪流慢慢來
      every("temple", dt, shen > 0.12, () => temple(Math.min(1, shen * 1.1)), () => (templeStep % 2 ? rand(5, 7) : rand(7, 10)));
      // 幽魂：風鈴，風大時響得勤
      every("chime", dt, hun > 0.15, () => chime(hun), () => rand(0.8, 3) / (0.5 + gust));
      // 妖怪：白天蟬鳴，晚上貓頭鷹
      set(L.cicada.g.gain, yao * (1 - night) * (1 - w.rain) * 0.06, 0.8);
      set(L.cicada.f.frequency, 4800 + Math.sin(t * 0.3) * 500, 0.5);
      every("owl", dt, yao > 0.2 && night > 0.4, () => owl(yao), () => rand(5, 11));
      // 老闆：有人在翻書
      every("page", dt, laoban > 0.15, () => page(Math.min(1, laoban * 1.2)), () => rand(2.5, 6));
    },
    pause(p) { if (ctx && on) p ? ctx.suspend() : ctx.resume(); },
  };
}
