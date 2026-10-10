/* 章节元数据：科目 / 考场随场景自动推导，章节入场时显示仪式卡。
   subj 为 null 时沿用当前科目（例如禁闭室、终局）。 */
(() => {
  const CH = {
    entry:   { subj: "待定", exam: "入场" },
    physics: { subj: "物理", exam: "003712 · 鸡鸣山",
      card: { no: "考场 003712", subj: "物理", meta: ["开考：北京时间 18:00", "计分：答题墙", "违规三次 · 全程监考"], cast: "欢迎来到 003712 号考场。", tone: "snow" } },
    rest1:   { subj: "休整", exam: "考生休息处",
      card: { no: "考生休息处", subj: "休整", meta: ["分数可兑换物资", "违规考生须先服刑"], cast: "休息处开放。可用分数兑换物资。", tone: "rest" } },
    jinbi:   { subj: null, exam: "监考处 · 禁闭室",
      card: { no: "监考处 · 禁闭室", subj: "违规处罚", meta: ["处罚时间：三小时", "环境越舒适，惩罚越重"], cast: "违规处罚执行中。", tone: "jinbi" } },
    lang:    { subj: "外语", exam: "外语考场 · 吉普赛村",
      card: { no: "外语考场", subj: "外语 · 吉普赛语", meta: ["考试时间：10 天", "听力每段只播放两遍"], cast: "本场考试时间：10天。本场考试科目：外语。", tone: "village" } },
    rest2:   { subj: "休整", exam: "考生休息处",
      card: { no: "考生休息处", subj: "等级核算", meta: ["分数核算为等级", "末尾淘汰"], cast: "现有分数将核算为等级，之后每场考试结束核算一次。", tone: "rest" } },
    hist:    { subj: "历史", exam: "历史考场 · 海上马车夫",
      card: { no: "历史考场", subj: "历史 · 海上马车夫", meta: ["30 名考生 · 分组排名", "行为参与计分 · 无标准答案"], cast: "本场计分方式采用行为参与模式，没有答题卡，没有标准答案。", tone: "sea" } },
    pol:     { subj: "政治 · 清理考场", exam: null,
      card: { no: "监考区 · 中期处罚", subj: "政治 · 清理考场", meta: ["违规考生协助清理异常考场", "唯物与唯心"], cast: "欢迎回来。", tone: "twin" } },
    castle:  { subj: "历史（重考）", exam: "古堡",
      card: { no: "历史重考 · 古堡", subj: "世界史 · 可怕的年代", meta: ["没有答题卡 · 私人计分", "服从公爵"], cast: "考生已从各处乘马车而来，驶往最终考试地点。", tone: "castle" } },
    casino:  { subj: "休整", exam: "考生休息处 · 赌场",
      card: { no: "考生休息处 · 赌场", subj: "休整", meta: ["本处支持以分数下注"], cast: "休息处开放。本处支持以分数下注。", tone: "casino" } },
    math:    { subj: "数学", exam: "布兰登小镇",
      card: { no: "大型联合考场", subj: "数学", meta: ["2048 名考生", "三个阶段 · 先单人作战"], cast: "本场考试为大型联合考场，请考生做好准备。", tone: "math" } },
    rest3:   { subj: "休整", exam: "2号休息处",
      card: { no: "2 号休息处", subj: "最后的休整", meta: ["五门考试，仅剩一门"], cast: "下一门考试科目：语文。", tone: "rest" } },
    yuwen:   { subj: "语文", exam: "非公开式单人考场",
      card: { no: "非公开式单人考场", subj: "语文 · 诗词鉴赏", meta: ["现在是考场时间 17:30", "单人作答"], cast: "下一门考试科目：语文。", tone: "core" } },
    finale:  { subj: "终局", exam: null,
      card: { no: "监考区 · 主控中心", subj: "终局", meta: ["可移动武器 12300 箱", "1500 个火力点"], cast: "我是监考官154，全区六万七千个广播器暂时由我代管。", tone: "core" } }
  };
  const BY_ID = {
    boot: "entry", rules_only: null,
    cabin_cell: "jinbi", jinbi: "jinbi", hist_jinbi: "jinbi", castle_bench: "jinbi", castle_memory: "jinbi",
    rest5_end: "rest1", final_gate: "rest3", final_yuwen: "yuwen", casino: "casino", casino_fire: "casino",
    boot2: "physics", boot3: "physics"
  };
  /* 禁闭室沿用所在考试的科目 */
  const JINBI_SUBJ = { cabin_cell: "物理", jinbi: "休整", hist_jinbi: "历史", castle_bench: "历史（重考）", castle_memory: "历史（重考）" };
  const PREFIX = [["cabin_", "physics"], ["rest5", "rest1"], ["lang_", "lang"], ["rest7", "rest2"], ["hist_", "hist"],
    ["pol_", "pol"], ["castle_", "castle"], ["math_", "math"], ["final_", "finale"]];
  function keyOf(id) {
    if (id in BY_ID) return BY_ID[id];
    for (const [p, k] of PREFIX) if (id.startsWith(p)) return k;
    return null;
  }
  /* 返回 { key, subj, exam, card }；未知场景（结局等）返回 null，HUD 保持原样 */
  function chapterOf(id, sc) {
    const key = keyOf(id);
    if (!key) return null;
    const c = CH[key];
    const locHead = sc && sc.loc ? String(sc.loc).split(" · ")[0] : "";
    return {
      key,
      subj: c.subj != null ? c.subj : (JINBI_SUBJ[id] || null),
      exam: c.exam != null ? c.exam : (locHead || null),
      card: c.card || null
    };
  }
  window.QQCH = { chapters: CH, chapterOf, keyOf };
})();
