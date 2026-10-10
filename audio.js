/* 程序化环境音（WebAudio）：每类场景一组声音层，切换时交叉淡化；外加界面音效与危险心跳。
   默认静音，由页面上的「声音」按钮开启。 */
(function () {
  var ac = null, master = null, on = false, cur = null, bundle = null, beat = null, buffers = {};
  var R = Math.random;

  function init() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0;
    var comp = ac.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ac.destination);
    var len = ac.sampleRate * 4;
    ["white", "pink", "brown"].forEach(function (k) {
      var b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0), last = 0, b0 = 0, b1 = 0, b2 = 0;
      for (var i = 0; i < len; i++) {
        var w = R() * 2 - 1;
        if (k === "white") d[i] = w * 0.5;
        else if (k === "brown") { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
        else { b0 = 0.997 * b0 + w * 0.029591; b1 = 0.985 * b1 + w * 0.032534; b2 = 0.95 * b2 + w * 0.048056; d[i] = (b0 + b1 + b2 + w * 0.05) * 0.9; }
      }
      buffers[k] = b;
    });
    return true;
  }

  /* ---------- 基础构件 ---------- */
  function noise(B, kind, type, freq, q, gain) {
    var s = ac.createBufferSource(); s.buffer = buffers[kind]; s.loop = true; s.loopStart = R() * 2;
    var f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q || 0.7;
    var g = ac.createGain(); g.gain.value = gain;
    s.connect(f); f.connect(g); g.connect(B.out); s.start(0, R() * 3);
    B.nodes.push(s); return { src: s, f: f, g: g };
  }
  function tone(B, type, freq, gain) {
    var o = ac.createOscillator(); o.type = type; o.frequency.value = freq;
    var g = ac.createGain(); g.gain.value = gain; o.connect(g); g.connect(B.out); o.start();
    B.nodes.push(o); return { o: o, g: g };
  }
  function lfo(B, param, rate, depth) {
    var o = ac.createOscillator(); o.frequency.value = rate; var g = ac.createGain(); g.gain.value = depth;
    o.connect(g); g.connect(param); o.start(); B.nodes.push(o);
  }
  function every(B, ms, fn, chance) { B.timers.push(setInterval(function () { if (on && (chance == null || R() < chance)) fn(); }, ms)); }
  function env(dest, t, a, peak, d) { dest.gain.setValueAtTime(0.0001, t); dest.gain.exponentialRampToValueAtTime(peak, t + a); dest.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function burst(out, kind, type, freq, q, peak, dur) {
    var s = ac.createBufferSource(); s.buffer = buffers[kind]; var f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    var g = ac.createGain(); s.connect(f); f.connect(g); g.connect(out); var t = ac.currentTime; env(g, t, 0.005, peak, dur); s.start(t, R() * 3); s.stop(t + dur + 0.1); return f;
  }
  function blip(out, type, f0, f1, peak, dur) {
    var o = ac.createOscillator(); o.type = type; var g = ac.createGain(); o.connect(g); g.connect(out); var t = ac.currentTime;
    o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur); env(g, t, 0.006, peak, dur); o.start(t); o.stop(t + dur + 0.1);
  }
  var PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];

  /* ---------- 各场景声景 ---------- */
  var SCAPES = {
    wind: function (B, amt) {
      var w = noise(B, "brown", "lowpass", 420, 0.9, 0.5 * amt); lfo(B, w.f.frequency, 0.07, 220); lfo(B, w.g.gain, 0.11, 0.18 * amt);
      var h = noise(B, "white", "highpass", 5200, 0.5, 0.025 * amt); lfo(B, h.g.gain, 0.05, 0.015 * amt);
      every(B, 2600, function () { var f = burst(B.out, "pink", "bandpass", 600 + R() * 500, 2, 0.12 * amt, 1.8 + R()); f.frequency.linearRampToValueAtTime(300 + R() * 300, ac.currentTime + 2); }, 0.45);
    },
    fire: function (B, amt) {
      noise(B, "brown", "lowpass", 220, 0.6, 0.35 * amt);
      every(B, 90, function () { burst(B.out, "white", "highpass", 1800 + R() * 3000, 1, 0.05 + R() * 0.2 * amt, 0.02 + R() * 0.03); }, 0.42);
      every(B, 1400, function () { burst(B.out, "pink", "bandpass", 300, 1.5, 0.16 * amt, 0.5); }, 0.3);
    },
    radio: function (B) {
      var s = noise(B, "white", "bandpass", 2600, 0.5, 0.22); lfo(B, s.f.frequency, 0.3, 900);
      every(B, 1700, function () { blip(B.out, "sine", 900 + R() * 1400, 300 + R() * 2000, 0.04, 0.6); }, 0.6);
      tone(B, "sine", 60, 0.03);
    },
    sea: function (B) {
      var w = noise(B, "pink", "lowpass", 700, 0.6, 0.32); lfo(B, w.g.gain, 0.09, 0.22); lfo(B, w.f.frequency, 0.09, 300);
      SCAPES.wind(B, 0.45);
      every(B, 2300, function () { var o = ac.createOscillator(); o.type = "sawtooth"; var f = ac.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 9; var g = ac.createGain(); o.connect(f); f.connect(g); g.connect(B.out); var t = ac.currentTime, d = 0.6 + R() * 0.8; o.frequency.setValueAtTime(70 + R() * 50, t); o.frequency.linearRampToValueAtTime(50 + R() * 40, t + d); f.frequency.setValueAtTime(500 + R() * 400, t); env(g, t, 0.15, 0.06, d); o.start(t); o.stop(t + d + 0.3); }, 0.4);
    },
    castle: function (B) {
      var d = noise(B, "pink", "bandpass", 500, 3, 0.14); lfo(B, d.f.frequency, 0.05, 350); lfo(B, d.g.gain, 0.08, 0.08);
      [65.4, 98, 130.8].forEach(function (f, i) { var t = tone(B, i ? "triangle" : "sine", f, 0.035); lfo(B, t.g.gain, 0.04 + i * 0.02, 0.015); });
      every(B, 1000, function () { blip(B.out, "square", 2400, 0, 0.012, 0.03); });
    },
    system: function (B, red) {
      tone(B, "sine", red ? 41 : 50, 0.09); tone(B, "triangle", red ? 82 : 100, 0.03);
      noise(B, "white", "bandpass", 6000, 4, 0.012);
      every(B, 700, function () { blip(B.out, "sine", 1200 + (R() * 6 | 0) * 220, 0, 0.025, 0.07); }, 0.35);
      if (red) every(B, 3000, function () { blip(B.out, "sawtooth", 90, 40, 0.18, 1.2); }, 0.4);
    },
    jinbi: function (B) {
      tone(B, "sine", 55, 0.05); noise(B, "brown", "lowpass", 160, 0.5, 0.12);
      every(B, 1300, function () { blip(B.out, "sine", 1400 + R() * 500, 500, 0.05, 0.18); }, 0.5);
    },
    rest: function (B) {
      noise(B, "brown", "lowpass", 260, 0.5, 0.08); tone(B, "sine", 60, 0.015);
      every(B, 1000, function () { blip(B.out, "triangle", 1800, 0, 0.02, 0.04); });
      SCAPES.fire(B, 0.25);
    },
    school: function (B) {
      noise(B, "pink", "lowpass", 900, 0.5, 0.06);
      every(B, 4000, function () { var f = PENTA[R() * 4 | 0]; blip(B.out, "sine", f, 0, 0.05, 1.6); setTimeout(function () { if (on) blip(B.out, "sine", f * 1.25, 0, 0.04, 1.6); }, 400); }, 0.5);
      every(B, 900, function () { burst(B.out, "pink", "bandpass", 900 + R() * 600, 3, 0.02, 0.25); }, 0.4);
    },
    casino: function (B) {
      noise(B, "pink", "bandpass", 700, 0.8, 0.07);
      every(B, 450, function () { blip(B.out, "sine", 2200 + R() * 1800, 0, 0.03, 0.12); }, 0.4);
      every(B, 2500, function () { [0, 1, 2].forEach(function (k) { setTimeout(function () { if (on) blip(B.out, "triangle", PENTA[(R() * 6) | 0], 0, 0.03, 0.4); }, k * 120); }); }, 0.3);
    },
    math: function (B) {
      var w = noise(B, "pink", "lowpass", 500, 0.6, 0.12); lfo(B, w.g.gain, 0.08, 0.08);
      every(B, 650, function () { blip(B.out, "sine", PENTA[(R() * 6) | 0] * 2, 0, 0.03, 0.9); }, 0.45);
    },
    core: function (B) {
      SCAPES.system(B, true); SCAPES.wind(B, 0.4);
      every(B, 5000, function () { burst(B.out, "brown", "lowpass", 120, 0.7, 0.5, 2.5); }, 0.35);
    },
    village: function (B) { SCAPES.wind(B, 0.6); every(B, 3000, function () { blip(B.out, "sine", 300 + R() * 80, 220, 0.03, 1.2); }, 0.3); },
    death: function (B) { tone(B, "sine", 36, 0.08); tone(B, "sine", 36.6, 0.06); noise(B, "brown", "lowpass", 150, 0.5, 0.1); },
    dawn: function (B) { [261.6, 329.6, 392, 493.9].forEach(function (f, i) { var t = tone(B, "sine", f, 0.022); lfo(B, t.g.gain, 0.05 + i * 0.03, 0.012); }); SCAPES.wind(B, 0.2); }
  };
  var MAP = {
    intro: "radio", radio: "radio", title: "radio", cover: "wind:1", snow: "wind:1", cabin: "fire:1", fire: "fire:1.6", rest: "rest",
    system: "jinbi", jinbi: "jinbi", twin: "system", sea: "sea", village: "village", fog: "village", castle: "castle", ballroom: "castle",
    school: "school", casino: "casino", math: "math", core: "core", death: "death", dawn: "dawn"
  };

  function stopBundle(B) {
    if (!B) return;
    var t = ac.currentTime;
    B.out.gain.cancelScheduledValues(t); B.out.gain.setValueAtTime(B.out.gain.value, t); B.out.gain.linearRampToValueAtTime(0, t + 1.5);
    B.timers.forEach(clearInterval);
    setTimeout(function () { B.nodes.forEach(function (n) { try { n.stop(); } catch (e) { /* ignore */ } }); B.out.disconnect(); }, 1700);
  }
  function start(name) {
    var spec = (MAP[name] || "radio").split(":"), fn = SCAPES[spec[0]];
    var B = { out: ac.createGain(), nodes: [], timers: [] };
    B.out.gain.value = 0; B.out.connect(master);
    fn(B, spec[1] ? parseFloat(spec[1]) : 1);
    B.out.gain.linearRampToValueAtTime(1, ac.currentTime + 1.6);
    return B;
  }
  function scene(name) {
    cur = name;
    if (!ac || !on) return;
    if (bundle && bundle.name === (MAP[name] || "radio")) return;
    stopBundle(bundle);
    bundle = start(name); bundle.name = MAP[name] || "radio";
  }
  function heartbeat(enable) {
    if (!ac || !on) { beat = enable ? "pending" : null; return; }
    if (enable && !beat) {
      var thump = function () { [0, 0.22].forEach(function (dt, k) { var o = ac.createOscillator(); o.type = "sine"; var g = ac.createGain(); o.connect(g); g.connect(master); var t = ac.currentTime + dt; o.frequency.setValueAtTime(k ? 52 : 60, t); o.frequency.exponentialRampToValueAtTime(30, t + 0.18); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(k ? 0.35 : 0.5, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25); o.start(t); o.stop(t + 0.3); }); };
      thump(); beat = setInterval(thump, 1050);
    } else if (!enable && beat) { if (beat !== "pending") clearInterval(beat); beat = null; }
  }
  var UI = {
    stamp: function () { blip(master, "sine", 120, 40, 0.6, 0.25); burst(master, "white", "lowpass", 1200, 0.7, 0.35, 0.08); },
    page: function () { var f = burst(master, "pink", "bandpass", 1800, 0.8, 0.12, 0.28); f.frequency.linearRampToValueAtTime(4200, ac.currentTime + 0.25); },
    click: function () { blip(master, "triangle", 1500, 900, 0.07, 0.05); },
    notice: function () { blip(master, "sine", 880, 0, 0.06, 0.15); setTimeout(function () { if (on) blip(master, "sine", 1320, 0, 0.05, 0.2); }, 110); },
    hit: function () { blip(master, "sine", 90, 30, 0.55, 0.5); burst(master, "brown", "lowpass", 300, 0.7, 0.4, 0.3); },
    card: function () { [0, 1, 2].forEach(function (k) { setTimeout(function () { if (on) blip(master, "sine", PENTA[k + 2] * 2, 0, 0.05, 0.5); }, k * 90); }); }
  };
  function ui(kind) { if (!ac || !on || !UI[kind]) return; try { UI[kind](); } catch (e) { /* ignore */ } }
  function toggle() {
    if (!ac && !init()) return false;
    on = !on;
    if (ac.state === "suspended") ac.resume();
    var t = ac.currentTime;
    master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(on ? 0.85 : 0, t + 0.4);
    if (on) { bundle = null; scene(cur || "cover"); if (beat === "pending") { beat = null; heartbeat(true); } }
    else { stopBundle(bundle); bundle = null; if (beat && beat !== "pending") clearInterval(beat); beat = beat ? "pending" : null; }
    return on;
  }
  document.addEventListener("visibilitychange", function () { if (ac && on) { if (document.hidden) ac.suspend(); else ac.resume(); } });
  window.QQAUDIO = { scene: scene, toggle: toggle, ui: ui, heartbeat: heartbeat, isOn: function () { return on; } };
})();
