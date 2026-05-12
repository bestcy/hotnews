const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "youxichaguan",
  async scrape() {
    const url = "https://www.youxichaguan.com/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("h3.item-title a").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(node.text());
      const href = node.attr("href") || "";

      if (
        title.length < 8 ||
        !/^https:\/\/youxichaguan\.com\/archives\/\d+$/.test(href) ||
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
      platform: "游戏茶馆",
      category: "游戏",
      icon: "/icons/youxichaguan.svg",
      updatedAtText: "游戏 / 行业文章",
      sourceUrl: url,
      items,
    });
  },
};
