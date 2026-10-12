/* 全球高考 · 剧情注册表
 * 剧情数据放在 scenes/*.js，每个文件只调用一次 GK.register(章节名, 数据)，数据只含 JSON 字面量。
 * 之所以用「注册式 .js」而不是 .json + fetch：双击 index.html（file://）时浏览器禁止 fetch 本地文件，
 * 而 <script> 标签在 file:// 下照常加载。
 * 注册后的结果挂在 window.SCENES / window.ENDINGS 上，供引擎（js/game.js）与工具（tools/）读取。 */
(function (root) {
  "use strict";
  var SCENES = root.SCENES = root.SCENES || {};
  var ENDINGS = root.ENDINGS = root.ENDINGS || {};
  var SHOPS = {}, FRAGS = {}, FILES = [], FILE_OF = {};
  function merge(dst, src, kind, file) {
    if (!src) return;
    Object.keys(src).forEach(function (k) {
      if (Object.prototype.hasOwnProperty.call(dst, k)) console.error("[GK] 重复的" + kind + "：" + k + "（" + file + "）");
      dst[k] = src[k];
    });
  }
  function register(file, data) {
    data = data || {};
    FILES.push(file);
    if (data.scenes) Object.keys(data.scenes).forEach(function (id) { FILE_OF[id] = file; });
    merge(SCENES, data.scenes, "场景", file);
    merge(ENDINGS, data.endings, "结局", file);
    merge(SHOPS, data.shops, "兑换目录", file);
    merge(FRAGS, data.fragments, "文本片段", file);
  }
  /** 场景里的 shop 字段是目录名（如 "rest"），这里换成目录数组 */
  function shopOf(ref) { return typeof ref === "string" ? (SHOPS[ref] || []) : (ref || []); }
  root.GK = { register: register, shopOf: shopOf, shops: SHOPS, fragments: FRAGS, files: FILES, fileOf: FILE_OF };
})(typeof window !== "undefined" ? window : this);
