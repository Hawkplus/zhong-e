/* 中哈科普 · 界面语言切换
   中文 / Қазақша 两态：翻译界面文案，切换标题主次，
   正文保持中哈对照，不隐藏任一语言。选择写入 localStorage。 */
(function () {
  'use strict';

  var DICT = {
    /* 导航 / 页脚 */
    '首页': 'Басты бет',
    '视频库': 'Бейнежинақ',
    '概念库': 'Ұғымдар',
    '提示词库': 'Промпттар',
    '关于项目': 'Жоба туралы',
    '浏览': 'Шолу',
    '资源': 'Ресурстар',
    '项目': 'Жоба',
    '新增视频': 'Бейне қосу',
    'GitHub 仓库': 'GitHub қоймасы',
    '提示词原文 .md': 'Промпт мәтіні .md',
    '通用模板 .md': 'Әмбебап үлгі .md',
    '视频文件 .mp4': 'Бейне файлы .mp4',

    /* 首页 Hero / 区块入口 */
    '观看最新视频': 'Соңғы бейнені көру',
    '浏览专业知识': 'Кәсіби білімді шолу',
    '首期上线 · 残差网络': 'Алғашқы шығарылым · Қалдық желілер',
    '88 秒 · 11 章节': '88 секунд · 11 тарау',
    '浏览概念库': 'Ұғымдар кітапханасын шолу',
    '查看全部概念': 'Барлық ұғымдарды көру',
    '视频详情': 'Бейне туралы',
    '进入分类': 'Бөлімге кіру',
    '筹备中': 'Дайындалуда',
    '即将上线': 'Жақында',
    '观看视频': 'Бейнені көру',
    '阅读概念': 'Ұғымды оқу',
    '查看详情': 'Толығырақ',
    '查看提示词库': 'Промпттар кітапханасын ашу',
    '2 份提示词': '2 промпт',
    '可复制': 'Көшіруге болады',
    '可下载': 'Жүктеуге болады',
    '后续选题 · 筹备中': 'Келесі тақырыптар · Дайындалуда',
    '1 部视频 · 3 个概念': '1 бейне · 3 ұғым',
    '88 秒': '88 секунд',
    '11 章节': '11 тарау',
    '88 秒 · 11 章节 · 中英字幕': '88 секунд · 11 тарау · Қытай/ағылшын субтитрі',
    '探索每部科学动画背后的完整制作逻辑、视觉规范与生成指令。': 'Әр ғылыми анимацияның толық өндіріс логикасын, визуалды нормаларын және генерация нұсқауларын зерттеңіз.',
    '展开后点击任意章节，视频会跳到对应时间点播放。': 'Ашқаннан кейін кез келген тарауды басыңыз, бейне сәйкес уақытқа өтеді.',
    '想看完整的制作逻辑？提示词库收录了本片的原始提示词与通用模板。': 'Толық өндіріс логикасын көргіңіз келе ме? Промпттар кітапханасында бұл бейненің түпнұсқа промпты мен әмбебап үлгісі бар.',
    '打开提示词库': 'Промпттар кітапханасын ашу',
    '核心结论：': 'Негізгі қорытынды:',

    /* 视频页 */
    '生成它的提示词': 'Оны жасаған промпт',
    '查看提示词': 'Промптты көру',
    '下载 .md': '.md жүктеу',
    '展开时间线': 'Уақыт желісін ашу',
    '时长': 'Ұзақтығы',
    '章节': 'Тарау',
    '画面': 'Көрініс',
    '帧率': 'Кадр жиілігі',
    '音轨': 'Дыбыс жолы',
    '字幕': 'Субтитр',
    '发布': 'Жарияланды',
    '含 AAC 音轨': 'AAC дыбыс жолы бар',
    '中文 / 英文': 'Қытай / Ағылшын',
    '人工智能与计算机科学 · 深度学习': 'Жасанды интеллект және информатика · Терең оқыту',
    '人工智能与计算机科学': 'Жасанды интеллект және информатика',
    'Concept Library · 双语知识': 'Concept Library · Қос тілді білім',
    'Prompt Library · 创作资源': 'Prompt Library · Шығармашылық ресурстар',
    'About · 项目说明': 'About · Жоба сипаттамасы',
    '在视频中查看：为什么需要残差网络': 'Бейнеден қарау: неге қалдық желі қажет',
    '在视频中查看：残差连接的核心机制': 'Бейнеден қарау: қалдық байланыстың негізгі механизмі',
    '在视频中查看：残差网络如何改善训练': 'Бейнеден қарау: қалдық желі оқытуды қалай жақсартады',

    /* 概念库 */
    '核心机制 · 残差学习': 'Негізгі механизм · Қалдық оқыту',
    '训练视角 · 优化': 'Оқыту тұрғысы · Оңтайландыру',
    '退化现象': 'Деградация',
    '残差连接': 'Қалдық байланыс',
    '梯度通路': 'Градиент жолы',
    '恒等映射': 'Тепе-тең бейнелеу',
    '跳跃连接': 'Айналма байланыс',
    '梯度': 'Градиент',

    /* 提示词库 */
    '用途': 'Мақсаты',
    '适用模型 / 工具': 'Модель / құрал',
    '版本': 'Нұсқа',
    '文件': 'Файл',
    '90 秒无配音科普动画': '90 секундтық дыбыссыз ғылыми анимация',
    '支持代码渲染的 AI Agent / 多模态模型': 'Кодтық рендерді қолдайтын AI Agent / мультимодальды модель',
    '17 拍通用科普动画模板': '17 кадрлық әмбебап ғылыми анимация үлгісі',
    '视频生成 / 程序化渲染工作流': 'Бейне генерациясы / бағдарламалық рендер ағыны',
    'Markdown · 可下载': 'Markdown · жүктеуге болады',
    '一键复制全文': 'Толық мәтінді көшіру',
    '复制全文': 'Толық көшіру',
    '下载 Markdown': 'Markdown жүктеу',
    '展开完整提示词（147 行）': 'Толық промптты ашу (147 жол)',
    '展开完整提示词（128 行）': 'Толық промптты ашу (128 жол)',
    '复用提示': 'Қайта қолдану кеңестері',
    '实例': 'Мысал',
    '模板': 'Үлгі',

    /* 关于页 */
    '类型': 'Түрі',
    '语言': 'Тіл',
    '视频': 'Бейне',
    '概念': 'Ұғым',
    '提示词': 'Промпт',
    '托管': 'Хостинг',
    '更新': 'Жаңартылды',
    '静态科普站': 'Статикалық ғылыми сайт',
    '1 部': '1 бейне',
    '3 个': '3 ұғым',
    '2 份': '2 промпт',
    '残差网络 · 视频与概念': 'Қалдық желілер · бейне және ұғым',
    '概念库 · 三个核心概念': 'Ұғымдар · үш негізгі ұғым',
    '提示词库 · 两份全文': 'Промпттар · екі толық мәтін',
    '下载提示词 .md': 'Промптты жүктеу .md',
    '信息优先，装饰克制': 'Ақпарат бірінші, безендіру ұстамды',
    '中文与哈萨克语并行': 'Қытай және қазақ тілдері қатар',
    '无外部依赖，离线可读': 'Сыртқы тәуелділіксіз, офлайн оқуға болады',

    /* 视频侧栏 / 面包屑 / 404 */
    '为什么需要残差网络？': 'Неге қалдық желі қажет?',
    '残差连接的核心机制': 'Қалдық байланыстың негізгі механизмі',
    '如何改善训练？': 'Оқытуды қалай жақсартады?',
    '实际应用与局限': 'Нақты қолданылуы мен шектеулері',
    '残差网络': 'Қалдық желілер',
    '返回首页': 'Басты бетке',
    '观看残差网络': 'Қалдық желілерді көру'
  };

  var SCOPES = [
    '.site-nav',
    '.hero-actions',
    '.hero-foot',
    '.section-link',
    '.category-foot',
    '.status-pill',
    '.count-pill',
    '.roadmap-head',
    '.roadmap-item .status',
    '.feature-meta',
    '.player-meta',
    '.chapter-hint',
    '.prompt-banner-desc',
    '.aside-prompt',
    '.stage-conclusion b',
    '.feature-kicker',
    '.feature-actions',
    '.concept-link',
    '.prompt-banner-action',
    '.prompt-tags',
    '.page-kicker',
    '.page-meta',
    '.player-actions a',
    '.player-actions button:not([data-favorite])',
    '.prompt-cta h3',
    '.prompt-cta-actions',
    '.chapters > summary',
    '.info-list .k',
    '.info-list .v',
    '.path-list a',
    '.tag-cloud a',
    '.prompt-overview .v',
    '.prompt-specs .k',
    '.prompt-specs .v',
    '.prompt-actions',
    '.prompt-notes h3',
    '.prompt-details > summary',
    '.prompt-badges',
    '.about-facts .k',
    '.about-facts .v',
    '.entry-kicker',
    '.entry-link',
    '.breadcrumb',
    '.error-actions',
    '.site-footer'
  ];

  var registry = [];
  var seen = new Set();

  function walk(node) {
    if (node.nodeType === 3) {
      var key = node.nodeValue.trim();
      if (DICT[key] && !seen.has(node)) {
        seen.add(node);
        registry.push({ node: node, original: node.nodeValue });
      }
      return;
    }
    if (node.nodeType !== 1) return;
    if (/^(SCRIPT|STYLE|SVG|PATH|CANVAS)$/.test(node.tagName)) return;
    Array.prototype.slice.call(node.childNodes).forEach(walk);
  }

  function collect() {
    SCOPES.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(walk);
    });
  }

  function apply(lang) {
    registry.forEach(function (item) {
      item.node.nodeValue = item.original;
    });
    if (lang === 'kk') {
      registry.forEach(function (item) {
        var key = item.original.trim();
        var leading = (item.original.match(/^\s*/) || [''])[0];
        var trailing = (item.original.match(/\s*$/) || [''])[0];
        item.node.nodeValue = leading + DICT[key] + trailing;
      });
    }
  }

  function updateButtons(lang) {
    document.querySelectorAll('.lang-switch button').forEach(function (button) {
      var on = button.getAttribute('data-lang') === lang;
      button.classList.toggle('is-on', on);
      button.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function setLang(lang, persist) {
    if (lang !== 'kk') lang = 'zh';
    window.SITE_LANG = lang;
    document.documentElement.classList.toggle('lang-kk', lang === 'kk');
    document.documentElement.setAttribute('data-ui-lang', lang);
    apply(lang);
    updateButtons(lang);

    if (persist) {
      try { window.localStorage.setItem('zhongha:lang', lang); } catch (error) { /* 隐私模式 */ }
    }

    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
    /* 语言切换会改变标题高度与页面总高度，刷新阅读进度 / 回到顶部状态 */
    window.dispatchEvent(new Event('scroll'));
  }

  function init() {
    collect();
    var stored = window.SITE_LANG === 'kk' || document.documentElement.classList.contains('lang-kk') ? 'kk' : 'zh';
    setLang(stored, false);

    document.querySelectorAll('.lang-switch button').forEach(function (button) {
      button.addEventListener('click', function () {
        setLang(button.getAttribute('data-lang'), true);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
