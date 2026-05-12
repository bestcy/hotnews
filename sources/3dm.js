const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "3dm",
  async scrape() {
    const url = "https://www.3dmgame.com/news/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a.bt").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(node.text()).replace(/^游戏新闻\s*/, "").trim();
      const href = node.attr("href") || "";

      if (
        title.length < 10 ||
        !/^https:\/\/www\.3dmgame\.com\/news\/\d+\/\d+\.html$/.test(href)
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
      platform: "3DM",
      category: "游戏",
      icon: "/icons/3dm.svg",
      updatedAtText: "游戏 / 新闻列表",
      sourceUrl: url,
      items,
    });
  },
};
