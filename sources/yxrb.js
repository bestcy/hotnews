const {
  absoluteUrl,
  buildCard,
  fetchText,
  loadHtml,
  normalizeText,
} = require("./helpers");

function isCleanTitle(title) {
  return title.length >= 8 && title.length <= 80;
}

module.exports = {
  name: "yxrb",
  async scrape() {
    const url = "https://news.yxrb.net/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(
        node.attr("title") ||
          node.find("h1,h2,h3,h4").first().text() ||
          node.text()
      );
      const href = absoluteUrl(node.attr("href") || "", url);

      if (
        !isCleanTitle(title) ||
        !/^https:\/\/news\.yxrb\.net\/\d{4}\/\d{4}\/\d+\.html$/.test(href) ||
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
      platform: "游戏日报",
      category: "游戏",
      icon: "/icons/yxrb.svg",
      updatedAtText: "游戏 / 行业报道",
      sourceUrl: url,
      items,
    });
  },
};
