const {
  absoluteUrl,
  buildCard,
  fetchText,
  loadHtml,
  normalizeText,
} = require("./helpers");

module.exports = {
  name: "qieyou",
  async scrape() {
    const url = "https://www.qieyou.com/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $('a[href*="/content/"]').each((_, element) => {
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
        title.length < 8 ||
        !/^https:\/\/www\.qieyou\.com\/content\/\d+$/.test(href) ||
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
      platform: "切游网",
      category: "游戏",
      icon: "/icons/qieyou.svg",
      updatedAtText: "游戏 / 手游动态",
      sourceUrl: url,
      items,
    });
  },
};
