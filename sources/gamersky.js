const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "gamersky",
  async scrape() {
    const url = "https://www.gamersky.com/news/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a.tt").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(node.text());
      const href = node.attr("href") || "";

      if (
        title.length < 10 ||
        !/^https:\/\/www\.gamersky\.com\/news\/\d+\/\d+\.shtml$/.test(href)
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
      });

      return undefined;
    });

    return buildCard({
      platform: "游民星空",
      category: "游戏",
      icon: "/icons/gamersky.svg",
      updatedAtText: "游戏 / 新闻列表",
      sourceUrl: url,
      items,
    });
  },
};
