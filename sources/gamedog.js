const {
  absoluteUrl,
  buildCard,
  fetchText,
  loadHtml,
  normalizeText,
} = require("./helpers");

module.exports = {
  name: "gamedog",
  async scrape() {
    const url = "https://www.gamedog.cn/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $('a[href*="/news/"]').each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(
        node.attr("title") ||
          node.find("h1,h2,h3,h4").first().text() ||
          node.text() ||
          node.find("img").first().attr("alt")
      );
      const href = absoluteUrl(node.attr("href") || "", url);

      if (
        title.length < 8 ||
        !/^https:\/\/www\.gamedog\.cn\/news\/\d+\.html$/.test(href) ||
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
      platform: "游戏狗",
      category: "游戏",
      icon: "/icons/gamedog.svg",
      updatedAtText: "游戏 / 手游资讯",
      sourceUrl: url,
      items,
    });
  },
};
