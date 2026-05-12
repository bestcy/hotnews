const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "ali213",
  async scrape() {
    const url = "https://www.ali213.net/news/game/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("h2.lone_t a").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(node.text());
      const href = node.attr("href") || "";

      if (
        title.length < 10 ||
        !/^https:\/\/www\.ali213\.net\/news\/html\/\d+-\d+\/\d+\.html$/.test(href)
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
      platform: "游侠网",
      category: "游戏",
      icon: "/icons/ali213.svg",
      updatedAtText: "游戏 / 游戏资讯",
      sourceUrl: url,
      items,
    });
  },
};
