/* 氛围层：画布粒子（雪 / 炉火余烬 / 收音机雪花噪点 / 系统冷光 / 雾 / 海冰 / 灰烬）
   + WebAudio 环境音（默认静音，页内按钮开关）。全部本地生成，无外部资源。 */
(function () {
  var cvs = document.getElementById("fx");
  var ctx = cvs.getContext("2d");
  var app = document.getElementById("app");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 0, H = 0, DPR = 1, mode = "title", parts = [], t0 = performance.now(), last = t0, raf = 0;
  var noiseCvs = document.createElement("canvas"), noiseCtx = noiseCvs.getContext("2d");
  noiseCvs.width = 160; noiseCvs.height = 120;

  var MODES = {
    title:   { kind: "ember",  n: 40,  color: "201,163,106" },
    intro:   { kind: "static", n: 0, strong: true },
    cover:   { kind: "snow",   n: 260, wind: 0.45, big: true },
    radio:   { kind: "static", n: 0 },
    snow:    { kind: "snow",   n: 150, wind: 0.25 },
    cabin:   { kind: "ember",  n: 60,  color: "255,150,60", glow: true },
    fire:    { kind: "ember",  n: 120, color: "255,120,40", glow: true },
    rest:    { kind: "dust",   n: 50 },
    system:  { kind: "cold",   n: 70 },
    core:    { kind: "cold",   n: 120, red: true },
    village: { kind: "fog",    n: 9,  ash: 30 },
    fog:     { kind: "fog",    n: 12, ash: 20 },
    sea:     { kind: "snow",   n: 90, wind: 1.2, sea: true },
    death:   { kind: "ash",    n: 90 },
    dawn:    { kind: "dust",   n: 70, gold: true }
  };

  function resize() {
    var r = app.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    cvs.width = Math.round(W * DPR); cvs.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function spawn(cfg, initial) {
    var p = { x: rnd(0, W), y: initial ? rnd(0, H) : 0, a: rnd(0.2, 1), s: rnd(0.5, 1) };
    switch (cfg.kind) {
      case "snow": p.y = initial ? rnd(-10, H) : -6; p.r = cfg.big && Math.random() < 0.12 ? rnd(2.8, 4.6) : rnd(0.6, 2.6); p.vy = rnd(18, 55) * (p.r / 2); p.vx = cfg.wind * rnd(10, 30); p.ph = rnd(0, 6.28); break;
      case "ember": p.y = initial ? rnd(H * 0.3, H) : H + 4; p.r = rnd(0.6, 2); p.vy = -rnd(14, 46); p.vx = rnd(-8, 8); p.life = rnd(3, 8); p.age = initial ? rnd(0, p.life) : 0; break;
      case "dust": p.r = rnd(0.5, 1.8); p.vy = rnd(-6, 6); p.vx = rnd(-5, 5); p.ph = rnd(0, 6.28); break;
      case "cold": p.y = initial ? rnd(0, H) : H + 4; p.r = rnd(0.5, 1.6); p.vy = -rnd(8, 30); p.vx = 0; p.len = rnd(4, 18); break;
      case "fog": p.y = rnd(H * 0.2, H); p.r = rnd(140, 320); p.vx = rnd(4, 14) * (Math.random() < 0.5 ? -1 : 1); p.a = rnd(0.05, 0.12); break;
      case "ash": p.y = initial ? rnd(0, H) : -6; p.r = rnd(0.6, 2.2); p.vy = rnd(8, 22); p.vx = rnd(-6, 6); p.ph = rnd(0, 6.28); break;
    }
    return p;
  }

  function setMode(m) {
    if (!MODES[m]) m = "title";
    if (m === mode && parts.length) return;
    mode = m;
    var cfg = MODES[m];
    var n = reduce ? Math.round(cfg.n / 4) : cfg.n;
    parts = [];
    for (var i = 0; i < n; i++) parts.push(spawn(cfg, true));
    if (cfg.ash) for (var j = 0; j < (reduce ? 5 : cfg.ash); j++) { var a = spawn({ kind: "ash" }, true); a.isAsh = true; parts.push(a); }
    Audio.scene(m);
  }

  function drawStatic(t, strong) {
    var img = noiseCtx.createImageData(160, 120), d = img.data;
    for (var i = 0; i < d.length; i += 4) { var v = Math.random() * 255; if (strong) { d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 70; } else { d[i] = v * 0.6; d[i + 1] = v; d[i + 2] = v * 0.7; d[i + 3] = 26; } }
    noiseCtx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(noiseCvs, 0, 0, W, H);
    // 滚动的信号干扰条
    var y = ((t * 60) % (H + 80)) - 40;
    var g = ctx.createLinearGradient(0, y - 30, 0, y + 30);
    g.addColorStop(0, "rgba(116,224,160,0)"); g.addColorStop(0.5, "rgba(116,224,160,.07)"); g.addColorStop(1, "rgba(116,224,160,0)");
    ctx.fillStyle = g; ctx.fillRect(0, y - 30, W, 60);
    if (Math.random() < 0.04) { ctx.fillStyle = "rgba(200,255,220,.06)"; ctx.fillRect(0, rnd(0, H), W, rnd(1, 4)); }
  }

  function drawSea(t) {
    // 冰面与缓慢起伏的海平线
    var base = H * 0.82;
    ctx.beginPath(); ctx.moveTo(0, H);
    for (var x = 0; x <= W; x += 16) ctx.lineTo(x, base + Math.sin(x * 0.012 + t * 0.6) * 6 + Math.sin(x * 0.031 + t) * 3);
    ctx.lineTo(W, H); ctx.closePath();
    var g = ctx.createLinearGradient(0, base - 10, 0, H);
    g.addColorStop(0, "rgba(158,196,214,.16)"); g.addColorStop(1, "rgba(20,40,60,.4)");
    ctx.fillStyle = g; ctx.fill();
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    var t = (now - t0) / 1000, cfg = MODES[mode];
    ctx.clearRect(0, 0, W, H);
    if (cfg.kind === "static") { drawStatic(t, cfg.strong); return; }
    if (cfg.glow) {
      var fl = 0.75 + Math.sin(t * 7) * 0.08 + Math.sin(t * 13.3) * 0.06 + (Math.random() - 0.5) * 0.05;
      var gg = ctx.createRadialGradient(W * 0.35, H * 1.05, 10, W * 0.35, H * 1.05, H * 0.9);
      gg.addColorStop(0, "rgba(255,140,50," + (0.22 * fl) + ")"); gg.addColorStop(1, "rgba(255,140,50,0)");
      ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H);
    }
    if (cfg.kind === "cold") {
      ctx.strokeStyle = cfg.red ? "rgba(196,42,42,.06)" : "rgba(116,224,200,.05)"; ctx.lineWidth = 1;
      ctx.beginPath();
      for (var gx = 0; gx < W; gx += 48) { ctx.moveTo(gx + 0.5, 0); ctx.lineTo(gx + 0.5, H); }
      for (var gy = (t * 12) % 48; gy < H; gy += 48) { ctx.moveTo(0, gy + 0.5); ctx.lineTo(W, gy + 0.5); }
      ctx.stroke();
      var sy = (t * 90) % (H + 200) - 100;
      var sg = ctx.createLinearGradient(0, sy - 60, 0, sy + 4);
      sg.addColorStop(0, "rgba(116,224,200,0)"); sg.addColorStop(1, cfg.red ? "rgba(255,80,80,.10)" : "rgba(140,240,220,.10)");
      ctx.fillStyle = sg; ctx.fillRect(0, sy - 60, W, 64);
    }
    if (cfg.sea) drawSea(t);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i], k = p.isAsh ? "ash" : cfg.kind;
      if (k === "snow") {
        p.ph += dt; p.x += (p.vx + Math.sin(p.ph) * 8) * dt; p.y += p.vy * dt;
        if (p.y > H + 6 || p.x > W + 10 || p.x < -10) { parts[i] = spawn(cfg, false); if (cfg.wind > 0.8) parts[i].x = rnd(-W * 0.3, W); continue; }
        ctx.fillStyle = "rgba(235,245,255," + (0.35 + p.a * 0.55) + ")";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      } else if (k === "ember") {
        p.age += dt; p.x += (p.vx + Math.sin(p.age * 3) * 6) * dt; p.y += p.vy * dt;
        if (p.age > p.life || p.y < -10) { parts[i] = spawn(cfg, false); continue; }
        var al = Math.sin(Math.PI * p.age / p.life) * p.a;
        ctx.fillStyle = "rgba(" + cfg.color + "," + al + ")";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      } else if (k === "dust") {
        p.ph += dt * 0.6; p.x += (p.vx + Math.sin(p.ph) * 3) * dt; p.y += (p.vy + Math.cos(p.ph) * 3) * dt;
        if (p.x < -5) p.x = W + 5; if (p.x > W + 5) p.x = -5; if (p.y < -5) p.y = H + 5; if (p.y > H + 5) p.y = -5;
        ctx.fillStyle = cfg.gold ? "rgba(255,214,150," + (0.15 + 0.35 * (0.5 + 0.5 * Math.sin(p.ph * 2))) + ")" : "rgba(230,215,184," + (0.08 + 0.18 * p.a) + ")";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      } else if (k === "cold") {
        p.y += p.vy * dt;
        if (p.y < -20) { parts[i] = spawn(cfg, false); continue; }
        ctx.strokeStyle = cfg.red ? "rgba(255,90,90," + (0.15 + p.a * 0.35) + ")" : "rgba(140,240,220," + (0.12 + p.a * 0.3) + ")";
        ctx.lineWidth = p.r; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y + p.len); ctx.stroke();
      } else if (k === "fog") {
        p.x += p.vx * dt;
        if (p.x < -p.r) p.x = W + p.r; if (p.x > W + p.r) p.x = -p.r;
        var fg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        fg.addColorStop(0, "rgba(180,185,190," + p.a + ")"); fg.addColorStop(1, "rgba(180,185,190,0)");
        ctx.fillStyle = fg; ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      } else if (k === "ash") {
        p.ph += dt; p.x += (p.vx + Math.sin(p.ph) * 5) * dt; p.y += p.vy * dt;
        if (p.y > H + 6) { var na = spawn({ kind: "ash" }, false); na.isAsh = p.isAsh; parts[i] = na; continue; }
        ctx.fillStyle = mode === "death" ? "rgba(200,60,60," + (0.25 + p.a * 0.4) + ")" : "rgba(120,110,100," + (0.2 + p.a * 0.3) + ")";
        ctx.fillRect(p.x, p.y, p.r * 1.6, p.r);
      }
    }
  }

  /* ---------- WebAudio 环境音 ---------- */
  var Audio = (function () {
    var ac = null, master, noise, filt, nGain, o1, o2, hGain, crackleTimer = null, on = false, cur = "title";
    var PRESET = {
      title:   { f: 1800, q: 0.7, type: "bandpass", n: 0.05, h: 0.00, hz: 55 },
      intro:   { f: 3200, q: 0.5, type: "bandpass", n: 0.30, h: 0.00, hz: 60 },
      cover:   { f: 460,  q: 0.9, type: "lowpass",  n: 0.22, h: 0.00, hz: 55, wind: true },
      radio:   { f: 2600, q: 0.6, type: "bandpass", n: 0.12, h: 0.00, hz: 60 },
      snow:    { f: 500,  q: 0.9, type: "lowpass",  n: 0.22, h: 0.00, hz: 55, wind: true },
      sea:     { f: 420,  q: 0.9, type: "lowpass",  n: 0.24, h: 0.015, hz: 45, wind: true },
      cabin:   { f: 260,  q: 0.5, type: "lowpass",  n: 0.10, h: 0.00, hz: 55, crackle: true },
      fire:    { f: 380,  q: 0.5, type: "lowpass",  n: 0.16, h: 0.00, hz: 55, crackle: true },
      rest:    { f: 300,  q: 0.5, type: "lowpass",  n: 0.03, h: 0.02, hz: 60 },
      system:  { f: 900,  q: 2.0, type: "bandpass", n: 0.03, h: 0.05, hz: 55 },
      core:    { f: 700,  q: 3.0, type: "bandpass", n: 0.05, h: 0.07, hz: 41 },
      village: { f: 350,  q: 0.8, type: "lowpass",  n: 0.12, h: 0.01, hz: 49, wind: true },
      fog:     { f: 320,  q: 0.8, type: "lowpass",  n: 0.12, h: 0.01, hz: 49, wind: true },
      death:   { f: 180,  q: 0.8, type: "lowpass",  n: 0.06, h: 0.05, hz: 36 },
      dawn:    { f: 600,  q: 0.5, type: "lowpass",  n: 0.04, h: 0.02, hz: 65 }
    };
    function init() {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ac = new AC();
      master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
      var len = ac.sampleRate * 3, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0), lastV = 0;
      for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; lastV = (lastV + 0.04 * w) / 1.04; d[i] = lastV * 3 + w * 0.15; }
      noise = ac.createBufferSource(); noise.buffer = buf; noise.loop = true;
      filt = ac.createBiquadFilter(); nGain = ac.createGain(); nGain.gain.value = 0;
      noise.connect(filt); filt.connect(nGain); nGain.connect(master); noise.start();
      o1 = ac.createOscillator(); o2 = ac.createOscillator(); o1.type = "sine"; o2.type = "triangle";
      hGain = ac.createGain(); hGain.gain.value = 0;
      o1.connect(hGain); o2.connect(hGain); hGain.connect(master); o1.start(); o2.start();
      return true;
    }
    function crackle() {
      if (!ac || !on) return;
      var b = ac.createBufferSource(), len = Math.round(ac.sampleRate * 0.03), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      b.buffer = buf; var g = ac.createGain(); g.gain.value = rnd(0.05, 0.25);
      b.connect(g); g.connect(master); b.start();
    }
    function scene(m) {
      cur = m;
      if (!ac || !on) return;
      var p = PRESET[m] || PRESET.title, now = ac.currentTime;
      filt.type = p.type;
      filt.frequency.setTargetAtTime(p.f, now, 0.6);
      filt.Q.setTargetAtTime(p.q, now, 0.6);
      nGain.gain.setTargetAtTime(p.n, now, 0.8);
      hGain.gain.setTargetAtTime(p.h, now, 0.8);
      o1.frequency.setTargetAtTime(p.hz, now, 0.5);
      o2.frequency.setTargetAtTime(p.hz * 2.01, now, 0.5);
      clearInterval(crackleTimer); crackleTimer = null;
      if (p.crackle) crackleTimer = setInterval(function () { if (Math.random() < 0.55) crackle(); }, 180);
    }
    function windTick() {
      if (!ac || !on) return;
      var p = PRESET[cur] || {};
      if (p.wind) filt.frequency.setTargetAtTime(p.f * rnd(0.6, 1.6), ac.currentTime, 1.2);
    }
    setInterval(windTick, 1800);
    function toggle() {
      if (!ac && !init()) return false;
      on = !on;
      if (ac.state === "suspended") ac.resume();
      master.gain.setTargetAtTime(on ? 0.9 : 0, ac.currentTime, 0.3);
      if (on) scene(cur); else { clearInterval(crackleTimer); crackleTimer = null; }
      return on;
    }
    function hit() {   // 危险时的一声低闷撞击
      if (!ac || !on) return;
      var o = ac.createOscillator(), g = ac.createGain(), now = ac.currentTime;
      o.frequency.setValueAtTime(90, now); o.frequency.exponentialRampToValueAtTime(30, now + 0.4);
      g.gain.setValueAtTime(0.5, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      o.connect(g); g.connect(master); o.start(now); o.stop(now + 0.55);
    }
    return { scene: scene, toggle: toggle, hit: hit };
  })();

  function shake(strong) {
    if (reduce) return;
    app.classList.remove("shake", "shake-strong");
    void app.offsetWidth;
    app.classList.add(strong ? "shake-strong" : "shake");
    Audio.hit();
  }

  /* 所有「声音」按钮同步；偏好记在本地，默认关闭 */
  var SOUND_KEY = "qqgk-sound";
  function syncBtns(on) {
    document.querySelectorAll(".sound-toggle").forEach(function (b) {
      b.textContent = on ? "声音：开" : "声音：关";
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.classList.toggle("on", on);
    });
  }
  var soundOn = false, ignoreClick = false;
  function setSound(on) {
    if (on !== soundOn) soundOn = Audio.toggle();
    syncBtns(soundOn);
    try { localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0"); } catch (e) { /* ignore */ }
  }
  document.querySelectorAll(".sound-toggle").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      if (ignoreClick) { ignoreClick = false; syncBtns(false); try { localStorage.setItem(SOUND_KEY, "0"); } catch (er) { /* ignore */ } return; }
      setSound(!soundOn);
    });
  });
  var wantSound = false;
  try { wantSound = localStorage.getItem(SOUND_KEY) === "1"; } catch (e) { /* ignore */ }
  if (wantSound) {   // 浏览器要求先有用户操作才能出声：等第一次点击/按键再开
    syncBtns(true);
    var arm = function (e) {
      window.removeEventListener("pointerdown", arm, true);
      window.removeEventListener("keydown", arm, true);
      if (e && e.target && e.target.classList && e.target.classList.contains("sound-toggle")) { ignoreClick = true; return; }
      if (!soundOn) setSound(true);
    };
    window.addEventListener("pointerdown", arm, true);
    window.addEventListener("keydown", arm, true);
  }

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  });
  resize();
  setMode(app.dataset.bg || "title");
  raf = requestAnimationFrame(frame);

  window.QQFX = { setScene: setMode, shake: shake, resize: resize };
})();
