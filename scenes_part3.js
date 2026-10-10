/* 第三部分：历史（海上航行）· 终章 · 结局 */
var ENDINGS = {
  dead: "移除",
  end_pass: "待考",
  end_invig: "监考官",
  end_yh: "同行",
  end_qj: "同考",
  end_true: "对影成三人"
};

function endingText(s, body) {
  return body + "\n\n——————\n考生：" + s.name + "　准考证：" + s.ticket +
    "\n最终分数：" + s.score + "　违规：" + s.viol + "　身体状态：" + s.hp;
}

var ENDING_CHOICES = [
  { text: "重新领取准考证", next: "new" },
  { text: "返回封面", next: "title" }
];

Object.assign(SCENES, {
hist_in: {
  loc: "历史考场 · 海上",
  bg: "sea",
  radio: "科目：历史。题干：海上马车夫。冰化之时，请将船员平安送回家。",
  who: "",
  fx: { exam: "历史考场", subj: "历史", log: "进入历史考场。" },
  text: "一艘老式货船，被冻在一片礁石和浮冰中间。桅杆上挂着冰凌，船帆硬得像铁皮。\n三十名考生挤在甲板上。船员们裹着破毯子，眼神麻木：「冰化了，我们就能回家了。」\n冰什么时候化，没人知道。\n秦究——现在是考生了——靠着船舷，朝游惑扬了扬下巴：「冷吗？」\n游惑：「不冷。」他嘴唇已经冻白了。",
  choices: [
    { text: "下船舱，照看受伤的船员", next: "hist_cold", fx: { score: 2, log: "你给船员包扎冻伤。" } },
    { text: "跟游惑和秦究上甲板", next: "hist_cold", fx: { yh: 1, qj: 1 } }
  ]
},
hist_cold: {
  loc: "历史考场 · 冰封的夜",
  bg: "sea",
  radio: "气温持续下降。",
  who: "",
  fx: { clock: 360, hp: -10 },
  text: "夜里冷得骨头疼。柴火早就烧完了，船员一个接一个地发起高烧。\n再这样下去，等不到冰化，题目就会先「没」几个。\n游惑看了一眼脚下的甲板，又看了一眼秦究。\n秦究笑了：「想到一块儿去了。」\n——这艘船，是系统的道具。拆系统的船取暖，算不算违规？",
  choices: [
    { text: "帮他们拆船", next: "hist_jinbi", flash: true, fx: { viol: 1, yh: 1, qj: 1, flag: { tore: true }, log: "拆毁系统船只 · 违规 +1" } },
    { text: "把自己的外套和毯子给船员", next: "hist_octopus", fx: { hp: -15, score: 3, log: "你冻得发抖，但船员退烧了。" } },
    { text: "「别！这肯定违规！」", next: "hist_octopus", fx: { yh: -1, log: "他们还是拆了。被带走的只有他们俩。" } }
  ]
},
hist_jinbi: {
  loc: "监考区 · 禁闭室",
  bg: "system",
  radio: "违规考生已分开关押。",
  who: "",
  fx: { score: -10, flag: { heardA: true }, clock: 180, log: "违规扣分 -10。" },
  text: "处罚来得很快。你们三个被分开关进不同的禁闭室。\n黑暗里，你听见墙那头有个女人的声音，压得很低，又很急：\n「考官A……游惑，快醒醒。」\n你屏住呼吸。考官A？\n更远的地方，传来秦究翻纸页的声音——像是在读一本旧日记。",
  choices: [
    { text: "贴着墙，听她继续说", next: "hist_octopus", fx: { yh: 1, log: "你听见了「考官A」。" } },
    { text: "敲墙：「秦究？你在看什么？」", next: "hist_octopus", fx: { qj: 1, log: "秦究：「赵文途的日记。」" } }
  ]
},
hist_octopus: {
  loc: "历史考场 · 礁石",
  bg: "sea",
  radio: function(s){ return s.flags.tore ? "当前排名：倒数第一。" : "警告：海怪靠近。"; },
  who: "",
  flash: true,
  text: function(s){
    return (s.flags.tore ? "从禁闭室回来，你们的分数被倒扣成了倒数第一。\n" : "") +
      "海面突然鼓起。一条又丑又大的章鱼从冰缝里伸出触须，专挑排名最末的人抓。\n触须卷住秦究的腰，又去缠游惑的脚踝。\n下一秒，游惑抽出刀，秦究反手扣住触须——\n十分钟后，甲板上支起了火，章鱼须在上面滋滋冒油。\n于闻目瞪口呆：「……烤、烤了？」";
  },
  choices: [
    { text: "递刀过去", next: "hist_rabbit", fx: { yh: 1, score: 2 } },
    { text: "掏出打火机，把火生旺", next: "hist_rabbit", if: { has: "打火机" }, fx: { qj: 1, score: 3, hp: 10, log: "章鱼须烤得刚好。" } },
    { text: "躲远点", next: "hist_rabbit", fx: { hp: -15, log: "一根触须扫到了你。" } }
  ]
},
hist_rabbit: {
  loc: "历史考场 · 篝火",
  bg: "fire",
  who: "监考官 021", whoClass: "sys",
  text: "一只系统兔子蹦上甲板，被秦究拎着耳朵提起来，没多久也上了火。\n篝火那头，一个女监考官走了过来——021。她看着游惑，看了很久。\n「你真的什么都不记得了？」她说，「你是考官A。系统最早的主监考官。」\n火光噼啪。游惑没有动。\n秦究也没有说话。他看着游惑，眼神第一次没有笑。",
  choices: [
    { text: "看向游惑", next: "hist_result", fx: { yh: 1, flag: { knowA: true }, log: "游惑是考官A。" } },
    { text: "看向秦究", next: "hist_result", fx: { qj: 1, flag: { knowA: true }, log: "秦究好像早就猜到了。" } }
  ]
},
hist_result: {
  loc: "历史考场 · 结算",
  bg: "sea",
  radio: "历史科目结算完毕。",
  who: "系统", whoClass: "sys",
  stamp: "及格",
  text: function(s){
    return "第七天，冰化了。船员们站在船头，望着远处的陆地，一个个哭得像孩子。\n他们回家了。\n结算墙亮起：\n及格。\n" +
      (s.flags.tore ? "游惑、秦究，以及你：等级 C。【需重考。】\n秦究耸肩：「重考就重考。」" : "游惑、秦究：等级 C。【需重考。】\n你的等级：B。");
  },
  choices: [
    { text: "领取及格章", next: "final_gate", fx: { flag: { pass3: true }, score: 6, exam: "休息处", subj: "待定", log: "历史及格。" } }
  ]
},

/* ---------- 终章 ---------- */
final_gate: {
  loc: "考生休息处 · 很久以后",
  bg: "radio",
  radio: "下一门考试科目：语文。",
  who: "",
  fx: { clock: 600 },
  text: function(s){
    return "后来又考了很多门。\n历史重考，在公爵的古堡。数学，在鬼屋兄妹和镜子里。每一场，游惑和秦究都站在一起，把题目做成系统最头疼的样子。\n于闻长高了一点，老于学会了不念叨。\n" +
      "你听说了更多：考官A，主监考官，被清空的记忆，一个从没成功的计划。\n现在，广播说，最后一门是语文。\n" +
      (s.score >= 30 ? "另外，一封盖着系统印章的通知书落在你手里：【考生" + s.name + "，成绩优异，可申请转为监考官。】" : "");
  },
  choices: [
    { text: "接受通知书，转为监考官", next: "end_invig", if: { minScore: 30 } },
    { text: "留在休息处，等下一场", next: "end_pass" },
    { text: "走进最后一门考场：语文", next: "final_yuwen" }
  ]
},
final_yuwen: {
  loc: "语文考场 · 终局",
  bg: "core",
  radio: "本场考试，无解。",
  who: "系统", whoClass: "sys",
  flash: true,
  text: "这一场，系统没打算让任何人及格。\n题目就是死局。\n可考场里站着的不只是考生。922、154、021……那些老监考官，一个接一个地从白光里走出来，站到考生这一边。\n游惑走在最前面。考官A，这一次没有失忆。\n秦究在他身边，手里转着一副卡牌：「老规矩？」\n游惑：「炸了它。」",
  choices: [
    { text: "把所有分数押上，跟他们一起炸考场", next: "end_true", if: { minYh: 5, minQj: 3 }, flash: true },
    { text: "守在游惑身后", next: "end_yh", if: { minYh: 4 } },
    { text: "替秦究守住门", next: "end_qj", if: { or: [{ minQj: 3 }, { has: "001的卡牌" }] } },
    { text: "护着于闻和老于，退到考场边上", next: "end_pass" }
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
    return endingText(s, "爆炸声从考场中心炸开，一圈一圈，像有人把整张试卷撕碎了。\n白光、雪、火、海水——所有考场一层层剥落。\n你最后看见的，是两道身影站在废墟中央。游惑的衣角被风掀起，秦究偏头和他说了句什么。\n系统崩塌了。\n\n很久以后，在医院的走廊里，你又见到了他们。一个嫌消毒水味重，一个在旁边笑。\n他们说，要回部队了。\n你想起那面墙上的字。\n解。");
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
    return endingText(s, "你一直站在游惑身后。他没回头，但每次有东西扑过来，他的刀都先到。\n系统崩塌的那一刻，他终于回头看了你一眼。\n「还行。」他说。\n于闻后来跟你说，这是他哥夸人的最高级别。");
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
    return endingText(s, "你替秦究守着门。门外是系统，门里是他和游惑。\n门快被撞开的时候，秦究的声音从里面传出来：「同学，再撑十秒。」\n十秒后，世界安静了。\n他推门出来，冲你挑了挑眉：「分数我记下了。这回，是满分。」");
  },
  choices: ENDING_CHOICES
},
end_invig: {
  loc: "结局 · 监考官",
  bg: "system",
  who: "结局", whoClass: "sys",
  ending: "end_invig",
  stamp: "监考",
  text: function(s){
    return endingText(s, "你换上了监考官的制服。臂章上有一个新编号。\n922 教你怎么记违规，154 教你怎么开禁闭室。\n后来有一天，系统忽然断电。监考区一片漆黑，所有人都在等。\n灯再也没亮。\n你站在空荡荡的监考台上，想起那个在禁闭室里睡得很香的人——原来，你们一直站在同一边。");
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
    return endingText(s, "你没有走进那扇门，或者走进去了，又退了出来。\n你在休息处等。暖气，吊灯，滚动的兑换目录。\n然后某一天，屏幕黑了。广播没有再响。\n门外不是考场，是一条普通的街，路灯一盏盏亮起来。\n你活着及格了。至于是谁结束了这场考试——你大概猜得到。");
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
