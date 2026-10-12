#!/usr/bin/env node
// 随机游玩模拟：用浏览器同一份剧情数据与解释器（js/story.js），复刻 js/game.js 的状态结算
// 用法：node tools/sim.mjs [局数=20000] [种子=12345]
import { SPECIAL, loadStory } from "./lib/load.mjs";
const { SCENES: S, ENDINGS: E, GK, Story } = loadStory();

function run(policy, rnd) {
  const st = { score: 0, viol: 0, hp: 100, inv: [], flags: {}, yh: 0, qj: 0, hints: 0, scene: "boot", steps: 0, minHp: 100 };
  const cond = (c) => Story.cond(c, st);
  const apply = (fx) => { if (!fx) return;
    if (fx.score) st.score = Math.max(0, st.score + fx.score);
    if (fx.viol) { st.viol = Math.max(0, st.viol + fx.viol); if (st.viol >= 3) st.flags.fullInvig = true; }
    if (fx.hp) st.hp = Math.max(0, Math.min(100, st.hp + fx.hp));
    if (fx.yh) st.yh += fx.yh; if (fx.qj) st.qj += fx.qj;
    if (fx.flag) Object.assign(st.flags, fx.flag);
    if (fx.inv && !st.inv.includes(fx.inv)) st.inv.push(fx.inv);
    if (fx.hints) st.hints = Math.max(0, st.hints + fx.hints); };
  const risk = (c) => { const fx = c.fx || {}; return c.dead || (fx.hp != null && fx.hp <= -30); };
  let id = "boot", deathAt = null;
  const go = (n) => { const sc = S[n]; id = n; st.scene = n; apply(sc.fx); Story.runEnter(sc.enter, st, apply);
    if (st.hp <= 0 && n !== "dead") { deathAt = deathAt || n; return go("dead"); } st.minHp = Math.min(st.minHp, st.hp); };
  go("boot");
  while (st.steps++ < 400) {
    const sc = S[id];
    if (id === "final_gate" && !st.flags.__g) { st.flags.__g = 1; GATE.push(st.score); }
    if (sc.ending) return { end: sc.ending, st, deathAt };
    if (sc.art === "seats") { const i = Math.floor(rnd() * 13); Object.assign(st.flags, { pickedShadow: i === 6, picked13: i === 12, pickedLamp: i === 9, pickedSeat: true }); }
    if (sc.art === "shop" && !st.flags["shop:" + id]) { st.flags["shop:" + id] = 1; const shop = GK.shopOf(sc.shop);
      for (let k = 0; k < 3; k++) { const it = shop[Math.floor(rnd() * shop.length)];
        if (rnd() < 0.6 && st.score >= it.cost && !(it.inv && st.inv.includes(it.inv)) && !(it.hints && st.hints >= (it.max || 9)) && !(it.hp && !it.inv && st.hp >= 100) && !(it.viol && st.viol <= 0)) {
          st.score -= it.cost; if (it.hp) st.hp = Math.min(100, st.hp + it.hp); if (it.viol) st.viol = Math.max(0, st.viol + it.viol); if (it.inv) st.inv.push(it.inv); if (it.hints) st.hints += it.hints; } } }
    let opts = (sc.choices || []).filter((c) => cond(c.if));
    if (!opts.length) return { end: "STUCK:" + id, st };
    if (policy === "hint" && st.hints > 0 && opts.some(risk) && opts.some((c) => !risk(c))) { st.hints--; opts = opts.filter((c) => !risk(c)); }
    const c = opts[Math.floor(rnd() * opts.length)];
    if (c.roll) { const o = rnd() < (c.roll.p ?? 0.5) ? c.roll.win : c.roll.lose; apply(o.fx); const n = o.next || c.next; if (SPECIAL.has(n)) return { end: n, st }; go(n); continue; }
    apply(c.fx);
    if (c.dead) { deathAt = id; go("dead"); continue; }
    if (SPECIAL.has(c.next)) return { end: "EXIT:" + c.next, st };
    go(c.next);
  }
  return { end: "LOOP", st };
}
const N = +process.argv[2] || 20000;
let seed = +process.argv[3] || 12345;
const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
let GATE = [];
for (const policy of ["random", "hint"]) {
  const ends = {}, deaths = {}; let score = 0;
  for (let i = 0; i < N; i++) { const r = run(policy, rnd); ends[r.end] = (ends[r.end] || 0) + 1; if (r.end === "dead") deaths[r.deathAt] = (deaths[r.deathAt] || 0) + 1; score += r.st.score; }
  console.log("RAW", policy, JSON.stringify(Object.fromEntries(Object.entries(ends).sort())), JSON.stringify(Object.fromEntries(Object.entries(deaths).sort())), "scoreSum=" + score);
  const pct = (n) => (100 * n / N).toFixed(1) + "%";
  console.log(`\n[${policy}] N=${N} avgScore=${(score / N).toFixed(1)}`);
  for (const [k, v] of Object.entries(ends).sort((a, b) => b[1] - a[1])) console.log("  ", k.padEnd(12), pct(v), E[k] ? "(" + E[k].name + ")" : "");
  const g = GATE.sort((a, b) => a - b); GATE = [];
  if (g.length) console.log("   score@final_gate p50/p75/p90:", g[g.length >> 1], g[Math.floor(g.length * .75)], g[Math.floor(g.length * .9)]);
  console.log("   death at:", Object.entries(deaths).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => k + " " + pct(v)).join(", "));
}
