const {
  absoluteUrl,
  buildCard,
  fetchText,
  loadHtml,
  normalizeText,
} = require("./helpers");

module.exports = {
  name: "yystv",
  async scrape() {
    const url = "https://www.yystv.cn/b/news";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $(".articles-item").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(node.find(".articles-title").text());
      const href = absoluteUrl(
        node.find("a.articles-link").attr("href") || "",
        "https://www.yystv.cn"
      );
      const meta = normalizeText(node.find(".article-meta").text())
        .replace(/\s+/g, " ")
        .trim();

      if (
        title.length < 10 ||
        !/^https:\/\/www\.yystv\.cn\/p\/\d+$/.test(href)
      ) {
        return undefined;
      }

      if (seen.has(href)) {
        return undefined;
      }

      seen.add(href);
      items.push({
        rank: items.length + 1,
        title,
        href,
        meta,
      });

      return undefined;
    });

    return buildCard({
      platform: "游研社",
      category: "游戏",
      icon: "/icons/yystv.svg",
      updatedAtText: "游戏 / 趣闻",
      sourceUrl: url,
      items,
    });
  },
};
