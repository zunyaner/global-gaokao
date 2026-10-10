/* 第二部分：休息处（鸡鸣山麓旅馆）· 禁闭室 · 外语（吉普赛语） */
var SHOP_REST = [
  { name: "热汤", desc: "身体状态 +20", cost: 2, hp: 20 },
  { name: "伤药", desc: "身体状态 +45", cost: 5, hp: 45 },
  { name: "求助牌", desc: "「监考官的帮助」。危急时换一句提示，并标出危险选项。", cost: 5, hints: 1, max: 3 },
  { name: "打火机", desc: "冷的地方用得上。烧东西也用得上。", cost: 3, inv: "打火机" },
  { name: "针线包", desc: "缝补用。考场里，也许缝的不是衣服。", cost: 3, inv: "针线包" }
];

Object.assign(SCENES, {
rest5: {
  loc: "考生休息处 · 鸡鸣山麓",
  bg: "rest",
  radio: "休息处开放。可用分数兑换物资。",
  who: "",
  art: "shop",
  shop: SHOP_REST,
  fx: { hp: 25 },
  text: function(s){
    var t = "下山的路很长。松林尽头，路边斜立着一块界碑，一面写着「鸡鸣山麓」，另一面写着「向前100米」。\n雪雾里出现几栋房屋。离得最近的那栋悬挂着灯箱，白底红字：住宿暖气 餐饮。\n重点突出，吸引力非常致命。\n一位短发女老板拎着菜刀从走廊尽头出来：「哟，刚考完？小胡给登记一下。」\n于闻瘫在沙发上数分，老于念叨「活着就好」。游惑坐在最远的角落，摸了一下耳钉，心情极差——如果交卷再慢几分钟，922 的牛肉就能熟了。";
    if (s.viol > 0 && !s.flags.servedJinbi) t += "\n\n前台屏幕忽然跳出一行红字：【违规考生请前往监考处领罚。】";
    return t;
  },
  choices: [
    { text: "（违规考生）去监考处领罚", next: "jinbi", if: { minViol: 1, noflag: "servedJinbi" } },
    { text: "去角落找游惑", next: "rest5_yh", if: { noflag: "restYh" } },
    { text: "跟老板搭话", next: "rest5_boss", if: { noflag: "restBoss" } },
    { text: "回房间睡一觉", next: "rest5_sleep", if: { noflag: "restSleep" } },
    { text: "出发，去下一场考试", next: "rest5_end", if: { or: [{ flag: "servedJinbi" }, { maxViol: 0 }] } }
  ]
},
jinbi: {
  loc: "监考处 · 禁闭室",
  bg: "jinbi",
  radio: "违规处罚执行中。",
  who: "监考官 922", whoClass: "sys",
  fx: { flag: { servedJinbi: true }, clock: 120, log: "监考处报到。" },
  text: function(s){
    return "922 和 154 一左一右，把你领进一间没有窗的屋子。922 一边走一边嘟囔：「我有一点急，还有一点饿。」\n154 生怕谁听见似的：「少说两句。」\n铁门合上。黑得像被系统删掉了一块。\n门外，有人慢悠悠地敲了两下，是 001：「禁闭室环境的舒适度决定着惩罚的力度。这间，我特意挑过。」\n" +
      (s.flags.fullInvig ? "「你违规三次了。下一场，有人会全程看着你。」" : "「下次违规之前，想想值不值。」");
  },
  choices: [
    { text: "隔着门问：「你们老大一直这么闲？」", next: "rest5", fx: { qj: 1, log: "154：「……他不闲。他只是喜欢。」" } },
    { text: "闭眼睡觉，像某位考生那样", next: "rest5", fx: { hp: 15, yh: 1, log: "你在禁闭室里睡了一觉。" } }
  ]
},
rest5_boss: {
  loc: "考生休息处 · 前台",
  bg: "rest",
  who: "旅馆老板", whoClass: "npc",
  fx: { flag: { restBoss: true } },
  text: "老板用刀背咣咣敲着墙。墙上一行字：考生休息处。\n「这话真是稀奇了，」她笑得像个山妖怪，「你们刚考完，我能不知道？」\n她压低声音，冲角落的游惑扬了扬下巴：「知道么？有的考场里啊，还能找到以往考生的痕迹呢。」\n前台小胡在旁边小声补充：「老板说的是真的。名字、日记、墓碑，什么都有。」",
  choices: [
    { text: "「以往的考生……后来去哪了？」", next: "rest5", fx: { score: 1, flag: { bossClue: true }, log: "老板：「有的及格了，有的留在考场里，成了题。」" } },
    { text: "要一碗热汤", next: "rest5", fx: { hp: 15 } }
  ]
},
rest5_yh: {
  loc: "考生休息处 · 角落",
  bg: "rest",
  who: "游惑", whoClass: "yh",
  fx: { flag: { restYh: true } },
  text: function(s){
    var a = s.flags.wroteJie ? "「墙上那行字，」他忽然开口，「你誊的？」\n你说是。他看了你两秒，「嗯」了一声，像是在给卷面打分。" : "他看你一眼，又看回杯子里的热水。\n「有事说。」";
    return "你在他对面坐下。灯光太亮了，他眼睛有点不舒服似的，偶尔眯一下。\n" + a + "\n于闻凑过来小声说：「我哥不是冷，是懒得说话。真的。」";
  },
  choices: [
    { text: "「下一场一起？」", next: "rest5", fx: { yh: 1, log: "游惑没拒绝。" } },
    { text: "「那个 001……你真不认识？」", next: "rest5", fx: { yh: 1, flag: { askedPast: true }, log: "游惑：「忘了。」停了很久，又说，「……他很烦。」" } }
  ]
},
rest5_sleep: {
  loc: "考生休息处 · 房间",
  bg: "rest",
  who: "",
  fx: { hp: 25, clock: 360, flag: { restSleep: true }, log: "睡了六个小时。状态恢复。" },
  text: "暖气烧得很足。你几乎是一沾枕头就睡着了。\n梦里还是雪。雪里有人穿着笔挺的制服，背对着你，看不清脸。有人在远处叫一个字母——\n醒来的时候，窗外是假的晴天。",
  choices: [
    { text: "下楼", next: "rest5" }
  ]
},
rest5_end: {
  loc: "十字路口",
  bg: "radio",
  radio: "本轮考试制度为3+1+1，恭喜你们顺利完成了其中一门，现有另外四门待考。",
  who: "系统广播", whoClass: "sys",
  text: "大路尽头是一个十字路口。广播说：\n【考生拥有选择权，可以自主安排考试顺序。】\n【请在30秒内做出选择。】\n于闻和老于为「先考哪门」吵成一团。纹身男要考数学，于闻说数学会死人。\n【友情提示，选择时间还剩5秒。】\n【4秒。】【3秒。】……\n【自主选择权关闭。】\n游惑冷笑一声，脸气绿了。",
  choices: [
    { text: "「……所以考什么？」", next: "lang_in", fx: { clock: 30 } }
  ]
},

/* ---------- 外语 ---------- */
lang_in: {
  loc: "外语考场 · 村口",
  bg: "village",
  radio: "本场考试时间：10天。本场考试科目：外语。本场外语语种：吉普赛。",
  who: "",
  fx: { exam: "外语考场", subj: "外语", log: "进入外语考场。" },
  text: function(s){
    var t = "雾很重。村口立着一块地碑，刻的字一个都看不懂。\n于闻盯着地碑看了半天：「讲个笑话，看地碑能知道自己在哪儿。」\n村民穿着发黑的衣服，从门缝里看你们。他们说话像收音机调错了台。村子尽头的孤屋前，坐着一个裹黑布的老太婆。再往后，是一片墓地。";
    t += s.flags.fullInvig
      ? "\n\n你身后多了一个人。001 双手插兜：「全程陪同。别回头看我，看题。」"
      : "\n\n村口还站着一个人——001。「有人用了一张监考官的帮助，」他冲游惑笑，「我来帮忙。」游惑：「……」";
    return t;
  },
  choices: [
    { text: "去找门口的黑婆", next: "lang_room" },
    { text: "先去墓地看看", next: "lang_grave" },
    { text: "跟着游惑走", next: "lang_room", fx: { yh: 1 } }
  ]
},
lang_room: {
  loc: "外语考场 · 黑婆的屋子",
  bg: "village",
  radio: "听力原文将于30分钟后开始播放，每道题只播放两遍。",
  who: "系统广播", whoClass: "sys",
  text: "黑婆把你们领进屋子，一人指了一张床。001 很自然地把行李放在游惑隔壁那张。\n广播立刻响了：\n【另，禁止考生和监考官发展不正当关系，请重新分配房间。】\n全屋安静了三秒。\n于闻憋笑憋得浑身发抖。游惑面无表情地把 001 的行李扔了出去。",
  choices: [
    { text: "笑出声", next: "lang_listen", fx: { qj: 1, log: "001 冲你眨了一下眼。" } },
    { text: "替游惑把门关上", next: "lang_listen", fx: { yh: 1 } }
  ]
},
lang_listen: {
  loc: "外语考场 · 听力",
  bg: "village",
  radio: "听力正式开始，请各位考生迅速到场，每段话只播放两遍。",
  who: "黑婆", whoClass: "npc",
  art: "paper",
  paper: "第一场考试：听力。\n黑婆说话，考生听。每段只播放两遍。",
  text: "黑婆开口，声音像砂纸刮过门板。一串听不懂的音节，最后落在一个反复出现的词上。\n纹身男掏出手机想录音。于闻急得拽他：「开卷以外不能用手机！」\n游惑安静地听完第一遍，抬手在门框上写下几个音节。",
  hint: "听力只放两遍，听力期间别交头接耳，别掏手机——那都算违规。",
  choices: [
    { text: "跟着她的发音，一个音一个音地默记", next: "lang_heipo2", fx: { score: 2, flag: { learnWord: true }, log: "你记下了几个吉普赛语词。" } },
    { text: "抄下游惑写在门框上的音节", next: "lang_heipo2", fx: { yh: 1, flag: { learnWord: true } } },
    { text: "凑过去问于闻她说了啥", next: "lang_heipo2", fx: { viol: 1, hp: -10, log: "听力期间交谈 · 违规 +1" } }
  ]
},
lang_heipo2: {
  loc: "外语考场 · 黑婆的屋子",
  bg: "village",
  who: "秦究 · 001", whoClass: "qj",
  text: "听力结束，黑婆低头缝一个布娃娃，针脚又密又歪。墙上挂着一排做好的，眼睛全是黑纽扣。\n【明早7点30分，阅读考试准时开始，请勿迟到。】\n窗外天色暗得很快。村民挨家挨户关门，门闩落下的声音此起彼伏。\n001 倚着门框，看游惑：「优等生的小聪明，到这儿可就不管用了。」",
  choices: [
    { text: "趁天没黑，去墓地", next: "lang_grave", if: { noflag: "foundZhao" } },
    { text: "回床上，等天亮", next: "lang_night" }
  ]
},
lang_grave: {
  loc: "外语考场 · 墓地",
  bg: "fog",
  who: "",
  fx: { flag: { foundZhao: true }, clock: 40 },
  text: function(s){
    return "墓碑东倒西歪。有几座坟的土是松的，像有什么东西从下面爬出去过。\n最边上一块碑没刻吉普赛文，碑底一行小字是中文：\n「他的朋友为他立碑于此，愿他安息。」\n碑前埋着一个铁盒，里面是一本泡烂了的日记本。扉页写着三个字：赵文途。" +
      (s.flags.bossClue ? "\n你想起旅馆老板那句话：有的考场里，还能找到以往考生的痕迹。" : "");
  },
  hint: "坟土松动的那几座，别站太近。日记本比墓碑更重要。",
  choices: [
    { text: "把日记本揣进怀里", next: "lang_grave2", fx: { score: 2, inv: "赵文途的日记", log: "往期考生：赵文途。" } },
    { text: "蹲下去看松动的坟土", next: "lang_grave2", fx: { hp: -20, log: "一只手从土里抓住了你的脚踝。" } }
  ]
},
lang_grave2: {
  loc: "外语考场 · 墓地",
  bg: "fog",
  who: "",
  text: "你回头看了一眼。雾里，一个村民站在墓地边上，一动不动。\n他的衣服和别的村民一样黑，可他的脸——像个中国人。\n他张了张嘴，发出的只有乱码。\n黑婆远远喊他：村民丁。",
  choices: [
    { text: "回去，把听力补上", next: "lang_listen", if: { noflag: "learnWord" } },
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
    var t = "半夜，窗户被什么拍响。啪。啪。\n于闻缩在被子里：「手……是手！墓地里那些——」\n断手断脚在地上爬，扒门、敲窗、钻缝。整栋屋子都在响。\n隔壁床，游惑睡得纹丝不动。无论鬼怪如何闹腾，都没能把他吵醒。\n";
    t += s.flags.fullInvig
      ? "001 坐在你床尾，一只鬼手刚伸进来，就被他捏住了手腕：「全程陪同，包括这个。」"
      : "门开了。001 走进来，随手捏住一只往游惑床上爬的鬼手，打量两眼，搁在游惑枕边：「送你，不谢。」";
    return t;
  },
  hint: "鬼手只往门缝和窗缝钻。别开窗，别出门，守住床边就行。",
  choices: [
    { text: "抄起凳子守门", next: "lang_doll", fx: { hp: -10, score: 2, log: "你守了一夜门。" } },
    { text: "试着叫醒游惑", next: "lang_doll", fx: { yh: 1, log: "叫不醒。根本叫不醒。" } },
    { text: "开窗把鬼手扔出去", next: "lang_doll", fx: { hp: -30, log: "窗外伸进来的，不止一只。" } },
    { text: "躲到 001 身后", next: "lang_doll", if: { or: [{ full: true }, { minQj: 2 }] }, fx: { qj: 2, log: "001：「这时候倒想起监考官了。」" } }
  ]
},
lang_doll: {
  loc: "外语考场 · 缝还是不缝",
  bg: "village",
  radio: "警告：阅读题已经开始，请考生不要浪费考试时间。",
  who: "",
  art: "paper",
  paper: function(s){ return "阅读题：村民的委托。\n每个娃娃，代表一个人。" + (s.flags.learnWord ? "\n（你认得那个反复出现的词：名字。）" : ""); },
  text: function(s){
    return "天亮了。黑婆的布和剪刀摆在桌上。游惑已经缝了 16 个娃娃——大佬疯了，于闻说。\n村民丁站在门外，盯着桌上的布。\n" +
      (s.inv.indexOf("赵文途的日记") >= 0 ? "你翻开日记：往期考生赵文途，记忆被清盘，变成了村民丁。他在等后来的人，送来一个代表他自己的娃娃，好让他解脱。" : "他到底在等什么？你只知道，缝错的娃娃会出事——黑婆缝的那些，眼睛是空的。") +
      (s.inv.indexOf("针线包") >= 0 ? "\n你摸出休息处换来的针线包。" : "");
  },
  hint: "娃娃代表人。替村民丁缝「他自己」——名字是赵文途。千万别缝你自己。",
  choices: [
    { text: "缝一个娃娃，背后绣上「赵文途」，送到他手里", next: "lang_fire", if: { has: "赵文途的日记" }, fx: { score: 6, flag: { langTrue: true }, log: "村民丁握住了娃娃。" } },
    { text: "用针线包仔细缝一个，绣上「赵文途」", next: "lang_fire", if: { flag: "foundZhao", has: "针线包" }, fx: { score: 6, flag: { langTrue: true }, log: "针脚很稳。" } },
    { text: "按那个词的意思，缝一个绣着「名字」的娃娃", next: "lang_fire", if: { flag: "learnWord" }, fx: { score: 3, flag: { langSafe: true } } },
    { text: "照着自己的样子缝一个，送给黑婆", next: "lang_fire", fx: { hp: -40, score: 1, flag: { langSafe: true }, log: "娃娃的纽扣眼睛在看你。你的影子淡了一截。" } },
    { text: "跟着游惑一起，挨家挨户把娃娃送完", next: "lang_fire", fx: { yh: 1, score: 2, flag: { langSafe: true } } }
  ]
},
lang_fire: {
  loc: "外语考场 · 火烧考场",
  bg: "fire",
  who: "游惑", whoClass: "yh",
  text: function(s){
    return (s.flags.langTrue ? "村民丁抱着娃娃，嘴里的乱码终于停了。他说了一句中文：「谢谢。」然后像一缕烟，散了。\n" : "村民丁没有接你的娃娃。\n") +
      "游惑知道了赵文途的事。他什么也没说，只是脸冷得吓人。\n「不想考了，」他说，「趁今晚把娃娃送完。」\n然后，001 不知从哪拎来一桶油，往黑婆的屋子上一泼。\n尘归尘，土归土。";
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
  radio: "考场崩溃，无法恢复，考试终止。",
  who: "系统", whoClass: "sys",
  stamp: "及格",
  text: function(s){
    return "火从黑婆的屋子烧到墓地，烧了整整一夜。那些在地上爬的东西，终于不动了。\n【考场遭受永久性损伤，考生总分扣除5分，最终合计为12分。】\n【监考官处分一次。】\n001：「呵。」\n【抵扣之后，总分仍然超过本场考试平均分。奖励：考生游惑获得一次抽签权。】\n隔天，001 的臂章没了。系统通知：受处分的监考官 001，转为考生。\n他把制服外套搭在臂弯里，冲游惑笑：「下一场，咱们就是同学了。」\n游惑：「……谁跟你咱们。」";
  },
  choices: [
    { text: "领取及格章，前往下一处", next: "rest7", fx: { flag: { pass2: true }, score: 6, exam: "休息处", subj: "休息", log: "外语及格。001 转为考生。" } }
  ]
},
rest7: {
  loc: "考生休息处",
  bg: "rest",
  radio: "现有分数将核算为等级，之后每场考试结束核算一次。",
  who: "",
  fx: { hp: 30, log: "休息处：状态恢复。" },
  art: "shop",
  shop: SHOP_REST,
  text: "又是休息处。暖气，吊灯，滚动的兑换目录。广播在念新规矩：\n【考试实行末尾淘汰制，每场考试结束后，等级为D的考生直接淘汰，等级为C的考生留待查看，需要重考。】\n现在秦究也戴上了考生的牌子，坐在游惑旁边的沙发扶手上，像在自己家。\n于闻小声说：「我怎么觉得……他俩以前就认识？」",
  choices: [
    { text: "问秦究：「被罢黜了，你一点都不急？」", next: "rest7_end", fx: { qj: 1, log: "秦究：「急什么，考生视角也挺好。」" } },
    { text: "问游惑：「你真不记得他？」", next: "rest7_end", fx: { yh: 1, log: "游惑：「不记得。」停了停，「……应该不记得。」" } },
    { text: "什么都不问，直接出发", next: "rest7_end" }
  ]
},
rest7_end: {
  loc: "码头",
  bg: "radio",
  radio: "考生已从各处登船，驶往最终考试地点。",
  who: "系统广播", whoClass: "sys",
  text: "【除受处分监考官001号外，考生拥有自主选择权，可以安排待考科目顺序。】\n秦究：「……我谢谢它。」\n汽笛长鸣。海浪的声音混着收音机的杂音，从雾的另一头涌过来。\n【本场考试科目：历史。考查知识点：世界史，海上马车夫。】",
  choices: [
    { text: "登船", next: "hist_in", fx: { clock: 30 } }
  ]
}
});
