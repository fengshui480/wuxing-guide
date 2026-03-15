/**
 * report-generator.js
 * 玄学形象指南 — 报告生成器 (IIFE module)
 * Depends on: wuxing-engine.js (WuxingEngine), mapping-data.js (WUXING_DATA)
 */

const ReportGenerator = (function () {
  'use strict';

  const DATA = WUXING_DATA;
  const Engine = WuxingEngine;

  /**
   * 确定性伪随机，基于种子返回 [0, max) 的整数
   */
  function pseudoRandInt(seed, max) {
    const val = ((seed * 1664525 + 1013904223) & 0xffffffff) >>> 0;
    return val % max;
  }

  /**
   * 生日种子：year * 10000 + month * 100 + day
   */
  function dateSeed(year, month, day) {
    return year * 10000 + month * 100 + day;
  }

  /**
   * 从关键词池中确定性地选取 3 个关键词（来自不同五行池）
   * 优先从 xi、dayMaster、yong 三个五行池中各取一个
   */
  function pickAuraKeywords(year, month, day, xiEl, dayMasterEl, yongEl) {
    const seed = dateSeed(year, month, day);

    const pools = [xiEl, dayMasterEl, yongEl];
    const keywords = [];

    pools.forEach(function (el, i) {
      const pool = DATA.AURA_KEYWORDS[el] || DATA.AURA_KEYWORDS['金'];
      const idx = pseudoRandInt(seed + i * 31337, pool.length);
      keywords.push(pool[idx]);
    });

    return keywords;
  }

  /**
   * 构建颜色信息对象
   */
  function buildColors(xiEl, yongEl, jiEl) {
    const xiColors  = DATA.COLORS[xiEl]  || DATA.COLORS['金'];
    const yongColors = DATA.COLORS[yongEl] || DATA.COLORS['金'];
    const jiColors  = DATA.COLORS[jiEl]  || DATA.COLORS['金'];

    return {
      main:       xiColors.main[0],
      accent:     yongColors.main[0],
      avoid:      jiColors.main[0],
      mainAll:    xiColors.main,
      accentAll:  yongColors.main,
      avoidAll:   jiColors.main,
      xiElement:  xiEl,
      yongElement: yongEl,
      jiElement:  jiEl
    };
  }

  /**
   * 构建穿搭风格对象
   */
  function buildStyle(xiEl, gender) {
    const table = (gender === 'male') ? DATA.STYLES_MALE : DATA.STYLES;
    const styleData = table[xiEl] || table['金'];

    if (gender === 'male') {
      return {
        keyword: styleData.keyword,
        scenes: styleData.scenes,
        accessory: null
      };
    }

    return {
      keyword:   styleData.keyword,
      scenes:    styleData.scenes,
      accessory: styleData.accessory
    };
  }

  /**
   * 构建妆容对象
   */
  function buildMakeup(xiEl, gender) {
    if (gender === 'male') {
      const maleData = DATA.MAKEUP_MALE[xiEl] || DATA.MAKEUP_MALE['金'];
      return {
        keyword: maleData.keyword,
        tip:     maleData.tips
      };
    }

    const makeupData = DATA.MAKEUP[xiEl] || DATA.MAKEUP['金'];
    return {
      keyword: makeupData.keyword,
      lip:     makeupData.lip,
      eye:     makeupData.eye,
      blush:   makeupData.blush
    };
  }

  /**
   * 构建说明文字
   */
  function buildExplanation(dayMasterEl, isStrong, xi, yong, ji) {
    const strongStr = isStrong ? '偏旺' : '偏弱';
    return '你的日主五行属「' + dayMasterEl + '」，当前' + strongStr +
           '，喜「' + xi + '」「' + yong + '」来调和，忌「' + ji + '」过多。';
  }

  /**
   * 主方法：生成完整报告
   * @param {Object} params - { year, month, day, gender, city?, industry? }
   * @returns {Object} report
   */
  function generate(params) {
    const { year, month, day, gender, city, industry } = params;

    // ── 八字 & 五行推算 ──────────────────────────────────────────────────────
    const bazi          = Engine.getBazi(year, month, day);
    const dayMasterEl   = Engine.getDayMasterElement(bazi);
    const isStrong      = Engine.isDayMasterStrong(bazi);
    const xiyongshen    = Engine.getXiyongshen(bazi);
    const todayInfo     = Engine.getTodayInfo();

    const { xi, yong, ji } = xiyongshen;

    // ── 气场分数 ─────────────────────────────────────────────────────────────
    const auraScore      = Engine.calcAuraScore(xiyongshen, todayInfo);
    const auraPercentile = Engine.calcPercentile(auraScore);

    // ── 气场关键词 ───────────────────────────────────────────────────────────
    const auraKeywords = pickAuraKeywords(year, month, day, xi, dayMasterEl, yong);

    // ── 颜色 ─────────────────────────────────────────────────────────────────
    const colors = buildColors(xi, yong, ji);

    // ── 穿搭风格 ─────────────────────────────────────────────────────────────
    const style = buildStyle(xi, gender);

    // ── 妆容 ─────────────────────────────────────────────────────────────────
    const makeup = buildMakeup(xi, gender);

    // ── 说明文字 ─────────────────────────────────────────────────────────────
    const explanation = buildExplanation(dayMasterEl, isStrong, xi, yong, ji);

    // ── 用户信息回显 ─────────────────────────────────────────────────────────
    const userInfo = {
      gender:    gender,
      birthDate: year + '年' + month + '月' + day + '日',
      city:      city    || null,
      industry:  industry || null,
      shengxiao: bazi.shengxiao
    };

    return {
      bazi,
      dayMasterElement: dayMasterEl,
      isStrong,
      xiyongshen,
      todayInfo,
      explanation,
      auraScore,
      auraPercentile,
      auraKeywords,
      colors,
      style,
      makeup,
      userInfo
    };
  }

  // ── 暴露公共 API ────────────────────────────────────────────────────────────
  return { generate };

})();
