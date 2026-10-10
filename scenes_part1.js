var SCENES = {
rules_only: {
  loc: "考试条例 · 考生须知",
  bg: "system",
  nosave: true, nohud: true,
  radio: "请认真阅读。勾选「已知晓」后，条例将默认生效。",
  who: "系统", whoClass: "sys",
  text: "一、本考试为真身考试。及格活命，不及格者将从系统中移除。\n二、考试期间服从监考官。累计违规三次，由特级监考官全程监考。\n三、题型包括单选、多选、填空、听力、论述等。书写「解」，视为提交答案。\n四、休息区可用分数兑换物资。分数可带离考场。\n五、允许在规则范围内自行作答。破坏考场、攻击监考官、听力期间交谈，均记违规。\n六、考场内出现的「死人」「怪物」「猎人」，可能是题干本身。\n\n【考试为踩点给分，考生必须将答案写在指定答题卡上（特殊情况除外），否则答案作废。】\n【考试过程中如发现违规舞弊等情况，将逐出考场。】\n【其他考试要求，以具体题目为准。】\n\n（注：「解」字作答、分数兑换等为本互动的简化玩法。）",
  choices: [
    { text: "已知晓，返回封面", next: "title" }
  ]
},
boot: {
  loc: "入场通道",
  bg: "radio",
  radio: "滋啦——滋啦——白噪音铺满整个车厢。",
  who: "",
  fx: { exam: "入场", subj: "待定", clock: 0, log: "信号接入。" },
  text: function(s){ return "你本来坐在普通的座位上。窗外是城市的灯。\n下一秒，风变得很空，像有人把世界的音量拧小了。收音机自己响起来。\n准考证在你手心发烫。姓名栏写着：" + s.name + "。"; },
  choices: [
    { text: "把音量拧大，听下去", next: "boot2" },
    { text: "推开车门——门打不开", next: "boot2", fx: { log: "车门反锁。系统已接管。" } }
  ]
},
boot2: {
  loc: "入场通道",
  radio: "现在是北京时间十七时三十分。离考试开始还有三十分钟。",
  who: "系统广播", whoClass: "sys",
  text: "「欢迎参加全球大型高危险性统一考试。」\n「本场为真身考试。请各位考生带好准考证，按时入场。」\n「不及格者，将从系统中移除。」\n\n播音腔平稳得可怕。像在通知明天的天气，而不是死亡。",
  choices: [
    { text: "看向窗外", next: "boot3" }
  ]
},
boot3: {
  loc: "考场 003712 · 门外",
  bg: "snow",
  radio: "考生已到达考场。请入场。",
  who: "",
  fx: { exam: "003712", subj: "物理", clock: 8 },
  text: "雪忽然砸下来。城市没了。\n眼前是一栋猎人木屋，灯火从窗缝里漏出来。门口钉着一块冷铁牌：\n考场 003712　科目：物理　分值：24　时限：48小时。\n木门没锁。里面有人声，还有很浅的、几乎听不见的呼吸——有人在睡觉。",
  choices: [
    { text: "推门进去", next: "cabin_in", fx: { clock: 2 } }
  ]
},
cabin_in: {
  loc: "考场 003712 · 猎人木屋",
  bg: "cabin",
  radio: "第一阶段将在六小时后结算。请尽快熟悉考场。",
  who: "于闻", whoClass: "npc",
  fx: { log: "进入物理考场。" },
  text: "一个年轻人撞上你，嗓门发紧：「你也是刚进来的？我去，真身啊真身——死了就是真死！」\n他叫于闻，身后跟着他爸老于，一脸诚惶诚恐。已经把屋子里能看到的人都数了一遍：「连你，十二个。可餐具是十三套。你懂我意思吗？」\n壁炉烧着。长桌铺白布。刀、叉、汤匙，整齐得像灵堂。",
  choices: [
    { text: "「十三套餐具，十二个人。题眼在多余的那一份。」", next: "cabin_yh", fx: { score: 2, log: "你先看到了餐具。" } },
    { text: "「先别喊。把屋子看清楚。」", next: "cabin_yh", fx: { yh: 1, log: "你压住场面。" } },
    { text: "先找那个睡觉的人", next: "cabin_yh" }
  ]
},
cabin_yh: {
  loc: "考场 003712 · 厅",
  bg: "cabin",
  who: "游惑", whoClass: "yh",
  text: "沙发上躺着一个人。黑发，眉骨很冷，闭着眼，像这考场里睡觉才是正事。\n于闻压低嗓子：「那是我哥，游惑。别惹他……我是说，别吵他。他睡觉的时候天塌了都别叫，叫醒了更吓人。反正，很能打。」\n火光在他眼皮上跳。他没醒，呼吸却稳得不像考生。",
  choices: [
    { text: "叫醒他：「考试开始了。」", next: "cabin_wake" },
    { text: "不打扰。去看长桌和灯。", next: "cabin_radio", fx: { yh: 1, log: "你没有去吵游惑。" } },
    { text: "低头看他的准考证", next: "cabin_peek" }
  ]
},
cabin_wake: {
  loc: "考场 003712 · 厅",
  bg: "cabin",
  who: "游惑", whoClass: "yh",
  text: "游惑睁眼。眼神清，也冷，像刚从很深的地方被拽回来。\n「有事？」\n你说考试。他「知道。」两个字，然后把脸重新侧进沙发靠垫里。\n于闻在背后比划：看吧，叫了也白叫。",
  choices: [
    { text: "「那你倒是起来答题。」", next: "cabin_radio", fx: { log: "游惑懒得理你。" } },
    { text: "「随你。我自己看题。」", next: "cabin_radio", fx: { yh: 1 } }
  ]
},
cabin_peek: {
  loc: "考场 003712 · 厅",
  bg: "cabin",
  who: "游惑", whoClass: "yh",
  text: "准考证压在他袖口下。你刚偏头，他就没睁眼地开口：\n「看够了没。」\n声音不重，却把你钉在原地。于闻倒抽一口冷气。",
  choices: [
    { text: "退开，去听广播", next: "cabin_radio" },
    { text: "「只是确认你是不是考生。」", next: "cabin_radio", fx: { yh: 1, log: "游惑没再理你。" } }
  ]
},
cabin_radio: {
  loc: "考场 003712 · 厅",
  bg: "cabin",
  radio: "科目：物理。分值：24分。考试时长：四十八小时。题型：论述。请在六小时内完成第一阶段作答。",
  who: "系统广播", whoClass: "sys",
  art: "paper",
  paper: "论述题：最后的晚餐。十三套餐具，十二名考生。光与影，生与死。请给出你的「解」。",
  text: "墙面浮出字，像被一只看不见的手用白粉慢慢写上。\n老于推了推眼镜，声音发颤：「最后的晚餐……达·芬奇。十二门徒加耶稣，十三个人。光学！灯的位置决定谁坐在阴影里——」\n于闻小声：「阴影里的人会怎样？」\n没人回答。壁炉噼啪一声，像在替系统笑。",
  choices: [
    { text: "去长桌边数餐具、看刀和灯", next: "cabin_inspect", fx: { clock: 20 } },
    { text: "听老于把光学推完", next: "cabin_mai", fx: { clock: 30 } },
    { text: "看游惑怎么做", next: "cabin_watch_yh", fx: { yh: 1 } },
    { text: "推开半扇窗：「试试违规是什么后果。」", next: "cabin_inspect", flash: true, fx: { viol: 1, hp: -5, clock: 10, log: "擅自开窗 · 违规 +1。风雪灌进来，001 在楼上记了一笔。" } }
  ]
},
cabin_inspect: {
  loc: "考场 003712 · 长桌",
  bg: "cabin",
  who: "",
  text: "十三套刀叉。第十二套在灯下发亮，第十三套一半没入阴影。\n刀很沉。与其说是餐具，不如说是笔。刀尖能刻木头。\n窗外暴雪。你若把脸贴到玻璃上，能看见自己的影子被灯拉得很长，长到像另一条人命。\n于闻：「我跟你说，那个猎人甲——他一直在给我们盛汤。可报名册上没有他。」",
  choices: [
    { text: "记住：多余的那份是给「题干」的", next: "cabin_seats", fx: { score: 3, flag: { insight13: true }, log: "你把第十三套餐具当成题干。" } },
    { text: "先坐下，活过第一阶段最重要", next: "cabin_seats" },
    { text: "把油灯挪到桌子正中", next: "cabin_seats", fx: { score: 2, viol: 1, log: "移动考场道具 · 违规 +1", flag: { movedLamp: true } } }
  ]
},
cabin_mai: {
  loc: "考场 003712 · 厅",
  bg: "cabin",
  who: "老于", whoClass: "npc",
  text: "老于在灰上画光路：「入射、反射、遮挡。谁挡住灯，谁就是阴影里的人。六小时结算一次，阴影座位会……扣人。」\n他说得对，也不全对。这题不只要算光，还要问：谁有资格当第十三人。\n游惑不知何时坐起来，看了一眼他的图，又看向壁炉边那个笑眯眯盛汤的猎人。",
  choices: [
    { text: "「猎人不是考生。」", next: "cabin_seats", fx: { score: 3, flag: { insight13: true } } },
    { text: "按她说的，避开阴影座位", next: "cabin_seats", fx: { score: 1 } }
  ]
},
cabin_watch_yh: {
  loc: "考场 003712 · 厅",
  bg: "cabin",
  who: "游惑", whoClass: "yh",
  text: "游惑没加入讨论。他走到墙边，看那道论述题，像在看一张过期的试卷。\n他抽出餐刀。刀光一闪。\n木屑掉下来。墙上多了一个字：\n解。\n字迹狠，也干净。像他这个人。",
  choices: [
    { text: "跟着他，在旁边也刻一个「解」", next: "cabin_seats", fx: { yh: 2, score: 4, flag: { wroteJie: true }, log: "你写下「解」。" } },
    { text: "按兵不动，先把座位看明白", next: "cabin_seats", fx: { yh: 1 } }
  ]
},
cabin_seats: {
  loc: "考场 003712 · 晚餐",
  bg: "cabin",
  radio: "第一阶段作答开始。请落座。",
  who: "系统", whoClass: "sys",
  art: "seats",
  text: "长桌空出十三把椅子。灯在第十位正上方。第七位几乎没进光。第十三位空着，却摆好了餐具。\n猎人站在你身后，温声说：「请坐。汤要凉了。」\n点选一个座位。选完再继续。",
  choices: [
    { text: "落座，等待第一阶段结算", next: "cabin_settle", needSeat: true }
  ]
},
cabin_settle: {
  loc: "考场 003712 · 第一阶段",
  bg: "cabin",
  radio: "第一阶段结算中……",
  who: "",
  text: function(s){
    if (!s.flags.pickedSeat) return "你没有落座。系统判定：未作答。\n阴影像活的一样漫上来。脚下一空。";
    if (s.flags.pickedShadow) return "第七位的椅腿突然陷进地板。阴影不是装饰，是答案的一部分。\n你的小腿像被冰卡住。汤碗翻了，汤是红的。";
    if (s.flags.picked13) return "你坐进第十三位。猎人的笑容裂开。\n那是他的位置。你把题干自己坐穿了——系统迟疑了一秒。";
    if (s.flags.pickedLamp) return "灯下很亮。六小时里你没有被抽中惩罚。老于松了一口气。\n可猎人还在。题没结束。";
    return "座位安全。暂时。猎人仍在桌边走来走去，像在数还有几份汤。";
  },
  choices: [
    { text: "撑住，看游惑", next: "cabin_write", if: { noflag: "pickedSeat" }, fx: { hp: -35, log: "未作答惩罚。" } },
    { text: "咬牙从阴影里爬回来", next: "cabin_write", if: { flag: "pickedShadow" }, fx: { hp: -40, log: "阴影座位反噬。" } },
    { text: "盯着猎人", next: "cabin_write", if: { flag: "picked13" }, fx: { score: 4, yh: 1, log: "坐穿题干。" } },
    { text: "把刀握在手里", next: "cabin_write", if: { flag: "pickedLamp" } },
    { text: "把刀握在手里", next: "cabin_write", if: { flag: "pickedSeat", none: ["pickedShadow","picked13","pickedLamp"] } }
  ]
},
cabin_write: {
  loc: "考场 003712 · 墙",
  bg: "cabin",
  who: "游惑", whoClass: "yh",
  text: function(s){
    var extra = s.flags.wroteJie ? "你的「解」和他的并排。他扫了一眼，没评价，但也没让你滚开。" : "你还没动笔。";
    return "游惑把刀尖抵在墙上，又描了一遍那个字。木纤维裂开。\n「题目要的不是坐对位置。」他说话很慢，「是把题干掉。」\n猎人还在笑。十三套餐具，第十二个考生，第十三份给谁——谁出题，谁就是那一份。\n" + extra;
  },
  choices: [
    { text: "在墙上刻「解」，并走向猎人", next: "cabin_hunter", fx: { yh: 2, score: 4, flag: { wroteJie: true }, log: "提交：解。" } },
    { text: "帮游惑拦住猎人的退路", next: "cabin_hunter", fx: { yh: 2, score: 2 } },
    { text: "「别冲动！会违规的！」", next: "cabin_hunter", fx: { yh: -1, log: "你试图阻止游惑。" } }
  ]
},
cabin_hunter: {
  loc: "考场 003712 · 壁炉",
  bg: "cabin",
  who: "游惑", whoClass: "yh",
  text: "灯影一晃。猎人的脸在火光里不像人。\n游惑把椅子踢过去，动作不大，椅脚正中膝弯。猎人磕在壁炉石沿上，汤勺当一声滚进灰里。\n系统短暂地静了。像有人按错了暂停。\n二楼栏杆上，有人笑了一声。懒，也亮。",
  choices: [
    { text: "补上一脚，把题干踩实", next: "cabin_001", fx: { yh: 1, viol: 1, score: 3, log: "破坏考场核心道具 · 违规 +1" }, flash: true },
    { text: "站在原处，看系统怎么判", next: "cabin_001", fx: { score: 2 } },
    { text: "去扶猎人——他也许是受害者", next: "cabin_001", fx: { hp: -15, score: -1, log: "题干反咬一口。" } }
  ]
},
cabin_001: {
  loc: "考场 003712 · 二楼栏杆",
  bg: "cabin",
  who: "秦究 · 001", whoClass: "qj",
  text: function(s){
    var v = s.flags.fullInvig
      ? "他的目光在你脸上停了一下：「你。违规三次。按条例，我全程看着你。监考官全程陪同，别想着跑。」\n"
      : "";
    return "白衬衫，袖口松着，指间有烟。臂章：001。\n秦究把下巴搁在栏杆上，笑得欠打：「物理题，用力学作答，也算一种解法。小朋友们，分数我记下了。」\n"
      + v +
      "游惑抬头看他。两人对视的那一秒，空气像被谁抽空。\n「滚下监考台。」游惑说。\n「这位同学，」秦究很愉快，「这届考生里，会写『解』的，不止你一个。」";
  },
  choices: [
    { text: "「……你俩认识。」", next: "cabin_result", fx: { qj: 1, yh: 1, log: "你看见了001与游惑。" } },
    { text: "低头装不存在，等分数", next: "cabin_result" },
    { text: "抬头看秦究：「特级监考官亲自来？」", next: "cabin_result", fx: { qj: 2, log: "001记住了你。" } }
  ]
},
cabin_result: {
  loc: "考场 003712 · 结算",
  bg: "cabin",
  radio: "物理科目结算完毕。请前往休息区。",
  who: "系统", whoClass: "sys",
  enter: function(s){
    s.flags.physOk = !!(s.flags.wroteJie || s.flags.insight13 || s.flags.picked13 || s.score >= 8);
  },
  text: function(s){
    if (s.flags.physOk) {
      return "墙面上盖下一枚红章。\n及格。\n猎人的身体像被橡皮擦掉的铅笔印，慢慢淡了。长桌还在，十三套餐具变成十二。\n于闻坐在地上大喘气。老于捂着嘴。游惑已经在门口等传送，好像这只是一张做完的卷子。\n秦究挥了挥手，烟在雪光里散开：「下回见。别死太早。」";
    }
    return "分数不够。系统开始点名。有人从椅子上直接消失，连一声都没留下。\n你的准考证发烫。姓名栏的墨水在爬。";
  },
  choices: [
    { text: "接过及格章，进入休息区", next: "rest5", stamp: "及格", if: { flag: "physOk" }, fx: { flag: { pass1: true }, score: 6, exam: "休息区05", subj: "休息", log: "物理及格。" } },
    { text: "抓住游惑的袖口", next: "dead", if: { noflag: "physOk" }, stamp: "移除" }
  ]
}
};
