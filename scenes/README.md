# 剧情数据格式（scenes/）

每个章节一个文件，文件里**只有一次** `GK.register("章节名", { ... })` 调用，第二个参数是**纯 JSON 字面量**
（双引号键名、无函数、无变量、无注释）。`tools/validate.mjs` 会把这一段直接交给 `JSON.parse`，解析不了就报错。

## 为什么是「注册式 .js」而不是 .json

双击 `index.html`（`file://`）时，浏览器禁止用 `fetch()` 读本地 `.json`，但 `<script src>` 照常加载。
所以剧情写成「只含数据的 .js」：在 `file://` 与 GitHub Pages 下都能直接用，不需要构建步骤，也只有一份源文件
（不用维护 .json 与生成产物两套）。内容本身就是合法 JSON，随时可以原样抽出来给别的工具用。

## 加载顺序（见 index.html）

`js/registry.js`（定义 `GK.register`）→ `js/story.js`（解释器）→ `scenes/*.js` → 其余引擎脚本。
新增章节文件时，在 index.html 里补一个 `<script src="scenes/xxx.js">`；validate 会检查两边是否一致。

| 文件 | 内容（按 js/chapters.js 的章节划分） |
| --- | --- |
| prologue.js | 规则页、夜车入场 |
| physics.js | 物理 · 考场 003712 · 鸡鸣山（含该场的禁闭室） |
| rest-areas.js | 各休息处、监考处禁闭室、赌场、2 号休息处；以及兑换目录 `shops` |
| foreign-language.js | 外语 · 吉普赛村 |
| history.js | 历史 · 海上马车夫 |
| cleanup-politics.js | 监考区中期处罚 · 政治 · 清理考场 |
| castle.js | 历史重考 · 古堡 |
| math.js | 数学 · 布兰登小镇 |
| finale.js | 语文 · 终局 |
| endings.js | 六个结局场景、`endings`（图鉴元数据）、`fragments`（公共文本片段） |

## register 的数据

```json
{
  "scenes":    { "场景id": 场景, ... },
  "shops":     { "目录名": [ { "name": "", "desc": "", "cost": 3, "hp": 20, "inv": "", "hints": 1, "max": 3, "viol": -1 } ] },
  "endings":   { "结局id": { "name": "", "hint": "", "epi": "" } },
  "fragments": { "片段名": 文本 }
}
```

## 场景

| 字段 | 说明 |
| --- | --- |
| `loc` `bg` `who` `whoClass` `face` | 地点、背景、说话人（立绘由说话人自动匹配，`face` 可指定） |
| `radio` `text` | **文本**（见下） |
| `choices` | 选项数组（非空） |
| `fx` | 进入场景时结算一次的**效果**（读档恢复时不重复结算） |
| `enter` | **入场钩子**，每次进入都执行（读档也执行，须幂等） |
| `hint` | 求助牌提示文字 |
| `art` | `"seats"` 座位图 / `"paper"` 纸面题（配 `paper` 文本）/ `"svg"`（配 `svg` 字符串）/ `"shop"`（配 `shop` 目录名） |
| `stamp` `flash` | 盖章动画文字、闪屏 |
| `ending` | 结局 id（须在 endings 中有元数据） |
| `nosave` `nohud` | 不存档 / 不显示 HUD |

### 选项

```json
{ "text": "跟着跳", "next": "pol_school", "if": 条件, "fx": 效果, "stamp": "求助", "flash": true, "needSeat": true,
  "roll": { "p": 0.5, "win": { "fx": {}, "next": "可选", "stamp": "可选" }, "lose": { "fx": {} } } }
```

`next` 也可以是特殊目标：`title`（封面）`new`（重新领取准考证）`gallery` / `recap`（档案室）。

### 文本

- `"字符串"`：支持占位符 `{name}` `{ticket}` `{score}` `{viol}` `{hp}` `{yh}` `{qj}` `{hints}`（只在 text / paper / radio 中替换）
- `[片段, 片段, …]`：依次拼接
- `{ "if": 条件, "then": 文本, "else": 文本 }`：`else` 可省略
- `{ "frag": "endingFooter" }`：引用 `fragments`
- `{ "hook": "名字" }`：引用 `js/story.js` 里的引擎钩子（留给真正复杂的逻辑；目前没有用到）

### 条件（全部满足才为真）

`flag` `noflag` `has`（持有物品）`full`（已被全程监考）`any` / `none`（旗标数组）
`min` / `max`（`yh` `qj` `score` `viol` `hp` `hints` 的下限 / 上限，含等号）`or` / `all`（条件数组）

```json
{ "flag": "mirrorOk", "any": ["fedSally", "happyShirley"] }
{ "min": { "yh": 4, "qj": 4 }, "max": { "viol": 2 } }
{ "or": [ { "any": ["tore", "groupYQ"] }, { "max": { "score": 19 } } ] }
```

### 效果

`score` `viol` `hp` `yh` `qj` `hints` `clock`（数字增量）、`flag`（`{ "旗标": true/false }`）、
`inv` / `drop`（获得 / 失去物品）、`subj` `exam`、`log`（系统记录）。

### 入场钩子

```json
{ "set": { "goodRank": { "flag": "mirrorOk", "any": ["fedSally", "happyShirley"] } },
  "once": { "flag": "casinoHeal", "fx": { "hp": 35 } } }
```

`set`：把条件真假写进旗标；`once`：旗标未置位时置位并执行一次效果。

## 校验与模拟

```
node tools/validate.mjs     # 纯数据 / schema / 缺失 id / 不可达场景 / 残留函数 / 占位符
node tools/sim.mjs 50000    # 随机游玩模拟（固定种子，结局分布与死亡位置）
```
