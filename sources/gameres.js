const {
  absoluteUrl,
  buildCard,
  fetchText,
  loadHtml,
  normalizeText,
} = require("./helpers");

module.exports = {
  name: "gameres",
  async scrape() {
    const url = "https://www.gameres.com/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $('a.feed-item-title-a[href$=".html"], h3.caption a[href$=".html"], .carousel-title a[href$=".html"]').each(
      (_, element) => {
        if (items.length >= 10) {
          return false;
        }

        const node = $(element);
        const title = normalizeText(node.text()).replace(/｜GameRes$/, "");
        const href = absoluteUrl(node.attr("href") || "", url);

        if (
          title.length < 8 ||
          !/^https:\/\/www\.gameres\.com\/\d+\.html$/.test(href) ||
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
      platform: "GameRes",
      category: "游戏",
      icon: "/icons/gameres.svg",
      updatedAtText: "游戏 / 研发资讯",
      sourceUrl: url,
      items,
    });
  },
};
