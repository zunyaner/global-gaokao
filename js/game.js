(() => {
  const $ = (s) => document.querySelector(s);
  const SAVE_KEY = "qqgk-save";
  const END_KEY = "qqgk-endings";
  const ENDS = window.ENDINGS || {};
  const endName = (id) => { const e = ENDS[id]; return e ? (typeof e === "string" ? e : e.name) : ""; };
  const ART = window.QQART || { portrait: () => "", faceFor: () => null, people: {} };
  const SND = window.QQAUDIO || { ui() {}, heartbeat() {} };
  const CHM = window.QQCH || { chapterOf: () => null };
  const STORY = window.GKStory;                 // 声明式剧情解释器（js/story.js）
  const shopOf = (ref) => window.GK.shopOf(ref);
  const READ_KEY = "qqgk-read";
  const SET_KEY = "qqgk-settings";
  const UNDO_MAX = 30;

  /* 本地存储：隐私模式 / 被禁用时退回内存，游戏照常可玩 */
  const mem = {};
  let storeOk = true;
  const store = {
    get(k) { if (storeOk) { try { return localStorage.getItem(k); } catch (e) { storeOk = false; } } return k in mem ? mem[k] : null; },
    set(k, v) { mem[k] = v; if (!storeOk) return; try { localStorage.setItem(k, v); } catch (e) { storeOk = false; } }
  };
  const readJSON = (k, dflt) => { try { const v = store.get(k); return v ? JSON.parse(v) : dflt; } catch (e) { return dflt; } };

  const settings = Object.assign({ speed: "mid", skip: false }, readJSON(SET_KEY, {}));
  settings.skip = false;                       // 快进不跨会话保留
  const SPEED = { slow: [34, 70], mid: [16, 36], fast: [6, 14], instant: [0, 0] };
  const saveSettings = () => store.set(SET_KEY, JSON.stringify({ speed: settings.speed }));
  const readSet = new Set(readJSON(READ_KEY, []));
  let readDirty = null;
  function markRead(id) {
    if (readSet.has(id)) return;
    readSet.add(id);
    clearTimeout(readDirty);
    readDirty = setTimeout(() => store.set(READ_KEY, JSON.stringify([...readSet])), 200);
  }

  /* 旧版 WebKit / 微信 X5 不支持 dvh：用真实可视高度兜底 */
  const setVh = () => document.documentElement.style.setProperty("--vh", (window.innerHeight * 0.01) + "px");
  setVh();
  window.addEventListener("resize", setVh, { passive: true });
  window.addEventListener("orientationchange", () => setTimeout(setVh, 250), { passive: true });

  const state = {
    name: "", ticket: "", score: 0, viol: 0, hp: 100,
    inv: [], flags: {}, yh: 0, qj: 0,
    subj: "待定", exam: "入场", scene: "boot",
    clock: 17 * 60 + 30, log: [], hints: 0, trail: [], hist: []
  };

  let typing = false, skipType = false, typeToken = 0, timer = null, choiceMap = [];
  let stampTimer = null, hurt = false;
  const FX = window.QQFX || { setScene() {}, shake() {}, resize() {} };

  /* ---------- 存档 ---------- */
  function save() {
    let raw;
    try { raw = JSON.stringify(state); } catch (e) { return; }
    store.set(SAVE_KEY, raw);
  }
  function hasSave() {
    return !!store.get(SAVE_KEY);
  }
  function load() {
    try {
      const raw = store.get(SAVE_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      Object.assign(state, d);
      state.flags = d.flags || {};
      state.inv = d.inv || [];
      state.log = d.log || [];
      state.trail = d.trail || [];
      state.hints = d.hints || 0;
      state.hist = Array.isArray(d.hist) ? d.hist.slice(-UNDO_MAX) : [];
      return true;
    } catch (e) { return false; }
  }
  function getEndings() {
    return readJSON(END_KEY, []);
  }
  function markEnding(id) {
    const got = getEndings();
    if (got.includes(id)) return;
    got.push(id);
    store.set(END_KEY, JSON.stringify(got));
  }

  /* 页内提示 / 弹层 / 转义见 js/ui.js（不使用浏览器弹窗） */
  const { toast, modal, closeModal, modalOpen, esc } = window.GKUI;

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
    if (!$("#screen-game").classList.contains("hidden")) setDanger(state.hp <= 30 && !(cur && cur.ending));
    $("#h-clock").textContent = hhmm();
    $("#s-subj").textContent = state.subj;
    $("#s-exam").textContent = state.exam;
    $("#hp-bar").style.width = Math.max(0, Math.min(100, state.hp)) + "%";
    const invs = state.inv.slice();
    if (state.hints > 0) invs.unshift("求助牌 ×" + state.hints);
    $("#inv").textContent = invs.length ? invs.join(" · ") : "无";
    const tags = [];
    if (state.flags.wroteJie) tags.push("会写「解」");
    if (state.flags.fullInvig) tags.push("全程监考");
    if (state.yh >= 4) tags.push("游惑侧");
    if (state.qj >= 4) tags.push("001侧");
    if (state.flags.pass1) tags.push("物理及格");
    if (state.flags.pass2) tags.push("外语及格");
    if (state.flags.pass3) tags.push("历史及格");
    if (state.flags.knowA) tags.push("知晓考官A");
    if (state.flags.team8) tags.push("八人小组");
    if (state.flags.pass4) tags.push("数学及格");
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
    if (fx.drop) state.inv = state.inv.filter((x) => x !== fx.drop);
    if (fx.hints) state.hints = Math.max(0, (state.hints || 0) + fx.hints);
    if (fx.subj) state.subj = fx.subj;
    if (fx.exam) state.exam = fx.exam;
    if (fx.clock) state.clock += fx.clock;
    if (fx.log) log(fx.log);
  }

  function typeText(el, text, cb, instant) {
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
    const sp = SPEED[settings.speed] || SPEED.mid;
    if (reduce || instant || sp[0] === 0) { finish(); return; }
    const tick = () => {
      if (token !== typeToken) return;
      if (skipType) { finish(); return; }
      if (i < text.length) {
        el.textContent = text.slice(0, ++i);
        el.appendChild(caret);
        el.scrollTop = el.scrollHeight;
        if (scroller && scroller.scrollHeight > scroller.clientHeight) scroller.scrollTop = scroller.scrollHeight;
        const ch = text[i - 1];
        setTimeout(tick, ch === "\n" ? sp[1] : sp[0]);
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

  /* 条件对象的语义见 js/story.js */
  const cond = (c) => STORY.cond(c, state);

  function renderArt(sc) {
    const art = $("#art");
    art.innerHTML = "";
    $(".stage").classList.toggle("has-art", !!sc.art);   // 代替 :has()，兼容旧版微信 / Safari
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
      d.textContent = STORY.text(sc.paper, state);
      art.appendChild(d);
    }
    if (sc.art === "svg") {
      const d = document.createElement("div");
      d.className = "svg-q";
      d.innerHTML = sc.svg;
      art.appendChild(d);
    }
    if (sc.art === "shop") {
      const wrap = document.createElement("div");
      wrap.className = "shop";
      const rows = [];
      const refresh = () => rows.forEach((r) => r());
      shopOf(sc.shop).forEach((it) => {
        const row = document.createElement("div");
        row.className = "shop-item";
        const left = document.createElement("span");
        left.innerHTML = `${it.name}<br><small>${it.desc}</small>`;
        const btn = document.createElement("button");
        const owned = () => (it.inv && state.inv.includes(it.inv)) || (it.hints && it.max && (state.hints || 0) >= it.max);
        rows.push(() => {
          btn.textContent = owned() ? (it.hints ? "已达上限" : "已兑换") : it.cost + " 分";
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
          if (it.hints) state.hints = (state.hints || 0) + it.hints;
          SND.ui("card");
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

  /* 求助牌：标出每个选项的风险 */
  function riskOf(c) {
    const fx = c.fx || {};
    if (c.dead) return ["死", "deadly"];
    if (fx.hp != null && fx.hp <= -30) return ["重伤", "deadly"];
    if (fx.viol > 0) return ["违规", "warn"];
    if (fx.hp != null && fx.hp < 0) return ["受伤", "warn"];
    if (c.roll) return ["看运气", "warn"];
    return ["稳", "safe"];
  }
  function hintAvailable(sc) {
    if (sc.ending || !sc.choices) return false;
    const vis = sc.choices.filter((c) => cond(c.if));
    return !!sc.hint || vis.some((c) => riskOf(c)[1] !== "safe");
  }
  function useHint() {
    const sc = SCENES[state.scene];
    if (!sc || !(state.hints > 0) || state.flags["hint:" + state.scene]) return;
    state.hints -= 1;
    state.flags["hint:" + state.scene] = true;
    SND.ui("card");
    log("使用求助牌 · 监考官的帮助");
    showHint(sc);
    renderChoices(sc);
    renderHud();
    save();
  }
  function showHint(sc) {
    const h = $("#hintbox");
    h.hidden = false;
    h.innerHTML = `<b>监考官的帮助</b>${esc(sc.hint || "这一题没什么陷阱。照你自己的判断来。")}`;
  }
  function renderChoices(sc) {
    const box = $("#choices");
    box.innerHTML = "";
    choiceMap = [];
    const hinted = !!state.flags["hint:" + state.scene];
    (sc.choices || []).forEach((c) => {
      if (!cond(c.if)) return;
      const b = document.createElement("button");
      b.className = "choice";
      const k = choiceMap.length + 1;
      let badge = "";
      if (hinted) { const r = riskOf(c); badge = `<span class="risk ${r[1]}">${r[0]}</span>`; }
      b.innerHTML = `<kbd>${k}</kbd><span class="ct">${c.text}</span>${badge}`;
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
    if (!hinted && state.hints > 0 && hintAvailable(sc)) {
      const hb = document.createElement("button");
      hb.className = "choice hint-btn";
      hb.innerHTML = `<kbd>H</kbd><span class="ct">使用求助牌（剩 ${state.hints} 张）：请监考官给一句提示</span>`;
      hb.onclick = useHint;
      box.appendChild(hb);
    }
  }

  function pick(c) {
    if (typing) { skipType = true; return; }
    if (c.needSeat && !state.flags.pickedSeat) { log("先在长桌上点一个座位。"); toast("先在长桌上点一个座位。"); return; }
    const from = SCENES[state.scene];
    SND.ui("click");
    if (from && !from.nosave) pushSnap();
    if (from && !from.nosave && !from.ending) {
      state.trail.push({ s: state.subj, at: from.loc || "", c: c.text, t: hhmm().slice(5) });
      if (state.trail.length > 240) state.trail.shift();
    }
    if (c.roll) {
      const out = Math.random() < (c.roll.p == null ? 0.5 : c.roll.p) ? c.roll.win : c.roll.lose;
      if (out.fx) apply(out.fx);
      if (out.stamp) showStamp(out.stamp);
      go(out.next || c.next);
      return;
    }
    if (c.fx) apply(c.fx);
    if (c.stamp) showStamp(c.stamp);
    if (c.flash) flash();
    if (c.dead) { go("dead"); return; }
    go(c.next);
  }

  const FILM = () => window.QQFILM || null;
  function showTitle() {
    $("#app").classList.remove("side-open");
    if (FILM()) FILM().hide();
    setDanger(false);
    vis("#screen-game", false);
    vis("#hud", false);
    vis("#screen-title", true);
    $("#lamp").hidden = true;
    setBg("cover");
    choiceMap = [];
    const got = getEndings().filter((g) => ENDS[g]);
    const total = Object.keys(ENDS).length;
    $("#endings").textContent = got.length && total ? `已达成结局 ${got.length} / ${total}：` + got.map(endName).join("、") : "";
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

  function setDanger(on) {
    const app = $("#app");
    if (app.classList.contains("danger") === on) return;
    app.classList.toggle("danger", on);
    SND.heartbeat(on);
  }

  function renderWho(sc) {
    const who = $("#who"), face = $("#face"), tag = $("#who-tag");
    who.textContent = sc.who || "";
    who.className = "who " + (sc.whoClass || "");
    const key = sc.face || ART.faceFor(sc.who);
    const p = key && ART.people[key];
    if (p && !sc.ending) {
      face.innerHTML = ART.portrait(key);
      face.className = "face f-" + key;
      face.hidden = false;
      tag.textContent = p.tag || "";
    } else {
      face.hidden = true; face.innerHTML = ""; tag.textContent = "";
    }
    $("#who-row").hidden = !sc.who;
  }

  function go(id, resume) {
    if (id === "title") { showTitle(); return; }
    if (id === "new") { newGame(true); return; }
    if (id === "gallery" || id === "recap") { openPanel(id); return; }
    const sc = SCENES[id];
    if (!sc) { console.error("missing scene", id); log("系统错误：考场丢失 " + id); toast("系统错误：考场丢失 " + id); return; }
    const changed = state.scene !== id;
    if (!sc.nosave) state.scene = id;
    if (sc.fx && !resume) apply(sc.fx);      // 读档续考时不重复结算场景效果
    STORY.runEnter(sc.enter, state, apply);   // 声明式入场钩子（幂等，读档时也执行）
    /* 科目 / 考场始终由场景所属章节推导（读档、回退、任何入口都一致） */
    const ch = sc.nosave ? null : CHM.chapterOf(id, sc);
    let card = null;
    if (ch) {
      if (ch.subj) state.subj = ch.subj;
      if (ch.exam) state.exam = ch.exam;
      if (ch.card && !state.flags["card:" + ch.key]) {
        state.flags["card:" + ch.key] = true;
        if (!resume) card = ch.card;
      }
    }
    if (sc.stamp && !resume) showStamp(sc.stamp);
    if (sc.flash) flash();
    if (state.hp <= 0 && id !== "dead") { go("dead"); return; }
    if (sc.ending) markEnding(sc.ending);
    if (!sc.nosave) save();
    choiceMap = [];
    $("#app").classList.remove("side-open");
    vis("#screen-title", false);
    if (FILM()) FILM().hide();
    vis("#screen-game", true);
    vis("#hud", !sc.nohud);
    setBg(sc.bg || "title");
    if (hurt || id === "dead") { FX.shake(state.hp <= 30 || id === "dead"); }
    hurt = false;
    setDanger(state.hp <= 30 && !sc.ending);
    if (changed || resume) SND.ui(sc.stamp ? "stamp" : "page");
    $("#lamp").hidden = !(sc.bg === "cabin");
    const stage = $(".stage");
    stage.classList.remove("fade");
    void stage.offsetWidth;
    stage.classList.add("fade");
    stage.scrollTop = 0;
    $("#loc").textContent = sc.loc || "";
    $("#radio").textContent = STORY.text(sc.radio, state);
    renderWho(sc);
    $("#hintbox").hidden = true;
    if (state.flags["hint:" + id]) showHint(sc);
    renderArt(sc);
    renderHud();
    $("#choices").innerHTML = "";
    const txt = STORY.text(sc.text, state);
    const wasRead = readSet.has(id);
    const fast = settings.skip && wasRead;
    if (settings.skip && !wasRead && !sc.ending) setSkip(false, "未读内容 · 快进已停止");
    const myTok = ++goToken;
    const run = () => {
      if (myTok !== goToken) return;
      typeText($("#text"), txt, () => {
        markRead(id);
        renderChoices(sc);
        autoAdvance(sc, myTok);
      }, fast);
    };
    if (card) { $("#text").textContent = ""; showCard(card, run); } else run();
  }

  /* ---------- 快进：已读场景瞬显，只有一个选项时自动推进；遇到未读即停 ---------- */
  let goToken = 0;
  function autoAdvance(sc, tok) {
    if (!settings.skip || sc.ending || sc.art === "shop" || sc.art === "seats") return;
    if (choiceMap.length !== 1 || !readSet.has(state.scene)) return;
    const c = choiceMap[0];
    if (c.needSeat || c.roll || c.dead) return;
    setTimeout(() => { if (tok === goToken && settings.skip && !cardOpen() && !panelOpen() && !modalOpen()) pick(c); }, 320);
  }
  function setSkip(on, msg) {
    settings.skip = !!on;
    const b = $("#btn-skip");
    if (b) { b.setAttribute("aria-pressed", on ? "true" : "false"); b.classList.toggle("on", !!on); b.textContent = on ? "快进中" : "快进"; }
    if (msg) toast(msg);
    if (on && !$("#screen-game").classList.contains("hidden")) {
      if (typing && readSet.has(state.scene)) skipType = true;
      if (!typing) autoAdvance(SCENES[state.scene] || {}, goToken);
    }
  }

  /* ---------- 回退：恢复上一次选择前的完整状态 ---------- */
  function pushSnap() {
    const { hist, ...rest } = state;
    try { state.hist.push(JSON.stringify(rest)); } catch (e) { return; }
    if (state.hist.length > UNDO_MAX) state.hist.splice(0, state.hist.length - UNDO_MAX);
  }
  function undo() {
    if ($("#screen-game").classList.contains("hidden") || cardOpen()) return;
    if (!state.hist || !state.hist.length) { toast("没有可以回退的选择。"); return; }
    let snap;
    try { snap = JSON.parse(state.hist.pop()); } catch (e) { toast("回退记录损坏。"); return; }
    const hist = state.hist;
    const cards = {};                                   // 章节卡每轮只放一次：回退不重置
    Object.keys(state.flags || {}).forEach((k) => { if (k.startsWith("card:")) cards[k] = true; });
    Object.keys(state).forEach((k) => { if (k !== "hist") delete state[k]; });
    Object.assign(state, snap, { hist });
    state.flags = Object.assign(state.flags || {}, cards);
    if (settings.skip) setSkip(false);
    typeToken++; goToken++;
    SND.ui("page");
    go(state.scene, true);
    save();
    toast("已回退一步（剩 " + hist.length + " 步）");
  }

  /* ---------- 章节仪式卡 ---------- */
  let cardDone = null, cardTimer = null;
  const cardOpen = () => !$("#chapcard").classList.contains("hidden");
  function showCard(c, done) {
    const el = $("#chapcard");
    $("#cc-no").textContent = c.no;
    $("#cc-subj").textContent = c.subj;
    $("#cc-meta").innerHTML = (c.meta || []).map((m) => `<span>${esc(m)}</span>`).join("");
    $("#cc-cast").textContent = "【" + c.cast + "】";
    el.dataset.tone = c.tone || "";
    el.classList.remove("hidden", "out");
    void el.offsetWidth;
    el.classList.add("play");
    cardDone = done;
    SND.ui("stamp");
    clearTimeout(cardTimer);
    cardTimer = setTimeout(closeCard, reduceMotion ? 2200 : 3600);
  }
  function closeCard() {
    if (!cardOpen()) return;
    clearTimeout(cardTimer);
    const el = $("#chapcard");
    el.classList.remove("play");
    el.classList.add("hidden");
    SND.ui("page");
    const d = cardDone; cardDone = null;
    d && d();
  }

  function startClock() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      state.clock = (state.clock + 1) % (24 * 60);
      if (!$("#hud").classList.contains("hidden")) $("#h-clock").textContent = hhmm();
    }, 1400);
  }

  function newGame(force, mode) {
    if (!force && hasSave()) {
      modal("已有一份考试记录。领取新的准考证后，旧记录将在入场时被覆盖。", [
        { text: "领取新准考证", act: () => newGame(true, mode) },
        { text: "继续旧考试", ghost: true, act: cont },
        { text: "取消", ghost: true }
      ]);
      return;
    }
    Object.assign(state, {
      name: "", ticket: "", score: 0, viol: 0, hp: 100, inv: [],
      flags: {}, yh: 0, qj: 0, subj: "待定", exam: "入场",
      scene: "boot", clock: 17 * 60 + 30, log: ["收音机滋啦作响。"], hints: 0, trail: [], hist: []
    });
    state.ticket = "A-17-" + String(1000 + Math.floor(Math.random() * 9000));
    $("#ticket-no").textContent = state.ticket;
    $("#name-in").value = "";
    $("#name-in").placeholder = "填写真实姓名";
    $("#name-in").classList.remove("err");
    $("#name-in").disabled = false;
    $("#f-ink").textContent = "";
    vis("#screen-game", false);
    vis("#hud", false);
    vis("#screen-title", false);
    if (FILM()) FILM().ticket(mode || "short");
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
    if (entering) return;
    entering = true;
    state.name = name;
    $("#name-in").blur();
    const begin = () => {
      entering = false;
      log("信号接入。");
      log(`考生 ${name} 入场 · ${state.ticket}`);
      state.trail.push({ s: "待定", at: "哈尔滨 · 十月的夜", c: "攥紧准考证", t: "17:30" });
      startClock();
      go("boot3");
    };
    if (FILM()) FILM().develop(name, begin); else begin();
  }
  let entering = false;

  function cont() {
    if (!load()) { toast("无存档。请先领取准考证。"); return; }
    const id = SCENES[state.scene] ? state.scene : "boot";
    startClock();
    go(id, true);
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
    SND.ui("stamp");
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
  $("#btn-gallery").onclick = () => openPanel("gallery");
  $("#btn-recap").onclick = () => openPanel("recap");
  $("#side-gallery").onclick = () => openPanel("gallery");
  $("#side-recap").onclick = () => openPanel("recap");
  $("#panel-x").onclick = closePanel;
  $("#panel").addEventListener("click", (e) => { if (e.target.id === "panel") closePanel(); });
  document.querySelectorAll(".ptab").forEach((b) => { b.onclick = () => openPanel(b.dataset.tab); });
  $("#btn-rules").onclick = (e) => stampPress(e.currentTarget, () => go("rules_only"));
  $("#btn-back").onclick = () => { if (FILM()) FILM().toCover(); else showTitle(); };
  $("#btn-enter").onclick = enter;
  $("#btn-menu").onclick = () => go("title");
  $("#btn-side").onclick = () => $("#app").classList.toggle("side-open");
  $("#btn-undo").onclick = undo;
  $("#btn-skip").onclick = () => setSkip(!settings.skip, settings.skip ? "" : "快进已读内容 · 遇到未读自动停止");
  $("#chapcard").addEventListener("click", (e) => { e.stopPropagation(); closeCard(); });
  function renderSpeed() {
    document.querySelectorAll(".spd").forEach((b) => {
      const on = b.dataset.speed === settings.speed;
      b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  document.querySelectorAll(".spd").forEach((b) => {
    b.onclick = () => { settings.speed = b.dataset.speed; saveSettings(); renderSpeed(); if (typing) skipType = settings.speed === "instant"; };
  });
  renderSpeed();
  $(".stage").addEventListener("click", () => {
    if (typing) skipType = true;
    $("#app").classList.remove("side-open");
  });
  $("#name-in").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); enter(); } });

  document.addEventListener("keydown", (e) => {
    if (cardOpen()) { e.preventDefault(); if (!e.repeat) closeCard(); return; }
    if (modalOpen()) { if (e.key === "Escape") closeModal(); return; }
    if (panelOpen()) { if (e.key === "Escape") { e.preventDefault(); closePanel(); } return; }
    if (e.key === "Escape") { $("#app").classList.remove("side-open"); return; }
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    if ($("#screen-game").classList.contains("hidden")) return;
    if (e.key === " " || e.key === "Enter") {
      if (typing) { skipType = true; e.preventDefault(); }
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if ((e.key === "h" || e.key === "H") && $(".hint-btn")) { e.preventDefault(); useHint(); return; }
    if (e.key === "Backspace" || e.key === "z" || e.key === "Z") { e.preventDefault(); undo(); return; }
    if (e.key === "f" || e.key === "F") { e.preventDefault(); setSkip(!settings.skip); return; }
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 9 && choiceMap[n - 1]) { e.preventDefault(); pick(choiceMap[n - 1]); }
  });

  /* ---------- 结局图鉴 / 剧情回顾 ---------- */
  let panelReturn = null;
  const panelOpen = () => !$("#panel").classList.contains("hidden");
  function savedTrail() {
    if (state.trail && state.trail.length) return { name: state.name, trail: state.trail };
    const d = readJSON(SAVE_KEY, null); if (d && d.trail) return { name: d.name, trail: d.trail };
    return { name: "", trail: [] };
  }
  function renderGallery() {
    const got = getEndings();
    const ids = Object.keys(ENDS);
    const n = ids.filter((i) => got.includes(i)).length;
    let h = `<p class="p-sum">已解锁 <b>${n}</b> / ${ids.length}。结局记录保存在本机浏览器中。</p><div class="g-grid">`;
    ids.forEach((id, i) => {
      const e = typeof ENDS[id] === "string" ? { name: ENDS[id] } : ENDS[id];
      const on = got.includes(id);
      h += `<div class="g-card ${on ? "on" : "locked"} g-${id}"><div class="g-no">No.${String(i + 1).padStart(2, "0")}</div>` +
        `<div class="g-name">${on ? esc(e.name) : "？？？"}</div>` +
        `<div class="g-epi">${on ? esc(e.epi || "") : "未解锁 · " + esc(e.hint || "")}</div>` +
        (on ? `<div class="g-seal">${esc(e.name.slice(0, 2))}</div>` : `<div class="g-lock">封</div>`) + `</div>`;
    });
    return h + "</div>";
  }
  function renderRecap() {
    const d = savedTrail();
    if (!d.trail.length) return `<p class="p-sum">还没有考试记录。领取准考证后，你在每个考场做过的选择都会记在这里。</p>`;
    let h = `<p class="p-sum">考生 <b>${esc(d.name || "—")}</b> 本轮共做出 <b>${d.trail.length}</b> 个选择。</p><ol class="r-list">`;
    let last = null;
    d.trail.forEach((x) => {
      if (x.s !== last) { h += `<li class="r-subj">${esc(x.s)}</li>`; last = x.s; }
      h += `<li class="r-item"><span class="r-at">${esc(x.at)}</span><span class="r-c">${esc(x.c)}</span></li>`;
    });
    return h + "</ol>";
  }
  function openPanel(tab) {
    const p = $("#panel");
    if (!panelOpen()) panelReturn = document.activeElement;
    p.classList.remove("hidden");
    $("#panel-title").textContent = tab === "gallery" ? "结局图鉴" : "剧情回顾";
    document.querySelectorAll(".ptab").forEach((b) => { const on = b.dataset.tab === tab; b.classList.toggle("on", on); b.setAttribute("aria-selected", on ? "true" : "false"); });
    const body = $("#panel-body");
    body.innerHTML = tab === "gallery" ? renderGallery() : renderRecap();
    body.scrollTop = tab === "recap" ? body.scrollHeight : 0;
    SND.ui("page");
    setTimeout(() => $("#panel-x").focus(), 0);
  }
  function closePanel() {
    $("#panel").classList.add("hidden");
    if (panelReturn && panelReturn.focus) panelReturn.focus();
  }

  if (!FILM()) showTitle();
  window.QQGK = { go, state, save, cond, showTitle, openPanel, closePanel, useHint, undo, setSkip, settings, readSet, closeCard, newGame, store };
})();
