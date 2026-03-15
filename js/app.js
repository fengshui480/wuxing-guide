/**
 * app.js
 * 玄学形象指南 — 应用入口 + 动画
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

  // ── SHA-256 哈希函数 ───────────────────────────────────────────────────────

  async function sha256(message) {
    var msgBuffer = new TextEncoder().encode(message);
    var hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    var hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  // ── 暂存报告数据（表单→验证码→报告的中间态） ──────────────────────────────
  var pendingReport = null;

  // ── 表单提交 → 跳转到验证码页 ──────────────────────────────────────────────

  document.getElementById('user-form').addEventListener('submit', function (e) {
    e.preventDefault();

    var year    = parseInt(document.getElementById('birth-year').value, 10);
    var month   = parseInt(document.getElementById('birth-month').value, 10);
    var day     = parseInt(document.getElementById('birth-day').value, 10);
    var gender  = document.querySelector('input[name="gender"]:checked').value;
    var city    = document.getElementById('city').value.trim() || null;
    var industry = document.getElementById('industry').value.trim() || null;

    var btn = document.querySelector('#user-form .submit-btn');
    var originalText = btn.textContent;
    btn.textContent = '正在解读五行...';
    btn.disabled = true;

    setTimeout(function () {
      // 预生成报告，暂存
      pendingReport = ReportGenerator.generate({
        year: year, month: month, day: day,
        gender: gender, city: city, industry: industry
      });

      var formSection = document.getElementById('form-section');
      formSection.classList.add('fading-out');

      setTimeout(function () {
        formSection.style.display = 'none';
        formSection.classList.remove('fading-out');
        btn.textContent = originalText;
        btn.disabled = false;

        // 显示验证码页
        var codeSection = document.getElementById('code-section');
        codeSection.style.display = '';
        codeSection.style.opacity = '0';
        codeSection.offsetHeight;
        codeSection.style.opacity = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 清除上次的错误和输入
        document.getElementById('access-code').value = '';
        document.getElementById('code-error').style.display = 'none';
      }, 300);
    }, 800);
  });

  // ── 验证码校验 → 显示报告 ──────────────────────────────────────────────────

  document.getElementById('verify-btn').addEventListener('click', async function () {
    var codeInput = document.getElementById('access-code');
    var code = codeInput.value.trim().toUpperCase();
    var errorEl = document.getElementById('code-error');

    if (code.length !== 8) {
      errorEl.style.display = '';
      errorEl.textContent = '请输入8位访问码';
      codeInput.classList.add('input-error');
      return;
    }

    var btn = document.getElementById('verify-btn');
    btn.textContent = '验证中...';
    btn.disabled = true;

    var hash = await sha256(code);

    // 生成用户身份指纹（出生日期绑定）
    var userBirth = pendingReport.userInfo.birthDate;
    var userFingerprint = await sha256(code + '|' + userBirth);

    // 检查码的绑定状态
    var codeBindings = JSON.parse(localStorage.getItem('codeBindings') || '{}');
    var boundFingerprint = codeBindings[hash];

    if (typeof CODE_HASHES === 'undefined' || !CODE_HASHES.has(hash)) {
      // 码不存在
      errorEl.style.display = '';
      errorEl.textContent = '访问码无效，请检查后重试';
      codeInput.classList.add('input-error');
      btn.textContent = '解锁完整报告';
      btn.disabled = false;
    } else if (boundFingerprint && boundFingerprint !== userFingerprint) {
      // 码已绑定给其他用户
      errorEl.style.display = '';
      errorEl.textContent = '该访问码已绑定其他用户，请购买新的访问码';
      codeInput.classList.add('input-error');
      btn.textContent = '解锁完整报告';
      btn.disabled = false;
    } else {
      // 验证通过，绑定码与用户
      codeBindings[hash] = userFingerprint;
      localStorage.setItem('codeBindings', JSON.stringify(codeBindings));

      errorEl.style.display = 'none';
      codeInput.classList.remove('input-error');

      var codeSection = document.getElementById('code-section');
      codeSection.classList.add('fading-out');

      setTimeout(function () {
        codeSection.style.display = 'none';
        codeSection.classList.remove('fading-out');
        btn.textContent = '解锁完整报告';
        btn.disabled = false;

        renderReport(pendingReport);
      }, 300);
    }
  });

  // Enter 键触发验证
  document.getElementById('access-code').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      document.getElementById('verify-btn').click();
    }
  });

  // ── 返回修改信息 ──────────────────────────────────────────────────────────

  document.getElementById('back-to-form').addEventListener('click', function () {
    var codeSection = document.getElementById('code-section');
    codeSection.classList.add('fading-out');
    setTimeout(function () {
      codeSection.style.display = 'none';
      codeSection.classList.remove('fading-out');
      document.getElementById('form-section').style.display = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  });

  // ── 重新测试（报告页→表单页） ──────────────────────────────────────────────

  document.getElementById('retry-btn').addEventListener('click', function () {
    var reportSection = document.getElementById('report-section');
    reportSection.classList.add('fading-out');

    setTimeout(function () {
      reportSection.style.display = 'none';
      reportSection.classList.remove('fading-out');

      var formSection = document.getElementById('form-section');
      formSection.style.display = '';
      formSection.offsetHeight;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  });

  // ── Helper: 分数计数动画 ──────────────────────────────────────────────────

  function animateScore(target) {
    var el = document.getElementById('aura-score');
    var current = 0;
    var duration = 1000; // 1 second
    var steps = 30;
    var increment = target / steps;
    var interval = duration / steps;
    var timer = setInterval(function () {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.round(current);
    }, interval);
  }

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
               '<span class="swatch-circle" style="background:' + c.hex + '"></span>' +
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
    // 显示报告区
    var reportSection = document.getElementById('report-section');
    reportSection.style.display = '';
    reportSection.style.opacity = '0';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 触发 reflow 后淡入
    reportSection.offsetHeight; // eslint-disable-line no-unused-expressions
    reportSection.style.opacity = '';

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
    // Prep score number to 0 (will animate)
    document.getElementById('aura-score').textContent = '0';
    // Reset progress bar to 0 so transition plays
    document.getElementById('score-bar-fill').style.width = '0';
    document.getElementById('score-percentile').textContent =
      '超越了今日 ' + report.auraPercentile + '% 的人';

    // ── 气场关键词 ────────────────────────────────────────────────────────
    var kwHtml = report.auraKeywords.map(function (kw, i) {
      return (i > 0 ? '<span class="kw-divider">/</span>' : '') +
             '<span class="kw-tag">' + kw + '</span>';
    }).join('');
    document.getElementById('aura-keywords').innerHTML = kwHtml;

    // ── 开运色卡（通用 + 个人双体系） ────────────────────────────────────────
    var c = report.colors;
    var u = c.universal;
    var p = c.personal;
    var colorHtml =
      '<div class="color-section-header">今日通用开运色 <span class="color-section-note">· 今日日干属「' + u.todayElement + '」</span></div>' +
      renderColorGroup('大吉色 · ' + u.dajiEl + '系', u.daji, 'daji') +
      renderColorGroup('次吉色 · ' + u.cijiEl + '系', u.ciji, 'ciji') +
      '<div class="color-section-divider"></div>' +
      '<div class="color-section-header">你的专属加持色 <span class="color-section-note">· 基于八字喜用神「' + p.element + '」</span></div>' +
      renderColorGroup('专属主色 · ' + p.element + '系', p.colors, 'personal') +
      renderColorGroup('专属辅色 · ' + p.accentElement + '系', p.accent, 'accent') +
      '<div class="color-section-divider"></div>' +
      renderColorGroup('今日避忌色 · ' + u.buyiEl + '系', u.buyi, 'avoid');
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

    // ── 卡片交错淡入动画 ──────────────────────────────────────────────────
    var cards = document.querySelectorAll('#report-section .report-card');
    cards.forEach(function (card) {
      card.classList.remove('visible');
    });

    cards.forEach(function (card, i) {
      setTimeout(function () {
        card.classList.add('visible');
      }, 80 + i * 150);
    });

    // ── 分数动画（在首张卡片出现后启动） ──────────────────────────────────
    setTimeout(function () {
      animateScore(report.auraScore);
      // 进度条动画：在 score 动画时同步展开
      setTimeout(function () {
        document.getElementById('score-bar-fill').style.width = report.auraScore + '%';
      }, 30);
    }, 80);
  }

});
