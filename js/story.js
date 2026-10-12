/* 全球高考 · 声明式剧情解释器（纯逻辑，不碰 DOM；浏览器与 node 工具共用）
 *
 * 文本（text / paper / radio）可以是：
 *   "字符串"                         —— 支持占位符 {name} {ticket} {score} {viol} {hp} {yh} {qj} {hints}
 *   [片段, 片段, …]                  —— 依次拼接
 *   { "if": 条件, "then": 文本, "else": 文本 }   —— else 可省略（视为空串）
 *   { "frag": "片段名" }             —— 引用 GK.register(..., { fragments }) 注册的公共文本
 *   { "hook": "钩子名" }             —— 引用下方 HOOKS 中的引擎钩子（复杂逻辑才用）
 *
 * 条件对象（各项同时满足才为真；空 / 缺省为真）：
 *   flag:"x"  noflag:"x"  has:"物品"  full:true（已被全程监考）
 *   any:["a","b"]（任一旗标）  none:["a","b"]（都没有）
 *   min:{ yh:4, qj:2, score:10, viol:1, hints:1 }   max:{ hp:60, viol:0, score:19 }
 *   or:[条件, …]  all:[条件, …]
 *
 * 入场钩子（enter，每次进入场景时执行，读档恢复时也执行，因此必须幂等）：
 *   { "set": { "旗标": 条件, … },  "once": { "flag": "旗标", "fx": 效果对象 } }
 *   set：把条件的真假写进旗标；once：旗标未置位时置位并执行一次效果（效果对象与选项的 fx 相同）。
 */
(function (root) {
  "use strict";
  var VARS = { name: 1, ticket: 1, score: 1, viol: 1, hp: 1, yh: 1, qj: 1, hints: 1 };
  var COND_KEYS = { flag: 1, noflag: 1, has: 1, full: 1, any: 1, none: 1, min: 1, max: 1, or: 1, all: 1 };
  var NUM_KEYS = { yh: 1, qj: 1, score: 1, viol: 1, hp: 1, hints: 1 };
  /** 引擎钩子：文本里 {"hook":"名字"} 引用；签名 (state) => string。当前剧情不需要，保留扩展点。 */
  var HOOKS = {};

  function frags() { return (root.GK && root.GK.fragments) || {}; }

  function interp(str, st) {
    return String(str).replace(/\{(\w+)\}/g, function (m, k) { return VARS[k] ? String(st[k]) : m; });
  }

  function text(t, st) {
    if (t == null) return "";
    if (typeof t === "string") return interp(t, st);
    if (Array.isArray(t)) { var r = ""; for (var i = 0; i < t.length; i++) r += text(t[i], st); return r; }
    if (typeof t === "object") {
      if ("if" in t) return cond(t["if"], st) ? text(t.then, st) : text(t["else"], st);
      if (t.frag) return text(frags()[t.frag], st);
      if (t.hook) return HOOKS[t.hook] ? String(HOOKS[t.hook](st)) : "";
    }
    return String(t);
  }

  function num(st, k) { var v = st[k]; return k === "hints" ? (v || 0) : v; }

  function cond(c, st) {
    if (!c) return true;
    var f = st.flags || {};
    if (c.flag && !f[c.flag]) return false;
    if (c.noflag && f[c.noflag]) return false;
    if (c.has && (st.inv || []).indexOf(c.has) < 0) return false;
    if (c.full && !f.fullInvig) return false;
    if (c.any && !c.any.some(function (x) { return f[x]; })) return false;
    if (c.none && c.none.some(function (x) { return f[x]; })) return false;
    var k;
    if (c.min) for (k in c.min) if (num(st, k) < c.min[k]) return false;
    if (c.max) for (k in c.max) if (num(st, k) > c.max[k]) return false;
    if (c.or && !c.or.some(function (x) { return cond(x, st); })) return false;
    if (c.all && !c.all.every(function (x) { return cond(x, st); })) return false;
    return true;
  }

  function runEnter(e, st, apply) {
    if (!e) return;
    st.flags = st.flags || {};
    if (e.set) Object.keys(e.set).forEach(function (k) { st.flags[k] = !!cond(e.set[k], st); });
    if (e.once && !st.flags[e.once.flag]) { st.flags[e.once.flag] = true; if (apply) apply(e.once.fx); }
  }

  root.GKStory = { text: text, cond: cond, runEnter: runEnter, interp: interp, hooks: HOOKS, VARS: VARS, COND_KEYS: COND_KEYS, NUM_KEYS: NUM_KEYS };
})(typeof window !== "undefined" ? window : this);
