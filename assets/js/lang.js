/* 中俄科普 · 界面语言切换
   中文 / Русский 两态：翻译界面文案，切换标题主次，
   正文保持中俄对照，不隐藏任一语言。选择写入 localStorage。 */
(function () {
  'use strict';

  var DICT = {
    '学习练习': 'Практика',
    '读懂之后，试着回答': 'Проверьте свои знания',
    '开始自测': 'Пройти тест',
    '跳到主要内容': 'Перейти к содержимому',
    /* 导航 / 页脚 */
    '首页': 'Главная',
    '视频库': 'Видеотека',
    '概念库': 'Понятия',
    '提示词库': 'Промпты',
    '关于项目': 'О проекте',
    '浏览': 'Обзор',
    '资源': 'Ресурсы',
    '项目': 'Проект',
    '新增视频': 'Добавить видео',
    'GitHub 仓库': 'Репозиторий GitHub',
    '提示词原文 .md': 'Текст промпта .md',
    '通用模板 .md': 'Универсальный шаблон .md',
    '视频文件 .mp4': 'Видеофайл .mp4',

    /* 首页 Hero / 区块入口 */
    '观看最新视频': 'Смотреть новое видео',
    '浏览专业知识': 'Изучить понятия',
    '首期上线 · 残差网络': 'Первый выпуск · Остаточные сети',
    '88 秒 · 11 章节': '88 секунд · 11 глав',
    '浏览概念库': 'Открыть библиотеку понятий',
    '查看全部概念': 'Все понятия',
    '视频详情': 'О видео',
    '进入分类': 'Перейти в раздел',
    '筹备中': 'В разработке',
    '即将上线': 'Скоро',
    '观看视频': 'Смотреть видео',
    '阅读概念': 'Читать пояснение',
    '查看详情': 'Подробнее',
    '查看提示词库': 'Открыть библиотеку промптов',
    '2 份提示词': '2 промпта',
    '可复制': 'Можно скопировать',
    '可下载': 'Скачать',
    '后续选题 · 筹备中': 'Следующие темы · В разработке',
    '1 部视频 · 3 个概念': '1 видео · 3 понятия',
    '88 秒': '88 секунд',
    '11 章节': '11 глав',
    '88 秒 · 11 章节 · 中英字幕': '88 секунд · 11 глав · Китайские и английские субтитры',
    '探索每部科学动画背后的完整制作逻辑、视觉规范与生成指令。': 'Изучите процесс создания научных анимаций, визуальные требования и инструкции для генерации.',
    '展开后点击任意章节，视频会跳到对应时间点播放。': 'Раскройте список и выберите главу, чтобы перейти к нужному моменту видео.',
    '想看完整的制作逻辑？提示词库收录了本片的原始提示词与通用模板。': 'Хотите узнать, как создано видео? В библиотеке доступны исходный промпт и универсальный шаблон.',
    '打开提示词库': 'Открыть библиотеку промптов',
    '核心结论：': 'Главный вывод:',

    /* 视频页 */
    '生成它的提示词': 'Промпт для создания видео',
    '查看提示词': 'Посмотреть промпт',
    '下载 .md': 'Скачать .md',
    '展开时间线': 'Открыть список глав',
    '时长': 'Длительность',
    '章节': 'Глава',
    '画面': 'Сцена',
    '帧率': 'Частота кадров',
    '音轨': 'Аудиодорожка',
    '字幕': 'Субтитры',
    '发布': 'Опубликовано',
    '含 AAC 音轨': 'Есть аудиодорожка AAC',
    '中文 / 英文': 'Китайский / Английский',
    '人工智能与计算机科学 · 深度学习': 'Искусственный интеллект и информатика · Глубокое обучение',
    '人工智能与计算机科学': 'Искусственный интеллект и информатика',
    'Concept Library · 双语知识': 'Библиотека понятий · Двуязычные материалы',
    'Prompt Library · 创作资源': 'Библиотека промптов · Материалы для создания видео',
    'About · 项目说明': 'О проекте',
    '在视频中查看：为什么需要残差网络': 'Смотреть: зачем нужны остаточные сети',
    '在视频中查看：残差连接的核心机制': 'Смотреть: механизм остаточной связи',
    '在视频中查看：残差网络如何改善训练': 'Смотреть: как остаточные сети улучшают обучение',

    /* 概念库 */
    '核心机制 · 残差学习': 'Основной механизм · Остаточное обучение',
    '训练视角 · 优化': 'Обучение · Оптимизация',
    '退化现象': 'Деградация',
    '残差连接': 'Остаточная связь',
    '梯度通路': 'Путь градиента',
    '恒等映射': 'Тождественное отображение',
    '跳跃连接': 'Обходная связь',
    '梯度': 'Градиент',

    /* 提示词库 */
    '用途': 'Назначение',
    '适用模型 / 工具': 'Модель / инструмент',
    '版本': 'Версия',
    '文件': 'Файл',
    '90 秒无配音科普动画': 'Научная анимация без звука длительностью 90 секунд',
    '支持代码渲染的 AI Agent / 多模态模型': 'ИИ-агент / мультимодальная модель с поддержкой программного рендеринга',
    '17 拍通用科普动画模板': 'Универсальный шаблон научной анимации из 17 кадров',
    '视频生成 / 程序化渲染工作流': 'Генерация видео / программный рендеринг',
    'Markdown · 可下载': 'Markdown · Доступно для скачивания',
    '一键复制全文': 'Скопировать полный текст',
    '复制全文': 'Скопировать всё',
    '下载 Markdown': 'Скачать Markdown',
    '展开完整提示词（147 行）': 'Открыть полный промпт (147 строк)',
    '展开完整提示词（128 行）': 'Открыть полный промпт (128 строк)',
    '复用提示': 'Советы по использованию',
    '实例': 'Пример',
    '模板': 'Шаблон',

    /* 关于页 */
    '类型': 'Тип',
    '语言': 'Язык',
    '视频': 'Видео',
    '概念': 'Понятие',
    '提示词': 'Промпт',
    '托管': 'Хостинг',
    '更新': 'Обновлено',
    '静态科普站': 'Статический научно-популярный сайт',
    '1 部': '1 видео',
    '3 个': '3 понятия',
    '2 份': '2 промпта',
    '残差网络 · 视频与概念': 'Остаточные сети · Видео и понятия',
    '概念库 · 三个核心概念': 'Понятия · Три ключевых понятия',
    '提示词库 · 两份全文': 'Промпты · Два полных текста',
    '下载提示词 .md': 'Скачать промпт .md',
    '信息优先，装饰克制': 'Содержание на первом месте, оформление сдержанное',
    '中文与俄语并行': 'Китайский и русский параллельно',
    '无外部依赖，离线可读': 'Без внешних зависимостей, доступен для чтения офлайн',

    /* 视频侧栏 / 面包屑 / 404 */
    '为什么需要残差网络？': 'Зачем нужны остаточные сети?',
    '残差连接的核心机制': 'Основной механизм остаточной связи',
    '如何改善训练？': 'Как улучшается обучение?',
    '实际应用与局限': 'Применение и ограничения',
    '残差网络': 'Остаточные сети',
    '返回首页': 'На главную',
    '观看残差网络': 'Смотреть об остаточных сетях'
  };

  var SCOPES = [
    '.practice-jump',
    '.skip-link',
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
    if (lang === 'ru') {
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
    if (lang !== 'ru') lang = 'zh';
    window.SITE_LANG = lang;
    document.documentElement.lang = lang === 'ru' ? 'ru' : 'zh-CN';
    document.documentElement.classList.toggle('lang-ru', lang === 'ru');
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
    var stored = window.SITE_LANG === 'ru' || document.documentElement.classList.contains('lang-ru') ? 'ru' : 'zh';
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
