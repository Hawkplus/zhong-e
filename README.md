# 中哈科普 · 概念与提示词库

一个**纯静态**的中哈双语科普站：每部短片配一段中文 / 哈萨克语概念解释，以及一份可以复现它的生成提示词。

> 仓库名使用拼音 `zhong-ha`：GitHub 的仓库名只接受 ASCII 字符，中文「中哈」会被规范化，因此以拼音命名，站点与项目名仍为「中哈科普」。

首期内容：《残差网络：为什么网络越深，反而更难训练？》——88 秒中英字幕动画 + 中文/哈萨克语概念页 + 90 秒版完整制作提示词。

![站点预览：中哈科普首页](docs/preview.jpg)

## 在线访问

- 站点：`https://hawkplus.github.io/zhong-ha/`
- 仓库：`https://github.com/Hawkplus/zhong-ha`

## 内容结构

| 页面 | 说明 |
| --- | --- |
| `index.html` | 首页：概念速览、提示词摘要、视频库 |
| `videos/resnet.html` | 残差网络视频页：播放器、11 个章节、双语概念、科学边界 |
| `prompts.html` | 提示词库：两份提示词全文 + 结构拆解 |
| `about.html` | 关于项目、目录结构、新增视频的方法 |

## 技术

- 纯 HTML / CSS / 原生 JavaScript，无框架、无构建、无外部字体与统计脚本。
- 视频使用浏览器原生 `<video>` 播放；复制、章节跳转、目录高亮均为渐进增强，禁用 JS 后仍可阅读和播放。
- 托管在 GitHub Pages，`.nojekyll` 保证静态文件原样发布。

## 目录

```text
.
├── index.html
├── prompts.html
├── about.html
├── 404.html
├── videos/
│   └── resnet.html
├── assets/
│   ├── css/site.css
│   ├── js/site.js
│   ├── img/            # 封面、关键帧、分享图、favicon
│   ├── videos/         # resnet-88s.mp4
│   └── prompts/        # 提示词 Markdown 原文
├── .nojekyll
└── README.md
```

## 本地预览

直接双击 `index.html` 即可；视频与提示词使用相对路径，离线也能播放。

如需以 HTTP 方式预览（推荐，便于测试复制到剪贴板等功能）：

```bash
python -m http.server 8000
# 打开 http://localhost:8000/
```

## 如何新增一部视频

1. **准备素材**：`.mp4`（H.264 / yuv420p，16:9）、16:9 封面、每 8 秒一张章节缩略图。
2. **放入目录**：视频 → `assets/videos/`；封面与缩略图 → `assets/img/`；提示词 → `assets/prompts/`。文件名使用英文小写与连字符。
3. **复制页面**：`videos/resnet.html` → `videos/<slug>.html`，替换标题、哈萨克语标题、正文、章节按钮（`data-chapter` 为跳转秒数）和素材路径。
4. **更新首页**：在「视频库」增加卡片，并从「后续选题」删掉对应条目。

> `videos/` 下的页面引用素材时使用 `../assets/`；首页与 `prompts.html` 使用 `assets/`。

## 说明

- 视频、封面与插图由项目作者使用 AI 工具生成、剪辑与校对；内容用于科普学习，不构成专业结论。
- 哈萨克语文本为教学初稿，以准确传达概念为目标，欢迎在 Issue 中指正术语与表达。
- 概念内容参考：He, Zhang, Ren, Sun. *Deep Residual Learning for Image Recognition*. arXiv:1512.03385, 2015.
- 转载或复用内容请注明出处。
