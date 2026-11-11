/* 中哈科普 · 站点交互
   - 移动端导航 / 吸顶状态
   - 数据驱动的统计与分类数量
   - Click Spark 点击粒子
   - 复制、收藏、章节跳转、Toast
   无依赖，禁用 JS 时页面内容仍完整可读。 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var toastTimer = null;
  var toastEl = null;

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

    $$('[data-cat-count]').forEach(function (el) {
      var key = el.getAttribute('data-cat-count');
      var item = data.categories && data.categories[key];
      if (!item) return;
      el.textContent = item.status === 'active'
        ? item.videos + ' 部视频 · ' + item.concepts + ' 个概念'
        : '筹备中';
    });
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
          if (label) label.textContent = '已复制';
          showToast('已复制到剪贴板');
          window.setTimeout(function () { if (label) label.textContent = original; }, 1800);
        }).catch(function () {
          showToast('复制失败，请手动选择文本');
        });
        return;
      }

      var urlButton = event.target.closest('[data-copy-url]');
      if (urlButton) {
        event.preventDefault();
        copyText(urlButton.getAttribute('data-copy-url') || window.location.href).then(function () {
          showToast('链接已复制');
        }).catch(function () {
          showToast('复制失败，请从地址栏复制');
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
      if (label) label.textContent = active ? '已收藏' : '收藏';
    }

    render(stored.indexOf(id) !== -1);
    button.addEventListener('click', function () {
      var active = button.classList.contains('is-active');
      var next = active ? stored.filter(function (item) { return item !== id; }) : stored.concat(id);
      stored = next;
      try { window.localStorage.setItem(key, JSON.stringify(next)); } catch (error) { /* 隐私模式 */ }
      render(!active);
      showToast(active ? '已取消收藏' : '已收藏本期视频');
    });
  }

  /* ---------- Click Spark ---------- */
  function initSpark() {
    if (reduceMotion) return;
    var COLORS = ['#2878C8', '#28B6B0', '#5FA9E0'];

    document.addEventListener('click', function (event) {
      var target = event.target.closest('[data-spark]');
      if (!target) return;
      if (target.disabled || target.getAttribute('aria-disabled') === 'true') return;

      var x, y;
      if (event.detail > 0 && event.clientX) {
        x = event.clientX; y = event.clientY;
      } else {
        var rect = target.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }

      var dark = target.matches('.btn-primary, .play-orb, .prompt-banner .btn, .feature-media');
      var colors = dark ? COLORS.concat('#FFFFFF') : COLORS;
      var count = 13;

      for (var i = 0; i < count; i++) {
        var particle = document.createElement('span');
        var isLine = i % 3 === 0;
        var size = isLine ? 2 : 2 + Math.random() * 2.2;
        var angle = (Math.PI * 2 * i) / count + (Math.random() - .5) * .42;
        var distance = (isLine ? 18 : 24) + Math.random() * 26;

        particle.className = 'click-spark' + (isLine ? ' click-spark--line' : '');
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = size + 'px';
        particle.style.height = (isLine ? 9 : size) + 'px';
        particle.style.setProperty('--dx', (Math.cos(angle) * distance).toFixed(1) + 'px');
        particle.style.setProperty('--dy', (Math.sin(angle) * distance).toFixed(1) + 'px');
        particle.style.setProperty('--rot', (Math.random() * 240 - 120).toFixed(0) + 'deg');
        particle.style.setProperty('--spark-color', colors[Math.floor(Math.random() * colors.length)]);
        particle.addEventListener('animationend', function () { this.remove(); });
        document.body.appendChild(particle);
      }
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
    initSpark();
    initYear();
  });
})();
