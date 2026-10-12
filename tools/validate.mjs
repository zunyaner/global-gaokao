#!/usr/bin/env node
// 剧情数据校验：纯数据（无函数）、结构 schema、缺失 id、不可达场景、占位符与引用
// 用法：node tools/validate.mjs        （有错误时退出码为 1）
import fs from "node:fs";
import path from "node:path";
import { ROOT, SPECIAL, scriptList, loadStory } from "./lib/load.mjs";

const errors = [], warns = [];
const err = (m) => errors.push(m), warn = (m) => warns.push(m);

/* ---------- 1. 每个 scenes/*.js 必须是「一次 GK.register(名, JSON)」，JSON 部分能被 JSON.parse ---------- */
const sceneDir = path.join(ROOT, "scenes");
const onDisk = fs.readdirSync(sceneDir).filter((f) => f.endsWith(".js")).map((f) => "scenes/" + f).sort();
const inHtml = scriptList().filter((s) => s.startsWith("scenes/"));
for (const f of onDisk) if (!inHtml.includes(f)) err(`${f} 没有在 index.html 中引用`);
for (const f of inHtml) if (!onDisk.includes(f)) err(`index.html 引用了不存在的 ${f}`);
const raw = {};
for (const f of onDisk) {
  const src = fs.readFileSync(path.join(ROOT, f), "utf8").replace(/^\s*\/\*[\s\S]*?\*\/\s*/, "");
  const m = src.match(/^GK\.register\(\s*("[^"\n]+")\s*,\s*([\s\S]*)\)\s*;\s*$/);
  if (!m) { err(`${f}：文件必须只包含一次 GK.register("章节", {...});（前面可有一段块注释）`); continue; }
  const name = JSON.parse(m[1]);
  if ("scenes/" + name + ".js" !== f) err(`${f}：注册名 "${name}" 与文件名不一致`);
  try { raw[f] = JSON.parse(m[2]); } catch (e) { err(`${f}：数据不是纯 JSON 字面量（可能残留函数 / 变量 / 注释 / 单引号）：${e.message}`); }
}

/* ---------- 2. 加载（与浏览器同一份注册表与解释器） ---------- */
const { SCENES, ENDINGS, GK, Story, loadErrors } = loadStory();
loadErrors.forEach((e) => err("注册：" + e));
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
(function noFn(v, where) {
  if (typeof v === "function") err(`${where}：残留函数`);
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) noFn(x, where + "." + k);
})({ SCENES, ENDINGS, shops: GK.shops, fragments: GK.fragments }, "data");

/* ---------- 3. schema ---------- */
const SCENE_KEYS = { loc: "s", bg: "s", radio: "t", who: "s", whoClass: "s", face: "s", text: "t", choices: "a", fx: "fx", hint: "s",
  flash: "b", art: "s", paper: "t", enter: "e", shop: "s", stamp: "s", svg: "s", ending: "s", nosave: "b", nohud: "b" };
const CHOICE_KEYS = { text: "s", next: "s", fx: "fx", if: "c", needSeat: "b", stamp: "s", flash: "b", roll: "r", dead: "b" };
const FX_KEYS = { score: "n", viol: "n", hp: "n", yh: "n", qj: "n", hints: "n", clock: "n", flag: "flags", inv: "s", drop: "s", subj: "s", exam: "s", log: "s" };
const ARTS = ["seats", "paper", "svg", "shop"];
const BGS = ["radio", "snow", "cabin", "fire", "rest", "system", "jinbi", "twin", "sea", "village", "fog", "castle", "ballroom", "school", "casino", "math", "core", "death", "dawn", "title", "cover", "intro"];
const FLAGS_READ = new Map(), FLAGS_SET = new Set(["pickedShadow", "picked13", "pickedLamp", "pickedSeat", "seatIdx", "fullInvig"]); // 后者由引擎设置

function checkPlaceholders(str, where, allowed) {
  if (typeof str !== "string") return;
  for (const m of str.matchAll(/\{(\w*)\}?/g)) {
    if (!allowed) { err(`${where}：这里不做占位符替换，却出现了 "${m[0]}"`); continue; }
    if (!Story.VARS[m[1]] || !m[0].endsWith("}")) err(`${where}：未知占位符 "${m[0]}"（可用：${Object.keys(Story.VARS).map((k) => "{" + k + "}").join(" ")}）`);
  }
}
function checkCond(c, where) {
  if (!isObj(c)) { err(`${where}：条件必须是对象`); return; }
  for (const [k, v] of Object.entries(c)) {
    if (!Story.COND_KEYS[k]) { err(`${where}：未知条件键 "${k}"`); continue; }
    if (["flag", "noflag", "has"].includes(k)) { if (typeof v !== "string") err(`${where}.${k}：应为字符串`); else if (k !== "has") FLAGS_READ.set(v, where); }
    else if (k === "full") { if (v !== true) err(`${where}.full：应为 true`); }
    else if (k === "any" || k === "none") { if (!Array.isArray(v) || !v.every((x) => typeof x === "string")) err(`${where}.${k}：应为字符串数组`); else v.forEach((x) => FLAGS_READ.set(x, where)); }
    else if (k === "min" || k === "max") {
      if (!isObj(v)) { err(`${where}.${k}：应为对象`); continue; }
      for (const [n, x] of Object.entries(v)) { if (!Story.NUM_KEYS[n]) err(`${where}.${k}.${n}：未知数值`); if (typeof x !== "number") err(`${where}.${k}.${n}：应为数字`); }
    } else if (k === "or" || k === "all") { if (!Array.isArray(v) || !v.length) err(`${where}.${k}：应为非空数组`); else v.forEach((x, i) => checkCond(x, `${where}.${k}[${i}]`)); }
  }
}
function checkText(t, where) {
  if (typeof t === "string") return checkPlaceholders(t, where, true);
  if (Array.isArray(t)) return t.forEach((x, i) => checkText(x, `${where}[${i}]`));
  if (isObj(t)) {
    if ("if" in t) {
      for (const k of Object.keys(t)) if (!["if", "then", "else"].includes(k)) err(`${where}：条件文本里多余的键 "${k}"`);
      checkCond(t.if, where + ".if"); if (!("then" in t)) err(`${where}：缺少 then`);
      checkText(t.then, where + ".then"); if ("else" in t) checkText(t.else, where + ".else"); return;
    }
    if (t.frag) { if (Object.keys(t).length !== 1) err(`${where}：frag 对象只能有一个键`); if (!(t.frag in GK.fragments)) err(`${where}：未注册的文本片段 "${t.frag}"`); return; }
    if (t.hook) { if (!Story.hooks[t.hook]) err(`${where}：未定义的引擎钩子 "${t.hook}"`); return; }
  }
  err(`${where}：无法识别的文本节点 ${JSON.stringify(t).slice(0, 60)}`);
}
function checkFx(fx, where) {
  if (!isObj(fx)) { err(`${where}：效果必须是对象`); return; }
  for (const [k, v] of Object.entries(fx)) {
    const t = FX_KEYS[k];
    if (!t) { err(`${where}：未知效果键 "${k}"`); continue; }
    if (t === "n" && typeof v !== "number") err(`${where}.${k}：应为数字`);
    if (t === "s" && typeof v !== "string") err(`${where}.${k}：应为字符串`);
    if (t === "s" && typeof v === "string") checkPlaceholders(v, `${where}.${k}`, false);
    if (t === "flags") { if (!isObj(v)) err(`${where}.flag：应为对象`); else for (const [f, b] of Object.entries(v)) { FLAGS_SET.add(f); if (typeof b !== "boolean") err(`${where}.flag.${f}：应为布尔值`); } }
  }
}
function checkFields(obj, KEYS, where) {
  for (const [k, v] of Object.entries(obj)) {
    const t = KEYS[k];
    if (!t) { err(`${where}：未知字段 "${k}"`); continue; }
    if (t === "s" && typeof v !== "string") err(`${where}.${k}：应为字符串`);
    if (t === "b" && typeof v !== "boolean") err(`${where}.${k}：应为布尔值`);
    if (t === "s" && typeof v === "string" && k !== "svg") checkPlaceholders(v, `${where}.${k}`, false);
    if (t === "t") checkText(v, `${where}.${k}`);
    if (t === "fx") checkFx(v, `${where}.${k}`);
    if (t === "c") checkCond(v, `${where}.${k}`);
  }
}
for (const [id, sc] of Object.entries(SCENES)) {
  const w = `${GK.fileOf[id]}:${id}`;
  if (!/^[a-z][a-z0-9_]*$/.test(id)) err(`${w}：场景 id 只允许小写字母 / 数字 / 下划线`);
  checkFields(sc, SCENE_KEYS, w);
  if (sc.text == null) err(`${w}：缺少 text`);
  if (!Array.isArray(sc.choices) || !sc.choices.length) err(`${w}：choices 必须是非空数组`);
  if (sc.bg && !BGS.includes(sc.bg)) warn(`${w}：bg "${sc.bg}" 不在已知背景列表里`);
  if (sc.art && !ARTS.includes(sc.art)) err(`${w}：未知 art 类型 "${sc.art}"`);
  if (sc.art === "paper" && sc.paper == null) err(`${w}：art=paper 却没有 paper`);
  if (sc.art === "svg" && !sc.svg) err(`${w}：art=svg 却没有 svg`);
  if (sc.art === "shop" && !(sc.shop in GK.shops)) err(`${w}：兑换目录 "${sc.shop}" 未注册`);
  if (sc.ending && !(sc.ending in ENDINGS)) err(`${w}：结局 "${sc.ending}" 没有图鉴元数据`);
  if (sc.enter) {
    for (const k of Object.keys(sc.enter)) if (!["set", "once"].includes(k)) err(`${w}.enter：未知键 "${k}"`);
    if (sc.enter.set) for (const [f, c] of Object.entries(sc.enter.set)) { FLAGS_SET.add(f); checkCond(c, `${w}.enter.set.${f}`); }
    if (sc.enter.once) { if (typeof sc.enter.once.flag !== "string") err(`${w}.enter.once.flag：应为字符串`); else FLAGS_SET.add(sc.enter.once.flag); checkFx(sc.enter.once.fx || {}, `${w}.enter.once.fx`); }
  }
  (sc.choices || []).forEach((c, i) => {
    const cw = `${w}.choices[${i}]`;
    checkFields(c, CHOICE_KEYS, cw);
    if (typeof c.text !== "string" || !c.text) err(`${cw}：缺少 text`);
    if (typeof c.next !== "string") err(`${cw}：缺少 next`);
    if (c.roll) {
      if (typeof c.roll.p !== "number" || c.roll.p < 0 || c.roll.p > 1) err(`${cw}.roll.p：应为 0~1 的数字`);
      for (const side of ["win", "lose"]) { const o = c.roll[side]; if (!isObj(o)) { err(`${cw}.roll.${side}：缺失`); continue; } checkFields(o, { fx: "fx", next: "s", stamp: "s" }, `${cw}.roll.${side}`); }
    }
  });
}
for (const [id, e] of Object.entries(ENDINGS)) {
  for (const k of ["name", "hint", "epi"]) if (typeof e[k] !== "string" || !e[k]) err(`endings:${id}.${k}：缺失`);
  if (!Object.values(SCENES).some((s) => s.ending === id)) err(`endings:${id}：没有任何场景通向这个结局`);
}
for (const [name, items] of Object.entries(GK.shops)) items.forEach((it, i) => {
  checkFields(it, { name: "s", desc: "s", cost: "n", hp: "n", viol: "n", hints: "n", max: "n", inv: "s" }, `shops.${name}[${i}]`);
  if (typeof it.cost !== "number") err(`shops.${name}[${i}].cost：应为数字`);
});
for (const [k, v] of Object.entries(GK.fragments)) checkText(v, `fragments.${k}`);

/* ---------- 4. 场景图：缺失 id / 不可达 ---------- */
const edges = {}, missing = [];
for (const [id, sc] of Object.entries(SCENES)) {
  edges[id] = [];
  for (const c of sc.choices || []) {
    const outs = c.roll ? [c.roll.win.next || c.next, c.roll.lose.next || c.next] : [c.dead ? "dead" : c.next];
    for (const n of outs) { if (!SCENES[n] && !SPECIAL.has(n)) missing.push(`${id} → ${n}`); edges[id].push(n); }
  }
}
missing.forEach((m) => err("缺失场景：" + m));
if (!SCENES.boot) err("缺少入口场景 boot");
if (!SCENES.dead) err("缺少 dead（身体状态归零时进入）");
const ROOTS = ["boot", "rules_only", "dead"];        // rules_only 从封面进入；dead 由身体状态归零触发
const seen = new Set(ROOTS.filter((r) => SCENES[r])), q = ["boot"];
while (q.length) { const x = q.shift(); for (const n of edges[x] || []) if (SCENES[n] && !seen.has(n)) { seen.add(n); q.push(n); } }
Object.keys(SCENES).filter((k) => !seen.has(k)).forEach((k) => err(`不可达场景：${k}（${GK.fileOf[k]}）`));
for (const [f, where] of FLAGS_READ) if (!FLAGS_SET.has(f)) warn(`旗标 "${f}" 被读取（${where}）但没有任何效果会设置它`);

/* ---------- 报告 ---------- */
const byFile = {};
for (const id of Object.keys(SCENES)) byFile[GK.fileOf[id]] = (byFile[GK.fileOf[id]] || 0) + 1;
console.log(`剧情文件 ${onDisk.length} 个，场景 ${Object.keys(SCENES).length} 个，结局 ${Object.keys(ENDINGS).length} 个`);
console.log("  " + Object.entries(byFile).map(([f, n]) => `${f}:${n}`).join("  "));
warns.forEach((w) => console.log("警告  " + w));
errors.forEach((e) => console.log("错误  " + e));
console.log(errors.length ? `✗ 校验失败：${errors.length} 个错误` : `✓ 校验通过（纯数据、schema、缺失 id、不可达场景、占位符均无问题）${warns.length ? "，" + warns.length + " 个警告" : ""}`);
process.exit(errors.length ? 1 : 0);
