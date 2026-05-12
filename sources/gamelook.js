const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "gamelook",
  async scrape() {
    const url = "http://www.gamelook.com.cn/category/news";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("h2.item-title a").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(node.text());
      const href = node.attr("href") || "";

      if (
        title.length < 8 ||
        !/^http:\/\/www\.gamelook\.com\.cn\/\d{4}\/\d{2}\/\d+\/$/.test(href) ||
        seen.has(href)
      ) {
        return undefined;
      }

      seen.add(href);
      items.push({
        rank: items.length + 1,
        title,
        href,
      });

      return undefined;
    });

    return buildCard({
      platform: "GameLook",
      category: "游戏",
      icon: "/icons/gamelook.svg",
      updatedAtText: "游戏 / 行业资讯",
      sourceUrl: url,
      items,
    });
  },
};
