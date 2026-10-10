/* 原创代码插画：人物半身像（剪影 + 轮廓光，不画五官）与各考场背景。
   全部由 SVG 字符串生成，无外部图片。 */
(function () {
  /* ---------- 小工具 ---------- */
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  var SVG = function (vb, body, cls) { return '<svg class="' + (cls || "") + '" viewBox="' + vb + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + body + "</svg>"; };
  var uid = 0;

  /* ================= 人物半身像 ================= */
  var BODY = {
    coat:    "M8 140 C10 114 28 101 46 97 L74 97 C92 101 110 114 112 140 Z",
    slim:    "M14 140 C16 116 32 103 48 99 L72 99 C88 103 104 116 106 140 Z",
    broad:   "M2 140 C4 110 24 98 44 95 L76 95 C96 98 116 110 118 140 Z",
    kid:     "M24 140 C26 122 38 112 50 109 L70 109 C82 112 94 122 96 140 Z"
  };
  var HAIR = {
    yh:  "M38 56 C34 36 44 24 60 24 C76 24 87 34 83 56 C80 46 76 42 72 41 L70 35 L66 41 C60 38 54 38 50 43 L47 37 L45 45 C42 47 40 51 38 56 Z",
    qj:  "M39 52 C38 34 48 26 61 26 C75 26 84 34 82 52 C79 42 72 37 62 37 C52 37 44 42 39 52 Z",
    yw:  "M39 54 C37 38 46 27 60 27 C73 27 83 36 81 54 C78 46 76 44 73 43 L72 36 L68 42 L64 35 L60 42 L56 36 L53 43 L49 37 L47 44 C44 46 41 49 39 54 Z",
    ly:  "M38 58 C37 50 39 44 42 41 L44 52 Z M82 58 C83 50 81 44 78 41 L76 52 Z",
    f021:"M37 60 C34 34 46 25 60 25 C74 25 86 34 83 60 C82 50 78 44 72 41 C64 46 52 46 44 42 C40 46 38 52 37 60 Z M80 46 C92 54 94 74 86 90 C88 74 86 60 80 52 Z",
    crew:"M40 50 C40 36 48 30 60 30 C72 30 80 36 80 50 C76 42 70 39 60 39 C50 39 44 42 40 50 Z",
    side:"M39 52 C38 34 48 27 60 27 C74 27 83 35 81 52 C78 44 74 40 66 39 L64 34 C58 38 48 40 39 52 Z",
    bob: "M36 70 C32 36 46 25 60 25 C75 25 89 36 84 70 C82 60 80 52 78 46 C68 44 54 44 44 40 C40 48 38 58 36 70 Z",
    long:"M36 96 C30 60 34 30 60 26 C86 30 90 60 84 96 C82 74 80 56 78 46 C68 42 52 42 42 46 C40 60 38 78 36 96 Z",
    wild:"M34 62 C28 40 40 22 60 22 C82 22 94 40 86 62 C84 52 80 46 76 44 L80 34 L70 40 L66 30 L60 40 L52 30 L50 40 L42 34 L44 44 C40 48 36 54 34 62 Z",
    wig: "M32 70 C24 60 26 46 32 40 C30 30 40 22 52 24 C56 18 66 18 70 24 C82 22 92 30 88 40 C94 46 96 60 88 70 C90 62 86 56 82 54 C82 46 78 42 72 42 C64 46 54 46 48 42 C42 42 38 46 38 54 C34 56 30 62 32 70 Z",
    girl:"M38 60 C34 38 46 28 60 28 C74 28 86 38 82 60 C80 50 76 45 70 43 C62 47 52 47 46 43 C42 47 40 52 38 60 Z",
    cap: "M38 46 C40 32 50 27 60 27 C72 27 80 33 82 44 L92 46 C92 49 88 50 82 50 L38 50 Z",
    bald:"M39 56 C38 50 40 46 43 44 L45 54 Z M81 56 C82 50 80 46 77 44 L75 54 Z",
    hood:"M26 104 C22 60 34 22 60 20 C86 22 98 60 94 104 C86 92 82 80 80 66 C78 46 70 38 60 38 C50 38 42 46 40 66 C38 80 34 92 26 104 Z"
  };
  var PEOPLE = {
    yh:      { name: "游惑",   tag: "考生",        rim: "#9ec4d6", bg: ["#16222c", "#0a0f14"], body: "slim",  hair: "yh",   acc: ["stud", "collarHigh"] },
    qj:      { name: "秦究",   tag: "001",         rim: "#e8c98a", bg: ["#2a2216", "#0f0c08"], body: "coat",  hair: "qj",   acc: ["lapel", "armband:001", "smoke"] },
    qjx:     { name: "秦究",   tag: "考生",        rim: "#e8c98a", bg: ["#2a2216", "#0f0c08"], body: "coat",  hair: "qj",   acc: ["lapel"] },
    yw:      { name: "于闻",   tag: "考生",        rim: "#d7c4a4", bg: ["#22201a", "#0d0c0a"], body: "slim",  hair: "yw",   acc: ["hoodie"] },
    ly:      { name: "老于",   tag: "考生",        rim: "#d7c4a4", bg: ["#24201a", "#0d0c0a"], body: "broad", hair: "ly",   acc: ["round"] },
    yy:      { name: "于遥",   tag: "考生",        rim: "#e4c6c0", bg: ["#2a1c1c", "#0f0a0a"], body: "slim",  hair: "long", acc: ["shawl"] },
    i021:    { name: "021",    tag: "监考官",      rim: "#c8a8e8", bg: ["#1e1a2a", "#0a0910"], body: "slim",  hair: "f021", acc: ["lapel", "armband:021"] },
    i922:    { name: "922",    tag: "监考官",      rim: "#a8c8b8", bg: ["#18221e", "#090d0b"], body: "broad", hair: "crew", acc: ["lapel", "armband:922"] },
    i154:    { name: "154",    tag: "监考官",      rim: "#a8b8d8", bg: ["#181c26", "#090a0e"], body: "coat",  hair: "side", acc: ["lapel", "armband:154"] },
    cy:      { name: "楚月",   tag: "休息处老板",  rim: "#f0b8a0", bg: ["#2a1a14", "#0f0a08"], body: "slim",  hair: "bob",  acc: ["apron"] },
    hunter:  { name: "猎人甲", tag: "题目",        rim: "#c0d0d8", bg: ["#141a1e", "#06080a"], body: "broad", hair: "wild", acc: ["fur", "pale"] },
    heipo:   { name: "黑婆",   tag: "村民",        rim: "#b0a0c0", bg: ["#16121a", "#060508"], body: "broad", hair: "hood", acc: ["hoodFill"] },
    zwt:     { name: "村民丁", tag: "往期考生",    rim: "#a0b0a0", bg: ["#141814", "#060806"], body: "coat",  hair: "hood", acc: ["hoodFill"] },
    duke:    { name: "公爵",   tag: "题目",        rim: "#e0c070", bg: ["#2a1216", "#0e0507"], body: "broad", hair: "wig",  acc: ["ruff", "mask"] },
    butler:  { name: "管家",   tag: "NPC",         rim: "#c0b090", bg: ["#1e1814", "#0a0806"], body: "coat",  hair: "side", acc: ["lapel"] },
    shirley: { name: "雪莉",   tag: "NPC",         rim: "#f0c0d0", bg: ["#2a1a22", "#0e080b"], body: "kid",   hair: "girl", acc: ["bows"] },
    sally:   { name: "萨利",   tag: "NPC",         rim: "#c0d8f0", bg: ["#16202a", "#080b0e"], body: "kid",   hair: "cap",  acc: [] },
    gq:      { name: "高齐",   tag: "考生",        rim: "#d8c0a0", bg: ["#221c16", "#0c0a08"], body: "broad", hair: "crew", acc: ["lapel"] },
    zq:      { name: "周祺",   tag: "考生",        rim: "#e8c8b8", bg: ["#261a18", "#0d0908"], body: "slim",  hair: "bob",  acc: [] },
    oldman:  { name: "老人",   tag: "处罚中心",    rim: "#c8c0b0", bg: ["#1c1a18", "#0a0908"], body: "coat",  hair: "bald", acc: ["glasses"] },
    mirror:  { name: "镜像人", tag: "题目",        rim: "#b8e0f0", bg: ["#101820", "#04070a"], body: "coat",  hair: "qj",   acc: ["shards"] },
    sys:     { name: "系统",   tag: "SYSTEM",      sys: true }
  };
  var NAME_MAP = [
    ["游惑", "yh"], ["考官A", "yh"], ["秦究", "qj"], ["001", "qj"], ["于闻", "yw"], ["老于", "ly"], ["于遥", "yy"],
    ["021", "i021"], ["922", "i922"], ["154", "i154"], ["楚月", "cy"], ["老板", "cy"], ["猎人", "hunter"], ["黑婆", "heipo"],
    ["村民丁", "zwt"], ["公爵", "duke"], ["管家", "butler"], ["雪莉", "shirley"], ["萨利", "sally"], ["高齐", "gq"], ["周祺", "zq"],
    ["老人", "oldman"], ["镜像", "mirror"], ["系统", "sys"], ["广播", "sys"]
  ];
  function faceFor(who) {
    if (!who) return null;
    for (var i = 0; i < NAME_MAP.length; i++) if (who.indexOf(NAME_MAP[i][0]) >= 0) return NAME_MAP[i][1];
    return null;
  }

  function sysIcon() {
    var id = "sg" + (++uid);
    return '<svg viewBox="0 0 120 140" aria-hidden="true"><defs><radialGradient id="' + id + '" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#1c4a36"/><stop offset="1" stop-color="#04100a"/></radialGradient></defs>' +
      '<rect width="120" height="140" fill="url(#' + id + ')"/>' +
      '<g fill="none" stroke="#74e0a0"><circle cx="60" cy="62" r="34" stroke-opacity=".25"/><circle cx="60" cy="62" r="24" stroke-opacity=".5"/>' +
      '<path d="M26 62 Q60 30 94 62 Q60 94 26 62Z" stroke-width="2"/><circle cx="60" cy="62" r="9" fill="#74e0a0" fill-opacity=".85" class="sys-pupil"/></g>' +
      '<path class="sys-wave" d="M14 116 L30 116 L36 106 L44 124 L52 110 L60 118 L68 104 L76 122 L84 112 L90 116 L106 116" fill="none" stroke="#74e0a0" stroke-width="1.6"/>' +
      '<g fill="#74e0a0" fill-opacity=".08">' + Array.apply(null, Array(14)).map(function (_, i) { return '<rect y="' + (i * 10) + '" width="120" height="1"/>'; }).join("") + "</g></svg>";
  }

  function portrait(key) {
    var p = PEOPLE[key];
    if (!p) return "";
    if (p.sys) return sysIcon();
    var id = "pg" + (++uid), rim = p.rim, acc = p.acc || [], s = "";
    s += '<defs><radialGradient id="' + id + 'b" cx=".5" cy=".38" r=".7"><stop offset="0" stop-color="' + p.bg[0] + '"/><stop offset="1" stop-color="' + p.bg[1] + '"/></radialGradient>' +
      '<radialGradient id="' + id + 'g" cx=".5" cy=".4" r=".5"><stop offset="0" stop-color="' + rim + '" stop-opacity=".28"/><stop offset="1" stop-color="' + rim + '" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#151a22"/><stop offset="1" stop-color="#07090c"/></linearGradient></defs>';
    s += '<rect width="120" height="140" fill="url(#' + id + 'b)"/><circle cx="60" cy="56" r="52" fill="url(#' + id + 'g)"/>';
    var skin = acc.indexOf("pale") >= 0 ? "#2a3036" : "#0d1117";
    var body = BODY[p.body] || BODY.coat;
    if (acc.indexOf("hoodie") >= 0) s += '<path d="M34 104 C30 86 40 78 60 78 C80 78 90 86 86 104 Z" fill="#10141b"/>';
    if (acc.indexOf("fur") >= 0) s += '<path d="M2 140 C2 108 20 92 60 90 C100 92 118 108 118 140 Z" fill="#141210"/>';
    s += '<path d="' + body + '" fill="url(#' + id + 's)"/>';
    s += '<path d="' + body.replace(/ Z$/, "") + '" fill="none" stroke="' + rim + '" stroke-opacity=".45" stroke-width="1.4"/>';
    if (acc.indexOf("fur") >= 0) s += '<path d="M16 110 L22 102 L28 108 L34 99 L40 106 L48 98 L54 104 L60 97 L66 104 L72 98 L80 106 L86 99 L92 108 L98 102 L104 110" fill="none" stroke="' + rim + '" stroke-opacity=".35" stroke-width="1.6"/>';
    if (acc.indexOf("shawl") >= 0) s += '<path d="M20 140 C28 112 44 104 60 104 C76 104 92 112 100 140" fill="none" stroke="' + rim + '" stroke-opacity=".3" stroke-width="5"/>';
    if (acc.indexOf("apron") >= 0) s += '<path d="M44 140 L46 108 L74 108 L76 140" fill="none" stroke="' + rim + '" stroke-opacity=".35" stroke-width="1.5"/>';
    if (acc.indexOf("ruff") >= 0) s += '<path d="M36 98 Q42 106 48 98 Q54 106 60 98 Q66 106 72 98 Q78 106 84 98" fill="none" stroke="' + rim + '" stroke-opacity=".6" stroke-width="2"/>';
    s += '<rect x="51" y="74" width="18" height="26" fill="' + skin + '"/>';
    if (acc.indexOf("collarHigh") >= 0) s += '<path d="M46 98 L50 84 L60 92 L70 84 L74 98" fill="#0b0f15" stroke="' + rim + '" stroke-opacity=".4" stroke-width="1.2"/>';
    if (acc.indexOf("lapel") >= 0) s += '<path d="M48 97 L60 118 L72 97" fill="none" stroke="' + rim + '" stroke-opacity=".5" stroke-width="1.4"/><path d="M60 118 L60 140" stroke="' + rim + '" stroke-opacity=".2"/>';
    var head = acc.indexOf("hoodFill") >= 0 ? "" : '<ellipse cx="60" cy="58" rx="21" ry="26" fill="' + skin + '"/>' +
      '<path d="M39 58 C39 40 48 32 60 32 C72 32 81 40 81 58" fill="none" stroke="' + rim + '" stroke-opacity=".55" stroke-width="1.4"/>';
    s += head;
    if (p.hair) {
      var hp = HAIR[p.hair];
      s += '<path d="' + hp + '" fill="#080b10"/><path d="' + hp + '" fill="none" stroke="' + rim + '" stroke-opacity=".5" stroke-width="1.2"/>';
    }
    if (acc.indexOf("hoodFill") >= 0) s += '<ellipse cx="60" cy="66" rx="16" ry="20" fill="#030405"/>';
    if (acc.indexOf("stud") >= 0) s += '<g class="stud"><circle cx="38.5" cy="66" r="1.8" fill="#e8f4ff"/><path d="M38.5 61 L38.5 71 M33.5 66 L43.5 66" stroke="#e8f4ff" stroke-opacity=".7" stroke-width=".7"/></g>';
    if (acc.indexOf("round") >= 0) s += '<path d="M40 70 Q60 92 80 70" fill="none" stroke="' + rim + '" stroke-opacity=".2" stroke-width="1.2"/>';
    if (acc.indexOf("glasses") >= 0) s += '<g fill="none" stroke="' + rim + '" stroke-opacity=".7" stroke-width="1.3"><circle cx="52" cy="58" r="5.5"/><circle cx="68" cy="58" r="5.5"/><path d="M57.5 58 L62.5 58"/></g>';
    if (acc.indexOf("mask") >= 0) s += '<path d="M40 54 Q50 46 60 54 Q70 46 80 54 Q78 64 68 62 Q60 58 52 62 Q42 64 40 54Z" fill="' + rim + '" fill-opacity=".55"/><path d="M80 54 L92 44" stroke="' + rim + '" stroke-opacity=".6"/>';
    if (acc.indexOf("bows") >= 0) s += '<g fill="' + rim + '" fill-opacity=".7"><path d="M36 40 L28 34 L28 46Z M36 40 L44 34 L44 46Z"/><path d="M84 40 L76 34 L76 46Z M84 40 L92 34 L92 46Z"/></g>';
    acc.forEach(function (a) {
      if (a.indexOf("armband:") === 0) {
        var n = a.split(":")[1];
        s += '<g transform="rotate(-18 22 122)"><rect x="6" y="116" width="32" height="11" fill="#1a1410" stroke="' + rim + '" stroke-opacity=".7"/><text x="22" y="124.5" font-size="8" text-anchor="middle" fill="' + rim + '" font-family="Georgia,serif">' + n + "</text></g>";
      }
    });
    if (acc.indexOf("smoke") >= 0) s += '<path class="smoke-p" d="M94 92 C90 82 98 76 94 66 C91 58 97 52 94 44" fill="none" stroke="#c8d0d8" stroke-opacity=".22" stroke-width="2" stroke-linecap="round"/><circle cx="94" cy="94" r="1.6" fill="#ff8a3a"/>';
    if (acc.indexOf("shards") >= 0) s += '<g stroke="#b8e0f0" stroke-opacity=".6" fill="none"><path d="M20 20 L50 70 L30 130"/><path d="M100 10 L70 60 L96 120"/><path d="M50 70 L70 60"/></g>';
    return '<svg viewBox="0 0 120 140" aria-hidden="true">' + s + "</svg>";
  }

  /* ================= 场景背景 ================= */
  var VB = "0 0 1600 900";
  function stars(n, seed, maxY) { var r = rng(seed), s = ""; for (var i = 0; i < n; i++) s += '<circle cx="' + (r() * 1600).toFixed(0) + '" cy="' + (r() * maxY).toFixed(0) + '" r="' + (r() * 1.4 + 0.3).toFixed(1) + '" opacity="' + (r() * 0.6 + 0.2).toFixed(2) + '"/>'; return '<g fill="#dfe8f0">' + s + "</g>"; }
  function pines(n, seed, x0, x1, y0, y1, h0, h1, fill) {
    var r = rng(seed), s = "";
    for (var i = 0; i < n; i++) {
      var x = x0 + r() * (x1 - x0), h = h0 + r() * (h1 - h0), w = h * 0.42, b = y0 + r() * (y1 - y0);
      s += '<path d="M' + x.toFixed(0) + " " + (b - h).toFixed(0) + " l" + (w * 0.22).toFixed(0) + " " + (h * 0.26).toFixed(0) + " h" + (-w * 0.12).toFixed(0) + " l" + (w * 0.27).toFixed(0) + " " + (h * 0.26).toFixed(0) + " h" + (-w * 0.17).toFixed(0) + " l" + (w * 0.3).toFixed(0) + " " + (h * 0.34).toFixed(0) + " h" + (-w * 1.34).toFixed(0) + " l" + (w * 0.3).toFixed(0) + " " + (-h * 0.34).toFixed(0) + " h" + (-w * 0.17).toFixed(0) + " l" + (w * 0.27).toFixed(0) + " " + (-h * 0.26).toFixed(0) + " h" + (-w * 0.12).toFixed(0) + 'Z"/>';
    }
    return '<g fill="' + fill + '">' + s + "</g>";
  }
  function grad(id, stops, vertical) {
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (vertical === false ? 1 : 0) + '" y2="' + (vertical === false ? 0 : 1) + '">' +
      stops.map(function (st) { return '<stop offset="' + st[0] + '" stop-color="' + st[1] + '"' + (st[2] != null ? ' stop-opacity="' + st[2] + '"' : "") + "/>"; }).join("") + "</linearGradient>";
  }
  function rgrad(id, c, o) { return '<radialGradient id="' + id + '" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="' + c + '" stop-opacity="' + o + '"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>'; }
  var BLUR = '<filter id="bl8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter><filter id="bl3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>';

  var BG = {};
  BG.cabin = function () {
    var r = rng(3), planks = "", tools = "", cups = "";
    for (var x = 0; x < 1600; x += 46) planks += '<rect x="' + x + '" y="0" width="44" height="640" fill="#2a1a10" opacity="' + (0.5 + r() * 0.4).toFixed(2) + '"/><line x1="' + x + '" y1="0" x2="' + x + '" y2="640" stroke="#120a05" stroke-width="2"/>';
    for (var i = 0; i < 13; i++) { var cx = 470 + i * 52; cups += '<path d="M' + cx + ' 600 l-8 -26 h16 z M' + cx + ' 600 v14 M' + (cx - 7) + ' 614 h14" stroke="#e8d0a0" stroke-opacity=".55" fill="#e8d0a0" fill-opacity=".14" stroke-width="1.5"/>'; }
    tools = '<g fill="none" stroke="#0e0804" stroke-width="7" stroke-linecap="round"><path d="M260 150 C240 120 250 90 230 70 M260 150 C280 120 270 90 290 70 M252 120 l-22 -10 M268 120 l22 -10"/><path d="M1180 120 L1400 170"/><path d="M1210 230 c40 -30 80 -30 120 0 c-40 30 -80 30 -120 0z"/></g>' +
      '<g fill="#0e0804"><rect x="1240" y="300" width="20" height="60"/><circle cx="1250" cy="380" r="22"/><path d="M640 120 l14 50 l-28 0z M720 110 l12 60 l-24 0z"/></g>';
    return SVG(VB, "<defs>" + grad("cb-w", [[0, "#3a2414"], [1, "#160d07"]]) + rgrad("cb-f", "#ff8a30", 0.7) + rgrad("cb-l", "#ffc070", 0.5) + BLUR + "</defs>" +
      '<rect width="1600" height="900" fill="url(#cb-w)"/>' + planks +
      '<g><rect x="80" y="170" width="200" height="230" fill="#0b1018"/><rect x="80" y="170" width="200" height="230" fill="none" stroke="#120a05" stroke-width="10"/><line x1="180" y1="170" x2="180" y2="400" stroke="#120a05" stroke-width="7"/><line x1="80" y1="285" x2="280" y2="285" stroke="#120a05" stroke-width="7"/>' + stars(24, 9, 0).replace(/cy="0"/g, 'cy="250"') + '<path d="M84 400 Q180 370 276 400Z" fill="#dfe8f0" opacity=".5"/></g>' +
      tools +
      '<circle cx="1330" cy="640" r="320" fill="url(#cb-f)" class="bg-flicker"/><rect x="1220" y="470" width="240" height="200" fill="#120a05"/><rect x="1260" y="540" width="160" height="110" fill="#ff8a30" opacity=".75" class="bg-flicker" filter="url(#bl3)"/><path d="M1290 650 q20 -60 40 -10 q14 -50 34 0 q16 -40 30 0" fill="#ffd27a" opacity=".85" class="bg-flicker"/>' +
      '<circle cx="800" cy="300" r="260" fill="url(#cb-l)" class="bg-flicker"/><path d="M800 0 L800 220" stroke="#120a05" stroke-width="3"/><path d="M780 220 h40 l-8 30 h-24z" fill="#3a2414"/><circle cx="800" cy="262" r="14" fill="#ffd28a" class="bg-flicker"/>' +
      '<rect y="640" width="1600" height="260" fill="#1a0f08"/><path d="M380 616 L1220 616 L1290 700 L310 700 Z" fill="#e8dcc0" opacity=".16"/><rect x="380" y="612" width="840" height="8" fill="#2a1a10"/>' + cups +
      '<g transform="translate(990 560)"><rect width="74" height="48" rx="8" fill="#3a2414" stroke="#120a05" stroke-width="3"/><rect x="40" y="8" width="26" height="16" rx="2" fill="#ffc070" opacity=".6"/><rect x="8" y="8" width="26" height="32" fill="#1a0f08"/></g>');
  };
  BG.snow = function () {
    return SVG(VB, "<defs>" + grad("sn-s", [[0, "#05080d"], [0.6, "#16202e"], [1, "#2a3646"]]) + grad("sn-g", [[0, "#56677c"], [1, "#161d27"]]) + rgrad("sn-w", "#ffb35a", 0.5) + BLUR + "</defs>" +
      '<rect width="1600" height="900" fill="url(#sn-s)"/><path d="M0 560 L200 430 L330 480 L520 350 L700 470 L880 380 L1060 460 L1240 340 L1420 430 L1600 380 V700 H0Z" fill="#1c2634"/>' +
      pines(60, 5, 0, 1600, 600, 640, 50, 130, "#0b1119") + '<path d="M0 650 Q500 610 900 640 T1600 625 V900 H0Z" fill="url(#sn-g)"/>' +
      '<ellipse cx="820" cy="652" rx="160" ry="18" fill="url(#sn-w)" class="bg-flicker"/><rect x="740" y="585" width="160" height="66" fill="#090c11"/><polygon points="724,592 820,530 916,592" fill="#07090d"/><polygon points="720,594 820,526 920,594 910,597 820,536 730,597" fill="#dfe8f0" opacity=".75"/>' +
      '<g class="bg-flicker"><rect x="756" y="606" width="26" height="18" fill="#ffbf6a"/><rect x="858" y="606" width="26" height="18" fill="#ffbf6a"/><rect x="752" y="602" width="34" height="26" fill="#ff9a3c" filter="url(#bl8)"/><rect x="854" y="602" width="34" height="26" fill="#ff9a3c" filter="url(#bl8)"/></g>');
  };
  BG.village = function () {
    var r = rng(11), houses = "";
    for (var i = 0; i < 9; i++) {
      var x = 60 + i * 175 + r() * 40, w = 110 + r() * 50, h = 90 + r() * 70, y = 640 - h, tilt = (r() - 0.5) * 6;
      houses += '<g transform="rotate(' + tilt.toFixed(1) + " " + (x + w / 2).toFixed(0) + ' 640)"><rect x="' + x.toFixed(0) + '" y="' + y.toFixed(0) + '" width="' + w.toFixed(0) + '" height="' + h.toFixed(0) + '" fill="#0e0f12"/><polygon points="' + (x - 12).toFixed(0) + "," + y.toFixed(0) + " " + (x + w / 2).toFixed(0) + "," + (y - 60 - r() * 30).toFixed(0) + " " + (x + w + 12).toFixed(0) + "," + y.toFixed(0) + '" fill="#0a0a0d"/>' +
        (r() < 0.4 ? '<rect class="bg-flicker" x="' + (x + w * 0.35).toFixed(0) + '" y="' + (y + h * 0.3).toFixed(0) + '" width="16" height="20" fill="#d8a050" opacity=".55"/>' : "") + "</g>";
    }
    return SVG(VB, "<defs>" + grad("vl-s", [[0, "#0d0e12"], [0.7, "#24262c"], [1, "#2e3036"]]) + grad("vl-fog", [[0, "#9aa0a8", 0], [0.5, "#9aa0a8", 0.25], [1, "#9aa0a8", 0]]) + "</defs>" +
      '<rect width="1600" height="900" fill="url(#vl-s)"/><circle cx="1260" cy="160" r="46" fill="#c8ccd2" opacity=".18"/>' +
      '<path d="M0 600 Q400 560 800 590 T1600 570 V900 H0Z" fill="#141518"/>' + houses +
      '<g stroke="#08090b" stroke-width="6" fill="none"><path d="M1460 640 L1460 470 M1460 520 L1420 480 M1460 500 L1500 450 M1460 560 L1510 530"/><path d="M200 640 L200 500 M200 540 L160 510"/></g>' +
      '<g transform="translate(1000 640) rotate(-8)"><rect x="-6" y="-120" width="10" height="120" fill="#0a0a0c"/><rect x="-60" y="-120" width="110" height="40" fill="#121216"/><text x="-5" y="-94" font-size="18" fill="#6a6a70" text-anchor="middle" font-family="Georgia,serif">Ʒ∂ŋ ꝸ</text></g>' +
      '<rect y="520" width="1600" height="220" fill="url(#vl-fog)"/><rect y="640" width="1600" height="260" fill="#0b0c0e"/>');
  };
  BG.fog = function () {
    var r = rng(21), stones = "";
    for (var i = 0; i < 22; i++) {
      var x = r() * 1600, y = 600 + r() * 260, s = 0.5 + (y - 600) / 260 * 0.9, rot = (r() - 0.5) * 24;
      stones += '<g transform="translate(' + x.toFixed(0) + " " + y.toFixed(0) + ") rotate(" + rot.toFixed(0) + ") scale(" + s.toFixed(2) + ')">' +
        (r() < 0.35 ? '<path d="M-6 0 V-90 H6 V0Z M-30 -64 H30 V-52 H-30Z" fill="#0c0d10"/>' : '<path d="M-28 0 V-60 Q-28 -88 0 -88 Q28 -88 28 -60 V0Z" fill="#101114" stroke="#5a6068" stroke-opacity=".25"/>') + "</g>";
    }
    return SVG(VB, "<defs>" + grad("fg-s", [[0, "#0a0b0d"], [0.6, "#1c1e22"], [1, "#30333a"]]) + grad("fg-f", [[0, "#b0b4ba", 0], [0.5, "#b0b4ba", 0.3], [1, "#b0b4ba", 0]]) + "</defs>" +
      '<rect width="1600" height="900" fill="url(#fg-s)"/><circle cx="380" cy="170" r="60" fill="#d0d4da" opacity=".2"/>' +
      '<g stroke="#08090b" stroke-width="8" fill="none" stroke-linecap="round"><path d="M1300 640 C1290 520 1310 450 1280 360 M1290 470 C1340 440 1380 420 1420 360 M1284 420 C1240 390 1220 360 1210 320"/></g>' +
      '<path d="M0 620 Q400 590 800 610 T1600 600 V900 H0Z" fill="#121316"/>' + stones +
      '<rect y="480" width="1600" height="300" fill="url(#fg-f)"/><rect y="700" width="1600" height="200" fill="url(#fg-f)" opacity=".6"/>');
  };
  BG.fire = function () {
    var r = rng(31), fl = "";
    for (var i = 0; i < 14; i++) { var x = r() * 1600, h = 120 + r() * 220; fl += '<path class="bg-flicker" d="M' + (x - 50).toFixed(0) + " 680 Q" + (x - 30).toFixed(0) + " " + (680 - h * 0.6).toFixed(0) + " " + x.toFixed(0) + " " + (680 - h).toFixed(0) + " Q" + (x + 30).toFixed(0) + " " + (680 - h * 0.6).toFixed(0) + " " + (x + 50).toFixed(0) + ' 680Z" fill="#ff7a2a" opacity="' + (0.35 + r() * 0.4).toFixed(2) + '"/>'; }
    return SVG(VB, "<defs>" + grad("fi-s", [[0, "#0d0605"], [0.6, "#3a140a"], [1, "#7a2a10"]]) + BLUR + "</defs>" +
      '<rect width="1600" height="900" fill="url(#fi-s)"/>' + BG._houses(41, "#0b0605") + '<g filter="url(#bl8)">' + fl + '</g><rect y="680" width="1600" height="220" fill="#0a0504"/>');
  };
  BG._houses = function (seed, fill) {
    var r = rng(seed), s = "";
    for (var i = 0; i < 8; i++) { var x = i * 200 + r() * 40, w = 120 + r() * 50, h = 100 + r() * 60; s += '<rect x="' + x.toFixed(0) + '" y="' + (680 - h).toFixed(0) + '" width="' + w.toFixed(0) + '" height="' + h.toFixed(0) + '" fill="' + fill + '"/><polygon points="' + (x - 10).toFixed(0) + "," + (680 - h).toFixed(0) + " " + (x + w / 2).toFixed(0) + "," + (620 - h - r() * 30).toFixed(0) + " " + (x + w + 10).toFixed(0) + "," + (680 - h).toFixed(0) + '" fill="' + fill + '"/>'; }
    return s;
  };
  BG.sea = function () {
    var r = rng(51), floes = "";
    for (var i = 0; i < 26; i++) { var x = r() * 1600, y = 690 + r() * 200, w = 40 + r() * 140; floes += '<path d="M' + x.toFixed(0) + " " + y.toFixed(0) + " l" + w.toFixed(0) + " -6 l" + (w * 0.2).toFixed(0) + " 10 l" + (-w * 1.1).toFixed(0) + ' 6z" fill="#c8d8e6" opacity="' + (0.25 + r() * 0.35).toFixed(2) + '"/>'; }
    return SVG(VB, "<defs>" + grad("se-s", [[0, "#04070c"], [0.55, "#142234"], [1, "#2a4058"]]) + grad("se-i", [[0, "#6a8098"], [1, "#16222e"]]) + grad("se-au", [[0, "#74e0a0", 0], [0.5, "#74e0c0", 0.18], [1, "#74e0a0", 0]], false) + "</defs>" +
      '<rect width="1600" height="900" fill="url(#se-s)"/>' + stars(70, 52, 400) + '<path class="bg-aurora" d="M0 160 C300 90 600 220 900 140 S1400 90 1600 170 L1600 260 C1300 200 1000 300 700 230 S200 220 0 280Z" fill="url(#se-au)"/>' +
      '<path d="M1080 640 L1160 520 L1230 560 L1320 480 L1440 640Z" fill="#0d141c"/><path d="M1160 520 L1180 540 L1230 560 L1200 545Z M1320 480 L1340 510 L1300 505Z" fill="#c8d8e6" opacity=".4"/>' +
      '<path d="M0 640 H1600 V900 H0Z" fill="url(#se-i)"/>' + floes +
      '<g transform="translate(380 420)"><path d="M0 220 L560 220 L520 300 L40 300Z" fill="#0b0f14"/><path d="M0 220 L560 220" stroke="#c8d8e6" stroke-opacity=".35" stroke-width="3"/>' +
      '<g stroke="#0b0f14" stroke-width="10"><line x1="160" y1="220" x2="160" y2="-40"/><line x1="360" y1="220" x2="360" y2="-80"/></g><g stroke="#0b0f14" stroke-width="5"><line x1="90" y1="20" x2="230" y2="20"/><line x1="270" y1="-20" x2="450" y2="-20"/><line x1="160" y1="-40" x2="560" y2="200"/><line x1="360" y1="-80" x2="0" y2="210"/></g>' +
      '<path d="M100 30 Q160 80 220 30 L220 120 Q160 150 100 120Z M280 -10 Q360 40 440 -10 L440 110 Q360 140 280 110Z" fill="#d8e2ea" opacity=".22"/>' +
      '<rect class="bg-flicker" x="440" y="236" width="16" height="12" fill="#ffbf6a" opacity=".7"/><rect class="bg-flicker" x="200" y="236" width="16" height="12" fill="#ffbf6a" opacity=".5"/></g>' +
      '<path d="M300 724 Q660 700 1020 726" stroke="#e8f0f6" stroke-opacity=".3" stroke-width="4" fill="none"/>');
  };
  BG.rest = function () {
    return SVG(VB, "<defs>" + grad("rs-w", [[0, "#3a2c1e"], [1, "#16100b"]]) + rgrad("rs-l", "#ffd090", 0.45) + BLUR + "</defs>" +
      '<rect width="1600" height="900" fill="url(#rs-w)"/><g opacity=".25">' + Array.apply(null, Array(20)).map(function (_, i) { return '<rect x="' + i * 80 + '" y="0" width="2" height="640" fill="#120c07"/>'; }).join("") + "</g>" +
      '<circle cx="800" cy="150" r="300" fill="url(#rs-l)"/><path d="M800 0 V90" stroke="#120c07" stroke-width="3"/><path d="M740 90 h120 l-30 40 h-60z" fill="#d8b070" opacity=".8"/>' +
      '<g transform="translate(1040 160)"><rect width="300" height="90" rx="6" fill="#f2ece0" opacity=".9"/><text x="150" y="58" font-size="40" text-anchor="middle" fill="#b3241e" font-family="Songti SC,STSong,SimSun,serif" font-weight="700" letter-spacing="4">住宿暖气 餐饮</text><rect width="300" height="90" rx="6" fill="#fff" opacity=".25" filter="url(#bl8)"/></g>' +
      '<g><rect x="120" y="200" width="240" height="280" fill="#0b1018"/><rect x="120" y="200" width="240" height="280" fill="none" stroke="#120c07" stroke-width="12"/>' + '<path d="M124 476 Q240 440 356 476Z" fill="#dfe8f0" opacity=".45"/></g>' +
      '<rect y="640" width="1600" height="260" fill="#1a120b"/><rect x="560" y="520" width="520" height="150" fill="#2a1c10" stroke="#120c07" stroke-width="4"/><rect x="560" y="520" width="520" height="14" fill="#4a3420"/>' +
      '<g transform="translate(980 470)"><rect width="40" height="50" fill="#120c07"/><circle cx="20" cy="22" r="13" fill="#e8dcc0" opacity=".7"/><path d="M20 22 V14 M20 22 L26 25" stroke="#120c07" stroke-width="2"/></g>');
  };
  BG.system = function () {
    return SVG(VB, "<defs>" + grad("sy-w", [[0, "#0a1214"], [1, "#030607"]]) + rgrad("sy-l", "#9af0e0", 0.35) + "</defs>" +
      '<rect width="1600" height="900" fill="url(#sy-w)"/><g stroke="#74e0c8" stroke-opacity=".06">' + Array.apply(null, Array(34)).map(function (_, i) { return '<line x1="' + i * 50 + '" y1="0" x2="' + i * 50 + '" y2="900"/>'; }).join("") + "</g>" +
      '<circle cx="800" cy="260" r="340" fill="url(#sy-l)" class="bg-flicker"/><path d="M800 0 V170" stroke="#1a2a2c" stroke-width="3"/><circle cx="800" cy="186" r="16" fill="#d8fff4" class="bg-flicker"/>' +
      '<g transform="translate(620 300)"><rect width="360" height="400" fill="#0b1416" stroke="#2a3c40" stroke-width="6"/><rect x="130" y="60" width="100" height="50" fill="#030607" stroke="#2a3c40" stroke-width="4"/><g stroke="#2a3c40" stroke-width="5"><line x1="155" y1="60" x2="155" y2="110"/><line x1="180" y1="60" x2="180" y2="110"/><line x1="205" y1="60" x2="205" y2="110"/></g><circle cx="320" cy="210" r="10" fill="#2a3c40"/></g>' +
      '<rect x="160" y="620" width="300" height="40" fill="#0b1416" stroke="#2a3c40" stroke-width="3"/><rect y="700" width="1600" height="200" fill="#050909"/><path d="M0 700 H1600" stroke="#74e0c8" stroke-opacity=".15"/>' +
      '<text x="1420" y="120" font-size="22" fill="#74e0a0" opacity=".35" font-family="Georgia,serif" text-anchor="end" letter-spacing="6">CONFINEMENT · 禁闭室</text>');
  };
  BG.twin = function () {
    var r = rng(61), wins = "";
    [[460, 140, 220], [920, 100, 220]].forEach(function (t) {
      for (var y = t[1] + 20; y < 860; y += 26) for (var x = t[0] + 16; x < t[0] + t[2] - 16; x += 24) if (r() < 0.45) wins += '<rect x="' + x + '" y="' + y + '" width="12" height="14" fill="#9af0e0" opacity="' + (0.15 + r() * 0.5).toFixed(2) + '"/>';
    });
    return SVG(VB, "<defs>" + grad("tw-s", [[0, "#02040a"], [1, "#101c2a"]]) + "</defs>" +
      '<rect width="1600" height="900" fill="url(#tw-s)"/>' + stars(60, 62, 500) + '<rect x="460" y="140" width="220" height="760" fill="#070b12"/><rect x="920" y="100" width="220" height="800" fill="#070b12"/>' + wins +
      '<rect x="680" y="420" width="240" height="18" fill="#0a1018"/><circle cx="570" cy="132" r="5" fill="#ff4040" class="bg-flicker"/><circle cx="1030" cy="92" r="5" fill="#ff4040" class="bg-flicker"/>' +
      '<g fill="#05080e">' + Array.apply(null, Array(16)).map(function (_, i) { var h = 120 + r() * 220; return '<rect x="' + (i * 105 - 20) + '" y="' + (900 - h).toFixed(0) + '" width="90" height="' + h.toFixed(0) + '"/>'; }).join("") + "</g>");
  };
  BG.school = function () {
    var r = rng(71), wins = "", dream = "";
    for (var y = 300; y < 560; y += 60) for (var x = 780; x < 1500; x += 70) wins += '<rect x="' + x + '" y="' + y + '" width="40" height="34" fill="' + (r() < 0.3 ? "#ffd090" : "#2a2a3a") + '" opacity="' + (0.5 + r() * 0.4).toFixed(2) + '"/>';
    dream = '<g opacity=".55" class="bg-float"><rect x="200" y="160" width="90" height="56" fill="#3a2a4a" transform="rotate(-14 245 188)"/><rect x="214" y="216" width="8" height="40" fill="#3a2a4a" transform="rotate(-14 245 188)"/><circle cx="520" cy="120" r="34" fill="none" stroke="#c8a8e8" stroke-width="5"/><circle cx="520" cy="120" r="12" fill="#c8a8e8"/>' +
      '<path d="M380 260 l30 -50 l30 50z" fill="#4a3a5a" transform="rotate(20 410 240)"/></g>';
    return SVG(VB, "<defs>" + grad("sc-s", [[0, "#1a1430"], [0.6, "#6a3a4a"], [1, "#d07a50"]]) + grad("sc-g", [[0, "#3a4a3a"], [1, "#141a14"]]) + "</defs>" +
      '<rect width="1600" height="900" fill="url(#sc-s)"/><circle cx="420" cy="560" r="70" fill="#ffb070" opacity=".5"/>' +
      '<rect x="760" y="240" width="760" height="380" fill="#16141e"/><rect x="760" y="230" width="760" height="16" fill="#0e0c14"/>' + wins +
      '<rect x="1100" y="160" width="80" height="80" fill="#16141e"/><circle cx="1140" cy="200" r="24" fill="#e8dcc0" opacity=".6"/>' +
      '<path d="M0 620 H1600 V900 H0Z" fill="url(#sc-g)"/><ellipse cx="500" cy="760" rx="520" ry="90" fill="none" stroke="#c87050" stroke-opacity=".5" stroke-width="22"/><ellipse cx="500" cy="760" rx="440" ry="60" fill="none" stroke="#e8dcc0" stroke-opacity=".2" stroke-width="2"/>' +
      '<rect x="1160" y="660" width="150" height="40" fill="#1e3a2a"/><rect x="1180" y="640" width="150" height="30" fill="#24443a"/>' + dream);
  };
  BG.castle = function () {
    return SVG(VB, "<defs>" + grad("ca-s", [[0, "#05030a"], [0.6, "#1c1020"], [1, "#3a1a26"]]) + rgrad("ca-m", "#e8d8c8", 0.35) + "</defs>" +
      '<rect width="1600" height="900" fill="url(#ca-s)"/>' + stars(50, 81, 360) + '<circle cx="1240" cy="170" r="120" fill="url(#ca-m)"/><circle cx="1240" cy="170" r="40" fill="#e8dcd0" opacity=".55"/>' +
      '<path d="M0 700 Q400 600 800 640 T1600 620 V900 H0Z" fill="#0c0610"/>' +
      '<g fill="#08040a"><rect x="560" y="360" width="480" height="300"/><rect x="520" y="260" width="90" height="400"/><rect x="990" y="240" width="90" height="420"/><rect x="760" y="200" width="80" height="460"/>' +
      '<polygon points="510,262 565,170 620,262"/><polygon points="980,242 1035,140 1090,242"/><polygon points="750,202 800,90 850,202"/>' +
      '<path d="M560 360 l0 -20 h30 v20 h30 v-20 h30 v20 h30 v-20 h30 v20 h30 v-20 h30 v20 h30 v-20 h30 v20 h30 v-20 h30 v20 h30 v-20 h30 v20 h30 v-20 h30 v20 h30 v-20 h30 v20z"/></g>' +
      '<g class="bg-flicker" fill="#ffb060"><rect x="550" y="320" width="14" height="26" opacity=".7"/><rect x="1020" y="300" width="14" height="26" opacity=".6"/><rect x="790" y="260" width="14" height="26" opacity=".8"/><rect x="640" y="440" width="18" height="30" opacity=".5"/><rect x="900" y="440" width="18" height="30" opacity=".7"/><rect x="770" y="520" width="60" height="140" rx="30" opacity=".35"/></g>' +
      '<path d="M800 660 C760 740 600 800 520 900" stroke="#2a1a24" stroke-width="30" fill="none"/>' +
      '<g transform="translate(440 790)" fill="#030204"><rect x="0" y="0" width="120" height="60" rx="10"/><circle cx="24" cy="66" r="20"/><circle cx="100" cy="66" r="20"/><path d="M-90 30 q30 -60 60 -10 l20 0 l-20 30z"/></g>');
  };
  BG.ballroom = function () {
    var r = rng(91), chand = "";
    [400, 800, 1200].forEach(function (x) { chand += '<g class="bg-flicker"><path d="M' + x + ' 0 V80" stroke="#3a2a10" stroke-width="3"/><ellipse cx="' + x + '" cy="110" rx="90" ry="30" fill="none" stroke="#e8c070" stroke-opacity=".6" stroke-width="3"/>' + Array.apply(null, Array(9)).map(function (_, i) { var a = i / 9 * 6.283; return '<circle cx="' + (x + Math.cos(a) * 90).toFixed(0) + '" cy="' + (110 + Math.sin(a) * 30).toFixed(0) + '" r="5" fill="#ffd890"/>'; }).join("") + '<circle cx="' + x + '" cy="110" r="140" fill="url(#br-l)"/></g>'; });
    return SVG(VB, "<defs>" + grad("br-w", [[0, "#2a1016"], [1, "#0e0507"]]) + rgrad("br-l", "#ffd890", 0.25) + "</defs>" +
      '<rect width="1600" height="900" fill="url(#br-w)"/><g fill="#1a080c">' + [100, 360, 1180, 1440].map(function (x) { return '<rect x="' + x + '" y="0" width="70" height="900"/>'; }).join("") + "</g>" +
      '<g fill="#3a1a20" opacity=".6">' + [180, 1240].map(function (x) { return '<path d="M' + x + ' 160 h180 v360 q-90 60 -180 0z"/>'; }).join("") + "</g>" + chand +
      '<rect y="680" width="1600" height="220" fill="#140608"/><g opacity=".5">' + Array.apply(null, Array(12)).map(function (_, i) { return '<path d="M' + (i * 140) + ' 680 L' + (i * 140 - 200) + ' 900" stroke="#3a1a20" stroke-width="2"/>'; }).join("") + "</g>" +
      '<g fill="#050203" opacity=".9">' + Array.apply(null, Array(8)).map(function (_, i) { var x = 260 + i * 150 + r() * 40, h = 150 + r() * 40; return '<ellipse cx="' + x.toFixed(0) + '" cy="' + (700 - h).toFixed(0) + '" rx="16" ry="20"/><path d="M' + (x - 34).toFixed(0) + " 700 Q" + (x - 30).toFixed(0) + " " + (700 - h + 26).toFixed(0) + " " + x.toFixed(0) + " " + (700 - h + 22).toFixed(0) + " Q" + (x + 30).toFixed(0) + " " + (700 - h + 26).toFixed(0) + " " + (x + 34).toFixed(0) + ' 700Z"/>'; }).join("") + "</g>");
  };
  BG.casino = function () {
    var r = rng(101), chips = "";
    for (var i = 0; i < 30; i++) chips += '<ellipse cx="' + (r() * 1600).toFixed(0) + '" cy="' + (720 + r() * 160).toFixed(0) + '" rx="14" ry="5" fill="' + ["#b3241e", "#e8c070", "#2a6a4a"][i % 3] + '" opacity=".5"/>';
    return SVG(VB, "<defs>" + grad("cs2-w", [[0, "#2a0a0e"], [1, "#0a0204"]]) + rgrad("cs2-l", "#ffb060", 0.35) + "</defs>" +
      '<rect width="1600" height="900" fill="url(#cs2-w)"/><circle cx="800" cy="200" r="400" fill="url(#cs2-l)"/>' +
      '<g transform="translate(560 120)"><rect width="480" height="90" rx="8" fill="#140406" stroke="#e8c070" stroke-opacity=".6" stroke-width="3"/><text x="240" y="62" font-size="46" text-anchor="middle" fill="#e8c070" font-family="Georgia,serif" letter-spacing="14" class="bg-flicker">CASINO</text></g>' +
      '<ellipse cx="800" cy="680" rx="420" ry="110" fill="#0e3a26"/><ellipse cx="800" cy="680" rx="420" ry="110" fill="none" stroke="#3a1a0a" stroke-width="20"/>' +
      '<g transform="translate(800 670)"><circle r="60" fill="#1a0a06" stroke="#e8c070" stroke-opacity=".6" stroke-width="3"/><g class="bg-spin">' + Array.apply(null, Array(12)).map(function (_, i) { return '<path d="M0 0 L' + (Math.cos(i / 12 * 6.283) * 56).toFixed(1) + " " + (Math.sin(i / 12 * 6.283) * 56).toFixed(1) + '" stroke="#e8c070" stroke-opacity=".4"/>'; }).join("") + "</g></g>" + chips);
  };
  BG.math = function () {
    var r = rng(111), mirrors = "";
    [[260, 600], [1180, 620], [1420, 640]].forEach(function (m) {
      mirrors += '<g transform="translate(' + m[0] + " " + m[1] + ')"><ellipse cx="0" cy="-90" rx="46" ry="90" fill="#9ab8c8" opacity=".22" stroke="#d8c890" stroke-opacity=".6" stroke-width="5"/><path d="M-20 -150 L12 -40" stroke="#ffffff" stroke-opacity=".25" stroke-width="6"/><rect x="-4" y="0" width="8" height="30" fill="#0a0c10"/>' +
        '<path d="M-10 -40 q10 -30 20 0 v30 h-20z" fill="#0a0c10" opacity=".6"/></g>';
    });
    return SVG(VB, "<defs>" + grad("ma-s", [[0, "#0e1424"], [0.55, "#3a3a54"], [1, "#8a6a6a"]]) + grad("ma-sea", [[0, "#3a4a60"], [1, "#0e1420"]]) + "</defs>" +
      '<rect width="1600" height="900" fill="url(#ma-s)"/><path d="M0 520 H1600 V620 H0Z" fill="url(#ma-sea)"/><path d="M0 540 Q400 530 800 545 T1600 535" stroke="#c8d0e0" stroke-opacity=".2" fill="none" stroke-width="2"/>' +
      '<g transform="translate(620 300)"><rect width="300" height="320" fill="#141420"/><polygon points="-30,0 150,-110 330,0" fill="#0e0e18"/><rect x="40" y="60" width="60" height="70" fill="#ffd090" opacity=".55" class="bg-flicker"/><rect x="200" y="60" width="60" height="70" fill="#2a2a3a"/><rect x="40" y="180" width="60" height="70" fill="#2a2a3a"/><rect x="200" y="180" width="60" height="70" fill="#ffd090" opacity=".4" class="bg-flicker"/><rect x="130" y="220" width="44" height="100" fill="#0a0a12"/></g>' +
      '<rect y="620" width="1600" height="280" fill="#16141c"/>' + mirrors +
      '<g stroke="#0a0a10" stroke-width="6"><line x1="480" y1="620" x2="480" y2="430"/><line x1="1000" y1="620" x2="1000" y2="430"/></g><circle cx="480" cy="424" r="10" fill="#ffd090" opacity=".7" class="bg-flicker"/><circle cx="1000" cy="424" r="10" fill="#ffd090" opacity=".7" class="bg-flicker"/>');
  };
  BG.core = function () {
    var r = rng(121), roofs = "", shadows = "";
    for (var i = 0; i < 18; i++) { var x = i * 95 - 20, h = 80 + r() * 160; roofs += '<rect x="' + x + '" y="' + (700 - h).toFixed(0) + '" width="88" height="' + h.toFixed(0) + '" fill="#0a0506"/>' + (r() < 0.5 ? '<rect x="' + (x + 30) + '" y="' + (720 - h).toFixed(0) + '" width="10" height="12" fill="#ff6a50" opacity=".4"/>' : ""); }
    for (var j = 0; j < 3; j++) { var sx = 520 + j * 220; shadows += '<ellipse cx="' + sx + '" cy="780" rx="14" ry="5" fill="#000"/><path d="M' + sx + ' 780 L' + (sx + 260) + ' 860 L' + (sx + 236) + ' 870 Z" fill="#000" opacity=".55"/>'; }
    return SVG(VB, "<defs>" + grad("co-s", [[0, "#05020a"], [0.6, "#1a0810"], [1, "#3a0e10"]]) + rgrad("co-m", "#f0e0c8", 0.4) + BLUR + "</defs>" +
      '<rect width="1600" height="900" fill="url(#co-s)"/>' + stars(40, 122, 300) + '<circle cx="360" cy="180" r="150" fill="url(#co-m)"/><circle cx="360" cy="180" r="56" fill="#f0e6d8" opacity=".75"/>' +
      '<g transform="translate(1120 120)"><rect x="-30" y="0" width="60" height="600" fill="#0a0304"/><rect x="-60" y="560" width="120" height="40" fill="#0a0304"/><circle cy="-6" r="14" fill="#ff3030" class="bg-flicker"/><circle cy="200" r="6" fill="#ff3030" opacity=".7" class="bg-flicker"/><circle cy="380" r="6" fill="#ff3030" opacity=".7" class="bg-flicker"/><circle cy="-6" r="60" fill="#ff3030" opacity=".25" filter="url(#bl8)" class="bg-flicker"/></g>' +
      roofs + '<rect y="700" width="1600" height="200" fill="#070304"/>' + shadows +
      '<text x="80" y="830" font-size="30" fill="#e8dcc0" opacity=".22" font-family="Songti SC,STSong,SimSun,serif" letter-spacing="10">举杯邀明月　对影成三人</text>');
  };
  BG.dawn = function () {
    var r = rng(131), city = "";
    for (var i = 0; i < 40; i++) { var x = i * 41 - 10, h = 60 + r() * 220; city += '<rect x="' + x + '" y="' + (760 - h).toFixed(0) + '" width="38" height="' + h.toFixed(0) + '" fill="#0e0c12"/>'; for (var y = 770 - h; y < 750; y += 16) if (r() < 0.5) city += '<rect x="' + (x + 6 + (r() * 22 | 0)) + '" y="' + y.toFixed(0) + '" width="6" height="7" fill="#ffd690" opacity="' + (0.4 + r() * 0.6).toFixed(2) + '"/>'; }
    return SVG(VB, "<defs>" + grad("da-s", [[0, "#0a0e1e"], [0.55, "#3a3048"], [0.85, "#c87a50"], [1, "#f0b070"]]) + "</defs>" +
      '<rect width="1600" height="900" fill="url(#da-s)"/>' + stars(40, 132, 260) + city + '<rect y="760" width="1600" height="140" fill="#08070a"/>');
  };
  BG.death = function () {
    return SVG(VB, "<defs>" + rgrad("de-g", "#7a1010", 0.5) + "</defs>" +
      '<rect width="1600" height="900" fill="#0a0303"/><circle cx="800" cy="420" r="520" fill="url(#de-g)"/>' +
      '<g transform="translate(800 450)" opacity=".35"><rect x="-150" y="-200" width="300" height="400" fill="#e6d7b8"/><rect x="-150" y="-200" width="300" height="400" fill="#7a1010" opacity=".5"/><text y="-130" font-size="34" text-anchor="middle" fill="#3a0a0a" font-family="Songti SC,STSong,SimSun,serif" letter-spacing="10">准 考 证</text><path d="M-110 -40 H110 M-110 20 H110 M-110 80 H110" stroke="#3a0a0a" stroke-width="3" stroke-dasharray="8 6"/><circle cx="70" cy="120" r="50" fill="none" stroke="#b3241e" stroke-width="8"/><text x="70" y="134" font-size="34" text-anchor="middle" fill="#b3241e" font-weight="900">移除</text></g>');
  };
  BG.radio = function () { return ""; };
  var ALIAS = { jinbi: "system", invig: "twin" };
  var cache = {};
  function bg(name) {
    name = ALIAS[name] || name;
    if (cache[name] != null) return cache[name];
    var f = BG[name];
    return (cache[name] = f ? f() : "");
  }

  window.QQART = { portrait: portrait, faceFor: faceFor, people: PEOPLE, bg: bg, has: function (n) { return !!BG[ALIAS[n] || n]; } };
})();
