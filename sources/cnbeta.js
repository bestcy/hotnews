const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "cnbeta",
  async scrape() {
    const url = "https://www.cnbeta.com.tw/category/tech.htm";
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
      const href = node.attr("href") || "";

      if (
        title.length < 10 ||
        !/^https:\/\/www\.cnbeta\.com\.tw\/articles\/tech\/\d+\.htm$/.test(href)
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
      platform: "CNBeta",
      category: "科技",
      icon: "/icons/cnbeta.svg",
      updatedAtText: "科技 / Tech 分类",
      sourceUrl: url,
      items,
    });
  },
};
