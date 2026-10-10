/* 开场影片 + 封面
   · 首次打开（无存档）：完整影片——夜里的车、路况广播、信号断裂、电流淹没一切，准考证落进掌心，就地填写姓名。
   · 之后打开：约 2 秒的短版（收音机报时 → 标题调频 → 雪夜封面）。
   · 「领取准考证」：短版夜车 → 准考证落下。确认入场后：墨迹显影 → 两句广播 → 黑场、心跳漏一拍 → 雪夜推镜 → 考场门牌 → 章节卡。
   · 「重听广播」：完整影片，最后门牌化入封面标题。
   点击 / 按键跳过（吞掉这次点击，不会误触下一屏）；系统「减少动画」时直接给出最终画面。 */
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var app = $("#app"), scr = $("#screen-title"), film = $("#film"), cap = $("#intro-cap");
  var FX = window.QQFX || { setScene: function () {} };
  var SND = window.QQAUDIO || { ui: function () {}, scene: function () {} };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SEEN_KEY = "qqgk-film";
  var CAPTION = "现在是北京时间十七时三十分……";
  var TRAFFIC = "交通台为您播报：红旗大街由南向北车流缓慢，中山路高架桥东段一起轻微剐蹭，请过往车辆注意避让。今晚有雪，夜间出行请——";
  var L1 = "现在是北京时间十七时三十分……";
  var L2 = "不及格者，将从系统中移除。";
  var timers = [], playing = false, skipFn = null, swallow = false, mode = "";

  function seen(level) {
    try { var v = +(localStorage.getItem(SEEN_KEY) || 0); if (level == null) return v; if (level > v) localStorage.setItem(SEEN_KEY, String(level)); } catch (e) { return level == null ? 0 : 0; }
    return 0;
  }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearAll() { timers.forEach(clearTimeout); timers = []; }
  function setBg(bg) { app.dataset.bg = bg; FX.setScene(bg); }
  function phase(p) { film.dataset.phase = p; }
  function hasSave() { try { return !!localStorage.getItem("qqgk-save"); } catch (e) { return false; } }
  var G = function () { return window.QQGK; };

  /* ---------- 跳过：捕获阶段拦截，并吞掉随后的 click ---------- */
  function arm(fn) { skipFn = fn; playing = true; }
  function disarm() { skipFn = null; playing = false; }
  function onSkip(e) {
    if (!skipFn) return;
    var t = e.target;
    if (t && t.closest && t.closest(".sound-toggle")) return;           // 开场中也允许开声音
    if (e.type === "keydown" && (e.metaKey || e.ctrlKey || e.altKey || e.key === "Tab")) return;
    e.preventDefault(); e.stopPropagation();
    if (e.type === "pointerdown" || e.type === "touchstart") { swallow = true; setTimeout(function () { swallow = false; }, 700); }
    var f = skipFn; disarm(); f();
  }
  window.addEventListener("pointerdown", onSkip, true);
  window.addEventListener("keydown", onSkip, true);
  window.addEventListener("click", function (e) {
    if (!swallow) return;
    swallow = false; e.preventDefault(); e.stopPropagation();
  }, true);

  /* ---------- 底噪画布（只在影片可见时绘制） ---------- */
  var nc = $("#f-noise"), nx = nc.getContext("2d"), nraf = 0, nlast = 0;
  var img = nx.createImageData(nc.width, nc.height);
  function noiseLoop(now) {
    nraf = requestAnimationFrame(noiseLoop);
    if (now - nlast < 50) return;                 // 20fps 足够，省电
    nlast = now;
    var d = img.data;
    for (var i = 0; i < d.length; i += 4) { var v = (Math.random() * 255) | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    nx.putImageData(img, 0, 0);
  }
  function noiseOn(on) {
    if (on && !nraf && !document.hidden) nraf = requestAnimationFrame(noiseLoop);
    if (!on && nraf) { cancelAnimationFrame(nraf); nraf = 0; }
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) noiseOn(false); else if (!film.classList.contains("hidden")) noiseOn(true);
  });

  /* ---------- 车窗外的城市（只生成一次） ---------- */
  var built = false;
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function buildCity() {
    if (built) return; built = true;
    function strip(h0, h1, win, col) {
      var x = 0, out = "";
      while (x < 1600) {
        var w = rnd(50, 130), h = rnd(h0, h1);
        out += '<rect x="' + x.toFixed(0) + '" y="' + (300 - h).toFixed(0) + '" width="' + w.toFixed(0) + '" height="' + h.toFixed(0) + '" fill="' + col + '"/>';
        for (var wy = 300 - h + 10; wy < 290; wy += 14) for (var wx = x + 8; wx < x + w - 8; wx += 12) {
          if (Math.random() < win) out += '<rect x="' + wx.toFixed(0) + '" y="' + wy.toFixed(0) + '" width="5" height="7" fill="' + (Math.random() < 0.8 ? "#ffcf7a" : "#bfe3ff") + '" opacity="' + rnd(0.35, 0.9).toFixed(2) + '"/>';
        }
        x += w + rnd(4, 26);
      }
      var svg = '<svg viewBox="0 0 1600 300" preserveAspectRatio="none">' + out + "</svg>";
      return svg + svg;
    }
    $(".f-far").innerHTML = strip(60, 220, 0.22, "#0d1220");
    $(".f-near").innerHTML = strip(30, 120, 0.12, "#06080e");
    var b = "", cols = ["255,190,110", "255,120,90", "255,240,220", "140,200,255", "255,90,70"];
    for (var i = 0; i < 18; i++) {
      var c = cols[i % cols.length], s = rnd(16, 70);
      b += '<i style="top:' + rnd(18, 78).toFixed(1) + "%;width:" + s.toFixed(0) + "px;height:" + s.toFixed(0) + "px;background:radial-gradient(circle,rgba(" + c + ",.85),rgba(" + c + ",0) 70%);animation-duration:" + rnd(1.6, 3.4).toFixed(2) + "s;animation-delay:-" + rnd(0, 3.4).toFixed(2) + 's"></i>';
    }
    $("#f-bokeh").innerHTML = b;
    /* 车内：窗框、座椅头枕、仪表台（窗洞用 evenodd 挖空） */
    $("#f-interior").innerHTML =
      '<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">' +
      '<defs><linearGradient id="fi-dash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1714"/><stop offset="1" stop-color="#050404"/></linearGradient>' +
      '<linearGradient id="fi-roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050505"/><stop offset="1" stop-color="#14110e"/></linearGradient></defs>' +
      '<path fill-rule="evenodd" fill="url(#fi-roof)" d="M0 0H1600V900H0Z M150 120 Q160 90 200 88 L1400 88 Q1450 90 1460 130 L1500 520 Q1500 560 1460 560 L190 560 Q140 560 140 520Z"/>' +
      '<path d="M150 120 Q160 90 200 88 L1400 88 Q1450 90 1460 130 L1500 520 Q1500 560 1460 560 L190 560 Q140 560 140 520Z" fill="none" stroke="#2a241d" stroke-width="14"/>' +
      '<rect x="780" y="88" width="26" height="472" fill="#0b0908"/>' +
      '<path d="M0 640 Q400 590 800 600 T1600 630 L1600 900 L0 900Z" fill="url(#fi-dash)"/>' +
      '<path d="M0 640 Q400 590 800 600 T1600 630" fill="none" stroke="#c9a36a" stroke-opacity=".12" stroke-width="2"/>' +
      '<path d="M60 900 C60 760 120 700 230 700 C330 700 380 770 380 900Z" fill="#0a0807"/>' +
      '<path d="M1260 900 C1260 770 1320 720 1420 720 C1520 720 1560 790 1560 900Z" fill="#0a0807"/>' +
      "</svg>";
  }

  /* ---------- 字幕逐字 ---------- */
  function typeInto(el, text, speed, perChar, done) {
    var i = 0;
    el.textContent = "";
    (function step() {
      if (!film.dataset.phase) return;
      el.textContent = text.slice(0, ++i);
      if (perChar) perChar(text[i - 1]);
      if (i < text.length) later(step, text[i - 1] === "…" ? speed * 2.4 : speed);
      else if (done) done();
    })();
  }
  function flick() {
    film.classList.remove("flick"); void film.offsetWidth; film.classList.add("flick");
    SND.ui("tick");
  }

  /* ---------- 显示 / 隐藏 ---------- */
  function showFilm() {
    buildCity();
    film.classList.remove("hidden");
    film.setAttribute("aria-hidden", "true");
    scr.classList.add("hidden");
    $("#screen-game").classList.add("hidden");
    $("#hud").classList.add("hidden");
    noiseOn(true);
  }
  function resetPush() {
    app.classList.remove("film-push", "figs-wait", "push-go");
    var cs = $("#cover-scene"), fx = $("#fx");
    [cs, fx].forEach(function (el) {
      if (!el || !el.style.transform) return;
      el.style.transition = "none"; el.style.transformOrigin = ""; el.style.transform = "";
      void el.offsetWidth; el.style.transition = "";
    });
  }
  function hide() {
    clearAll(); disarm();
    film.classList.add("hidden");
    film.classList.remove("flick");
    phase("");
    noiseOn(false);
    resetPush();
  }

  /* ---------- 第一幕：夜车 → 断流 → 电流 → 准考证落下 ---------- */
  function part1(kind, onReady) {
    clearAll();
    showFilm();
    $("#f-cap").textContent = ""; $("#f-l1").textContent = ""; $("#f-l2").textContent = "";
    $("#f-freq").textContent = "FM 97.3"; $("#f-lcd2").textContent = "交通台 · 17:29";
    film.classList.toggle("interactive", false);
    var toTicket = function () { clearAll(); phase("ticket"); setBg("intro"); later(onReady, reduce ? 0 : 60); };
    if (reduce) { toTicket(); return; }
    film.classList.remove("short"); if (kind === "short") film.classList.add("short");
    phase("bus"); setBg("film");
    arm(function () { film.classList.add("settle"); setTimeout(function () { film.classList.remove("settle"); }, 450); toTicket(); });
    if (kind === "short") {
      $("#f-cap").textContent = TRAFFIC.slice(0, 18) + "——";
      later(function () { phase("stutter"); setBg("intro"); SND.ui("cut"); }, 420);
      later(function () { phase("static"); }, 760);
      later(function () { phase("drop"); SND.ui("page"); }, 1000);
      later(function () { disarm(); toTicket(); }, 1900);
      return;
    }
    later(function () { typeInto($("#f-cap"), TRAFFIC, 48); }, 500);
    later(function () { phase("focus"); }, 2600);                                  // 景深：收音机清晰，窗外虚化
    later(function () {                                                            // 卡顿：声音被抽走
      phase("stutter"); SND.ui("cut");
      $("#f-cap").textContent = $("#f-cap").textContent.replace(/.{0,2}$/, "——");
      $("#f-freq").textContent = "-- --"; $("#f-lcd2").textContent = "17:30";
    }, 5600);
    later(function () { phase("static"); setBg("intro"); }, 6500);                 // 电流淹没一切，世界被「调暗」
    later(function () { phase("drop"); SND.ui("page"); }, 7600);                   // 准考证从黑暗里落进掌心
    later(function () { disarm(); toTicket(); }, 8700);
  }

  /* ---------- 第二幕：墨迹显影 → 广播 → 黑场 → 雪夜推镜 → 门牌 ---------- */
  function part2(name, kind, done) {
    clearAll();
    film.classList.remove("interactive", "short");
    var finish = function () { clearAll(); disarm(); done(); };
    if (reduce) { finish(); return; }
    var full = kind === "full";
    if (!full) film.classList.add("short");
    if (name) { $("#f-ink").textContent = name; phase("ink"); SND.ui("stamp"); } else phase("ink");
    arm(finish);
    var t = name ? (full ? 1500 : 650) : 300;
    later(function () {
      phase("cast"); setBg("intro");
      if (!full) { $("#f-l1").textContent = L1; $("#f-l2").textContent = L2; flick(); return; }
      typeInto($("#f-l1"), L1, 120, flick, function () {
        later(function () { typeInto($("#f-l2"), L2, 150, flick); }, 380);
      });
    }, t);
    t += full ? (L1.length * 120 + 1600 + L2.length * 150 + 700) : 900;
    later(function () { phase("black"); FX.setScene("film"); SND.ui("skipbeat"); }, t);       // 屏幕骤暗，心跳漏一拍
    t += full ? 1400 : 300;
    later(function () { startPush(full); }, t);                                               // 切：雪夜
    t += full ? 4600 : 500;
    later(function () { phase("sign"); SND.ui("sign"); }, t);                                 // 冷铁门牌：考场 003712
    t += full ? 1900 : 700;
    later(function () { phase("dissolve"); }, t);                                             // 字迹化开 → 标题 / 章节卡
    t += full ? 900 : 450;
    later(finish, t);
  }
  function startPush(full) {
    phase("snow");
    var cs = $("#cover-scene"), fx = $("#fx"), cab = cs && cs.querySelector(".cabin rect");
    app.classList.add("film-push", "figs-wait");
    setBg("cover");
    if (cs && cab) {
      var a = app.getBoundingClientRect(), r = cab.getBoundingClientRect();
      var ox = (r.left + r.width / 2 - a.left) + "px", oy = (r.top + r.height / 2 - a.top) + "px";
      [cs, fx].forEach(function (el) { el.style.transition = "none"; el.style.transformOrigin = ox + " " + oy; });
      cs.style.transform = "translateY(-7%) scale(1.02)"; fx.style.transform = "scale(1)";
      void cs.offsetWidth;
      var dur = full ? 6.2 : 1.2;
      cs.style.transition = "transform " + dur + "s cubic-bezier(.45,.05,.3,1), opacity 1.2s ease";
      fx.style.transition = "transform " + dur + "s ease-in";
      cs.style.transform = "translateY(0) scale(" + (full ? 1.75 : 1.4) + ")";
      fx.style.transform = "scale(" + (full ? 1.6 : 1.3) + ")";
    }
    later(function () { app.classList.remove("figs-wait"); }, full ? 2200 : 150);         // 两道背影从雪里浮出来
  }

  /* ---------- 封面短版开场（老玩家，约 2 秒） ---------- */
  function coverShort() {
    hide();
    scr.classList.remove("hidden");
    if (reduce) { coverFinal(false); return; }
    scr.classList.remove("reveal", "tune");
    scr.classList.add("intro");
    cap.textContent = "";
    var scene = $("#cover-scene");
    if (scene) scene.style.transition = "none";
    setBg("intro");
    if (scene) { scene.getBoundingClientRect(); scene.style.transition = ""; }
    arm(function () { coverFinal(false); });
    var i = 0;
    later(function type() { cap.textContent = CAPTION.slice(0, ++i); if (i < CAPTION.length) later(type, 42); }, 150);
    later(function () { scr.classList.add("tune"); }, 900);
    later(function () { disarm(); coverFinal(true); }, 2000);
  }
  function coverFinal(animated) {
    clearAll(); disarm();
    hide();
    var g = G();
    if (g && g.showTitle) g.showTitle();
    scr.classList.remove("hidden", "intro", "tune", "reveal");
    if (animated) { void scr.offsetWidth; scr.classList.add("reveal"); later(function () { scr.classList.remove("reveal"); }, 1800); }
    cap.textContent = CAPTION;
    setBg("cover");
  }

  /* ---------- 对外接口 ---------- */
  function ticket(kind) {             // game.js newGame() 调用
    var full = kind === "full";
    part1(full ? "full" : "short", function () {
      film.classList.add("interactive");
      film.removeAttribute("aria-hidden");
      seen(1);
      var inp = $("#name-in");
      if (!("ontouchstart" in window)) setTimeout(function () { try { inp.focus({ preventScroll: true }); } catch (e) { inp.focus(); } }, 80);
    });
  }
  function develop(name, done) {      // 确认入场后
    var full = seen() < 2;
    seen(2);
    film.classList.remove("interactive");
    part2(name, full ? "full" : "short", function () { hide(); done(); });
  }
  function replay() {                 // 「重听广播」：完整版，最后化入封面
    scr.classList.add("hidden");
    $("#name-in").value = ""; $("#f-ink").textContent = "";
    part1("full", function () {
      film.classList.remove("interactive");
      arm(function () { coverFinal(true); });
      later(function () { part2("", "full", function () { coverFinal(true); }); }, 1400);
    });
    arm(function () { coverFinal(true); });   // 跳过 = 直接回封面
  }
  function toCover() { coverFinal(true); }

  $("#btn-replay").addEventListener("click", function (e) { e.stopPropagation(); replay(); });

  window.QQFILM = { ticket: ticket, develop: develop, hide: hide, toCover: toCover, replay: replay, isPlaying: function () { return playing; } };
  window.QQCOVER = { play: replay, skip: function () { if (skipFn) { var f = skipFn; disarm(); f(); } }, isPlaying: function () { return playing; } };

  /* ---------- 启动 ---------- */
  if (!reduce && seen() < 1 && !hasSave() && G()) {
    G().newGame(true, "full");        // 第一次来：直接进入完整影片，落到可填写的准考证
  } else {
    coverShort();
  }
})();
