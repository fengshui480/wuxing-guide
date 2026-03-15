/**
 * app.js
 * 玄学形象指南 — 应用入口
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  if (typeof Solar === 'undefined') {
    console.error('lunar-javascript failed to load');
    return;
  }

  // ── 初始化表单 ────────────────────────────────────────────────────────────

  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function populateSelect(el, values, labels, defaultVal) {
    el.innerHTML = '';
    values.forEach(function (val, i) {
      var opt = document.createElement('option');
      opt.value = val;
      opt.textContent = labels ? labels[i] : val;
      if (String(val) === String(defaultVal)) opt.selected = true;
      el.appendChild(opt);
    });
  }

  function initForm() {
    var yearEl  = document.getElementById('birth-year');
    var monthEl = document.getElementById('birth-month');
    var dayEl   = document.getElementById('birth-day');

    // 年份：2010 降序到 1940，默认 1995
    var years = [];
    for (var y = 2010; y >= 1940; y--) years.push(y);
    var yearLabels = years.map(function (y) { return y + ' 年'; });
    populateSelect(yearEl, years, yearLabels, 1995);

    // 月份：1-12
    var months = [];
    var monthLabels = [];
    for (var m = 1; m <= 12; m++) {
      months.push(m);
      monthLabels.push(m + ' 月');
    }
    populateSelect(monthEl, months, monthLabels, 1);

    // 日期：根据当前年月动态填充
    function updateDays() {
      var y = parseInt(yearEl.value, 10);
      var mo = parseInt(monthEl.value, 10);
      var prevDay = parseInt(dayEl.value, 10) || 1;
      var maxDay = getDaysInMonth(y, mo);
      var days = [];
      var dayLabels = [];
      for (var d = 1; d <= maxDay; d++) {
        days.push(d);
        dayLabels.push(d + ' 日');
      }
      var defaultDay = Math.min(prevDay, maxDay);
      populateSelect(dayEl, days, dayLabels, defaultDay);
    }

    updateDays();
    yearEl.addEventListener('change', updateDays);
    monthEl.addEventListener('change', updateDays);
  }

  initForm();

  // ── 表单提交 ──────────────────────────────────────────────────────────────

  document.getElementById('user-form').addEventListener('submit', function (e) {
    e.preventDefault();

    var year    = parseInt(document.getElementById('birth-year').value, 10);
    var month   = parseInt(document.getElementById('birth-month').value, 10);
    var day     = parseInt(document.getElementById('birth-day').value, 10);
    var gender  = document.querySelector('input[name="gender"]:checked').value;
    var city    = document.getElementById('city').value.trim() || null;
    var industry = document.getElementById('industry').value.trim() || null;

    var report = ReportGenerator.generate({ year, month, day, gender, city, industry });
    renderReport(report);
  });

  // ── 重新测试 ──────────────────────────────────────────────────────────────

  document.getElementById('retry-btn').addEventListener('click', function () {
    document.getElementById('report-section').style.display = 'none';
    document.getElementById('form-section').style.display   = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Helper: 渲染色块组 ────────────────────────────────────────────────────

  /**
   * renderColorGroup
   * @param {string} label   - 中文标签（主色/辅色/避忌色）
   * @param {Array}  colors  - [{ name, hex }, ...]
   * @param {string} type    - 'main' | 'accent' | 'avoid'
   * @returns {string} HTML
   */
  function renderColorGroup(label, colors, type) {
    var swatchesHtml = colors.map(function (c) {
      return '<div class="color-swatch">' +
               '<span class="swatch-circle" style="background:' + c.hex + ';border:1px solid rgba(0,0,0,.08)"></span>' +
               '<span class="swatch-name">' + c.name + '</span>' +
             '</div>';
    }).join('');

    return '<div class="color-group color-group--' + type + '">' +
             '<span class="color-group-label">' + label + '</span>' +
             '<div class="color-swatches">' + swatchesHtml + '</div>' +
           '</div>';
  }

  /**
   * renderMakeupRow
   * @param {string} label - 中文标签（唇色/眼妆/腮红）
   * @param {Object} data  - { tone, examples: [...] }
   * @returns {string} HTML
   */
  function renderMakeupRow(label, data) {
    var tags = data.examples.map(function (ex) {
      return '<span class="makeup-tag">' + ex + '</span>';
    }).join('');

    return '<div class="makeup-row">' +
             '<span class="makeup-row-label">' + label + '</span>' +
             '<div class="makeup-row-content">' +
               '<span class="makeup-tone">' + data.tone + '</span>' +
               '<div class="makeup-tags">' + tags + '</div>' +
             '</div>' +
           '</div>';
  }

  // ── 主渲染函数 ────────────────────────────────────────────────────────────

  function renderReport(report) {
    // 切换显示
    document.getElementById('form-section').style.display   = 'none';
    document.getElementById('report-section').style.display = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // ── 报告头部 ──────────────────────────────────────────────────────────
    var now = new Date();
    var dateStr = now.getFullYear() + ' 年 ' + (now.getMonth() + 1) + ' 月 ' + now.getDate() + ' 日';
    document.getElementById('report-date').textContent = dateStr;

    var ui = report.userInfo;
    var genderLabel = (ui.gender === 'female') ? '女' : '男';
    var wuxingLabel = report.dayMasterElement + '命';
    var infoHtml = '<span class="info-tag">' + ui.shengxiao + '年</span>' +
                   '<span class="info-tag">' + wuxingLabel + '</span>' +
                   '<span class="info-tag">' + genderLabel + '</span>';
    if (ui.city)     infoHtml += '<span class="info-tag">' + ui.city + '</span>';
    if (ui.industry) infoHtml += '<span class="info-tag">' + ui.industry + '</span>';
    document.getElementById('report-user-info').innerHTML = infoHtml;

    // ── 气场指数 ──────────────────────────────────────────────────────────
    document.getElementById('aura-score').textContent = report.auraScore;
    document.getElementById('score-bar-fill').style.width = report.auraScore + '%';
    document.getElementById('score-percentile').textContent =
      '超越了今日 ' + report.auraPercentile + '% 的人';

    // ── 气场关键词 ────────────────────────────────────────────────────────
    var kwHtml = report.auraKeywords.map(function (kw, i) {
      return (i > 0 ? '<span class="kw-divider">/</span>' : '') +
             '<span class="kw-tag">' + kw + '</span>';
    }).join('');
    document.getElementById('aura-keywords').innerHTML = kwHtml;

    // ── 开运色卡 ──────────────────────────────────────────────────────────
    var c = report.colors;
    var colorHtml =
      renderColorGroup('主色（喜神 · ' + c.xiElement + '）',  c.mainAll,   'main')   +
      renderColorGroup('辅色（用神 · ' + c.yongElement + '）', c.accentAll, 'accent') +
      renderColorGroup('避忌色（忌神 · ' + c.jiElement + '）', c.avoidAll,  'avoid');
    document.getElementById('color-groups').innerHTML = colorHtml;

    // ── 命定穿搭 ──────────────────────────────────────────────────────────
    document.getElementById('style-keyword').textContent = report.style.keyword;

    var sceneMap = { commute: '通勤', casual: '休闲', date: '约会' };
    var sceneHtml = '';
    Object.keys(sceneMap).forEach(function (key) {
      sceneHtml += '<div class="scene-card">' +
                     '<span class="scene-label">' + sceneMap[key] + '</span>' +
                     '<p class="scene-desc">' + report.style.scenes[key] + '</p>' +
                   '</div>';
    });
    document.getElementById('scene-cards').innerHTML = sceneHtml;

    var accessoryEl = document.getElementById('accessory-section');
    if (report.style.accessory) {
      var acc = report.style.accessory;
      var accTags = acc.items.map(function (item) {
        return '<span class="acc-tag">' + item + '</span>';
      }).join('');
      accessoryEl.innerHTML =
        '<div class="accessory-header">' +
          '<span class="accessory-material">推荐材质：' + acc.material + '</span>' +
        '</div>' +
        '<div class="accessory-tags">' + accTags + '</div>';
    } else {
      accessoryEl.innerHTML = '';
    }

    // ── 开运妆容 ──────────────────────────────────────────────────────────
    document.getElementById('makeup-keyword').textContent = report.makeup.keyword;

    var makeupRowsEl = document.getElementById('makeup-rows');
    if (report.userInfo.gender === 'male') {
      makeupRowsEl.innerHTML =
        '<div class="makeup-tip">' + report.makeup.tip + '</div>';
    } else {
      makeupRowsEl.innerHTML =
        renderMakeupRow('唇色', report.makeup.lip) +
        renderMakeupRow('眼妆', report.makeup.eye) +
        renderMakeupRow('腮红', report.makeup.blush);
    }

    // ── 报告尾部 ──────────────────────────────────────────────────────────
    document.getElementById('explanation-text').textContent = report.explanation;
  }

});
