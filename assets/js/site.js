/* 中哈科普 · 站点交互
   - 移动端导航 / 吸顶状态
   - 数据驱动的统计与分类数量
   - 复制、收藏、章节跳转、Toast
   - 视觉动效（点阵 / 模糊入场 / 数字滚动 / 光斑 / 火花）见 motion.js
   无依赖，禁用 JS 时页面内容仍完整可读。 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var toastTimer = null;
  var toastEl = null;

  /* 界面语言（由 lang.js / 内联脚本维护） */
  function tr(zh, kk) {
    return window.SITE_LANG === 'kk' ? kk : zh;
  }

  /* ---------- 基础工具 ---------- */
  function $(selector, scope) { return (scope || document).querySelector(selector); }
  function $$(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }

  function showToast(message) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toastEl.classList.remove('is-visible'); }, 1900);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
      document.body.appendChild(area);
      area.select();
      try {
        var ok = document.execCommand('copy');
        document.body.removeChild(area);
        ok ? resolve() : reject(new Error('copy failed'));
      } catch (error) {
        document.body.removeChild(area);
        reject(error);
      }
    });
  }

  /* ---------- 导航 ---------- */
  function initNav() {
    var toggle = $('[data-nav-toggle]');
    var nav = $('#site-nav');
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    }

    toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    nav.addEventListener('click', function (event) { if (event.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      setOpen(false);
    });
  }

  function initHeaderState() {
    var header = $('.site-header');
    if (!header) return;
    function update() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------- 数据 ---------- */
  function initData() {
    var data = window.SITE_DATA;
    if (!data) return;

    $$('[data-stat]').forEach(function (el) {
      var key = el.getAttribute('data-stat');
      var value = data.stats && data.stats[key];
      if (value !== undefined && value !== null) el.textContent = String(value);
    });

    function renderCounts() {
      $$('[data-cat-count]').forEach(function (el) {
        var key = el.getAttribute('data-cat-count');
        var item = data.categories && data.categories[key];
        if (!item) return;
        el.textContent = item.status === 'active'
          ? item.videos + ' ' + tr('部视频', 'бейне') + ' · ' + item.concepts + ' ' + tr('个概念', 'ұғым')
          : tr('筹备中', 'Дайындалуда');
      });
    }
    renderCounts();
    window.addEventListener('langchange', renderCounts);
  }

  /* ---------- 复制 ---------- */
  function initCopy() {
    document.addEventListener('click', function (event) {
      var button = event.target.closest('[data-copy-target]');
      if (button) {
        event.preventDefault();
        var target = $(button.getAttribute('data-copy-target'));
        if (!target) return;
        var label = button.querySelector('[data-copy-label]');
        var original = label ? label.textContent : '';
        copyText(target.textContent).then(function () {
          if (label) label.textContent = tr('已复制', 'Көшірілді');
          showToast(tr('已复制到剪贴板', 'Мәтін алмасу буферіне көшірілді'));
          window.setTimeout(function () { if (label) label.textContent = original; }, 1800);
        }).catch(function () {
          showToast(tr('复制失败，请手动选择文本', 'Көшіру сәтсіз аяқталды, мәтінді өзіңіз таңдаңыз'));
        });
        return;
      }

      var urlButton = event.target.closest('[data-copy-url]');
      if (urlButton) {
        event.preventDefault();
        copyText(urlButton.getAttribute('data-copy-url') || window.location.href).then(function () {
          showToast(tr('链接已复制', 'Сілтеме көшірілді'));
        }).catch(function () {
          showToast(tr('复制失败，请从地址栏复制', 'Көшіру сәтсіз аяқталды, мекенжай жолынан көшіріңіз'));
        });
      }
    });
  }

  /* ---------- 视频章节 ---------- */
  function formatTime(seconds) {
    var total = Math.max(0, Math.floor(seconds || 0));
    var m = Math.floor(total / 60);
    var s = total % 60;
    return m + ':' + (s < 10 ? '0' + s : s);
  }

  function initChapters() {
    var video = $('#lesson-video');
    var chapters = $$('[data-chapter]');
    if (!video || !chapters.length) return;
    var timeEl = $('#player-time');

    chapters.forEach(function (chapter) {
      chapter.addEventListener('click', function () {
        var time = parseFloat(chapter.getAttribute('data-chapter')) || 0;
        try { video.currentTime = time; } catch (error) { /* 元数据未就绪 */ }
        var result = video.play();
        if (result && typeof result.catch === 'function') result.catch(function () {});
        video.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      });
    });

    function highlight() {
      var current = 0;
      var time = video.currentTime || 0;
      chapters.forEach(function (chapter) {
        var start = parseFloat(chapter.getAttribute('data-chapter')) || 0;
        if (time >= start) current = start;
      });
      chapters.forEach(function (chapter) {
        var start = parseFloat(chapter.getAttribute('data-chapter')) || 0;
        var active = start === current;
        chapter.classList.toggle('is-playing', active);
        if (active) chapter.setAttribute('aria-current', 'true');
        else chapter.removeAttribute('aria-current');
      });
      if (timeEl) {
        var duration = isFinite(video.duration) ? video.duration : 88;
        timeEl.textContent = formatTime(time) + ' / ' + formatTime(duration);
      }
    }

    video.addEventListener('timeupdate', highlight);
    video.addEventListener('loadedmetadata', highlight);
    video.addEventListener('seeked', highlight);
    highlight();
  }

  /* ---------- 收藏 ---------- */
  function initFavorite() {
    var button = $('[data-favorite]');
    if (!button) return;
    var key = 'zhongha:favorites';
    var id = button.getAttribute('data-favorite') || 'resnet';
    var label = button.querySelector('[data-fav-label]');
    var stored = [];

    try { stored = JSON.parse(window.localStorage.getItem(key) || '[]'); } catch (error) { stored = []; }
    if (!Array.isArray(stored)) stored = [];

    function render(active) {
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      button.setAttribute('aria-label', active
        ? tr('取消收藏本期视频', 'Бұл бейнені сақтаудан алу')
        : tr('收藏本期视频', 'Бұл бейнені сақтау'));
      if (label) label.textContent = active ? tr('已收藏', 'Сақталды') : tr('收藏', 'Сақтау');
    }

    render(stored.indexOf(id) !== -1);
    window.addEventListener('langchange', function () {
      render(button.classList.contains('is-active'));
    });
    button.addEventListener('click', function () {
      var active = button.classList.contains('is-active');
      var next = active ? stored.filter(function (item) { return item !== id; }) : stored.concat(id);
      stored = next;
      try { window.localStorage.setItem(key, JSON.stringify(next)); } catch (error) { /* 隐私模式 */ }
      render(!active);
      showToast(active ? tr('已取消收藏', 'Сақтаудан алынды') : tr('已收藏本期视频', 'Бұл бейне сақталды'));
    });
  }

  /* ---------- 年份 ---------- */
  function initYear() {
    $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initHeaderState();
    initData();
    initCopy();
    initChapters();
    initFavorite();
    initYear();
  });
})();

/* Search and explicit playback resume, with graceful storage fallback. */
(function () {
  'use strict';
  function initPractice(list, tr) {
    var questions = [
      {
        prompt: ['更深的普通网络出现退化时，哪项指标可能反而升高？', 'Терең кәдімгі желіде деградация болса, қай көрсеткіш артуы мүмкін?'],
        answer: 'degradation',
        explanation: ['训练误差可能升高，因为更深的网络更难优化。', 'Терең желіні оңтайландыру қиындағандықтан, оқыту қатесі артуы мүмкін.'],
        options: [['验证集准确率', 'Тексеру жиынындағы дәлдік'], ['训练误差', 'Оқыту қатесі'], ['输入分辨率', 'Кіріс ажыратымдылығы']],
        correct: 1
      },
      {
        prompt: ['残差块如何组合输入 x 和修正量 F(x)？', 'Қалдық блок x кірісі мен F(x) түзетуін қалай біріктіреді?'],
        answer: 'residual',
        explanation: ['捷径保留 x，残差分支提供 F(x)，两个分支相加。', 'Айналма жол x мәнін сақтайды, ал қалдық тармақ F(x) мәнін береді. Екеуі қосылады.'],
        options: [['x × F(x)', 'x × F(x)'], ['F(x) − x', 'F(x) − x'], ['x + F(x)', 'x + F(x)']],
        correct: 2
      },
      {
        prompt: ['反向传播时，捷径为梯度提供了什么？', 'Кері таралу кезінде айналма байланыс градиентке не береді?'],
        answer: 'gradient',
        explanation: ['梯度可以通过捷径传回较早的层。', 'Градиент айналма жол арқылы алдыңғы қабаттарға өте алады.'],
        options: [['更直接的传播路径', 'Тікелей таралу жолы'], ['更多训练样本', 'Көбірек оқыту үлгісі'], ['更大的输入图片', 'Үлкенірек кіріс суреті']],
        correct: 0
      }
    ];
    var section = document.createElement('section');
    section.className = 'practice';
    section.id = 'practice';
    section.innerHTML = '<h2 id="practice-title"></h2><p class="practice-step"></p><progress max="3" value="0" aria-labelledby="practice-title"></progress><fieldset><legend></legend><div class="practice-options"></div></fieldset><p role="status" class="practice-feedback"></p><a class="practice-review" hidden></a><button class="btn btn-primary" type="button" hidden></button>';
    section.setAttribute('aria-labelledby', 'practice-title');
    list.after(section);
    var title = section.querySelector('h2');
    var field = section.querySelector('fieldset');
    var legend = section.querySelector('legend');
    var options = section.querySelector('.practice-options');
    var feedback = section.querySelector('.practice-feedback');
    var review = section.querySelector('.practice-review');
    var next = section.querySelector('.btn');
    var position = 0;
    var score = 0;
    var choice = null;

    function render() {
      var question = questions[position];
      title.textContent = tr('残差网络小测', 'Қалдық желілер бойынша тест');
      section.querySelector('.practice-step').textContent = question
        ? tr('第 ' + (position + 1) + ' 题，共 3 题', (position + 1) + ' / 3 сұрақ')
        : tr('答对 ' + score + ' / 3 题', score + ' / 3 дұрыс жауап');
      section.querySelector('progress').value = position + Number(choice !== null);
      field.hidden = !question;
      review.hidden = choice === null;
      next.hidden = Boolean(question && choice === null);
      feedback.textContent = '';
      if (!question) {
        next.textContent = tr('再练一次', 'Қайталау');
        return;
      }
      legend.textContent = tr.apply(null, question.prompt);
      options.replaceChildren();
      question.options.forEach(function (pair, index) {
        var button = document.createElement('button');
        button.type = 'button';
        button.textContent = tr.apply(null, pair);
        button.disabled = choice !== null;
        if (choice !== null && index === question.correct) button.classList.add('is-correct');
        if (choice === index && index !== question.correct) button.classList.add('is-incorrect');
        button.addEventListener('click', function () {
          choice = index;
          score += Number(index === question.correct);
          render();
          next.focus();
        });
        options.append(button);
      });
      if (choice !== null) {
        feedback.textContent = (choice === question.correct ? tr('答对了。', 'Дұрыс. ') : tr('再看看这个概念。', 'Осы ұғымды қайталаңыз. ')) + tr.apply(null, question.explanation);
        review.href = '#' + question.answer;
        review.textContent = tr('回看概念', 'Ұғымды қайталау');
        next.textContent = position === questions.length - 1 ? tr('查看成绩', 'Нәтижені көру') : tr('下一题', 'Келесі сұрақ');
      }
    }

    next.addEventListener('click', function () {
      if (position === questions.length) {
        position = 0;
        score = 0;
      } else {
        position++;
      }
      choice = null;
      render();
      (field.hidden ? next : options.firstElementChild).focus();
    });
    window.addEventListener('langchange', render);
    render();
    if (location.hash === '#practice') section.scrollIntoView();
  }

  document.addEventListener('DOMContentLoaded', function () {
    function tr(zh, kk) { return window.SITE_LANG === 'kk' ? kk : zh; }
    var list = document.querySelector('.concept-list');
    if (list) {
      var form = document.createElement('div');
      form.className = 'concept-search';
      var label = document.createElement('label');
      label.htmlFor = 'concept-search';
      var input = document.createElement('input');
      input.id = 'concept-search';
      input.type = 'search';
      var status = document.createElement('p');
      status.setAttribute('role', 'status');
      form.append(label, input, status);
      list.before(form);
      var entries = Array.from(list.querySelectorAll('.concept-entry'));
      function filter() {
        var query = input.value.trim().toLocaleLowerCase();
        var count = 0;
        entries.forEach(function (entry) {
          entry.hidden = !entry.textContent.toLocaleLowerCase().includes(query);
          if (!entry.hidden) count++;
        });
        label.textContent = tr('搜索概念', 'Ұғымдарды іздеу');
        input.placeholder = tr('输入中文、哈萨克语或英文关键词', 'Қазақша, қытайша немесе ағылшынша іздеу');
        status.textContent = count ? tr('找到 ' + count + ' 个概念', count + ' ұғым табылды') : tr('没有匹配的概念，请更换关键词。', 'Ұғым табылмады. Басқа сөзді қолданыңыз.');
      }
      input.addEventListener('input', filter);
      window.addEventListener('langchange', filter);
      window.addEventListener('hashchange', function () { input.value = ''; filter(); });
      filter();
    }
    if (list) initPractice(list, tr);
    var video = document.querySelector('#lesson-video');
    if (!video) return;
    var key = 'zhongha:progress:resnet';
    var saved = 0;
    try { saved = Number(localStorage.getItem(key)); } catch (error) {}
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'resume-control';
    button.hidden = true;
    video.after(button);
    function renderResume() {
      button.textContent = tr('继续上次观看 · ', 'Көруді жалғастыру · ') + Math.floor(saved) + 's';
      button.hidden = !(Number.isFinite(saved) && saved > 2 && Number.isFinite(video.duration) && saved < video.duration - 2);
    }
    video.addEventListener('loadedmetadata', renderResume);
    window.addEventListener('langchange', renderResume);
    renderResume();
    button.addEventListener('click', function () {
      video.currentTime = saved;
      button.hidden = true;
      video.play().catch(function () {});
    });
    var lastSaved = -1;
    video.addEventListener('timeupdate', function () {
      var seconds = Math.floor(video.currentTime);
      if (seconds === lastSaved || video.paused) return;
      lastSaved = seconds;
      try { localStorage.setItem(key, String(seconds)); } catch (error) {}
    });
    video.addEventListener('ended', function () {
      saved = 0;
      button.hidden = true;
      try { localStorage.removeItem(key); } catch (error) {}
    });
  });
})();
