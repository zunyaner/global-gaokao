/* 封面开场：收音机白噪音 → 报时 → 标题调频 → 雪夜猎人小屋
   点击 / 按键可跳过；系统「减少动画」时直接显示最终封面。 */
(function () {
  var scr = document.getElementById("screen-title");
  var app = document.getElementById("app");
  var cap = document.getElementById("intro-cap");
  var FX = window.QQFX || { setScene: function () {} };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CAPTION = "现在是北京时间十七时三十分……";
  var timers = [], playing = false;

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function setBg(bg) { app.dataset.bg = bg; FX.setScene(bg); }

  function finish(animated) {
    timers.forEach(clearTimeout); timers = [];
    playing = false;
    window.removeEventListener("pointerdown", onSkip, true);
    window.removeEventListener("keydown", onSkip, true);
    scr.classList.remove("intro", "tune", "reveal");
    if (animated) { void scr.offsetWidth; scr.classList.add("reveal"); later(function () { scr.classList.remove("reveal"); }, 1800); }
    cap.textContent = CAPTION;
    if (!scr.classList.contains("hidden")) setBg("cover");
  }

  function onSkip(e) {
    if (!playing) return;
    if (e.target && e.target.classList && e.target.classList.contains("sound-toggle")) return; // 允许开场中开声音
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "pointerdown") swallow = true;   // 吞掉这次点击，避免穿透到刚出现的按钮
    finish(false);
  }
  var swallow = false;
  window.addEventListener("click", function (e) {
    if (!swallow) return;
    swallow = false;
    e.preventDefault();
    e.stopPropagation();
  }, true);
  window.addEventListener("pointerup", function () { setTimeout(function () { swallow = false; }, 400); }, true);

  function play() {
    if (reduce) { finish(false); return; }
    timers.forEach(clearTimeout); timers = [];
    playing = true;
    scr.classList.remove("reveal", "tune");
    scr.classList.add("intro");
    cap.textContent = "";
    var scene = document.getElementById("cover-scene");
    if (scene) { scene.style.transition = "none"; }
    setBg("intro");
    if (scene) { scene.getBoundingClientRect(); getComputedStyle(scene).opacity; scene.style.transition = ""; }
    window.addEventListener("pointerdown", onSkip, true);
    window.addEventListener("keydown", onSkip, true);
    // 逐字打出报时
    var i = 0;
    later(function type() {
      if (!playing) return;
      cap.textContent = CAPTION.slice(0, ++i);
      if (i < CAPTION.length) later(type, i > CAPTION.length - 3 ? 160 : 70);
    }, 450);
    later(function () { scr.classList.add("tune"); }, 2100);        // 收音机淡出，标题从雪花噪点里「调」出来
    later(function () { finish(true); }, 3500);                      // 信号接通：切到雪夜
  }

  document.getElementById("btn-replay").addEventListener("click", function (e) {
    e.stopPropagation();
    play();
  });

  window.QQCOVER = { play: play, skip: function () { finish(false); }, isPlaying: function () { return playing; } };
  play();
})();
