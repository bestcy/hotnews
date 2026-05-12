const { absoluteUrl, buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "36kr",
  async scrape() {
    const url = "https://www.36kr.com/newsflashes/catalog/2";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a.item-title").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(node.text());
      const href = absoluteUrl(node.attr("href") || "", "https://www.36kr.com");

      if (
        title.length < 8 ||
        !/^https:\/\/www\.36kr\.com\/newsflashes\/\d+$/.test(href)
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
      platform: "36氪",
      category: "财经",
      icon: "/icons/36kr.svg",
      updatedAtText: "财经 / 股市快讯",
      sourceUrl: url,
      items,
    });
  },
};
