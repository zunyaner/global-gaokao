/* 第七部分：2号休息处 · 语文（举杯邀明月，对影成三人）· 结局 */
var ENDINGS = {
  dead:      { name: "移除",       hint: "身体状态归零，或在考场里做了不该做的事。",
               epi: "准考证上的名字褪成了白纸。很久以后才有人告诉你：考场死亡，不等于现实死亡——那天医院里醒来的人里，也许有你。" },
  end_pass:  { name: "待考",       hint: "在最后关头，选择留在原地。",
               epi: "你在休息处等到了屏幕熄灭的那一天。门外是一条普通的街，路灯一盏盏亮起来。你活着及格了。" },
  end_invig: { name: "监考官",     hint: "成绩足够优异时，系统会递来一封通知书。",
               epi: "你成了监考官，臂章上有一个新编号。154 的广播响起时，你是第一批举手说「炸」的人之一。" },
  end_yh:    { name: "同行",       hint: "和游惑足够亲近，在终局站到他身后。",
               epi: "他从不回头，但每次有东西扑过来，他的刀都先到。系统崩塌时，他说了句「还行」。于闻说，这是他哥夸人的最高级别。" },
  end_qj:    { name: "同考",       hint: "和秦究足够亲近，在终局替他守一扇门。",
               epi: "门外是系统，门里是他和游惑。他推门出来，冲你挑了挑眉：「这回，是满分。」" },
  end_true:  { name: "对影成三人", hint: "与两人都足够亲近，知道「考官A」的秘密，并见过他们真正的过去。",
               epi: "「我叫秦究，我来找我的真实。」——一万两千八百二十二个考场分崩离析。硝烟散尽，是万家灯火，是喧嚣人间。" }
};

function endingText(s, body) {
  return body + "\n\n——————\n考生：" + s.name + "　准考证：" + s.ticket +
    "\n最终分数：" + s.score + "　违规：" + s.viol + "　身体状态：" + s.hp;
}
var ENDING_CHOICES = [
  { text: "查看结局图鉴", next: "gallery" },
  { text: "重新领取准考证", next: "new" },
  { text: "返回封面", next: "title" }
];
var INVIG_SCORE = 55;

Object.assign(SCENES, {
final_gate: {
  loc: "2号休息处",
  bg: "rest",
  radio: "下一门考试科目：语文。",
  who: "楚月", whoClass: "npc",
  art: "shop",
  shop: SHOP_REST,
  enter: function(s){
    s.flags.invOffer = s.score >= INVIG_SCORE;
    if (!s.flags.gateHeal) { s.flags.gateHeal = true; s.hp = Math.min(100, s.hp + 30); }
  },
  text: function(s){
    var t = "2号休息处的老板，是那位拎菜刀的短发女人——楚月。原来她一直在。\n「游惑，」她把一本破旧的登记本递过去，「上一次，我是留在外面的那个。」\n游惑接过本子：「这次也一样。除了154，还要有一个足够默契的朋友留在外面，知道什么时候该做什么事。」\n154 晃着手机走进来：「入口我已经弄好了。进去之后会碰到什么考场，我没法预估——大概率是你们还没考的那门。语文。」\n另一边，秦究低声跟游惑说了句什么。游惑：「补偿我。」\n";
    if (s.flags.invOffer) t += "\n一封盖着系统印章的通知书落在你手里：【考生" + s.name + "，成绩优异，可申请转为监考官。】";
    return t;
  },
  choices: [
    { text: "跟游惑、秦究走进最后一门", next: "final_yuwen", if: { or: [{ minYh: 5 }, { minQj: 5 }] } },
    { text: "跟 154 去洗劫武器库", next: "final_armory" },
    { text: "接受通知书，转为监考官", next: "final_invig", if: { flag: "invOffer" } },
    { text: "留在休息处，等", next: "end_pass" }
  ]
},
final_invig: {
  loc: "监考区 · 新监考官",
  bg: "twin",
  who: "监考官 922", whoClass: "sys",
  text: "你换上了监考官的制服。922 教你怎么记违规，154 教你怎么开禁闭室——然后 154 就不见了。\n当天夜里，全区六万七千个广播器同时响了：\n【我是监考官154，全区六万七千个广播器暂时由我代管，我来播送一道指令。】\n【麻烦各位二选一，要么炸塔，要么进队。】\n【给你们1分钟时间考虑一下，是继续困束在这里，还是帮我们一起炸了它。】\n922 已经在往身上挂弹匣了。",
  choices: [
    { text: "「炸。」", next: "end_invig", flash: true },
    { text: "回宿舍，假装没听见", next: "end_pass" }
  ]
},
final_armory: {
  loc: "监考区 · 武器库",
  bg: "twin",
  radio: "监考区共有可移动武器12300箱。",
  who: "监考官 154", whoClass: "sys",
  text: "154 刷开武器库的门，像刷开自家冰箱。\n「监考官可自主动用的一共3700箱，防弹车400辆。」他一边点货一边念，「我们正在做一件有点疯狂的事。」\n922 扛起一箱：「洗劫武器库，说出去谁信。」\n021 递给你一把枪：「会用吗？不会就站我后面。」\n楚月留在休息处，手里攥着那本登记本。",
  hint: "终局不比谁胆子大。站对位置、护好身边的人，比冲在最前面更要紧。",
  choices: [
    { text: "扛一箱弹药上车", next: "final_broadcast", fx: { score: 3 } },
    { text: "帮 154 守住广播室", next: "final_broadcast", fx: { flag: { radio154: true }, qj: 1 } }
  ]
},
final_yuwen: {
  loc: "语文 · 非公开式单人考场",
  bg: "core",
  radio: "现在是考场时间17:30。",
  who: "系统", whoClass: "sys",
  text: "又是十七点三十分。和第一天一样。\n【检测到一位考生正在入场，下面宣读考试纪律。】\n【本考场为非公开式单人考场，同一时段内，有且只能有一位考生在此进行考试。】\n【本场考试时间：无标准时间。直到考生顺利通过或被淘汰为止。】\n【本场考试科目：语文。涉及知识点：诗词鉴赏。】\n——系统想把你们拆开。可你们是一起跨进来的。\n街上的居民大多数身份相同，每天为相似的事情奔波。月亮升起来，每个人脚下都拖着一个影子。影子在动。",
  art: "paper",
  paper: "诗词鉴赏：\n花间一壶酒，独酌无相亲。\n举杯邀明月，对影成三人。\n问：「三人」是谁？",
  hint: "李白一个人喝酒：自己、明月、影子。影子也算一个——它在这一场里是活的。",
  choices: [
    { text: "「我、明月、我的影子。」", next: "final_broadcast", fx: { score: 6, flag: { poemOk: true }, yh: 1, log: "你的影子站到了你身边。" } },
    { text: "「游惑、秦究，和我。」", next: "final_broadcast", fx: { yh: 1, qj: 1, hp: -20, log: "答错了。可你的影子，好像还是站到了你这边。" } },
    { text: "「……三个考生？」", next: "final_broadcast", fx: { hp: -40, log: "影子从你脚下站起来，掐住了你的脖子。" } }
  ]
},
final_broadcast: {
  loc: "终局 · 广播",
  bg: "core",
  radio: "我是监考官154，全区六万七千个广播器暂时由我代管。",
  who: "监考官 154", whoClass: "sys",
  text: "【我们正在做一件有点疯狂的事，鉴于我正用这种方式跟你们沟通，这件事是什么，你们应该都能明白。】\n【既然叫一声同事，我想你们应该不会介意在这个关头帮个小忙。】\n【监考区总在固定的日期下雪下雨，固定的时刻天黑天亮。千篇一律的风景你们看了好几年，也该看腻了吧。】\n【给你们1分钟时间考虑一下，是继续困束在这里，还是帮我们一起炸了它。】\n一分钟后，整个监考区的灯，一盏接一盏亮了。",
  choices: [
    { text: "跟着车队冲向主控中心", next: "final_core" }
  ]
},
final_core: {
  loc: "终局 · 主控中心",
  bg: "core",
  radio: "主控中心检测到实质性危险，攻击和防御程序自动开启，1500个火力点已就位。",
  who: "游惑", whoClass: "yh",
  flash: true,
  text: function(s){
    return "火力从四面八方压下来。考生、监考官，所有人都在。\n" +
      (s.flags.poemOk ? "你的影子挡在你前面，替你挨了一下。\n" : "") +
      "游惑走在最前面。考官A，这一次没有失忆。\n秦究在他身边：「老规矩？」\n游惑：「我们牵住这群人，你们用最大火力轰。」\n【警告！警告！主……控中心遭受不可逆转性……毁损。】\n【自我清除程序已启动。倒数计时，10——】";
  },
  hint: "冲在火力正面不是勇敢，是送分。找你最信任的人，站到他身边去。",
  choices: [
    { text: "冲进主控中心，和他们一起找系统的核", next: "end_true", if: { minYh: 7, minQj: 6, flag: "knowA", any: ["dreamA", "sawRecord", "team8", "sawShower"] }, flash: true },
    { text: "守在游惑身后", next: "end_yh", if: { minYh: 6 } },
    { text: "替秦究守住门", next: "end_qj", if: { minQj: 5 } },
    { text: "护着于闻和老于，退到掩体后面", next: "end_pass" },
    { text: "端着枪冲向火力点正面", next: "final_last", fx: { hp: -65, log: "火力点集火。" } }
  ]
},
final_last: {
  loc: "终局 · 硝烟",
  bg: "core",
  who: "",
  text: "你被气浪掀翻。耳朵里只剩下嗡嗡声。\n有人把你拖进掩体——是于闻，脸上全是灰：「你疯了吗！」\n远处，倒计时还在响。",
  choices: [
    { text: "撑着站起来", next: "end_pass" }
  ]
},

/* ---------- 结局 ---------- */
end_true: {
  loc: "结局 · 对影成三人",
  bg: "dawn",
  who: "结局", whoClass: "sys",
  ending: "end_true",
  stamp: "解",
  text: function(s){
    return endingText(s, "【自我清除程序中断。】\n【检测到修正内容。】\n【内核自检已开启。】\n【错误。】\n你看见秦究站在废墟中央，对着那团光说：「我叫秦究，我来找我的真实。」\n游惑在他身边，抬手按下了修正程序。\n12822个独立考场开始分崩离析。那些蜂巢一样的土地上发生过的种种，生死爱恨，悲欢离合，从这一刻起将不复存在，也会永久存留。\n\n你在医院里醒来。原来所有考生在现实里只是陷入昏迷。\n走廊尽头，一个嫌消毒水味重，一个在旁边笑。他们说，要归队了。\n窗外，是万家灯火，是喧嚣人间。");
  },
  choices: ENDING_CHOICES
},
end_yh: {
  loc: "结局 · 同行",
  bg: "dawn",
  who: "结局", whoClass: "sys",
  ending: "end_yh",
  stamp: "同行",
  text: function(s){
    return endingText(s, "你一直站在游惑身后。他没回头，但每次有东西扑过来，他的刀都先到。\n系统崩塌的那一刻，他终于回头看了你一眼。\n「还行。」他说。\n于闻后来跟你说，这是他哥夸人的最高级别。\n你在医院里醒来的时候，床头放着一杯热水。没有留名字。");
  },
  choices: ENDING_CHOICES
},
end_qj: {
  loc: "结局 · 同考",
  bg: "dawn",
  who: "结局", whoClass: "sys",
  ending: "end_qj",
  stamp: "同考",
  text: function(s){
    return endingText(s, "你替秦究守着门。门外是系统，门里是他和游惑。\n门快被撞开的时候，秦究的声音从里面传出来：「同学，再撑十秒。」\n十秒后，世界安静了。\n他推门出来，冲你挑了挑眉：「分数我记下了。这回，是满分。」\n身后，游惑把一根烟递给他。");
  },
  choices: ENDING_CHOICES
},
end_invig: {
  loc: "结局 · 监考官",
  bg: "twin",
  who: "结局", whoClass: "sys",
  ending: "end_invig",
  stamp: "监考",
  text: function(s){
    return endingText(s, "你和 922、021 站在同一辆防弹车上。车灯照亮了双子楼。\n「炸。」\n这是你作为监考官下的第一道指令，也是最后一道。\n楼塌的那一刻，监考区下了一场不在日程表上的雪。\n你想起那个在禁闭室里睡得很香的考生——原来，你们一直站在同一边。");
  },
  choices: ENDING_CHOICES
},
end_pass: {
  loc: "结局 · 待考",
  bg: "rest",
  who: "结局", whoClass: "sys",
  ending: "end_pass",
  stamp: "待考",
  text: function(s){
    return endingText(s, "你在休息处等。暖气，吊灯，滚动的兑换目录。\n然后某一天，屏幕黑了。广播没有再响。\n门外不是考场，是一条普通的街，路灯一盏盏亮起来。\n你活着及格了。至于是谁结束了这场考试——你大概猜得到。");
  },
  choices: ENDING_CHOICES
},
dead: {
  loc: "系统通知",
  bg: "death",
  radio: "考生已被移除。",
  who: "系统", whoClass: "sys",
  ending: "dead",
  stamp: "移除",
  text: function(s){
    return endingText(s, "准考证上的名字一点点褪色，像被橡皮擦过。\n你最后听见的，是收音机的白噪音。\n滋啦——滋啦——\n「不及格者，将从系统中移除。」");
  },
  choices: ENDING_CHOICES
}
});
