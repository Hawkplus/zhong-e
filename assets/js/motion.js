/* 中俄科普 · 编辑式动效层
   参考 React Bits 的交互思路，用零依赖原生 JS 重写：
   BlurText / CountUp / AnimatedContent / SpotlightCard / DotGrid /
   DecryptedText / ClickSpark / 阅读进度 / 回到顶部。
   所有隐藏与动画都只在 JS 可用时启用；减少动态效果时自动降级。 */
(function () {
  'use strict';

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var canHover = !!(window.matchMedia && window.matchMedia('(hover: hover)').matches);

  function $(selector, scope) { return (scope || document).querySelector(selector); }
  function $$(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }

  /* ---------- BlurText：标题逐字模糊入场 ---------- */
  function initBlurText() {
    if (reduceMotion) return;

    $$('[data-blur-text]').forEach(function (el) {
      if (el.classList.contains('bt')) return;
      var label = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!label) return;

      el.setAttribute('aria-label', label);
      var inner = document.createElement('span');
      inner.className = 'bt-inner';
      inner.setAttribute('aria-hidden', 'true');
      while (el.firstChild) inner.appendChild(el.firstChild);
      el.appendChild(inner);

      var index = 0;
      function walk(node) {
        if (node.nodeType === 3) {
          var text = node.nodeValue || '';
          if (!text) return;
          var frag = document.createDocumentFragment();
          Array.from(text).forEach(function (ch) {
            if (/\s/.test(ch)) { frag.appendChild(document.createTextNode(ch)); return; }
            var seg = document.createElement('span');
            seg.className = 'bt-seg';
            seg.style.setProperty('--i', Math.min(index, 22));
            seg.textContent = ch;
            index += 1;
            frag.appendChild(seg);
          });
          node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === 1 && node.tagName !== 'BR') {
          Array.prototype.slice.call(node.childNodes).forEach(walk);
        }
      }
      Array.prototype.slice.call(inner.childNodes).forEach(walk);

      el.classList.add('bt');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { el.classList.add('is-in'); });
      });
      /* 网络慢或标签页在后台时的兜底 */
      window.setTimeout(function () {
        el.classList.add('is-in', 'bt-done');
      }, 2200);
    });
  }

  /* ---------- CountUp：统计数字滚动 ---------- */
  function initCountUp() {
    var nodes = $$('[data-stat]');
    if (!nodes.length) return;

    nodes.forEach(function (el) {
      var key = el.getAttribute('data-stat');
      var target = window.SITE_DATA && window.SITE_DATA.stats ? window.SITE_DATA.stats[key] : null;
      if (typeof target !== 'number') target = parseInt(el.textContent, 10);
      if (!isFinite(target) || target === 0) return;

      if (reduceMotion || !('IntersectionObserver' in window)) {
        el.textContent = String(target);
        return;
      }

      el.textContent = '0';
      var started = false;
      var guard = window.setTimeout(run, 2200);

      function run() {
        if (started) return;
        started = true;
        window.clearTimeout(guard);
        var from = 0;
        var start = performance.now();
        var duration = 900;
        function tick(now) {
          var p = Math.min(1, (now - start) / duration);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(from + (target - from) * eased));
          if (p < 1) {
            requestAnimationFrame(tick);
          } else {
            el.textContent = String(target);
          }
        }
        requestAnimationFrame(tick);
      }

      var observer = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        run();
      }, { threshold: 0.5 });
      observer.observe(el);
    });
  }

  /* ---------- AnimatedContent：滚动揭示 ---------- */
  function initReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    var nodes = $$('[data-reveal]');
    if (!nodes.length) return;

    var armed = [];
    var groups = new Map();

    nodes.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.92) return; /* 首屏内容直接可见 */

      var parent = el.parentElement || document.body;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });

    groups.forEach(function (items) {
      items.forEach(function (el, i) {
        el.style.setProperty('--reveal-delay', Math.min(i, 4) * 55 + 'ms');
        el.classList.add('is-armed');
        armed.push(el);
      });
    });

    if (!armed.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });

    armed.forEach(function (el) { observer.observe(el); });

    /* 极端情况下（后台标签、观察器异常）不让内容永久隐藏 */
    window.setTimeout(function () {
      armed.forEach(function (el) { el.classList.add('is-visible'); });
    }, 9000);
  }

  /* ---------- SpotlightCard：光斑跟随 ---------- */
  function initSpotlight() {
    if (reduceMotion || !canHover) return;
    $$('[data-spotlight]').forEach(function (el) {
      el.addEventListener('pointermove', function (event) {
        var rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', (event.clientX - rect.left) + 'px');
        el.style.setProperty('--my', (event.clientY - rect.top) + 'px');
      }, { passive: true });
      el.addEventListener('pointerleave', function () {
        el.style.removeProperty('--mx');
        el.style.removeProperty('--my');
      });
    });
  }

  /* ---------- DotGrid：Hero 交互点阵 ---------- */
  function initHeroDots() {
    var canvas = $('#hero-dots');
    var hero = canvas && canvas.closest('.hero');
    if (!canvas || !hero) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var dpr = 1;
    var width = 0;
    var height = 0;
    var raf = 0;
    var last = 0;
    var visible = true;
    var start = performance.now();
    var mouse = { x: -9999, y: -9999 };

    function resize() {
      var rect = hero.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduceMotion) draw(0);
    }

    function draw(now) {
      var t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);
      var gap = width < 760 ? 34 : 28;
      var cols = Math.ceil(width / gap) + 1;
      var rows = Math.ceil(height / gap) + 1;
      var ox = (width - (cols - 1) * gap) / 2;
      var oy = (height - (rows - 1) * gap) / 2;

      for (var j = 0; j < rows; j++) {
        for (var i = 0; i < cols; i++) {
          var x = ox + i * gap;
          var y = oy + j * gap;
          var dx = x - mouse.x;
          var dy = y - mouse.y;
          var near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 165);
          var wave = reduceMotion ? 0.22 : (Math.sin((x + y * 1.35) * 0.011 - t * 0.9) + 1) / 2;
          var alpha = 0.05 + wave * 0.05 + near * 0.32;
          var color = near > 0.02 ? '40,182,176' : '21,59,89';
          ctx.fillStyle = 'rgba(' + color + ',' + alpha.toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(x, y, 1.05 + near * 1.7 + wave * 0.18, 0, 6.2832);
          ctx.fill();
        }
      }
    }

    function loop(now) {
      if (!visible) { raf = 0; return; }
      if (!last || now - last > 32) {
        draw(now);
        last = now;
      }
      raf = requestAnimationFrame(loop);
    }

    function startLoop() {
      if (!raf && !reduceMotion) raf = requestAnimationFrame(loop);
    }
    function stopLoop() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    if (reduceMotion) return;

    var ro = 'ResizeObserver' in window ? new ResizeObserver(function () { resize(); draw(performance.now()); }) : null;
    if (ro) ro.observe(hero);

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) startLoop(); else stopLoop();
      }, { threshold: 0.05 });
      io.observe(hero);
    }

    hero.addEventListener('pointermove', function (event) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    }, { passive: true });
    hero.addEventListener('pointerleave', function () {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    startLoop();
  }

  /* ---------- DecryptedText：短标签解码 ---------- */
  function initDecrypt() {
    if (reduceMotion) return;
    $$('[data-decrypt]').forEach(function (el) {
      var text = (el.textContent || '').trim();
      if (!text) return;
      var charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#';
      var start = performance.now();
      var duration = 720;
      var finished = false;

      function finish() {
        if (finished) return;
        finished = true;
        el.textContent = text;
      }

      function frame(now) {
        var p = Math.min(1, (now - start) / duration);
        var revealed = Math.floor(p * text.length);
        var out = '';
        for (var i = 0; i < text.length; i++) {
          var ch = text.charAt(i);
          if (i < revealed || /\s/.test(ch) || !/[A-Z0-9/]/.test(ch)) out += ch;
          else out += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        el.textContent = out;
        if (p < 1) requestAnimationFrame(frame);
        else finish();
      }

      requestAnimationFrame(frame);
      window.setTimeout(finish, 1300);
    });
  }

  /* ---------- ClickSpark：Canvas 火花 ---------- */
  function initSpark() {
    if (reduceMotion) return;
    var canvas = document.createElement('canvas');
    canvas.className = 'spark-layer';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var width = 0;
    var height = 0;
    var dpr = 1;
    var sparks = [];
    var raf = 0;
    var COLORS = ['#2878C8', '#28B6B0', '#5FA9E0'];

    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(now) {
      ctx.clearRect(0, 0, width, height);
      sparks = sparks.filter(function (spark) { return now - spark.t < 520; });
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      sparks.forEach(function (spark) {
        var p = (now - spark.t) / 520;
        var ease = 1 - Math.pow(1 - p, 3);
        var distance = ease * spark.dist;
        var length = spark.len * (1 - ease);
        ctx.globalAlpha = 1 - p * 0.6;
        ctx.strokeStyle = spark.color;
        ctx.beginPath();
        ctx.moveTo(spark.x + Math.cos(spark.a) * distance, spark.y + Math.sin(spark.a) * distance);
        ctx.lineTo(spark.x + Math.cos(spark.a) * (distance + length), spark.y + Math.sin(spark.a) * (distance + length));
        ctx.stroke();
      });

      ctx.globalAlpha = 1;
      canvas.dataset.active = sparks.length ? '1' : '0';
      raf = sparks.length ? requestAnimationFrame(draw) : 0;
    }

    function onClick(event) {
      var target = event.target.closest('[data-spark]');
      if (!target || target.disabled || target.getAttribute('aria-disabled') === 'true') return;

      var x = event.clientX;
      var y = event.clientY;
      if (!event.detail || (!x && !y)) {
        var rect = target.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }

      var custom = target.getAttribute('data-spark-color');
      var dark = target.matches('.btn-primary, .play-orb, .prompt-banner .btn, .feature-media');
      var colors = custom ? [custom] : (dark ? COLORS.concat('#FFFFFF') : COLORS);
      var now = performance.now();

      for (var i = 0; i < 10; i++) {
        sparks.push({
          x: x,
          y: y,
          a: (Math.PI * 2 * i) / 10 + Math.random() * 0.35,
          t: now,
          dist: 23 + Math.random() * 12,
          len: 10 + Math.random() * 6,
          color: colors[i % colors.length]
        });
      }
      if (!raf) raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('click', onClick);
  }

  /* ---------- 阅读进度 ---------- */
  function initProgress() {
    var bar = document.createElement('div');
    bar.className = 'read-progress';
    bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = '<i></i>';
    document.body.appendChild(bar);
    var fill = bar.firstChild;
    var ticking = false;

    function update() {
      ticking = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      fill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* ---------- 回到顶部 ---------- */
  function initToTop() {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'to-top';
    button.setAttribute('aria-label', '回到顶部');
    button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
    document.body.appendChild(button);

    function update() {
      button.classList.toggle('is-visible', window.scrollY > 620);
    }
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initBlurText();
    initCountUp();
    initReveal();
    initSpotlight();
    initHeroDots();
    initDecrypt();
    initSpark();
    initProgress();
    initToTop();
  });
})();
