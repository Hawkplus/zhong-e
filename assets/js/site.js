/* 中哈科普 · 站点交互
   无依赖、渐进增强：禁用 JS 时页面仍可完整阅读与播放。 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. 移动端导航 -------------------------------------------------------- */
  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    }

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      setOpen(false);
    });
  }

  /* 2. 复制到剪贴板 ------------------------------------------------------ */
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

  function initCopy() {
    document.addEventListener('click', function (event) {
      var button = event.target.closest('[data-copy]');
      if (!button) return;
      event.preventDefault();

      var selector = button.getAttribute('data-copy');
      var source = selector ? document.querySelector(selector) : null;
      if (!source) return;

      var label = button.querySelector('[data-copy-label]');
      var original = label ? label.textContent : '';

      copyText(source.textContent).then(function () {
        button.classList.add('is-copied');
        if (label) label.textContent = '已复制';
        window.setTimeout(function () {
          button.classList.remove('is-copied');
          if (label) label.textContent = original;
        }, 1800);
      }).catch(function () {
        if (label) label.textContent = '请手动复制';
        window.setTimeout(function () {
          if (label) label.textContent = original;
        }, 1800);
      });
    });
  }

  /* 3. 视频章节跳转 ------------------------------------------------------ */
  function formatTime(seconds) {
    var total = Math.max(0, Math.floor(seconds || 0));
    var minutes = Math.floor(total / 60);
    var rest = total % 60;
    return minutes + ':' + (rest < 10 ? '0' + rest : rest);
  }

  function initChapters() {
    var video = document.getElementById('lesson-video');
    var chapters = Array.prototype.slice.call(document.querySelectorAll('[data-chapter]'));
    if (!video || !chapters.length) return;

    var progress = document.getElementById('video-progress');

    chapters.forEach(function (chapter) {
      chapter.addEventListener('click', function () {
        var time = parseFloat(chapter.getAttribute('data-chapter')) || 0;
        try {
          video.currentTime = time;
        } catch (error) { /* 元数据未加载时忽略 */ }
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () { /* 自动播放被拦截时保持暂停 */ });
        }
        video.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      });
    });

    function highlight() {
      var time = video.currentTime;
      var current = 0;
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
      if (progress) {
        progress.textContent = formatTime(time) + ' / ' + formatTime(video.duration);
      }
    }

    video.addEventListener('timeupdate', highlight);
    video.addEventListener('loadedmetadata', highlight);
    video.addEventListener('seeked', highlight);
    highlight();
  }

  /* 4. 文章侧栏目录高亮 -------------------------------------------------- */
  function initToc() {
    var links = Array.prototype.slice.call(document.querySelectorAll('[data-toc-link]'));
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    links.forEach(function (link) {
      var id = link.getAttribute('href').replace('#', '');
      var target = document.getElementById(id);
      if (target) map[id] = link;
    });

    var sections = Object.keys(map).map(function (id) { return document.getElementById(id); });
    if (!sections.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) { link.classList.remove('is-active'); });
        var link = map[entry.target.id];
        if (link) link.classList.add('is-active');
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* 6. 页脚年份 ---------------------------------------------------------- */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initCopy();
    initChapters();
    initToc();
    initYear();
  });
})();
