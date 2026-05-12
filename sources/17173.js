const {
  absoluteUrl,
  buildCard,
  fetchText,
  loadHtml,
  normalizeText,
} = require("./helpers");

module.exports = {
  name: "17173",
  async scrape() {
    const url = "https://www.17173.com/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $('a.con[href*="news.17173.com/content/"], a.c-red[href*="news.17173.com/content/"]').each(
      (_, element) => {
        if (items.length >= 10) {
          return false;
        }

        const node = $(element);
        const title = normalizeText(node.text());
        const href = absoluteUrl(node.attr("href") || "", url);

        if (
          title.length < 8 ||
          !/^https?:\/\/news\.17173\.com\/content\/\d+\/\d+(_\d+)?\.shtml$/.test(href) ||
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
      }
    );

    return buildCard({
      platform: "17173",
      category: "游戏",
      icon: "/icons/17173.svg",
      updatedAtText: "游戏 / 门户热点",
      sourceUrl: url,
      items,
    });
  },
};
