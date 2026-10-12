// 在 node 里按 index.html 的 <script> 顺序加载「注册表 + 解释器 + 剧情数据」，与浏览器完全同源
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const SPECIAL = new Set(["title", "new", "gallery", "recap"]);

export function scriptList(root = ROOT) {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  return [...html.matchAll(/<script\s+src="([^"]+)"/g)].map((m) => m[1]);
}

export function loadStory(root = ROOT) {
  const errors = [];
  const ctx = { console: { log() {}, warn() {}, error: (...a) => errors.push(a.join(" ")) } };
  ctx.window = ctx;
  vm.createContext(ctx);
  const files = scriptList(root).filter((s) => s === "js/registry.js" || s === "js/story.js" || s.startsWith("scenes/"));
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f });
  return { SCENES: ctx.SCENES, ENDINGS: ctx.ENDINGS, GK: ctx.GK, Story: ctx.GKStory, files, loadErrors: errors };
}
