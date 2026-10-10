/* 第六部分：数学 · 大型联合考场（布兰登小镇 · 鬼屋兄妹 · 镜像人） */
var MIRROR_SVG = '<svg class="mirror-q" viewBox="0 0 360 220" role="img" aria-label="一面落地镜">' +
  '<rect width="360" height="220" fill="#14141c"/><rect x="0" y="170" width="360" height="50" fill="#0c0c12"/>' +
  '<g fill="#07070b"><ellipse cx="60" cy="118" rx="12" ry="14"/><path d="M40 172 Q44 136 60 134 Q76 136 80 172Z"/>' +
  '<ellipse cx="96" cy="132" rx="9" ry="10"/><path d="M82 172 Q86 146 96 144 Q106 146 110 172Z"/><path d="M86 128 l-8 -6 v12z M106 128 l8 -6 v12z"/>' +
  '<ellipse cx="128" cy="134" rx="9" ry="10"/><path d="M114 172 Q118 148 128 146 Q138 148 142 172Z"/></g>' +
  '<g transform="translate(250 112)"><ellipse rx="70" ry="98" fill="#9ab8c8" fill-opacity=".16" stroke="#d8c890" stroke-opacity=".7" stroke-width="5"/>' +
  '<g fill="#1a2430"><ellipse cx="-34" cy="-4" rx="10" ry="12"/><path d="M-50 46 Q-46 16 -34 14 Q-22 16 -18 46Z"/>' +
  '<ellipse cx="-4" cy="10" rx="8" ry="9"/><path d="M-16 46 Q-12 24 -4 22 Q4 24 8 46Z"/>' +
  '<ellipse cx="22" cy="12" rx="8" ry="9"/><path d="M10 46 Q14 26 22 24 Q30 26 34 46Z"/></g>' +
  '<g fill="#1a2430" opacity=".38"><ellipse cx="46" cy="-30" rx="9" ry="11"/><path d="M32 18 Q36 -12 46 -16 Q56 -12 58 18Z"/></g>' +
  '<path d="M-40 -80 L-6 40" stroke="#fff" stroke-opacity=".12" stroke-width="7"/></g>' +
  '<text x="12" y="210" font-size="11" fill="#8a8a96" font-family="serif">屋里：你、雪莉、萨利</text></svg>';

Object.assign(SCENES, {
math_in: {
  loc: "数学 · 大型联合考场",
  bg: "radio",
  radio: "本场考试为大型联合考场，请考生做好准备。",
  who: "系统广播", whoClass: "sys",
  fx: { exam: "布兰登小镇", subj: "数学", clock: 60, log: "进入数学：大型联合考场。" },
  text: "【大型联合考场，又称多地区复合式筛选性考场。】\n【本场考试包含不同国家地区考生共计2048名。】\n【考试共分三个阶段。第一阶段为筛选性单元测试，由考生独自完成。】\n【注意，考生在第一阶段的成绩会决定你在第二阶段的地位。】\n白光一闪，身边的人全没了。\n你独自站在一座滨海小镇的路口。",
  choices: [
    { text: "往唯一亮着灯的小楼走", next: "math_house" }
  ]
},
math_house: {
  loc: "布兰登小镇 · 兄妹的小楼",
  bg: "math",
  radio: "注意事项：别让雪莉哭，也别让萨利饿肚子。",
  who: "雪莉", whoClass: "npc",
  text: "【这是一个叫做布兰登的滨海小镇，雪莉和萨利是一对兄妹。】\n开门的是个扎蝴蝶结的小女孩，身后站着她哥哥，瘦得像根豆芽，肚子咕咕叫。\n雪莉仰着脸看你：「你是客人吗？」\n她最喜欢做的一件事就是照镜子。一切能映出人影的东西，她都会停下来，美美地看上一会儿。\n【特别提醒：答错可以修改，但修改要付出代价。】",
  hint: "雪莉爱照镜子——夸她好看，别抢她的镜子。萨利饿了，先给他吃的。",
  choices: [
    { text: "先去厨房给萨利煮点东西", next: "math_mirror", fx: { score: 3, flag: { fedSally: true }, log: "萨利吃饱了。" } },
    { text: "蹲下来夸雪莉的蝴蝶结好看", next: "math_mirror", fx: { score: 3, flag: { happyShirley: true }, log: "雪莉笑了。" } },
    { text: "「镜子有什么好照的？」", next: "math_mirror", fx: { hp: -20, log: "雪莉哭了。广播里传来一声刺耳的电流。" } }
  ]
},
math_mirror: {
  loc: "布兰登小镇 · 落地镜",
  bg: "math",
  who: "雪莉", whoClass: "npc",
  art: "svg",
  svg: MIRROR_SVG,
  text: "客厅里立着一面落地镜。雪莉拉着你的手站到镜子前：「我们来玩游戏。你数一数，镜子里有几个人？」\n萨利在旁边小声说：「……数错了，雪莉会哭的。」\n你看了看屋里：你，雪莉，萨利。\n又看向镜子。镜子边缘，有一团很淡的影子。",
  hint: "数镜子里的，不是屋里的。最淡的那一个，也算。",
  choices: [
    { text: "「三个。」", next: "math_wrong" },
    { text: "「四个。」", next: "math_broadcast", fx: { score: 6, flag: { mirrorOk: true }, log: "镜子里有四个人。" } },
    { text: "「五个。」", next: "math_wrong" }
  ]
},
math_wrong: {
  loc: "布兰登小镇 · 修改答案",
  bg: "math",
  radio: "答错可以修改，但修改要付出代价。",
  who: "雪莉", whoClass: "npc",
  flash: true,
  fx: { hp: -15, log: "修改答案的代价：身体状态 -15" },
  text: "雪莉的眼睛一点点红了。镜子里那团淡影子，往前走了一步。\n你的手腕像被冰冷的玻璃割了一下。\n你又数了一遍——这次，你看清了镜子边缘那个人。",
  choices: [
    { text: "「……四个。」", next: "math_broadcast", fx: { score: 2, flag: { mirrorOk: true } } }
  ]
},
math_broadcast: {
  loc: "布兰登小镇 · 夜",
  bg: "math",
  radio: "298考场考生Christina弄哭雪莉，宣告死亡。",
  who: "系统广播", whoClass: "sys",
  text: "入夜，全镇的广播此起彼伏，宣告着别的考场里的死亡。\n【197考场，考生游惑弄哭了雪莉，宣告死亡。】\n你手里的勺子掉了。\n【197考场，考生游惑弄哭了雪莉……又宣告死亡。】\n【197考场，考生游惑弄哭了雪莉……再次宣告死亡。】\n……\n【197考场，考生游惑复活。】\n萨利：「……你朋友好厉害。」",
  choices: [
    { text: "笑出声", next: "math_eye", fx: { yh: 1 } },
    { text: "趁夜，把小楼里的镜子都盖上布", next: "math_eye", fx: { score: 2, flag: { coveredMirrors: true } } }
  ]
},
math_eye: {
  loc: "布兰登小镇 · 镜中世界",
  bg: "math",
  who: "",
  text: function(s){
    return (s.flags.coveredMirrors ? "盖着布的镜子在半夜自己滑落了一块。" : "半夜，客厅的镜子亮了。") +
      "\n镜子里的屋子和外面一模一样，只是左右颠倒——双面世界。镜子里的「你」朝你招手。\n你刚要往前，一只手从背后捂住了你的眼睛，把你拽离了镜子。\n是谁，你没看清。只听见一句很轻的：「别看。」\n第二天，你在镇上远远看见了游惑。他眼睛上缠着一条黑色绷带。";
  },
  hint: "别和镜子里的自己对视，也别伸手。",
  choices: [
    { text: "闭眼，顺着那只手往后退", next: "math_p1end", fx: { score: 2 } },
    { text: "伸手去碰镜子里的自己", next: "math_p1end", fx: { hp: -45, log: "镜子里的你，握住了你的手。" } }
  ]
},
math_p1end: {
  loc: "布兰登小镇 · 第一阶段结束",
  bg: "math",
  radio: "至此，单人作战的第一阶段正式结束，联合考场剩余考生1427人。",
  who: "系统", whoClass: "sys",
  text: function(s){
    return "【雪莉兄妹临走前留了可爱的字条，将小楼赠予客人暂住，就当是提前送你们的节日礼物。】\n【从现在起，你们拥有4个小时的休整时间。4个小时后中午12点整，第二阶段考试将正式开始。】\n" +
      (s.flags.mirrorOk && (s.flags.fedSally || s.flags.happyShirley) ? "你的第一阶段排名靠前。" : "你的第一阶段排名靠后。");
  },
  enter: function(s){ s.flags.goodRank = !!(s.flags.mirrorOk && (s.flags.fedSally || s.flags.happyShirley)); },
  choices: [
    { text: "睡四个小时", next: "math_p2", fx: { hp: 20 } }
  ]
},
math_p2: {
  loc: "布兰登镇 · 第二阶段",
  bg: "math",
  radio: "现在是11:55分，距离第二阶段考试正式开始还有五分钟。",
  who: "系统广播", whoClass: "sys",
  text: "【镇民们终于意识到，失踪的人根本没有回来，回来的已经不是原本那个了，而是怪物。他们把这种怪物叫做镜像人。】\n【镇民们制作了专门捕杀镜像人的弩箭，三箭命中可以杀死。】\n【小镇四处分布有若干面神奇的落地镜，每面落地镜每天最多可以吞下5个活人，50箭可以击碎一面镜子。】\n【没有武器的镇民，可以尝试跑向最近的庇护所。每间庇护所最多可以藏两位考生。】\n【进场分数按照第一阶段的成绩计算。】",
  hint: "有组队卡，就去找秦究；没有，就靠第一阶段的排名进庇护所。手里有弩箭，能多一条活路。",
  choices: [
    { text: "掏出组队卡", next: "math_team", if: { has: "组队卡" }, fx: { flag: { team8: true }, qj: 1, yh: 1, log: "组队：八人一组。" } },
    { text: "跑向最近的庇护所", next: "math_shelter" },
    { text: "握紧弩箭，守在路口", next: "math_hunt", if: { has: "弩箭" }, fx: { score: 3 } },
    { text: "去找游惑和秦究", next: "math_team", if: { or: [{ minYh: 6 }, { minQj: 5 }] }, fx: { flag: { team8: true }, log: "你在镇口追上了他们。" } }
  ]
},
math_shelter: {
  loc: "布兰登镇 · 庇护所",
  bg: "math",
  who: "系统", whoClass: "sys",
  text: function(s){
    return s.flags.goodRank
      ? "庇护所的门认出了你的排名，开了。你在里面躲了两个小时，听着外面的惨叫一声一声远去。\n【考生王娅思遭遇一名饥饿的镜像人，宣告死亡。】"
      : "【考生，第一阶段累积成绩排名靠后，暂时无权进入庇护所，再接再厉。】\n门在你面前关上。身后，传来很多很多脚步声。";
  },
  choices: [
    { text: "等到安全再出来", next: "math_final", if: { flag: "goodRank" }, fx: { score: 2 } },
    { text: "跑！往镇中心跑！", next: "math_final", if: { noflag: "goodRank" }, fx: { hp: -35, log: "三个镜像人追了你两条街。" } }
  ]
},
math_hunt: {
  loc: "布兰登镇 · 路口",
  bg: "math",
  who: "",
  text: "一个「镇民」从巷子里走出来，左右不分地朝你挥手。\n你抬起弩。一箭，两箭，三箭。\n它倒下去的时候，身体像镜子一样碎了。",
  choices: [
    { text: "继续往镇中心走", next: "math_final", fx: { score: 3, log: "杀死一个镜像人 +3。" } }
  ]
},
math_team: {
  loc: "布兰登镇 · 八名歹徒",
  bg: "math",
  who: "秦究", whoClass: "qj", face: "qjx",
  fx: { score: -6 },
  text: "八个人：游惑、秦究、于闻、老于、高齐、周祺……还有你。一路走一路抢，把一个镜像人小团伙打劫了个底朝天。\n打完一核分——负的。\n于闻：「……为什么越打越扣分？」\n高齐脸色变了：「做出符合自身身份的行为，就会加分，反之减分。我们……被算成镜像人了？」\n秦究笑了一声：「那就继续。」\n于是八人小组在镜像人的阵营里，继续杀自己人。踏马的说好凑不齐十个呢！",
  choices: [
    { text: "跟着砸镜子", next: "math_final", fx: { score: 10, yh: 1, qj: 1, log: "击碎一面落地镜 +10。" } },
    { text: "护着于闻和老于殿后", next: "math_final", fx: { score: 4, yh: 1 } }
  ]
},
math_final: {
  loc: "布兰登镇 · 最终一问",
  bg: "core",
  radio: "本场考试最终一问触发条件共计两个。",
  who: "系统广播", whoClass: "sys",
  text: "【现考场触发条件1，由此判定镜像人再无翻盘可能。清除布兰登小镇上所有的镜像人，本场考试即为结束。】\n镜子一面接一面碎掉。广播里忽然插进来一个熟悉的声音，信号很差：\n【能听见吗？老大？A？能听见应一声，我不能占用太久！】\n是 154。\n【切换出问题了！……只有一个办法，把你们一起打包除名，直接扔出系统——】\n信号断了。\n【考场状况异常，检测不到任何考生，异常等级为A级，请监考官立即处理！】",
  choices: [
    { text: "抓住身边的人", next: "math_result", fx: { yh: 1 } },
    { text: "冲着广播喊：「154！」", next: "math_result", fx: { qj: 1, flag: { called154: true } } }
  ]
},
math_result: {
  loc: "数学 · 考场记录",
  bg: "system",
  radio: "考场记录调取中。",
  who: "监考官 922", whoClass: "sys",
  text: "再睁眼，你们在监考处的大厅里。屏幕上回放着 197 考场的记录：游惑摘下黑色绷带，抬眼。\n922 盯着屏幕愣了三秒：「这他妈不是主考官A吗？？？」\n整个监考处炸了锅。\n游惑没理会。他转头对秦究说了什么，秦究低头笑了。\n于闻扯了扯你的袖子：「我刚刚好像听见……他们说要去『最后一门』。」",
  choices: [
    { text: "去 2 号休息处", next: "final_gate", stamp: "及格", fx: { flag: { pass4: true }, score: 6, exam: "2号休息处", subj: "待定", log: "数学结束。" } }
  ]
}
});
