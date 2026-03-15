# 玄学形象指南 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static single-page web app that generates personalized feng-shui style guide reports based on user's birth date and today's date.

**Architecture:** Pure frontend SPA using lunar-javascript library (CDN) for Chinese calendar/八字 calculations. Custom五行engine maps eight characters to colors, accessories, styles, and makeup. No backend, no payment — payment handled via 小红书商品橱窗.

**Tech Stack:** HTML5, CSS3 (vanilla, no framework), vanilla JavaScript, lunar-javascript@1.7.7 (CDN), GitHub Pages deployment.

---

## File Structure

```
fengshui-style-guide/
├── index.html              # Single page: form + report (section toggle)
├── css/
│   └── style.css           # All styles: form, report cards, responsive
├── js/
│   ├── wuxing-engine.js    # Core: 八字→五行→喜用神 calculation
│   ├── mapping-data.js     # Data tables: 五行→颜色/材质/风格/妆容/关键词
│   ├── report-generator.js # Combines engine + mapping → report data object
│   └── app.js              # DOM interaction: form validation, render report
├── assets/
│   └── favicon.ico         # Simple icon
└── docs/                   # Spec + plan (already created)
```

---

## Chunk 1: Core Engine + Data

### Task 1: Project Scaffolding

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/app.js`

- [ ] **Step 1: Create minimal index.html with lunar-javascript CDN**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>玄学形象指南</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="app">
    <section id="form-section"></section>
    <section id="report-section" style="display:none"></section>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/lunar-javascript@1.7.7/lunar.js"></script>
  <script src="js/mapping-data.js"></script>
  <script src="js/wuxing-engine.js"></script>
  <script src="js/report-generator.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create placeholder CSS**

```css
/* css/style.css */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #faf9f6; color: #2c2c2c; }
```

- [ ] **Step 3: Create placeholder app.js to verify CDN loads**

```javascript
// js/app.js
document.addEventListener('DOMContentLoaded', function() {
  // Verify lunar-javascript loaded
  var solar = Solar.fromYmd(1990, 6, 15);
  var lunar = solar.getLunar();
  console.log('Lunar lib loaded:', lunar.toString());
  console.log('八字:', lunar.getEightChar().toString());
});
```

- [ ] **Step 4: Open in browser, verify console shows 八字 output**

Run: open `index.html` in browser, check console for "Lunar lib loaded" and 八字 output.

- [ ] **Step 5: Init git repo and commit**

```bash
cd /home/yanghuanqi/projects/fengshui-style-guide
git init
git add index.html css/style.css js/app.js docs/
git commit -m "feat: project scaffolding with lunar-javascript CDN"
```

---

### Task 2: Five Elements Mapping Data

**Files:**
- Create: `js/mapping-data.js`

This file contains all static data tables. No logic — pure data.

- [ ] **Step 1: Create mapping-data.js with all五行 mapping tables**

```javascript
// js/mapping-data.js
// 五行 → 颜色/材质/风格/妆容/关键词 映射数据

var WUXING_DATA = {
  // 天干 → 五行
  TIANGAN_WUXING: {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
    '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
  },

  // 地支 → 五行
  DIZHI_WUXING: {
    '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
    '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
  },

  // 地支 → 月令（哪个五行当令）
  DIZHI_LINGGUAN: {
    '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土',
    '申': '金', '酉': '金', '戌': '土', '亥': '水', '子': '水', '丑': '土'
  },

  // 五行生克关系
  SHENG: { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' },  // A生B
  KE:    { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' },  // A克B
  BEI_SHENG: { '火': '木', '土': '火', '金': '土', '水': '金', '木': '水' }, // A被B生
  BEI_KE:    { '土': '木', '水': '土', '火': '水', '金': '火', '木': '金' }, // A被B克

  // 五行 → 颜色映射
  COLORS: {
    '金': {
      main: [
        { name: '月光银', hex: '#C0C0C0' },
        { name: '香槟金', hex: '#D4AF37' },
        { name: '珍珠白', hex: '#F5F5F0' }
      ],
      accent: [
        { name: '铂金灰', hex: '#A8A9AD' },
        { name: '象牙白', hex: '#FFFFF0' }
      ],
      avoid: [
        { name: '烈焰红', hex: '#DC143C' },
        { name: '正紫色', hex: '#800080' }
      ]
    },
    '木': {
      main: [
        { name: '松石绿', hex: '#2E8B57' },
        { name: '薄荷青', hex: '#98FB98' },
        { name: '橄榄绿', hex: '#6B8E23' }
      ],
      accent: [
        { name: '苔藓绿', hex: '#8A9A5B' },
        { name: '竹青色', hex: '#789262' }
      ],
      avoid: [
        { name: '亮白色', hex: '#FFFFFF' },
        { name: '金属银', hex: '#AAA9AD' }
      ]
    },
    '水': {
      main: [
        { name: '深海蓝', hex: '#003153' },
        { name: '雾霾蓝', hex: '#6699CC' },
        { name: '烟灰色', hex: '#708090' }
      ],
      accent: [
        { name: '墨黑色', hex: '#1C1C1C' },
        { name: '星空蓝', hex: '#191970' }
      ],
      avoid: [
        { name: '明黄色', hex: '#FFD700' },
        { name: '卡其棕', hex: '#C3B091' }
      ]
    },
    '火': {
      main: [
        { name: '玫瑰红', hex: '#E8505B' },
        { name: '日落橘', hex: '#FF6347' },
        { name: '莓果紫', hex: '#8B008B' }
      ],
      accent: [
        { name: '珊瑚粉', hex: '#FF7F50' },
        { name: '酒红色', hex: '#722F37' }
      ],
      avoid: [
        { name: '深海蓝', hex: '#003153' },
        { name: '纯黑色', hex: '#000000' }
      ]
    },
    '土': {
      main: [
        { name: '焦糖棕', hex: '#8B6914' },
        { name: '奶茶色', hex: '#D2B48C' },
        { name: '暖米色', hex: '#F5DEB3' }
      ],
      accent: [
        { name: '陶土红', hex: '#CB6D51' },
        { name: '沙漠金', hex: '#C2B280' }
      ],
      avoid: [
        { name: '翠绿色', hex: '#00A86B' },
        { name: '森林绿', hex: '#228B22' }
      ]
    }
  },

  // 五行 → 穿搭风格
  STYLES: {
    '金': {
      keyword: '清冷利落',
      scenes: {
        commute: '极简主义通勤：修身剪裁西装外套 + 直筒裤，线条感为主',
        casual: '都市冷淡风：oversized 纯色T + 金属扣阔腿裤',
        date: '高级禁欲系：缎面衬衫 + 精致金属腰带'
      },
      accessory: { material: '金属', items: ['金属手镯', '银色耳钉', '精钢腕表', '金属链条包'] },
      shape: '圆形'
    },
    '木': {
      keyword: '舒展自然',
      scenes: {
        commute: '文艺知性风：亚麻衬衫 + 棉质阔腿裤，自然垂坠感',
        casual: '森系清新：碎花连衣裙 + 编织草帽',
        date: '温柔邻家：针织开衫 + 棉麻长裙'
      },
      accessory: { material: '木质/棉麻', items: ['檀木手串', '棉麻围巾', '藤编手袋', '木质发簪'] },
      shape: '长条形'
    },
    '水': {
      keyword: '柔和流动',
      scenes: {
        commute: '法式通勤：雪纺衬衫 + 高腰伞裙，流动飘逸',
        casual: '慵懒文艺：oversized 针织毛衣 + 水洗牛仔',
        date: '神秘优雅：深色丝绒连衣裙 + 水晶耳坠'
      },
      accessory: { material: '水晶/珍珠', items: ['水晶手链', '珍珠耳钉', '玻璃发夹', '珍珠项链'] },
      shape: '波浪形'
    },
    '火': {
      keyword: '张扬明艳',
      scenes: {
        commute: '港风干练：收腰皮衣外套 + 高腰铅笔裙',
        casual: '辣妹热情：紧身上衣 + 高腰热裤 + 粗跟短靴',
        date: '复古女王：丝绸吊带裙 + 红色高跟鞋'
      },
      accessory: { material: '皮革/丝绸', items: ['丝巾', '皮革腰带', '红色手提包', '金色大耳环'] },
      shape: '三角形/尖角'
    },
    '土': {
      keyword: '沉稳厚重',
      scenes: {
        commute: '经典知性：驼色大衣 + 高领打底 + 及膝裙',
        casual: '温暖质感：粗棒针毛衣 + 灯芯绒裤',
        date: '优雅大气：一字肩连衣裙 + 玉石项链'
      },
      accessory: { material: '玉石/陶瓷', items: ['玉佩', '和田玉手镯', '陶瓷胸针', '琥珀吊坠'] },
      shape: '方形'
    }
  },

  // 五行 → 妆容建议
  MAKEUP: {
    '金': {
      lip: { tone: '裸色系/肉粉色', examples: ['MLBB 裸粉色', '奶茶豆沙色', '玫瑰奶棕色'] },
      eye: { tone: '大地金属色', examples: ['香槟金眼影', '浅棕+银色闪片', '金属感单色'] },
      blush: { tone: '淡粉偏白', examples: ['裸色腮红轻扫', '高光代替腮红'] },
      keyword: '高级冷感妆'
    },
    '木': {
      lip: { tone: '清透粉橘色', examples: ['水蜜桃色', '嫩粉色', '樱花粉唇釉'] },
      eye: { tone: '清新自然色', examples: ['浅棕+淡粉', '哑光大地色', '裸妆感清透'] },
      blush: { tone: '蜜桃粉', examples: ['腮红铺满苹果肌', '自然红晕感'] },
      keyword: '氧气素颜妆'
    },
    '水': {
      lip: { tone: '冷调梅子色', examples: ['梅子色', '冷调玫红', '深紫红'] },
      eye: { tone: '烟熏冷色调', examples: ['雾霾蓝眼影', '灰紫色烟熏', '银色闪片'] },
      blush: { tone: '玫瑰紫', examples: ['薰衣草紫腮红', '冷调粉紫'] },
      keyword: '冷艳氛围妆'
    },
    '火': {
      lip: { tone: '正红/橘红色', examples: ['正宫红', '烈焰橘红', '复古番茄红'] },
      eye: { tone: '暖调浓郁色', examples: ['酒红色眼影', '橘棕烟熏', '金铜色光泽'] },
      blush: { tone: '橘调', examples: ['日落橘腮红', '元气橘色'] },
      keyword: '浓颜明艳妆'
    },
    '土': {
      lip: { tone: '暖棕/焦糖色', examples: ['焦糖奶茶色', '红棕色', '肉桂色'] },
      eye: { tone: '大地暖棕色', examples: ['奶茶棕眼影', '焦糖色+哑光棕', '可可色系'] },
      blush: { tone: '杏色/奶棕', examples: ['奶杏色自然腮红', '修容色腮红'] },
      keyword: '温柔知性妆'
    }
  },

  // 气场关键词池（每个五行多组，随机选取组合）
  AURA_KEYWORDS: {
    '金': ['清冷锋芒', '银月如霜', '凛冬玫瑰', '冰川美人', '铂金之刃', '白月光', '冷感高定', '镜面女王'],
    '木': ['春风拂面', '林间精灵', '青竹幽兰', '破晓新芽', '森系仙子', '花间行者', '翠微清韵', '自然呼吸'],
    '水': ['暗涌玫瑰', '深海珍珠', '月影流光', '雾中独行', '星河低语', '潮汐秘密', '午夜天鹅', '幽蓝诱惑'],
    '火': ['烈焰红唇', '凤凰涅槃', '日落熔金', '野性玫瑰', '灼灼其华', '热带风暴', '燃烧蝴蝶', '正午太阳'],
    '土': ['大地母亲', '沉香如故', '暖阳琥珀', '秋日私语', '陶瓷温润', '古典芳华', '岁月如金', '山河温柔']
  },

  // 男性穿搭调整
  STYLES_MALE: {
    '金': {
      keyword: '精英利落',
      scenes: {
        commute: '商务极简：修身西装 + 白衬衫 + 金属袖扣',
        casual: '都市简约：纯色Polo衫 + 修身卡其裤 + 皮质手表',
        date: '绅士质感：深色针织衫 + 精致皮带 + 银色配饰'
      }
    },
    '木': {
      keyword: '儒雅自然',
      scenes: {
        commute: '学院风：棉麻衬衫 + 西裤 + 帆布包',
        casual: '户外休闲：亚麻T恤 + 工装裤 + 编织手环',
        date: '温暖邻家：针织开衫 + 牛仔裤 + 木质手表'
      }
    },
    '水': {
      keyword: '深邃神秘',
      scenes: {
        commute: '暗黑商务：深蓝西装 + 灰色衬衫 + 水晶袖扣',
        casual: '文艺暗调：黑色卫衣 + 水洗牛仔 + 帆布鞋',
        date: '神秘绅士：深色高领毛衣 + 深蓝大衣'
      }
    },
    '火': {
      keyword: '热烈张扬',
      scenes: {
        commute: '活力商务：酒红色领带 + 深色西装',
        casual: '街头潮流：红色棒球帽 + 皮衣外套 + 运动鞋',
        date: '复古型男：印花衬衫 + 皮夹克 + 尖头皮鞋'
      }
    },
    '土': {
      keyword: '稳重大气',
      scenes: {
        commute: '经典商务：驼色风衣 + 深棕皮鞋 + 皮质公文包',
        casual: '质感休闲：棕色卫衣 + 工装裤 + 沙漠靴',
        date: '温厚绅士：高领毛衣 + 呢子大衣 + 皮手套'
      }
    }
  },

  // 男性妆容（简化版，聚焦护肤和基础修饰）
  MAKEUP_MALE: {
    '金': { keyword: '清爽干净', tip: '哑光控油底妆 + 修眉整形 + 无色润唇膏' },
    '木': { keyword: '自然透气', tip: '保湿面霜 + 自然眉形 + 薄荷润唇' },
    '水': { keyword: '清透高级', tip: '水润底妆 + 眉毛修型 + 淡紫调润唇' },
    '火': { keyword: '精神焕发', tip: '遮瑕提亮 + 浓眉修饰 + 有色润唇膏' },
    '土': { keyword: '温润质感', tip: '柔焦底妆 + 自然浓眉 + 棕调润唇' }
  }
};
```

- [ ] **Step 2: Verify data loads in browser**

Add `console.log('Mapping data loaded:', Object.keys(WUXING_DATA))` to mapping-data.js, open index.html, check console.

- [ ] **Step 3: Commit**

```bash
git add js/mapping-data.js
git commit -m "feat: add complete wuxing mapping data tables"
```

---

### Task 3: WuXing Engine (Core Calculation)

**Files:**
- Create: `js/wuxing-engine.js`

This is the core五行计算引擎. It takes a birth date and today's date, uses lunar-javascript to get八字, then computes 喜用神 and all derived recommendations.

- [ ] **Step 1: Create wuxing-engine.js with八字 extraction**

```javascript
// js/wuxing-engine.js
var WuxingEngine = (function() {

  // 从出生日期获取八字信息
  function getBazi(year, month, day) {
    var solar = Solar.fromYmd(year, month, day);
    var lunar = solar.getLunar();
    var bazi = lunar.getEightChar();
    return {
      yearGan: bazi.getYearGan(),
      yearZhi: bazi.getYearZhi(),
      monthGan: bazi.getMonthGan(),
      monthZhi: bazi.getMonthZhi(),
      dayGan: bazi.getDayGan(),
      dayZhi: bazi.getDayZhi(),
      // 时柱使用午时（12点）作为默认
      hourGan: bazi.getTimeGan(),
      hourZhi: bazi.getTimeZhi(),
      napiYear: bazi.getYearNaYin(),
      napiMonth: bazi.getMonthNaYin(),
      napiDay: bazi.getDayNaYin(),
      shengxiao: lunar.getYearShengXiao()
    };
  }

  // 获取日主五行
  function getDayMasterElement(bazi) {
    return WUXING_DATA.TIANGAN_WUXING[bazi.dayGan];
  }

  // 统计八字中各五行出现次数
  function countElements(bazi) {
    var count = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
    var gans = [bazi.yearGan, bazi.monthGan, bazi.dayGan, bazi.hourGan];
    var zhis = [bazi.yearZhi, bazi.monthZhi, bazi.dayZhi, bazi.hourZhi];

    gans.forEach(function(g) {
      var el = WUXING_DATA.TIANGAN_WUXING[g];
      if (el) count[el] += 1;
    });
    zhis.forEach(function(z) {
      var el = WUXING_DATA.DIZHI_WUXING[z];
      if (el) count[el] += 1;
    });
    return count;
  }

  // 判断日主强弱
  function isDayMasterStrong(bazi) {
    var dayEl = getDayMasterElement(bazi);
    var count = countElements(bazi);

    // 得令：月支五行生助日主
    var monthEl = WUXING_DATA.DIZHI_WUXING[bazi.monthZhi];
    var deLing = (monthEl === dayEl) || (WUXING_DATA.SHENG[monthEl] === dayEl);

    // 得势：同类五行(日主+生日主的) 数量 >= 4
    var supportEl = WUXING_DATA.BEI_SHENG[dayEl]; // 生我的五行
    var supportCount = count[dayEl] + (supportEl ? count[supportEl] : 0);
    var deShi = supportCount >= 4;

    return deLing || deShi;
  }

  // 计算喜用神
  function getXiyongshen(bazi) {
    var dayEl = getDayMasterElement(bazi);
    var strong = isDayMasterStrong(bazi);

    if (strong) {
      // 日主强：喜克我、我生、我克的五行
      return {
        xi: WUXING_DATA.BEI_KE[dayEl],  // 克我的 → 官杀（正官、偏官）
        yong: WUXING_DATA.SHENG[dayEl],   // 我生的 → 食伤（泄秀）
        ji: dayEl                           // 忌同类
      };
    } else {
      // 日主弱：喜生我、同类五行
      return {
        xi: WUXING_DATA.BEI_SHENG[dayEl], // 生我的 → 印星
        yong: dayEl,                        // 同类 → 比劫
        ji: WUXING_DATA.BEI_KE[dayEl]      // 忌克我的
      };
    }
  }

  // 获取今日天干地支和五行
  function getTodayInfo() {
    var today = new Date();
    var solar = Solar.fromDate(today);
    var lunar = solar.getLunar();
    var bazi = lunar.getEightChar();
    return {
      dayGan: bazi.getDayGan(),
      dayZhi: bazi.getDayZhi(),
      dayGanWuxing: WUXING_DATA.TIANGAN_WUXING[bazi.getDayGan()],
      dayZhiWuxing: WUXING_DATA.DIZHI_WUXING[bazi.getDayZhi()],
      xiShenFangWei: lunar.getDayXiShenFangWei(),
      caiShenFangWei: lunar.getDayCaiShenFangWei(),
      chong: lunar.getDayChongDesc()
    };
  }

  // 计算气运值 (60-95 分区间)
  function calcAuraScore(xiyong, todayInfo) {
    var base = 75;

    // 今日天干五行与喜用神关系
    var todayGanEl = todayInfo.dayGanWuxing;
    if (todayGanEl === xiyong.xi) base += 12;
    else if (todayGanEl === xiyong.yong) base += 8;
    else if (WUXING_DATA.SHENG[todayGanEl] === xiyong.xi) base += 5;
    else if (todayGanEl === xiyong.ji) base -= 10;

    // 今日地支五行与喜用神关系
    var todayZhiEl = todayInfo.dayZhiWuxing;
    if (todayZhiEl === xiyong.xi) base += 6;
    else if (todayZhiEl === xiyong.yong) base += 4;
    else if (todayZhiEl === xiyong.ji) base -= 5;

    // 加入伪随机扰动（基于日期的确定性随机）
    var today = new Date();
    var seed = today.getFullYear() * 10000 + (today.getMonth()+1) * 100 + today.getDate();
    var noise = ((seed * 9301 + 49297) % 233280) / 233280.0; // 0-1
    base += Math.round((noise - 0.5) * 6); // -3 到 +3

    return Math.max(60, Math.min(95, base));
  }

  // 计算百分比排名 (基于分数的确定性映射)
  function calcPercentile(score) {
    // 映射: 60分→30%, 75分→55%, 85分→78%, 95分→96%
    var p = 30 + (score - 60) * (66 / 35);
    return Math.max(25, Math.min(98, Math.round(p)));
  }

  // 公开接口
  return {
    getBazi: getBazi,
    getDayMasterElement: getDayMasterElement,
    countElements: countElements,
    isDayMasterStrong: isDayMasterStrong,
    getXiyongshen: getXiyongshen,
    getTodayInfo: getTodayInfo,
    calcAuraScore: calcAuraScore,
    calcPercentile: calcPercentile
  };
})();
```

- [ ] **Step 2: Test engine in browser console**

Open index.html, run in console:
```javascript
var bazi = WuxingEngine.getBazi(1990, 6, 15);
console.log('八字:', bazi);
console.log('日主:', WuxingEngine.getDayMasterElement(bazi));
console.log('五行统计:', WuxingEngine.countElements(bazi));
console.log('喜用神:', WuxingEngine.getXiyongshen(bazi));
var today = WuxingEngine.getTodayInfo();
console.log('今日:', today);
var xiyong = WuxingEngine.getXiyongshen(bazi);
console.log('气运值:', WuxingEngine.calcAuraScore(xiyong, today));
```

Expected: all functions return non-null objects with correct五行 values.

- [ ] **Step 3: Commit**

```bash
git add js/wuxing-engine.js
git commit -m "feat: add wuxing engine with bazi, xiyongshen, aura score"
```

---

### Task 4: Report Generator

**Files:**
- Create: `js/report-generator.js`

Combines engine output + mapping data → structured report object ready for rendering.

- [ ] **Step 1: Create report-generator.js**

```javascript
// js/report-generator.js
var ReportGenerator = (function() {

  // 选择气场关键词（基于日期+五行的确定性随机）
  function pickAuraKeywords(xiyongEl, yongEl, dayMasterEl) {
    var today = new Date();
    var seed = today.getFullYear() * 10000 + (today.getMonth()+1) * 100 + today.getDate();

    function seededIndex(pool, offset) {
      var hash = ((seed + offset) * 9301 + 49297) % 233280;
      return pool[hash % pool.length];
    }

    var keywords = [
      seededIndex(WUXING_DATA.AURA_KEYWORDS[xiyongEl], 1),
      seededIndex(WUXING_DATA.AURA_KEYWORDS[dayMasterEl], 2),
      seededIndex(WUXING_DATA.AURA_KEYWORDS[yongEl], 3)
    ];
    return keywords;
  }

  // 选择颜色推荐（喜用神五行的颜色为主色，忌神的为避忌色）
  function pickColors(xiyong) {
    return {
      main: WUXING_DATA.COLORS[xiyong.xi].main[0],
      accent: WUXING_DATA.COLORS[xiyong.yong].main[0],
      avoid: WUXING_DATA.COLORS[xiyong.ji].main[0],
      mainAll: WUXING_DATA.COLORS[xiyong.xi].main,
      accentAll: WUXING_DATA.COLORS[xiyong.yong].accent,
      avoidAll: WUXING_DATA.COLORS[xiyong.ji].avoid,
      xiElement: xiyong.xi,
      yongElement: xiyong.yong,
      jiElement: xiyong.ji
    };
  }

  // 选择穿搭建议
  function pickStyle(xiyong, gender) {
    var styleData = gender === 'male' ? WUXING_DATA.STYLES_MALE : WUXING_DATA.STYLES;
    var mainStyle = styleData[xiyong.xi];
    var accessoryData = WUXING_DATA.STYLES[xiyong.xi].accessory; // 配饰用通用数据
    return {
      keyword: mainStyle.keyword,
      scenes: mainStyle.scenes,
      accessory: accessoryData
    };
  }

  // 选择妆容建议
  function pickMakeup(xiyong, gender) {
    if (gender === 'male') {
      return WUXING_DATA.MAKEUP_MALE[xiyong.xi];
    }
    return WUXING_DATA.MAKEUP[xiyong.xi];
  }

  // 生成五行解释文案
  function generateExplanation(dayMasterEl, xiyong, strong) {
    var relation = strong ? '偏旺' : '偏弱';
    return '你的日主五行属「' + dayMasterEl + '」，当前' + relation +
           '，喜用「' + xiyong.xi + '」「' + xiyong.yong + '」来调和，' +
           '忌「' + xiyong.ji + '」过多。';
  }

  // 主入口：生成完整报告
  function generate(params) {
    // params: { year, month, day, gender, city?, industry? }
    var bazi = WuxingEngine.getBazi(params.year, params.month, params.day);
    var dayMasterEl = WuxingEngine.getDayMasterElement(bazi);
    var strong = WuxingEngine.isDayMasterStrong(bazi);
    var xiyong = WuxingEngine.getXiyongshen(bazi);
    var todayInfo = WuxingEngine.getTodayInfo();
    var score = WuxingEngine.calcAuraScore(xiyong, todayInfo);
    var percentile = WuxingEngine.calcPercentile(score);

    return {
      // 基础信息
      bazi: bazi,
      dayMasterElement: dayMasterEl,
      isStrong: strong,
      xiyongshen: xiyong,
      todayInfo: todayInfo,
      explanation: generateExplanation(dayMasterEl, xiyong, strong),

      // 模块1: 气场指数
      auraScore: score,
      auraPercentile: percentile,

      // 模块2: 气场关键词
      auraKeywords: pickAuraKeywords(xiyong.xi, xiyong.yong, dayMasterEl),

      // 模块3: 开运色卡
      colors: pickColors(xiyong),

      // 模块4: 命定穿搭
      style: pickStyle(xiyong, params.gender),

      // 模块5: 开运妆容
      makeup: pickMakeup(xiyong, params.gender),

      // 用户信息回显
      userInfo: {
        gender: params.gender,
        birthDate: params.year + '-' + params.month + '-' + params.day,
        city: params.city || '',
        industry: params.industry || '',
        shengxiao: bazi.shengxiao
      }
    };
  }

  return { generate: generate };
})();
```

- [ ] **Step 2: Test report generation in browser console**

```javascript
var report = ReportGenerator.generate({
  year: 1995, month: 3, day: 20, gender: 'female'
});
console.log('Report:', JSON.stringify(report, null, 2));
```

Expected: complete report object with all 5 modules populated.

- [ ] **Step 3: Commit**

```bash
git add js/report-generator.js
git commit -m "feat: add report generator combining engine + mapping data"
```

---

## Chunk 2: UI — Form + Report Display

### Task 5: Input Form Page

**Files:**
- Modify: `index.html`
- Modify: `js/app.js`
- Modify: `css/style.css`

- [ ] **Step 1: Build form HTML structure in index.html**

Replace the `<section id="form-section">` placeholder with:

```html
<section id="form-section">
  <div class="form-container">
    <div class="form-header">
      <h1 class="brand-title">玄学形象指南</h1>
      <p class="brand-subtitle">五行 × 形象设计 · 今日专属方案</p>
    </div>
    <form id="user-form">
      <div class="form-group required">
        <label>性别</label>
        <div class="radio-group">
          <label class="radio-card"><input type="radio" name="gender" value="female" checked><span>女</span></label>
          <label class="radio-card"><input type="radio" name="gender" value="male"><span>男</span></label>
        </div>
      </div>
      <div class="form-group required">
        <label>出生日期</label>
        <div class="date-inputs">
          <select id="birth-year" required></select>
          <select id="birth-month" required></select>
          <select id="birth-day" required></select>
        </div>
      </div>
      <div class="form-group optional">
        <label>城市 <span class="optional-tag">选填</span></label>
        <input type="text" id="city" placeholder="如：北京、上海、杭州">
      </div>
      <div class="form-group optional">
        <label>行业/职业 <span class="optional-tag">选填</span></label>
        <input type="text" id="industry" placeholder="如：互联网、金融、教育">
      </div>
      <button type="submit" class="submit-btn">生成我的形象指南</button>
    </form>
  </div>
</section>
```

- [ ] **Step 2: Add form logic to app.js**

```javascript
// js/app.js
document.addEventListener('DOMContentLoaded', function() {
  initForm();
});

function initForm() {
  var yearSelect = document.getElementById('birth-year');
  var monthSelect = document.getElementById('birth-month');
  var daySelect = document.getElementById('birth-day');

  // 填充年份 (1940-2010)
  for (var y = 2010; y >= 1940; y--) {
    var opt = document.createElement('option');
    opt.value = y; opt.textContent = y + '年';
    yearSelect.appendChild(opt);
  }
  yearSelect.value = 1995;

  // 填充月份
  for (var m = 1; m <= 12; m++) {
    var opt = document.createElement('option');
    opt.value = m; opt.textContent = m + '月';
    monthSelect.appendChild(opt);
  }

  // 填充日期
  function updateDays() {
    var y = parseInt(yearSelect.value);
    var m = parseInt(monthSelect.value);
    var maxDay = new Date(y, m, 0).getDate();
    var curDay = parseInt(daySelect.value) || 1;
    daySelect.innerHTML = '';
    for (var d = 1; d <= maxDay; d++) {
      var opt = document.createElement('option');
      opt.value = d; opt.textContent = d + '日';
      daySelect.appendChild(opt);
    }
    daySelect.value = Math.min(curDay, maxDay);
  }
  yearSelect.addEventListener('change', updateDays);
  monthSelect.addEventListener('change', updateDays);
  updateDays();

  // 表单提交
  document.getElementById('user-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var params = {
      year: parseInt(yearSelect.value),
      month: parseInt(monthSelect.value),
      day: parseInt(daySelect.value),
      gender: document.querySelector('input[name="gender"]:checked').value,
      city: document.getElementById('city').value.trim(),
      industry: document.getElementById('industry').value.trim()
    };

    var report = ReportGenerator.generate(params);
    renderReport(report);
  });
}
```

- [ ] **Step 3: Add basic form styles to style.css**

See Task 7 for full styles. For now, add minimal styles to make form usable:

```css
.form-container { max-width: 420px; margin: 40px auto; padding: 32px 24px; }
.brand-title { text-align: center; font-size: 28px; color: #2c2c2c; letter-spacing: 4px; }
.brand-subtitle { text-align: center; color: #999; font-size: 14px; margin-top: 8px; }
.form-group { margin-top: 24px; }
.form-group label { display: block; font-size: 14px; color: #666; margin-bottom: 8px; }
.radio-group { display: flex; gap: 12px; }
.radio-card { flex: 1; text-align: center; padding: 12px; border: 1px solid #e0dcd5; border-radius: 8px; cursor: pointer; }
.radio-card input { display: none; }
.radio-card input:checked + span { color: #b8860b; }
.radio-card:has(input:checked) { border-color: #b8860b; background: #fdf8ef; }
.date-inputs { display: flex; gap: 8px; }
.date-inputs select { flex: 1; padding: 10px; border: 1px solid #e0dcd5; border-radius: 8px; background: #fff; }
input[type="text"] { width: 100%; padding: 10px 14px; border: 1px solid #e0dcd5; border-radius: 8px; }
.optional-tag { font-size: 12px; color: #bbb; }
.submit-btn {
  width: 100%; margin-top: 32px; padding: 14px; border: none; border-radius: 8px;
  background: linear-gradient(135deg, #b8860b, #d4a843); color: #fff;
  font-size: 16px; letter-spacing: 2px; cursor: pointer;
}
.submit-btn:hover { background: linear-gradient(135deg, #a07608, #c49b38); }
```

- [ ] **Step 4: Test form renders and submits without errors**

Open index.html, fill in form, click submit. Check console for report object (add `console.log(report)` temporarily in submit handler).

- [ ] **Step 5: Commit**

```bash
git add index.html js/app.js css/style.css
git commit -m "feat: add input form with date selectors and form validation"
```

---

### Task 6: Report Display Page

**Files:**
- Modify: `index.html` (add report template)
- Modify: `js/app.js` (add renderReport function)
- Modify: `css/style.css` (add report styles)

- [ ] **Step 1: Add report section HTML to index.html**

Replace `<section id="report-section">` with:

```html
<section id="report-section" style="display:none">
  <div class="report-container">
    <!-- Header -->
    <div class="report-header">
      <p class="report-date" id="report-date"></p>
      <h2 class="report-title">你的形象能量报告</h2>
      <p class="report-meta" id="report-meta"></p>
    </div>

    <!-- Module 1: 气场指数 -->
    <div class="report-card" id="card-aura-score">
      <div class="card-label">气场指数</div>
      <div class="score-display">
        <div class="score-number" id="score-number"></div>
        <div class="score-bar-container">
          <div class="score-bar" id="score-bar"></div>
        </div>
        <div class="score-percentile" id="score-percentile"></div>
      </div>
    </div>

    <!-- Module 2: 气场关键词 -->
    <div class="report-card" id="card-aura-keywords">
      <div class="card-label">今日气场</div>
      <div class="keywords-display" id="keywords-display"></div>
    </div>

    <!-- Module 3: 开运色卡 -->
    <div class="report-card" id="card-colors">
      <div class="card-label">今日开运色卡</div>
      <div class="colors-grid" id="colors-grid"></div>
      <div class="color-explanation" id="color-explanation"></div>
    </div>

    <!-- Module 4: 命定穿搭 -->
    <div class="report-card" id="card-style">
      <div class="card-label">今日命定穿搭</div>
      <div class="style-keyword" id="style-keyword"></div>
      <div class="style-scenes" id="style-scenes"></div>
      <div class="style-accessory" id="style-accessory"></div>
    </div>

    <!-- Module 5: 开运妆容 -->
    <div class="report-card" id="card-makeup">
      <div class="card-label" id="makeup-label">今日开运妆容</div>
      <div class="makeup-content" id="makeup-content"></div>
    </div>

    <!-- Footer -->
    <div class="report-footer">
      <p class="footer-explanation" id="footer-explanation"></p>
      <div class="footer-watermark">玄学形象指南 · 五行 × 形象设计</div>
      <div class="footer-tags">#气场指数 #五行穿搭 #开运妆容 #命定色卡</div>
    </div>

    <!-- 重新测试按钮 -->
    <button class="retry-btn" id="retry-btn">重新测试</button>
  </div>
</section>
```

- [ ] **Step 2: Add renderReport function to app.js**

```javascript
function renderReport(report) {
  // Hide form, show report
  document.getElementById('form-section').style.display = 'none';
  document.getElementById('report-section').style.display = 'block';

  // Header
  var today = new Date();
  var dateStr = today.getFullYear() + '年' + (today.getMonth()+1) + '月' + today.getDate() + '日';
  document.getElementById('report-date').textContent = dateStr;
  var genderText = report.userInfo.gender === 'female' ? '女' : '男';
  document.getElementById('report-meta').textContent =
    report.userInfo.shengxiao + '年 · ' + report.dayMasterElement + '命 · ' + genderText;

  // Module 1: 气场指数
  document.getElementById('score-number').textContent = report.auraScore;
  document.getElementById('score-bar').style.width = report.auraScore + '%';
  document.getElementById('score-percentile').textContent =
    '超过了 ' + report.auraPercentile + '% 的同属相用户';

  // Module 2: 气场关键词
  var kwHtml = report.auraKeywords.map(function(kw) {
    return '<span class="keyword-tag">' + kw + '</span>';
  }).join('<span class="keyword-divider">/</span>');
  document.getElementById('keywords-display').innerHTML = kwHtml;

  // Module 3: 色卡
  var colorsHtml = '';
  colorsHtml += renderColorGroup('主色 · ' + report.colors.xiElement + '系', report.colors.mainAll, 'main');
  colorsHtml += renderColorGroup('辅色 · ' + report.colors.yongElement + '系', report.colors.accentAll, 'accent');
  colorsHtml += renderColorGroup('避忌色 · ' + report.colors.jiElement + '系', report.colors.avoidAll, 'avoid');
  document.getElementById('colors-grid').innerHTML = colorsHtml;

  // Module 4: 穿搭
  document.getElementById('style-keyword').innerHTML =
    '<span class="style-kw-text">' + report.style.keyword + '</span>';
  var scenesHtml = '';
  var sceneLabels = { commute: '通勤', casual: '休闲', date: '约会' };
  Object.keys(report.style.scenes).forEach(function(key) {
    scenesHtml += '<div class="scene-item">' +
      '<span class="scene-label">' + sceneLabels[key] + '</span>' +
      '<p class="scene-desc">' + report.style.scenes[key] + '</p>' +
      '</div>';
  });
  document.getElementById('style-scenes').innerHTML = scenesHtml;

  // 配饰
  var accHtml = '<div class="accessory-section">' +
    '<span class="acc-material">开运材质：' + report.style.accessory.material + '</span>' +
    '<div class="acc-items">' +
    report.style.accessory.items.map(function(item) {
      return '<span class="acc-tag">' + item + '</span>';
    }).join('') +
    '</div></div>';
  document.getElementById('style-accessory').innerHTML = accHtml;

  // Module 5: 妆容
  var makeupHtml = '';
  if (report.userInfo.gender === 'male') {
    document.getElementById('makeup-label').textContent = '今日形象Tips';
    makeupHtml = '<div class="makeup-male">' +
      '<div class="makeup-keyword">' + report.makeup.keyword + '</div>' +
      '<p class="makeup-tip">' + report.makeup.tip + '</p>' +
      '</div>';
  } else {
    makeupHtml =
      '<div class="makeup-keyword">' + report.makeup.keyword + '</div>' +
      renderMakeupRow('唇色', report.makeup.lip) +
      renderMakeupRow('眼妆', report.makeup.eye) +
      renderMakeupRow('腮红', report.makeup.blush);
  }
  document.getElementById('makeup-content').innerHTML = makeupHtml;

  // Footer
  document.getElementById('footer-explanation').textContent = report.explanation;

  // Retry button
  document.getElementById('retry-btn').addEventListener('click', function() {
    document.getElementById('report-section').style.display = 'none';
    document.getElementById('form-section').style.display = 'block';
  });

  // Scroll to top
  window.scrollTo(0, 0);
}

function renderColorGroup(label, colors, type) {
  var cls = 'color-group color-group--' + type;
  var html = '<div class="' + cls + '"><div class="color-group-label">' + label + '</div><div class="color-swatches">';
  colors.forEach(function(c) {
    html += '<div class="color-swatch">' +
      '<div class="swatch-circle" style="background:' + c.hex + '"></div>' +
      '<span class="swatch-name">' + c.name + '</span></div>';
  });
  html += '</div></div>';
  return html;
}

function renderMakeupRow(label, data) {
  return '<div class="makeup-row">' +
    '<span class="makeup-label">' + label + '</span>' +
    '<span class="makeup-tone">' + data.tone + '</span>' +
    '<div class="makeup-examples">' +
    data.examples.map(function(ex) { return '<span class="makeup-ex">' + ex + '</span>'; }).join('') +
    '</div></div>';
}
```

- [ ] **Step 3: Test full flow**

Open index.html → fill form → submit → verify report displays with all 5 modules.

- [ ] **Step 4: Commit**

```bash
git add index.html js/app.js
git commit -m "feat: add report rendering with all 5 modules"
```

---

## Chunk 3: Visual Design + Polish

### Task 7: Full Visual Styling (Modern Luxury)

**Files:**
- Modify: `css/style.css` (complete rewrite with full design system)

- [ ] **Step 1: Write complete style.css**

Full CSS implementing modern luxury design:
- Background: warm gradient (米白 → 淡金)
- Cards: white with subtle gold border, rounded corners, soft shadow
- Typography: system fonts with careful sizing hierarchy
- Color swatches: circular with labels
- Score: large number with animated gradient bar
- Keywords: elegant spaced typography
- Responsive: mobile-first, 375px-428px primary
- Screenshot-friendly: key content fits in one viewport

Key design tokens:
```css
:root {
  --bg-gradient: linear-gradient(180deg, #faf9f6 0%, #f5f0e6 100%);
  --gold: #b8860b;
  --gold-light: #d4a843;
  --text-primary: #2c2c2c;
  --text-secondary: #888;
  --card-bg: #ffffff;
  --card-border: #f0ece3;
  --card-shadow: 0 2px 12px rgba(184,134,11,0.06);
  --radius: 12px;
}
```

Style the report cards, form elements, score display, color swatches, keyword tags, scene items, makeup rows, footer watermark, etc.

- [ ] **Step 2: Add Google Fonts for better typography (optional, system fonts fallback)**

Add to index.html `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600&family=Noto+Sans+SC:wght@300;400;500&display=swap" rel="stylesheet">
```

Update CSS:
```css
body { font-family: 'Noto Sans SC', system-ui, sans-serif; }
.brand-title, .report-title, .score-number { font-family: 'Noto Serif SC', serif; }
```

- [ ] **Step 3: Test on mobile viewport (375px width in DevTools)**

Verify all elements render correctly, no horizontal scroll, cards fit viewport width.

- [ ] **Step 4: Commit**

```bash
git add css/style.css index.html
git commit -m "feat: add complete modern luxury visual design"
```

---

### Task 8: Polish + Screenshot Optimization

**Files:**
- Modify: `css/style.css`
- Modify: `js/app.js`

- [ ] **Step 1: Add watermark and hashtag footer**

Ensure the footer watermark "玄学形象指南 · 五行 × 形象设计" and hashtags are styled subtly but visibly in screenshots.

- [ ] **Step 2: Add smooth scroll and page transitions**

```javascript
// In renderReport, add fade transition
document.getElementById('form-section').style.opacity = '0';
setTimeout(function() {
  document.getElementById('form-section').style.display = 'none';
  document.getElementById('report-section').style.display = 'block';
  document.getElementById('report-section').style.opacity = '0';
  requestAnimationFrame(function() {
    document.getElementById('report-section').style.opacity = '1';
  });
}, 300);
```

Add CSS:
```css
#form-section, #report-section { transition: opacity 0.3s ease; }
```

- [ ] **Step 3: Add score number animation (count up)**

```javascript
function animateScore(targetScore) {
  var el = document.getElementById('score-number');
  var current = 0;
  var step = Math.ceil(targetScore / 30);
  var timer = setInterval(function() {
    current += step;
    if (current >= targetScore) {
      current = targetScore;
      clearInterval(timer);
    }
    el.textContent = current;
  }, 30);
}
```

- [ ] **Step 4: Test full flow with animations**

- [ ] **Step 5: Commit**

```bash
git add css/style.css js/app.js
git commit -m "feat: add animations, transitions, and screenshot optimization"
```

---

## Chunk 4: Deployment

### Task 9: GitHub Pages Deployment

**Files:**
- No new files

- [ ] **Step 1: Create GitHub repository**

```bash
cd /home/yanghuanqi/projects/fengshui-style-guide
# Create repo on GitHub (can use gh CLI or manual)
gh repo create fengshui-style-guide --public --source=. --push
```

Note: use personal GitHub account (wwes7) with token `ghp_J5ak...`

- [ ] **Step 2: Enable GitHub Pages**

```bash
gh api repos/wwes7/fengshui-style-guide/pages -X POST -f source.branch=main -f source.path=/
```

Or manually: repo Settings → Pages → Source: main branch, root folder.

- [ ] **Step 3: Verify live site**

Visit `https://wwes7.github.io/fengshui-style-guide/` and test full flow.

- [ ] **Step 4: Final commit with any fixes**

```bash
git add -A
git commit -m "fix: deployment adjustments"
git push
```

---

## Reference Links

- [lunar-javascript GitHub](https://github.com/6tail/lunar-javascript) — Core calendar/八字 library
- [lunar-javascript CDN](https://cdn.jsdelivr.net/npm/lunar-javascript@1.7.7/lunar.js) — Browser CDN
- [JavaScript 八字五行查询](https://liuxiaowei574.github.io/2016/09/09/wuxing/) — Algorithm reference
- [八字算法详解](https://docs.tianjiyao.com/blog/bazi-algorithm) — 天机爻 algorithm docs
- [五行穿衣每日指南](https://www.d5168.com/wuhang/) — Competitor reference
- [珠宝饰品五行分类](https://zhuanlan.zhihu.com/p/608218794) — Accessory mapping reference
- [小红书虚拟商品开售流程](https://zhuanlan.zhihu.com/p/1892710283820118948) — 小红书 selling guide
- [小红书2026虚拟电商新规](https://zhuanlan.zhihu.com/p/2011800167825826964) — 2026 policy update
