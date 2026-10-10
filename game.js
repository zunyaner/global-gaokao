(() => {
  const $ = (s) => document.querySelector(s);
  const SAVE_KEY = "qqgk-save";
  const END_KEY = "qqgk-endings";
  const ENDS = window.ENDINGS || {};

  const state = {
    name: "", ticket: "", score: 0, viol: 0, hp: 100,
    inv: [], flags: {}, yh: 0, qj: 0,
    subj: "待定", exam: "入场", scene: "boot",
    clock: 17 * 60 + 30, log: []
  };

  let typing = false, skipType = false, typeToken = 0, timer = null, choiceMap = [];
  let stampTimer = null, toastTimer = null, hurt = false;
  const FX = window.QQFX || { setScene() {}, shake() {}, resize() {} };

  /* ---------- 存档 ---------- */
  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* 本地存储不可用时静默 */ }
  }
  function hasSave() {
    try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
  }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      Object.assign(state, d);
      state.flags = d.flags || {};
      state.inv = d.inv || [];
      state.log = d.log || [];
      return true;
    } catch (e) { return false; }
  }
  function getEndings() {
    try { return JSON.parse(localStorage.getItem(END_KEY) || "[]"); } catch (e) { return []; }
  }
  function markEnding(id) {
    const got = getEndings();
    if (got.includes(id)) return;
    got.push(id);
    try { localStorage.setItem(END_KEY, JSON.stringify(got)); } catch (e) { /* ignore */ }
  }

  /* ---------- 页内提示（不使用浏览器弹窗） ---------- */
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("on"), 2200);
  }
  function modal(msg, buttons) {
    const m = $("#modal");
    $("#modal-msg").textContent = msg;
    const box = $("#modal-btns");
    box.innerHTML = "";
    buttons.forEach((b, i) => {
      const el = document.createElement("button");
      el.className = "btn" + (b.ghost ? " ghost" : "");
      el.textContent = b.text;
      el.onclick = () => { closeModal(); b.act && b.act(); };
      box.appendChild(el);
      if (i === 0) setTimeout(() => el.focus(), 0);
    });
    m.classList.remove("hidden");
  }
  function closeModal() { $("#modal").classList.add("hidden"); }
  const modalOpen = () => !$("#modal").classList.contains("hidden");

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function log(msg) {
    state.log.unshift(msg);
    if (state.log.length > 36) state.log.pop();
    renderHud();
  }

  function hhmm() {
    const h = Math.floor(state.clock / 60) % 24;
    const m = state.clock % 60;
    return `北京时间 ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  function renderHud() {
    $("#h-ticket").textContent = state.ticket || "—";
    $("#h-name").textContent = state.name || "—";
    $("#h-score").textContent = state.score;
    $("#h-viol").textContent = state.viol;
    $("#h-hp").textContent = state.hp;
    $("#h-hp").classList.toggle("low", state.hp <= 30);
    const cur = SCENES[state.scene];
    $("#app").classList.toggle("danger", state.hp <= 30 && !$("#screen-game").classList.contains("hidden") && !(cur && cur.ending));
    $("#h-clock").textContent = hhmm();
    $("#s-subj").textContent = state.subj;
    $("#s-exam").textContent = state.exam;
    $("#hp-bar").style.width = Math.max(0, Math.min(100, state.hp)) + "%";
    $("#inv").textContent = state.inv.length ? state.inv.join(" · ") : "无";
    const tags = [];
    if (state.flags.wroteJie) tags.push("会写「解」");
    if (state.flags.fullInvig) tags.push("全程监考");
    if (state.yh >= 4) tags.push("游惑侧");
    if (state.qj >= 4) tags.push("001侧");
    if (state.flags.pass1) tags.push("物理及格");
    if (state.flags.pass2) tags.push("外语及格");
    if (state.flags.pass3) tags.push("历史及格");
    $("#tags").innerHTML = tags.map((t) => `<span class="tag">${t}</span>`).join("");
    $("#log").innerHTML = state.log.map((x) => `<div>${esc(x)}</div>`).join("");
  }

  function apply(fx) {
    if (!fx) return;
    if (fx.score) state.score = Math.max(0, state.score + fx.score);
    if (fx.viol) {
      state.viol = Math.max(0, state.viol + fx.viol);
      if (state.viol >= 3 && !state.flags.fullInvig) {
        state.flags.fullInvig = true;
        log("累计违规三次 · 特级监考官全程监考");
      }
    }
    if (fx.hp) state.hp = Math.max(0, Math.min(100, state.hp + fx.hp));
    if (fx.hp < 0) hurt = true;
    if (fx.yh) state.yh += fx.yh;
    if (fx.qj) state.qj += fx.qj;
    if (fx.flag) Object.assign(state.flags, fx.flag);
    if (fx.inv && !state.inv.includes(fx.inv)) state.inv.push(fx.inv);
    if (fx.subj) state.subj = fx.subj;
    if (fx.exam) state.exam = fx.exam;
    if (fx.clock) state.clock += fx.clock;
    if (fx.log) log(fx.log);
  }

  function typeText(el, text, cb) {
    const token = ++typeToken;          // 新一段文字开始时，旧的打字循环自动作废
    const scroller = el.closest(".stage");
    typing = true;
    skipType = false;
    el.textContent = "";
    const caret = document.createElement("span");
    caret.className = "caret";
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let i = 0;
    const finish = () => {
      el.textContent = text;
      el.appendChild(caret);
      typing = false;
      cb && cb();
    };
    if (reduce) { finish(); return; }
    const tick = () => {
      if (token !== typeToken) return;
      if (skipType) { finish(); return; }
      if (i < text.length) {
        el.textContent = text.slice(0, ++i);
        el.appendChild(caret);
        el.scrollTop = el.scrollHeight;
        if (scroller && scroller.scrollHeight > scroller.clientHeight) scroller.scrollTop = scroller.scrollHeight;
        const ch = text[i - 1];
        setTimeout(tick, ch === "\n" ? 36 : 16);
      } else {
        typing = false;
        cb && cb();
      }
    };
    tick();
  }

  function showStamp(word) {
    const el = $("#stamp");
    el.textContent = word;
    el.classList.add("hidden");
    void el.offsetWidth;
    el.classList.remove("hidden");
    clearTimeout(stampTimer);
    stampTimer = setTimeout(() => el.classList.add("hidden"), 1500);
  }

  function flash() {
    const f = $("#flash");
    f.classList.remove("on");
    void f.offsetWidth;
    f.classList.add("on");
  }

  function vis(id, on) { $(id).classList.toggle("hidden", !on); }

  function cond(c) {
    if (!c) return true;
    if (c.flag && !state.flags[c.flag]) return false;
    if (c.noflag && state.flags[c.noflag]) return false;
    if (c.minYh != null && state.yh < c.minYh) return false;
    if (c.minQj != null && state.qj < c.minQj) return false;
    if (c.has && !state.inv.includes(c.has)) return false;
    if (c.full && !state.flags.fullInvig) return false;
    if (c.any && !c.any.some((f) => state.flags[f])) return false;
    if (c.none && c.none.some((f) => state.flags[f])) return false;
    if (c.minScore != null && state.score < c.minScore) return false;
    if (c.maxHp != null && state.hp > c.maxHp) return false;
    if (c.minViol != null && state.viol < c.minViol) return false;
    if (c.maxViol != null && state.viol > c.maxViol) return false;
    if (c.or && !c.or.some(cond)) return false;
    return true;
  }

  function renderArt(sc) {
    const art = $("#art");
    art.innerHTML = "";
    if (!sc.art) return;
    if (sc.art === "seats") {
      const wrap = document.createElement("div");
      wrap.className = "seats";
      const labels = ["1 左首", "2", "3 窗侧", "4", "5 右首", "6", "7 阴影", "8", "9", "10 灯下", "11", "12", "13 空位"];
      const mark = (b, i) => {
        b.classList.add("picked");
        if (i === 6) b.classList.add("dead");
        if (i === 12 || i === 9) b.classList.add("ok");
      };
      labels.forEach((lb, i) => {
        const b = document.createElement("button");
        b.className = "seat";
        b.textContent = lb;
        if (state.flags.seatIdx === i) mark(b, i);   // 读档后恢复已选座位
        b.onclick = () => {
          document.querySelectorAll(".seat").forEach((x) => x.classList.remove("picked", "dead", "ok"));
          mark(b, i);
          state.flags.pickedShadow = i === 6;
          state.flags.picked13 = i === 12;
          state.flags.pickedLamp = i === 9;
          state.flags.pickedSeat = true;
          state.flags.seatIdx = i;
          log("落座：" + lb);
          save();
        };
        wrap.appendChild(b);
      });
      art.appendChild(wrap);
    }
    if (sc.art === "paper") {
      const d = document.createElement("div");
      d.className = "paper-q";
      d.textContent = typeof sc.paper === "function" ? sc.paper(state) : sc.paper;
      art.appendChild(d);
    }
    if (sc.art === "shop") {
      const wrap = document.createElement("div");
      wrap.className = "shop";
      const rows = [];
      const refresh = () => rows.forEach((r) => r());
      sc.shop.forEach((it) => {
        const row = document.createElement("div");
        row.className = "shop-item";
        const left = document.createElement("span");
        left.innerHTML = `${it.name}<br><small>${it.desc}</small>`;
        const btn = document.createElement("button");
        const owned = () => it.inv && state.inv.includes(it.inv);
        rows.push(() => {
          btn.textContent = owned() ? "已兑换" : it.cost + " 分";
          btn.disabled = owned();
        });
        btn.onclick = () => {
          if (owned()) return;
          if (state.score < it.cost) { log("分数不足，系统拒绝兑换。"); toast("分数不足，系统拒绝兑换。"); return; }
          if (it.hp && !it.inv && state.hp >= 100) { toast("身体状态已满，无需兑换。"); return; }
          if (it.viol && state.viol <= 0) { toast("你没有违规记录可以抵消。"); return; }
          state.score -= it.cost;
          if (it.hp) state.hp = Math.min(100, state.hp + it.hp);
          if (it.viol) state.viol = Math.max(0, state.viol + it.viol);
          if (it.inv && !state.inv.includes(it.inv)) state.inv.push(it.inv);
          log("休息区兑换：" + it.name);
          toast("兑换成功：" + it.name);
          refresh();
          renderHud();
          save();
        };
        row.appendChild(left);
        row.appendChild(btn);
        wrap.appendChild(row);
      });
      refresh();
      art.appendChild(wrap);
    }
  }

  function renderChoices(sc) {
    const box = $("#choices");
    box.innerHTML = "";
    choiceMap = [];
    (sc.choices || []).forEach((c) => {
      if (!cond(c.if)) return;
      const b = document.createElement("button");
      b.className = "choice";
      const k = choiceMap.length + 1;
      b.innerHTML = `<kbd>${k}</kbd>${c.text}`;
      b.onclick = () => pick(c);
      box.appendChild(b);
      choiceMap.push(c);
    });
    if (!choiceMap.length) {      // 防御：任何情况下都不让玩家卡死
      console.error("dead end in scene", state.scene);
      const b = document.createElement("button");
      b.className = "choice";
      b.innerHTML = "<kbd>1</kbd>返回封面";
      const c = { next: "title" };
      b.onclick = () => pick(c);
      box.appendChild(b);
      choiceMap.push(c);
    }
  }

  function pick(c) {
    if (typing) { skipType = true; return; }
    if (c.needSeat && !state.flags.pickedSeat) { log("先在长桌上点一个座位。"); toast("先在长桌上点一个座位。"); return; }
    if (c.fx) apply(c.fx);
    if (c.stamp) showStamp(c.stamp);
    if (c.flash) flash();
    if (c.dead) { go("dead"); return; }
    go(c.next);
  }

  function showTitle() {
    $("#app").classList.remove("side-open", "danger");
    vis("#screen-game", false);
    vis("#hud", false);
    vis("#screen-title", true);
    vis("#screen-ticket", false);
    $("#lamp").hidden = true;
    setBg("cover");
    choiceMap = [];
    const got = getEndings();
    const total = Object.keys(ENDS).length;
    $("#endings").textContent = got.length && total ? `已达成结局 ${got.filter((g) => ENDS[g]).length} / ${total}：` + got.filter((g) => ENDS[g]).map((g) => ENDS[g]).join("、") : "";
    $("#btn-cont").classList.toggle("dim", !hasSave());
  }

  function setBg(bg) {
    const app = $("#app");
    if (app.dataset.bg !== bg) {        // 换考场时的黑场转场
      app.classList.remove("wipe");
      void app.offsetWidth;
      app.classList.add("wipe");
    }
    app.dataset.bg = bg;
    FX.setScene(bg);
  }

  function go(id) {
    if (id === "title") { showTitle(); return; }
    if (id === "new") { newGame(true); return; }
    const sc = SCENES[id];
    if (!sc) { console.error("missing scene", id); log("系统错误：考场丢失 " + id); toast("系统错误：考场丢失 " + id); return; }
    if (!sc.nosave) state.scene = id;
    if (sc.fx) apply(sc.fx);
    if (sc.enter) sc.enter(state);
    if (sc.stamp) showStamp(sc.stamp);
    if (sc.flash) flash();
    if (state.hp <= 0 && id !== "dead") { go("dead"); return; }
    if (sc.ending) markEnding(sc.ending);
    if (!sc.nosave) save();
    choiceMap = [];
    $("#app").classList.remove("side-open");
    vis("#screen-title", false);
    vis("#screen-ticket", false);
    vis("#screen-game", true);
    vis("#hud", !sc.nohud);
    setBg(sc.bg || "title");
    if (hurt || id === "dead") { FX.shake(state.hp <= 30 || id === "dead"); }
    hurt = false;
    $("#lamp").hidden = !(sc.bg === "cabin");
    const stage = $(".stage");
    stage.classList.remove("fade");
    void stage.offsetWidth;
    stage.classList.add("fade");
    stage.scrollTop = 0;
    $("#loc").textContent = sc.loc || "";
    $("#radio").textContent = typeof sc.radio === "function" ? sc.radio(state) : (sc.radio || "");
    const who = $("#who");
    who.textContent = sc.who || "";
    who.className = "who " + (sc.whoClass || "");
    renderArt(sc);
    renderHud();
    $("#choices").innerHTML = "";
    const txt = typeof sc.text === "function" ? sc.text(state) : sc.text;
    typeText($("#text"), txt, () => renderChoices(sc));
  }

  function startClock() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      state.clock = (state.clock + 1) % (24 * 60);
      if (!$("#hud").classList.contains("hidden")) $("#h-clock").textContent = hhmm();
    }, 1400);
  }

  function newGame(force) {
    if (!force && hasSave()) {
      modal("已有一份考试记录。领取新的准考证后，旧记录将在入场时被覆盖。", [
        { text: "领取新准考证", act: () => newGame(true) },
        { text: "继续旧考试", ghost: true, act: cont },
        { text: "取消", ghost: true }
      ]);
      return;
    }
    Object.assign(state, {
      name: "", ticket: "", score: 0, viol: 0, hp: 100, inv: [],
      flags: {}, yh: 0, qj: 0, subj: "待定", exam: "入场",
      scene: "boot", clock: 17 * 60 + 30, log: ["收音机滋啦作响。"]
    });
    state.ticket = "A-17-" + String(1000 + Math.floor(Math.random() * 9000));
    $("#ticket-no").textContent = state.ticket;
    $("#name-in").value = "";
    $("#name-in").placeholder = "填写真实姓名";
    $("#name-in").classList.remove("err");
    vis("#screen-game", false);
    vis("#hud", false);
    vis("#screen-title", false);
    vis("#screen-ticket", true);
    setTimeout(() => $("#name-in").focus(), 0);
  }

  function enter() {
    const name = ($("#name-in").value || "").trim();
    if (!name) {
      const inp = $("#name-in");
      inp.placeholder = "系统不接受无名考生";
      inp.classList.remove("err");
      void inp.offsetWidth;
      inp.classList.add("err");
      inp.focus();
      return;
    }
    state.name = name;
    log(`考生 ${name} 入场 · ${state.ticket}`);
    startClock();
    go("boot");
  }

  function cont() {
    if (!load()) { toast("无存档。请先领取准考证。"); return; }
    const id = SCENES[state.scene] ? state.scene : "boot";
    startClock();
    go(id);
  }

  /* 封面按钮：先盖章，再执行 */
  let pressing = false;
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function stampPress(btn, fn) {
    if (pressing) return;
    if (reduceMotion) { fn(); return; }
    pressing = true;
    btn.classList.remove("stamped");
    void btn.offsetWidth;
    btn.classList.add("stamped");
    setTimeout(() => {
      pressing = false;
      fn();
      setTimeout(() => btn.classList.remove("stamped"), 700);
    }, 430);
  }
  function nope(btn, msg) {
    btn.classList.remove("nope");
    void btn.offsetWidth;
    btn.classList.add("nope");
    toast(msg);
  }
  $("#btn-new").onclick = (e) => stampPress(e.currentTarget, () => newGame(false));
  $("#btn-cont").onclick = (e) => {
    if (!hasSave()) { nope(e.currentTarget, "无存档。请先领取准考证。"); return; }
    stampPress(e.currentTarget, cont);
  };
  $("#btn-rules").onclick = (e) => stampPress(e.currentTarget, () => go("rules_only"));
  $("#btn-back").onclick = () => showTitle();
  $("#btn-enter").onclick = enter;
  $("#btn-menu").onclick = () => go("title");
  $("#btn-side").onclick = () => $("#app").classList.toggle("side-open");
  $(".stage").addEventListener("click", () => {
    if (typing) skipType = true;
    $("#app").classList.remove("side-open");
  });
  $("#name-in").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); enter(); } });

  document.addEventListener("keydown", (e) => {
    if (modalOpen()) { if (e.key === "Escape") closeModal(); return; }
    if (e.key === "Escape") { $("#app").classList.remove("side-open"); return; }
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    if ($("#screen-game").classList.contains("hidden")) return;
    if (e.key === " " || e.key === "Enter") {
      if (typing) { skipType = true; e.preventDefault(); }
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 9 && choiceMap[n - 1]) { e.preventDefault(); pick(choiceMap[n - 1]); }
  });

  showTitle();
  window.QQGK = { go, state, save, cond, showTitle };
})();
