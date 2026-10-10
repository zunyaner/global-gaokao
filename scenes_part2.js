/* 第二部分：休息处 · 禁闭室 · 外语（吉普赛语） */
var SHOP_REST = [
  { name: "热汤", desc: "身体状态 +20", cost: 2, hp: 20 },
  { name: "伤药", desc: "身体状态 +45", cost: 5, hp: 45 },
  { name: "打火机", desc: "冷的地方用得上。烧东西也用得上。", cost: 3, inv: "打火机" },
  { name: "针线包", desc: "缝补用。考场里，也许缝的不是衣服。", cost: 3, inv: "针线包" }
];

Object.assign(SCENES, {
rest5: {
  loc: "考生休息处 · 旅馆大堂",
  bg: "rest",
  radio: "休息处开放。可用分数兑换物资。下一场考试将在规定时间后开始。",
  who: "",
  art: "shop",
  shop: SHOP_REST,
  text: function(s){
    var t = "白光散掉，你站在一间旅馆大堂里。暖气很足，吊灯很亮，亮得像刚才的雪和汤都是别人的梦。\n墙上的屏幕滚动着兑换目录。分数在这里是钱，也是命。\n于闻瘫在沙发上数分，老于在一旁念叨「活着就好」。游惑要了一杯热水，坐在最远的角落，谁也不看。";
    if (s.viol > 0 && !s.flags.servedJinbi) t += "\n\n前台的屏幕忽然跳出一行红字：【违规考生请前往禁闭室。】";
    return t;
  },
  choices: [
    { text: "（违规考生）去禁闭室领罚", next: "jinbi", if: { minViol: 1, noflag: "servedJinbi" } },
    { text: "去角落找游惑", next: "rest5_yh", if: { noflag: "restYh" } },
    { text: "上楼——楼梯口靠着一个穿监考官制服的人", next: "rest5_qj", if: { noflag: "restQj" } },
    { text: "回房间睡一觉", next: "rest5_sleep", if: { noflag: "restSleep" } },
    { text: "前往下一场考试", next: "rest5_end", if: { or: [{ flag: "servedJinbi" }, { maxViol: 0 }] } }
  ]
},
jinbi: {
  loc: "监考区 · 禁闭室",
  bg: "system",
  radio: "违规处罚执行中。禁闭时间：以监考官通知为准。",
  who: "监考官 922", whoClass: "sys",
  fx: { flag: { servedJinbi: true }, clock: 120, log: "禁闭室报到。" },
  text: function(s){
    return "922 和 154 一左一右，把你领进一间没有窗的屋子。铁门合上，黑得像被系统删掉了一块。\n" +
      "隔壁那间也关着人。你听见有人翻了个身，呼吸很快又匀了——游惑在禁闭室里睡着了，睡得比在木屋沙发上还安稳。\n" +
      "门外，有人慢悠悠地敲了两下：「禁闭室不是旅馆。」是 001 的声音。\n" +
      (s.flags.fullInvig ? "「你违规三次了。下一场，我亲自陪你考。」" : "「下次违规之前，想想值不值。」");
  },
  choices: [
    { text: "隔着门问：「他也是被你关进来的？」", next: "rest5", fx: { qj: 1, log: "001 笑了一声，没回答。" } },
    { text: "学游惑，闭眼睡觉", next: "rest5", fx: { hp: 15, yh: 1, log: "你在禁闭室里睡了一觉。" } }
  ]
},
rest5_yh: {
  loc: "考生休息处 · 角落",
  bg: "rest",
  who: "游惑", whoClass: "yh",
  fx: { flag: { restYh: true } },
  text: function(s){
    var a = s.flags.wroteJie ? "「墙上那个字，」他忽然开口，「你写的？」\n你说是。他看了你两秒，「嗯」了一声，像是在给卷面打分。" : "他看你一眼，又看回杯子里的热水。\n「有事说。」";
    return "你在他对面坐下。他眼睛有点不舒服似的，偶尔眯一下，灯光太亮了。\n" + a + "\n于闻凑过来小声说：「我哥不是冷，是懒得说话。真的。」";
  },
  choices: [
    { text: "「下一场一起？」", next: "rest5", fx: { yh: 1, log: "游惑没拒绝。" } },
    { text: "「你好像……来过这种地方。」", next: "rest5", fx: { yh: 1, flag: { askedPast: true }, log: "游惑沉默了很久。" } }
  ]
},
rest5_qj: {
  loc: "考生休息处 · 楼梯口",
  bg: "rest",
  who: "秦究 · 001", whoClass: "qj",
  fx: { flag: { restQj: true } },
  text: "制服外套搭在栏杆上，袖口挽着。他在看楼下角落的游惑，看见你，才把目光挪开。\n「考生不在房间休息，跑来找监考官？」秦究语调懒洋洋的，「胆子不小。」\n他指间转着一副卡牌，背面花纹一模一样。",
  choices: [
    { text: "「监考官也住休息处？」", next: "rest5", fx: { qj: 1, log: "001：「监考官哪儿都能住。」" } },
    { text: "「那副牌是什么？」", next: "rest5", fx: { qj: 2, inv: "001的卡牌", log: "001 抽了一张给你：「抽卡奖励。不算惩罚，但有点特殊。」" } },
    { text: "点头，转身下楼", next: "rest5", fx: { yh: 1 } }
  ]
},
rest5_sleep: {
  loc: "考生休息处 · 房间",
  bg: "rest",
  who: "",
  fx: { hp: 25, clock: 360, flag: { restSleep: true }, log: "睡了六个小时。状态恢复。" },
  text: "床很软。你几乎是一沾枕头就睡着了。\n梦里还是雪。雪里有人穿着笔挺的制服，背对着你，看不清脸。有人在远处叫一个字母——\n醒来的时候，窗外是假的晴天。",
  choices: [
    { text: "下楼", next: "rest5" }
  ]
},
rest5_end: {
  loc: "考生休息处 · 出口",
  bg: "radio",
  radio: "请考生做好准备。下一门考试科目：外语。",
  who: "系统广播", whoClass: "sys",
  text: "广播一响，大堂里的人都安静下来。\n于闻小声嘀咕：「外语？英语我还行……」\n没人接话。出口的白光亮起来，像一张没写名字的答题卡。",
  choices: [
    { text: "走进白光", next: "lang_in", fx: { clock: 30 } }
  ]
},

/* ---------- 外语 ---------- */
lang_in: {
  loc: "外语考场 · 村庄",
  bg: "village",
  radio: "科目：外语。考试语种：吉普赛语。请在规定时间内完成作答。",
  who: "",
  fx: { exam: "外语考场", subj: "外语", log: "进入外语考场。" },
  text: function(s){
    var t = "雾很重。村口歪着一块木牌，字一个都看不懂。\n村民穿着发黑的衣服，从门缝里看你们。他们说话，像收音机调错了台——一串串乱码。\n于闻脸都白了：「……吉普赛语？这谁学过啊！」\n村子尽头有一座孤零零的屋子，门口坐着一个裹着黑布的老太婆。再往后，是一片墓地。";
    if (s.flags.fullInvig) t += "\n\n你身后多了一个人。秦究双手插兜：「全程陪同。别回头看我，看题。」";
    return t;
  },
  choices: [
    { text: "去找门口的黑婆", next: "lang_heipo" },
    { text: "先去墓地看看", next: "lang_grave" },
    { text: "跟着游惑走", next: "lang_heipo", fx: { yh: 1 } }
  ]
},
lang_heipo: {
  loc: "外语考场 · 黑婆的屋子",
  bg: "village",
  radio: "题目：请按村民要求，为他们缝制娃娃。",
  who: "黑婆", whoClass: "npc",
  art: "paper",
  paper: "外语题：听懂村民的话。完成他们的委托。答案写在指定位置，否则作废。",
  text: "黑婆的眼睛很浑。她开口，声音像砂纸刮过门板，一串听不懂的音节，最后落在一个反复出现的词上。\n她把一卷布、一把剪刀推到你面前，又指了指村子里的人。\n游惑靠在门边，安静地听完，抬手在门框上写下几个音节。",
  choices: [
    { text: "跟着她的发音，一个音一个音地重复", next: "lang_heipo2", fx: { score: 2, flag: { learnWord: true }, log: "你记下了几个吉普赛语词。" } },
    { text: "抄下游惑写在门框上的音节", next: "lang_heipo2", fx: { yh: 1, flag: { learnWord: true } } },
    { text: "用中文硬聊", next: "lang_heipo2", fx: { hp: -10, log: "黑婆冲你龇牙。" } }
  ]
},
lang_heipo2: {
  loc: "外语考场 · 黑婆的屋子",
  bg: "village",
  who: "",
  text: "黑婆不再说话。她低头缝一个布娃娃，针脚又密又歪。\n窗外天色暗得很快。村民挨家挨户关门，门闩落下的声音此起彼伏。\n于闻：「天黑之前，咱们得找个地方睡……」",
  choices: [
    { text: "趁天没黑，再去墓地", next: "lang_grave", if: { noflag: "foundZhao" } },
    { text: "回分到的住处", next: "lang_night" }
  ]
},
lang_grave: {
  loc: "外语考场 · 墓地",
  bg: "fog",
  who: "",
  fx: { flag: { foundZhao: true }, clock: 40 },
  text: "墓碑东倒西歪。有几座坟的土是松的，像有什么东西从下面爬出去过。\n最边上一块碑没刻吉普赛文，而是一行歪歪扭扭的中文，像用指甲刻的：\n「赵文途」。\n碑前压着一张泛黄的纸，边角印着系统的字样——那是一张往期考生的准考证。",
  choices: [
    { text: "记住这个名字", next: "lang_grave2", fx: { score: 2, log: "往期考生：赵文途。" } },
    { text: "土在动。快走", next: "lang_grave2", fx: { hp: -10, log: "有什么抓了一下你的脚踝。" } }
  ]
},
lang_grave2: {
  loc: "外语考场 · 墓地",
  bg: "fog",
  who: "",
  text: "你回头看了一眼。雾里，一个村民站在墓地边上，一动不动。\n他的衣服和别的村民一样黑，可他的脸——像个中国人。\n他张了张嘴，发出的却只有乱码。",
  choices: [
    { text: "去黑婆那里问个清楚", next: "lang_heipo", if: { noflag: "learnWord" } },
    { text: "天黑了，回住处", next: "lang_night" }
  ]
},
lang_night: {
  loc: "外语考场 · 夜",
  bg: "village",
  radio: "夜间请勿外出。",
  who: "",
  fx: { clock: 300 },
  text: function(s){
    var t = "半夜，窗户被什么拍响。啪。啪。\n于闻缩在被子里：「手……是手！墓地里那些——」\n断手断脚在地上爬，扒门、敲窗、钻缝。整栋屋子都在响。\n隔壁床，游惑睡得纹丝不动。不管外面怎么闹，他都没醒。\n";
    t += s.flags.fullInvig
      ? "秦究坐在你床尾，一只鬼手刚伸进来，就被他捏住了手腕。「全程陪同，」他说，「包括这个。」"
      : "门开了。秦究走进来，随手捏住一只往游惑床上爬的鬼手，打量两眼，搁在游惑枕边：「送你的。」";
    return t;
  },
  choices: [
    { text: "抄起凳子守门", next: "lang_doll", fx: { hp: -20, score: 2, log: "你守了一夜门。" } },
    { text: "试着叫醒游惑", next: "lang_doll", fx: { yh: 1, log: "叫不醒。根本叫不醒。" } },
    { text: "躲到秦究身后", next: "lang_doll", if: { or: [{ full: true }, { minQj: 2 }] }, fx: { qj: 2, log: "001：「这时候倒想起监考官了。」" } }
  ]
},
lang_doll: {
  loc: "外语考场 · 缝娃娃",
  bg: "village",
  radio: "第二题：请将娃娃送到对应的村民手中。",
  who: "",
  art: "paper",
  paper: function(s){ return "委托：村民丁，在等一个代表他自己的娃娃。" + (s.flags.learnWord ? "\n（你认得那个反复出现的词：名字。）" : ""); },
  text: function(s){
    return "天亮了。黑婆的布和剪刀摆在桌上。\n墓地边那个村民——村民丁——站在门外，盯着桌上的布。\n" +
      (s.flags.foundZhao ? "你想起墓碑上那三个字。赵文途。往期考生，记忆被清空，留在考场里，成了题目的一部分。" : "他到底在等什么？你只知道，缝错的娃娃会出事。") +
      (s.inv.indexOf("针线包") >= 0 ? "\n你摸出休息处换来的针线包。" : "");
  },
  choices: [
    { text: "缝一个娃娃，背后绣上「赵文途」，送到他手里", next: "lang_fire", if: { flag: "foundZhao", any: ["learnWord"] }, fx: { score: 6, flag: { langTrue: true }, log: "村民丁握住了娃娃。" } },
    { text: "用针线包仔细缝一个，绣上「赵文途」", next: "lang_fire", if: { flag: "foundZhao", has: "针线包" }, fx: { score: 6, flag: { langTrue: true }, log: "针脚很稳。" } },
    { text: "按黑婆那个词的意思，缝一个空白的「名字」娃娃", next: "lang_fire", if: { flag: "learnWord", noflag: "foundZhao" }, fx: { score: 3, flag: { langSafe: true } } },
    { text: "随便缝一个交差", next: "lang_fire", fx: { hp: -35, score: 1, flag: { langSafe: true }, log: "娃娃的眼睛缝歪了。它在看你。" } }
  ]
},
lang_fire: {
  loc: "外语考场 · 火",
  bg: "fire",
  who: "游惑", whoClass: "yh",
  text: function(s){
    return (s.flags.langTrue ? "村民丁抱着娃娃，嘴里的乱码终于停了。他说了一句中文：「谢谢。」然后像一缕烟，散了。\n" : "村民丁没有接你的娃娃。\n") +
      "游惑知道了赵文途的事。他什么也没说，只是脸冷得吓人。\n秦究不知从哪拎来一桶油，往黑婆的屋子上一泼。\n「这种考场，」他看向游惑，「烧了吧。」";
  },
  choices: [
    { text: "递上打火机", next: "lang_result", if: { has: "打火机" }, flash: true, fx: { yh: 1, qj: 1, viol: 1, flag: { burned: true }, log: "协助烧毁考场 · 违规 +1" } },
    { text: "帮他们把油泼匀", next: "lang_result", flash: true, fx: { yh: 1, qj: 1, viol: 1, flag: { burned: true }, log: "协助烧毁考场 · 违规 +1" } },
    { text: "拉着于闻和老于退到村口", next: "lang_result", fx: { score: 1 } }
  ]
},
lang_result: {
  loc: "外语考场 · 结算",
  bg: "fire",
  radio: "外语科目结算完毕。",
  who: "系统", whoClass: "sys",
  stamp: "及格",
  text: function(s){
    return "火从黑婆的屋子烧到墓地，烧了整整一夜。那些在地上爬的东西，终于不动了。\n结算墙在灰烬里亮起来。\n及格。\n" +
      "然后，系统又刷出一条通知：【监考官 001 违规协助考生破坏考场。按规定，取消其监考资格，转为考生。】\n" +
      "秦究看着那行字，笑了一下，把制服外套脱下来搭在臂弯里：「下一场，咱们就是同学了。」\n游惑：「……谁跟你咱们。」";
  },
  choices: [
    { text: "领取及格章，前往下一门", next: "rest7", fx: { flag: { pass2: true }, score: 6, exam: "休息处", subj: "休息", log: "外语及格。001 转为考生。" } }
  ]
},
rest7: {
  loc: "考生休息处 · 二楼",
  bg: "rest",
  radio: "下一门考试科目：历史。",
  who: "",
  art: "shop",
  shop: SHOP_REST,
  text: "又是休息处。暖气，吊灯，滚动的兑换目录。\n不同的是，现在秦究也戴上了考生的牌子。他坐在游惑旁边的沙发扶手上，像在自己家。\n于闻小声说：「我怎么觉得……他俩以前就认识？」",
  choices: [
    { text: "问秦究：「被取消监考资格，你一点都不急？」", next: "rest7_end", fx: { qj: 1, log: "秦究：「急什么，考生视角也挺好。」" } },
    { text: "问游惑：「你真不记得他？」", next: "rest7_end", fx: { yh: 1, log: "游惑：「不记得。」停了停，「……应该不记得。」" } },
    { text: "什么都不问，直接去考场", next: "rest7_end" }
  ]
},
rest7_end: {
  loc: "考生休息处 · 出口",
  bg: "radio",
  radio: "请考生做好准备。科目：历史。",
  who: "系统广播", whoClass: "sys",
  text: "白光亮起。\n你听见海浪的声音，混着收音机的杂音，从光的另一头涌过来。",
  choices: [
    { text: "走进白光", next: "hist_in", fx: { clock: 30 } }
  ]
}
});
