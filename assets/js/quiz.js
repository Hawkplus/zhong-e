(function () {
  'use strict';
  var questions = [
      {
        prompt: ['更深的普通网络出现退化时，哪项指标可能反而升高？', 'Какой показатель может вырасти при деградации более глубокой обычной сети?'],
        answer: 'degradation',
        explanation: ['训练误差可能升高，因为更深的网络更难优化。', 'Ошибка обучения может возрасти, поскольку более глубокую сеть сложнее оптимизировать.'],
        options: [['验证集准确率', 'Точность на проверочной выборке'], ['训练误差', 'Ошибка обучения'], ['输入分辨率', 'Разрешение входного изображения']],
        correct: 1
      },
      {
        prompt: ['残差块如何组合输入 x 和修正量 F(x)？', 'Как остаточный блок объединяет вход x и поправку F(x)?'],
        answer: 'residual',
        explanation: ['捷径保留 x，残差分支提供 F(x)，两个分支相加。', 'Обходной путь сохраняет x, а остаточная ветвь вычисляет F(x). Результаты складываются.'],
        options: [['x × F(x)', 'x × F(x)'], ['F(x) − x', 'F(x) − x'], ['x + F(x)', 'x + F(x)']],
        correct: 2
      },
      {
        prompt: ['反向传播时，捷径为梯度提供了什么？', 'Что даёт обходная связь градиенту при обратном распространении?'],
        answer: 'gradient',
        explanation: ['梯度可以通过捷径传回较早的层。', 'По обходному пути градиент может распространяться к более ранним слоям.'],
        options: [['更直接的传播路径', 'Более прямой путь распространения'], ['更多训练样本', 'Больше обучающих примеров'], ['更大的输入图片', 'Более крупное входное изображение']],
        correct: 0
      }
    ];
  questions.push(
    {
      prompt: ['如果 F(x) 接近 0，残差块的输出接近什么？', 'К чему близок выход блока, если F(x) близко к нулю?'],
      answer: 'residual',
      options: [['输入 x', 'Вход x'], ['恒为 0', 'Всегда ноль'], ['输入的平方', 'Квадрат входа']],
      correct: 0,
      explanation: ['由 z = x + F(x)，当 F(x) ≈ 0 时，z ≈ x，即接近恒等映射。', 'Из z = x + F(x) следует: если F(x) ≈ 0, то z ≈ x. Это близко к тождественному отображению.']
    },
    {
      prompt: ['两个分支的维度不一致时，如何进行相加？', 'Как сложить ветви с разными размерностями?'],
      answer: 'residual',
      options: [['直接相加即可', 'Просто сложить'], ['先用投影匹配维度', 'Согласовать размерности проекцией'], ['删除输入分支', 'Удалить входную ветвь']],
      correct: 1,
      explanation: ['先用投影（例如 1×1 卷积）匹配维度，再逐元素相加。', 'Сначала размерности согласуют проекцией, например свёрткой 1×1, затем выполняют поэлементное сложение.']
    },
    {
      prompt: ['哪一项更符合过拟合的表现？', 'Что характерно для переобучения?'],
      answer: 'degradation',
      options: [['训练误差较低，测试误差较高', 'Низкая ошибка обучения, высокая тестовая ошибка'], ['训练误差必定升高', 'Ошибка обучения обязательно растёт'], ['训练和测试误差始终相同', 'Ошибки обучения и тестирования всегда равны']],
      correct: 0,
      explanation: ['过拟合通常表现为对训练集拟合很好，但对未见数据的泛化较差。', 'При переобучении модель хорошо подстраивается под обучающие данные, но хуже обобщает на новые.']
    },
    {
      prompt: ['残差连接能保证网络越深、准确率越高吗？', 'Гарантирует ли остаточная связь рост точности с глубиной?'],
      answer: 'gradient',
      options: [['可以，深度决定准确率', 'Да, глубина определяет точность'], ['仅测试时可以', 'Только при тестировании'], ['不能，还取决于数据与训练', 'Нет, важны данные и обучение']],
      correct: 2,
      explanation: ['残差连接改善优化条件，最终效果仍受数据、架构和训练方法影响。', 'Остаточные связи облегчают оптимизацию. Результат также зависит от данных, архитектуры и метода обучения.']
    },
    {
      prompt: ['捷径连接在什么时候参与计算？', 'Когда обходная связь участвует в вычислении?'],
      answer: 'residual',
      options: [['仅在训练阶段', 'Только при обучении'], ['训练和推理阶段都参与', 'При обучении и инференсе'], ['仅在梯度消失时', 'Только при затухании градиента']],
      correct: 1,
      explanation: ['残差块在训练和推理阶段都会计算两个分支并组合输出。', 'Остаточный блок вычисляет обе ветви и объединяет их как при обучении, так и при инференсе.']
    },
    {
      prompt: ['原始 ResNet 研究关注的退化问题，主要体现在哪个数据集上的误差？', 'На какой выборке проявляется проблема деградации, изученная в ResNet?'],
      answer: 'degradation',
      options: [['只在测试集', 'Только на тестовой'], ['只在验证集', 'Только на проверочной'], ['训练集', 'На обучающей']],
      correct: 2,
      explanation: ['更深的普通网络可能出现更高的训练误差，说明增加层数带来了优化困难。', 'У более глубокой обычной сети может быть выше ошибка на обучающей выборке, что указывает на трудности оптимизации.']
    }
  );

  var root = document.getElementById('quiz-root');
  if (!root) return;
  var storageKey = 'zhonge:resnet:quiz:v2';
  var bestKey = storageKey + ':best';
  var topicNames = {
    degradation: ['退化与泛化', 'Деградация и обобщение'],
    residual: ['残差连接', 'Остаточные связи'],
    gradient: ['梯度与优化', 'Градиент и оптимизация']
  };
  var state = null;
  var notice = '';

  function tr(zh, ru) { return window.SITE_LANG === 'ru' ? ru : zh; }
  function localized(pair) { return tr(pair[0], pair[1]); }
  function read(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (error) { return null; }
  }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); }
    catch (error) { notice = tr('浏览器无法保存进度，本次练习仍可继续。', 'Прогресс не сохраняется в этом браузере. Вы можете продолжить.'); }
  }
  function valid(saved) {
    return saved && ['practice', 'exam'].includes(saved.mode) &&
      Array.isArray(saved.ids) && saved.ids.length > 0 && saved.ids.length <= questions.length &&
      new Set(saved.ids).size === saved.ids.length &&
      saved.ids.every(function (id) { return Number.isInteger(id) && id >= 0 && id < questions.length; }) &&
      Array.isArray(saved.answers) && saved.answers.length === saved.ids.length &&
      saved.answers.every(function (answer, index) {
        return answer === null || (Number.isInteger(answer) && answer >= 0 && answer < questions[saved.ids[index]].options.length);
      }) &&
      Array.isArray(saved.checked) && saved.checked.length === saved.ids.length &&
      saved.checked.every(function (checked, index) { return typeof checked === 'boolean' && (!checked || saved.answers[index] !== null); }) &&
      Number.isInteger(saved.position) && saved.position >= 0 && saved.position < saved.ids.length &&
      typeof saved.finished === 'boolean' &&
      (!saved.finished || saved.answers.every(function (answer) { return answer !== null; }));
  }

  var stored = read(storageKey);
  if (valid(stored)) state = stored;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function button(label, className, handler) {
    var node = el('button', className, label);
    node.type = 'button';
    node.addEventListener('click', handler);
    return node;
  }
  function link(label, href, className) {
    var node = el('a', className, label);
    node.href = href;
    return node;
  }
  function start(mode, ids) {
    state = { mode: mode, ids: ids || questions.map(function (_, index) { return index; }), position: 0, finished: false };
    state.answers = state.ids.map(function () { return null; });
    state.checked = state.ids.map(function () { return false; });
    notice = '';
    save();
    render(true);
  }
  function navigate(index) {
    state.position = index;
    notice = '';
    save();
    render(true);
  }
  function score() {
    return state.ids.reduce(function (total, id, index) { return total + Number(state.answers[index] === questions[id].correct); }, 0);
  }
  function finish() {
    var firstMissing = state.answers.indexOf(null);
    if (firstMissing !== -1) {
      state.position = firstMissing;
      notice = tr('还有未作答的题目，已定位到第一道。', 'Остались вопросы без ответа. Открыт первый из них.');
      save();
      render(true);
      return;
    }
    state.finished = true;
    state.checked.fill(true);
    save();
    if (state.ids.length === questions.length) {
      var previous = read(bestKey);
      var best = Number.isInteger(previous) && previous >= 0 && previous <= questions.length ? previous : 0;
      try { localStorage.setItem(bestKey, JSON.stringify(Math.max(best, score()))); } catch (error) {}
    }
    render(true);
  }

  function renderWelcome() {
    var intro = el('section', 'quiz-welcome');
    intro.append(el('p', 'quiz-kicker', tr('残差网络 · 学习练习', 'Остаточные сети · Практика')));
    intro.append(el('h1', '', tr('把“看懂了”变成“答得出”。', 'От понимания к уверенному ответу.')));
    intro.append(el('p', 'quiz-lead', tr('9 道题，串起退化现象、残差连接与梯度通路。选择适合你的学习方式。', '9 вопросов о деградации, остаточных связях и градиенте. Выберите подходящий режим.')));
    var modes = el('div', 'quiz-modes');
    [
      ['practice', ['边学边练', 'Учиться с подсказками'], ['确认答案后即时查看解析，逐题巩固概念。', 'Пояснение после подтверждения каждого ответа.']],
      ['exam', ['完整测验', 'Проверить себя'], ['独立完成全部题目，交卷后统一查看结果。', 'Ответьте самостоятельно. Результаты появятся после сдачи.']]
    ].forEach(function (mode) {
      var card = el('div', 'quiz-mode');
      card.append(el('h2', '', localized(mode[1])), el('p', '', localized(mode[2])));
      card.append(button(tr('开始', 'Начать'), 'btn btn-primary', function () { start(mode[0]); }));
      modes.append(card);
    });
    intro.append(modes, link(tr('先复习概念', 'Сначала повторить понятия'), 'concepts.html', 'text-link'));
    var best = read(bestKey);
    if (Number.isInteger(best) && best >= 0 && best <= questions.length) {
      intro.append(el('p', 'quiz-best', tr('本机最佳成绩 ', 'Лучший результат на устройстве ') + best + ' / ' + questions.length));
    }
    root.append(intro);
  }

  function renderQuestion() {
    var layout = el('div', 'quiz-layout');
    var aside = el('aside', 'quiz-sidebar');
    aside.append(el('p', 'quiz-kicker', state.mode === 'exam' ? tr('完整测验', 'Самопроверка') : tr('边学边练', 'Практика')));
    aside.append(el('h1', '', tr('残差网络', 'Остаточные сети')));
    var answered = state.answers.filter(function (value) { return value !== null; }).length;
    aside.append(el('p', 'quiz-count', tr('已答 ', 'Отвечено ') + answered + ' / ' + state.ids.length));
    var progress = el('progress');
    progress.max = state.ids.length;
    progress.value = answered;
    progress.setAttribute('aria-label', tr('答题进度', 'Прогресс'));
    aside.append(progress);
    var nav = el('nav', 'quiz-map');
    nav.setAttribute('aria-label', tr('题目导航', 'Навигация по вопросам'));
    state.ids.forEach(function (id, index) {
      var item = button(String(index + 1), 'quiz-number', function () { navigate(index); });
      var status = tr('未作答', 'Без ответа');
      if (state.answers[index] !== null) { item.classList.add('answered'); status = tr('已作答', 'Есть ответ'); }
      if (state.checked[index]) {
        var correct = state.answers[index] === questions[id].correct;
        item.classList.add(correct ? 'correct' : 'incorrect');
        status = correct ? tr('正确', 'Верно') : tr('错误', 'Неверно');
      }
      if (index === state.position) item.setAttribute('aria-current', 'step');
      item.setAttribute('aria-label', tr('题目 ', 'Вопрос ') + (index + 1) + ' · ' + status);
      nav.append(item);
    });
    var mapDetails = el('details', 'quiz-map-details');
    mapDetails.open = window.matchMedia('(min-width: 801px)').matches;
    mapDetails.append(el('summary', '', tr('题目导航', 'Все вопросы')), nav);
    aside.append(mapDetails, el('p', 'quiz-save-note', tr('进度保存在当前浏览器，刷新后可继续。', 'Прогресс сохраняется в браузере. Можно продолжить после обновления.')));
    aside.append(button(tr('结束并查看结果', 'Завершить и посмотреть результат'), 'btn btn-secondary', finish));
    aside.append(button(tr('重新选择模式', 'Выбрать режим'), 'quiz-reset', function () {
      if (!window.confirm(tr('重新选择将清除本轮答题进度，是否继续？', 'Текущий прогресс будет удалён. Продолжить?'))) return;
      state = null;
      save();
      render(true);
    }));
    layout.append(aside);
    var card = el('section', 'quiz-question');
    var question = questions[state.ids[state.position]];
    var selected = state.answers[state.position];
    var checked = state.checked[state.position];
    card.append(el('p', 'quiz-topic', localized(topicNames[question.answer])));
    var heading = el('h2', '', localized(question.prompt));
    heading.tabIndex = -1;
    heading.dataset.quizFocus = '';
    card.append(heading);
    card.append(el('p', 'quiz-instruction', tr('单选题 · 选择一个答案', 'Один правильный ответ')));
    var choices = el('fieldset', 'quiz-choices');
    var legend = el('legend', 'sr-only', tr('答案选项', 'Варианты ответа'));
    choices.append(legend);
    question.options.forEach(function (pair, index) {
      var label = el('label', 'quiz-choice');
      if (checked && index === question.correct) label.classList.add('correct');
      if (checked && index === selected && index !== question.correct) label.classList.add('incorrect');
      var radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'quiz-answer';
      radio.value = index;
      radio.checked = index === selected;
      radio.disabled = checked;
      radio.addEventListener('change', function () {
        state.answers[state.position] = index;
        save();
        // Keep the focused radio in place so native arrow-key navigation works.
        choices.querySelectorAll('label').forEach(function (option) {
          option.classList.toggle('selected', option.querySelector('input').checked);
        });
        var count = state.answers.filter(function (value) { return value !== null; }).length;
        aside.querySelector('.quiz-count').textContent = tr('已答 ', 'Отвечено ') + count + ' / ' + state.ids.length;
        progress.value = count;
        var currentNumber = nav.children[state.position];
        currentNumber.classList.add('answered');
        currentNumber.setAttribute('aria-label', tr('题目 ', 'Вопрос ') + (state.position + 1) + ' · ' + tr('已作答', 'Есть ответ'));
        notice = '';
        var oldNotice = card.querySelector('.quiz-notice');
        if (oldNotice) oldNotice.remove();
        action.disabled = false;
      });
      label.classList.toggle('selected', radio.checked);
      label.append(radio, el('span', 'quiz-letter', String.fromCharCode(65 + index)), el('span', 'quiz-choice-text', localized(pair)));
      if (checked && index === question.correct) label.append(el('span', 'quiz-option-status', tr('正确答案', 'Верный ответ')));
      choices.append(label);
    });
    card.append(choices);
    if (checked) {
      var explanation = el('div', 'quiz-explanation');
      explanation.setAttribute('role', 'status');
      explanation.append(el('strong', '', selected === question.correct ? tr('回答正确', 'Верно') : tr('再理解一下', 'Разберём ответ')));
      explanation.append(el('p', '', localized(question.explanation)));
      explanation.append(link(tr('回看对应概念', 'Повторить понятие'), 'concepts.html#' + question.answer, 'text-link'));
      card.append(explanation);
    }
    var controls = el('div', 'quiz-controls');
    var previous = button(tr('上一题', 'Назад'), 'btn btn-secondary', function () { navigate(state.position - 1); });
    previous.disabled = state.position === 0;
    controls.append(previous);
    var last = state.position === state.ids.length - 1;
    var action;
    if (state.mode === 'practice' && !checked) {
      action = button(tr('确认答案', 'Проверить ответ'), 'btn btn-primary', function () {
        if (state.answers[state.position] === null) return;
        state.checked[state.position] = true;
        save();
        render(true);
      });
      action.disabled = selected === null;
    } else {
      action = button(last ? tr('提交并评分', 'Завершить тест') : tr('下一题', 'Далее'), 'btn btn-primary', function () {
        if (last) finish(); else navigate(state.position + 1);
      });
    }
    controls.append(action);
    card.append(controls);
    if (notice) {
      var message = el('p', 'quiz-notice', notice);
      message.setAttribute('role', 'status');
      card.append(message);
    }
    layout.append(card);
    root.append(layout);
  }

  function renderResults() {
    var correct = score();
    var mistakes = state.ids.filter(function (id, index) { return state.answers[index] !== questions[id].correct; });
    var summary = el('section', 'quiz-result-header');
    summary.append(el('p', 'quiz-kicker', tr('本轮学习结果', 'Результат')));
    var heading = el('h1', '', tr('每一道题，都有收获。', 'Каждый вопрос — шаг вперёд.'));
    heading.tabIndex = -1;
    heading.dataset.quizFocus = '';
    summary.append(heading, el('p', 'quiz-score', correct + ' / ' + state.ids.length));
    summary.append(el('p', 'quiz-lead', tr('正确率 ', 'Верных ответов ') + Math.round(correct / state.ids.length * 100) + '%'));
    var topics = el('div', 'quiz-topic-scores');
    Object.keys(topicNames).forEach(function (topic) {
      var ids = state.ids.filter(function (id) { return questions[id].answer === topic; });
      if (!ids.length) return;
      var count = ids.filter(function (id) { return state.answers[state.ids.indexOf(id)] === questions[id].correct; }).length;
      topics.append(el('p', '', localized(topicNames[topic]) + '  ' + count + ' / ' + ids.length));
    });
    summary.append(topics);
    var actions = el('div', 'quiz-controls');
    if (mistakes.length) actions.append(button(tr('只练错题', 'Повторить ошибки'), 'btn btn-primary', function () { start('practice', mistakes); }));
    actions.append(button(tr('重新选择模式', 'Выбрать режим'), 'btn btn-secondary', function () {
      state = null; save(); render(true);
    }));
    summary.append(actions);
    root.append(summary);
    var review = el('section', 'quiz-review-list');
    review.append(el('h2', '', tr('答案与解析', 'Ответы и пояснения')));
    state.ids.forEach(function (id, index) {
      var question = questions[id];
      var right = state.answers[index] === question.correct;
      var item = el('details', 'quiz-review');
      item.open = !right;
      item.append(el('summary', '', (index + 1) + '. ' + localized(question.prompt) + ' — ' + (right ? tr('正确', 'Верно') : tr('需复习', 'Повторить'))));
      item.append(el('p', '', tr('你的答案：', 'Ваш ответ: ') + localized(question.options[state.answers[index]])));
      item.append(el('p', '', tr('正确答案：', 'Верный ответ: ') + localized(question.options[question.correct])));
      item.append(el('p', '', localized(question.explanation)));
      item.append(link(tr('阅读概念', 'Читать пояснение'), 'concepts.html#' + question.answer, 'text-link'));
      review.append(item);
    });
    root.append(review);
  }

  function render(focus) {
    root.replaceChildren();
    if (!state) renderWelcome();
    else if (state.finished) renderResults();
    else renderQuestion();
    if (focus) {
      var target = root.querySelector('[data-quiz-focus]') || root.querySelector('h1');
      if (target) { target.tabIndex = -1; target.focus({ preventScroll: false }); }
    }
  }
  window.addEventListener('langchange', function () { render(false); });
  render(false);
})();
