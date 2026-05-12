const {
  absoluteUrl,
  buildCard,
  fetchText,
  loadHtml,
  normalizeText,
} = require("./helpers");

module.exports = {
  name: "tgbus",
  async scrape() {
    const url = "https://www.tgbus.com/list/news/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $('.list-subdomain__item a[href^="/news/"]').each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(
        node.find(".title").first().text() ||
          node.find(".content").first().text() ||
          node.text()
      );
      const href = absoluteUrl(node.attr("href") || "", url);

      if (
        title.length < 8 ||
        !/^https:\/\/www\.tgbus\.com\/news\/\d+$/.test(href) ||
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
      platform: "电玩巴士",
      category: "游戏",
      icon: "/icons/tgbus.svg",
      updatedAtText: "游戏 / 首页要闻",
      sourceUrl: url,
      items,
    });
  },
};
