const { absoluteUrl, buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "stcn",
  async scrape() {
    const url = "https://www.stcn.com/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(node.text());
      const href = absoluteUrl(node.attr("href") || "", "https://www.stcn.com");

      if (
        title.length < 8 ||
        title.length > 60 ||
        !/^https:\/\/www\.stcn\.com\/article\/detail\/\d+\.html$/.test(href)
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
      platform: "证券时报",
      category: "财经",
      icon: "/icons/stcn.svg",
      updatedAtText: "财经 / 首页文章",
      sourceUrl: url,
      items,
    });
  },
};
