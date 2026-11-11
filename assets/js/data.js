/* 中哈科普 · 内容数据
   单一数据源：首页统计、分类数量与后续页面都以这里为准。
   只统计已经上线的真实内容。 */
window.SITE_DATA = {
  updated: "2026-11",
  stats: {
    videos: 1,
    concepts: 3,
    languages: 2,
    prompts: 2
  },
  categories: {
    ai: { videos: 1, concepts: 3, status: "active" },
    bio: { videos: 0, concepts: 0, status: "planned" },
    medeng: { videos: 0, concepts: 0, status: "planned" },
    physics: { videos: 0, concepts: 0, status: "planned" }
  }
};
