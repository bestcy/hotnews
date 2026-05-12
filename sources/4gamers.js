const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "4gamers",
  async scrape() {
    const url = "https://www.4gamers.com.tw/rss/latest-news";
    const xml = await fetchText(url, {
      headers: {
        accept: "application/rss+xml,application/xml,text/xml,*/*",
      },
    });
    const $ = loadHtml(xml, { xmlMode: true });
    const seen = new Set();
    const items = [];

    $("item").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(node.find("title").first().text());
      const href = normalizeText(node.find("link").first().text());

      if (
        title.length < 8 ||
        !/^https:\/\/www\.4gamers\.com\.tw\/news\/detail\/\d+\//.test(href) ||
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
      platform: "4Gamers",
      category: "游戏",
      icon: "/icons/4gamers.svg",
      updatedAtText: "游戏 / 最新消息",
      sourceUrl: "https://www.4gamers.com.tw/news",
      items,
    });
  },
};
