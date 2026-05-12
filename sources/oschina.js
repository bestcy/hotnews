const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "oschina",
  async scrape() {
    const url = "https://www.oschina.net/news";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a.header").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(node.text());
      const href = node.attr("href") || "";

      if (
        title.length < 10 ||
        !/^https:\/\/www\.oschina\.net\/news\/\d+/.test(href)
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
      platform: "OSCHINA",
      category: "科技",
      icon: "/icons/oschina.svg",
      updatedAtText: "科技 / 新闻列表",
      sourceUrl: url,
      items,
    });
  },
};
