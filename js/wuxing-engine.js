/**
 * wuxing-engine.js
 * 玄学形象指南 — 五行推算引擎 (IIFE module)
 * Depends on: lunar-javascript (global Solar), mapping-data.js (global WUXING_DATA)
 */

const WuxingEngine = (function () {
  'use strict';

  const DATA = WUXING_DATA;

  // ── 内部工具函数 ────────────────────────────────────────────────────────────

  /**
   * 根据天干或地支查其五行
   * @param {string} char - 天干或地支单字
   * @returns {string} 五行
   */
  function charToWuxing(char) {
    return DATA.TIANGAN_WUXING[char] || DATA.DIZHI_WUXING[char] || null;
  }

  /**
   * 确定性伪随机，基于日期种子，返回 [-3, 3] 整数
   * @param {number} seed - 数字种子
   * @returns {number}
   */
  function pseudoRandNoise(seed) {
    // 简单线性同余，结果落 [-3, 3]
    const val = ((seed * 1664525 + 1013904223) & 0xffffffff) >>> 0;
    return (val % 7) - 3;
  }

  // ── 公共方法 ────────────────────────────────────────────────────────────────

  /**
   * 1. 根据阳历生日获取八字
   * @param {number} year
   * @param {number} month  1-indexed
   * @param {number} day
   * @returns {Object} bazi
   */
  function getBazi(year, month, day) {
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();
    const ec = lunar.getEightChar();

    // 以正午（午时）为时柱默认
    const noonSolar = Solar.fromYmd(year, month, day);
    const noonLunar = noonSolar.getLunar();
    const noonEc = noonLunar.getEightChar();

    return {
      yearGan:  ec.getYearGan(),
      yearZhi:  ec.getYearZhi(),
      monthGan: ec.getMonthGan(),
      monthZhi: ec.getMonthZhi(),
      dayGan:   ec.getDayGan(),
      dayZhi:   ec.getDayZhi(),
      // 时柱：默认用午时（正午），lunar-javascript 的 getTimeGan/Zhi 需要时柱索引
      // 使用当日八字对象的时干支（以午时 index=6 为默认）
      hourGan:  noonEc.getTimeGan ? noonEc.getTimeGan() : ec.getDayGan(),
      hourZhi:  noonEc.getTimeZhi ? noonEc.getTimeZhi() : ec.getDayZhi(),
      nayin: {
        year:  ec.getYearNaYin(),
        month: ec.getMonthNaYin(),
        day:   ec.getDayNaYin()
      },
      shengxiao: lunar.getYearShengXiao()
    };
  }

  /**
   * 2. 日主五行（日干对应的五行）
   * @param {Object} bazi
   * @returns {string}
   */
  function getDayMasterElement(bazi) {
    return DATA.TIANGAN_WUXING[bazi.dayGan] || null;
  }

  /**
   * 3. 统计八字中各五行的数量
   * @param {Object} bazi
   * @returns {Object} { 木:n, 火:n, 土:n, 金:n, 水:n }
   */
  function countElements(bazi) {
    const counts = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    const chars = [
      bazi.yearGan,  bazi.yearZhi,
      bazi.monthGan, bazi.monthZhi,
      bazi.dayGan,   bazi.dayZhi,
      bazi.hourGan,  bazi.hourZhi
    ];
    chars.forEach(function (c) {
      const wx = charToWuxing(c);
      if (wx && counts[wx] !== undefined) {
        counts[wx]++;
      }
    });
    return counts;
  }

  /**
   * 4. 判断日主旺弱
   *    得令：月支五行与日主相同，或月支五行生日主
   *    得势：同类（同五行）+ 生我（生日主的五行）数量 >= 4
   * @param {Object} bazi
   * @returns {boolean} true = 旺（身强）
   */
  function isDayMasterStrong(bazi) {
    const dayWx = getDayMasterElement(bazi);
    const monthZhiWx = DATA.DIZHI_WUXING[bazi.monthZhi];

    // 得令：月支与日主同行，或月支生日主
    const deLing = (monthZhiWx === dayWx) || (DATA.SHENG[monthZhiWx] === dayWx);

    if (deLing) return true;

    // 得势：八字中同类 + 生我 的个数 >= 4
    const shengWoWx = DATA.BEI_SHENG[dayWx]; // 生日主的五行
    const counts = countElements(bazi);
    const supportCount = (counts[dayWx] || 0) + (counts[shengWoWx] || 0);

    return supportCount >= 4;
  }

  /**
   * 5. 求喜用神
   *    强（身强）→ 喜克我，用我生，忌同类
   *    弱（身弱）→ 喜生我，用同类，忌克我
   * @param {Object} bazi
   * @returns {{ xi: string, yong: string, ji: string }}
   */
  function getXiyongshen(bazi) {
    const dayWx = getDayMasterElement(bazi);
    const strong = isDayMasterStrong(bazi);

    if (strong) {
      return {
        xi:   DATA.BEI_KE[dayWx],   // 克我之行（耗身）
        yong: DATA.SHENG[dayWx],     // 我生之行（食伤泄秀）
        ji:   dayWx                  // 同类（帮身）为忌
      };
    } else {
      return {
        xi:   DATA.BEI_SHENG[dayWx], // 生我之行（印星）
        yong: dayWx,                  // 同类之行（比劫）
        ji:   DATA.BEI_KE[dayWx]     // 克我之行为忌
      };
    }
  }

  /**
   * 6. 获取今日信息（流日信息）
   * @returns {Object}
   */
  function getTodayInfo() {
    const solar = Solar.fromDate(new Date());
    const lunar = solar.getLunar();
    const ec = lunar.getEightChar();

    const dayGan = ec.getDayGan();
    const dayZhi = ec.getDayZhi();
    const dayGanWuxing = DATA.TIANGAN_WUXING[dayGan] || null;
    const dayZhiWuxing = DATA.DIZHI_WUXING[dayZhi] || null;

    let xiShenFangWei = null;
    let caiShenFangWei = null;
    try {
      xiShenFangWei = lunar.getDayXiShenFangWei ? lunar.getDayXiShenFangWei() : null;
    } catch (e) { /* 部分版本不支持 */ }
    try {
      caiShenFangWei = lunar.getDayCaiShenFangWei ? lunar.getDayCaiShenFangWei() : null;
    } catch (e) { /* 部分版本不支持 */ }

    return {
      dayGan,
      dayZhi,
      dayGanWuxing,
      dayZhiWuxing,
      xiShenFangWei,
      caiShenFangWei
    };
  }

  /**
   * 7. 计算今日气场分数
   *    基准 75，根据今日干支五行与喜用忌神的关系调整，加伪随机扰动 ±3
   * @param {{ xi: string, yong: string, ji: string }} xiyong
   * @param {Object} todayInfo - 来自 getTodayInfo()
   * @returns {number} 整数，夹在 [60, 95]
   */
  function calcAuraScore(xiyong, todayInfo) {
    let score = 75;

    const { xi, yong, ji } = xiyong;
    const ganWx = todayInfo.dayGanWuxing;
    const zhiWx = todayInfo.dayZhiWuxing;

    // 天干权重：+12（喜）/ +8（用）/ +5（中性） / -10（忌）
    if (ganWx === xi) {
      score += 12;
    } else if (ganWx === yong) {
      score += 8;
    } else if (ganWx === ji) {
      score -= 10;
    } else {
      score += 5; // 中性
    }

    // 地支权重：+6（喜）/ +4（用）/ -5（忌）
    if (zhiWx === xi) {
      score += 6;
    } else if (zhiWx === yong) {
      score += 4;
    } else if (zhiWx === ji) {
      score -= 5;
    }

    // 确定性伪随机噪声 ±3（基于今日日期生成种子）
    const now = new Date();
    const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    score += pseudoRandNoise(seed);

    // 夹紧到 [60, 95]
    return Math.max(60, Math.min(95, Math.round(score)));
  }

  /**
   * 8. 将气场分数映射为百分位
   *    线性映射：60 → 30%，95 → 96%，夹紧到 [25, 98]
   * @param {number} score
   * @returns {number} 百分位整数
   */
  function calcPercentile(score) {
    // 线性插值：score in [60,95] → percentile in [30,96]
    const minScore = 60, maxScore = 95;
    const minPct = 30, maxPct = 96;
    const pct = minPct + (score - minScore) / (maxScore - minScore) * (maxPct - minPct);
    return Math.max(25, Math.min(98, Math.round(pct)));
  }

  /**
   * 9. 今日通用五行穿衣（主流博主方法，所有人同一天结果相同）
   *    基于今日日干五行，按生克关系推算：
   *    大吉色 = 生今日五行的元素（生我者 → 印）
   *    次吉色 = 与今日五行相同的元素（同我者 → 比）
   *    不宜色 = 今日五行所克的元素（我克者 → 财）
   * @param {Object} todayInfo - 来自 getTodayInfo()
   * @returns {{ daji: string, ciji: string, buyi: string, todayElement: string }}
   */
  function getTodayUniversalColors(todayInfo) {
    const todayEl = todayInfo.dayGanWuxing;
    return {
      todayElement: todayEl,
      daji: DATA.BEI_SHENG[todayEl],  // 生我者 → 大吉
      ciji: todayEl,                    // 同我者 → 次吉
      buyi: DATA.SHENG[todayEl]        // 我克者 → 不宜（注：我生者为泄，我克者为财，主流用"我克"作为不宜）
    };
  }

  // ── 暴露公共 API ────────────────────────────────────────────────────────────
  return {
    getBazi,
    getDayMasterElement,
    countElements,
    isDayMasterStrong,
    getXiyongshen,
    getTodayInfo,
    getTodayUniversalColors,
    calcAuraScore,
    calcPercentile
  };

})();
