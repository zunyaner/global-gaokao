# 全球高考 · 同人互动

向木苏里《全球高考》致敬的纯静态互动小说。双击 `index.html` 即可本地游玩；线上：https://zunyaner.github.io/global-gaokao/

```
index.html            入口（GitHub Pages / 双击打开）
css/style.css
js/
  registry.js         剧情注册表：GK.register(章节, 纯数据)
  story.js            声明式剧情解释器：文本模板 / 条件 / 入场钩子（无 DOM，node 工具共用）
  chapters.js         章节元数据（HUD 科目 / 考场、章节卡）
  game.js             游戏引擎与界面（存档、回退、快进、选项、档案室）
  ui.js               页内提示条 / 弹层（不使用浏览器弹窗）
  cover.js            开场影片与封面
  fx.js  art.js  audio.js   粒子与背景 / 原创 SVG 立绘与场景 / WebAudio 程序化音效
scenes/               剧情数据（纯 JSON 字面量，按章节分文件，格式见 scenes/README.md）
assets/               favicon、apple-touch-icon、分享卡片 og-cover.png
tools/                validate.mjs（剧情校验）、sim.mjs（随机模拟）、lib/load.mjs
```

无构建步骤、无外部依赖。修改剧情后运行 `node tools/validate.mjs`。
