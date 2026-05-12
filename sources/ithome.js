const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "ithome",
  async scrape() {
    const url = "https://www.ithome.com/";
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

      if (title.length < 12 || !/^https:\/\/www\.ithome\.com\/0\//.test(href)) {
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
      platform: "IT之家",
      category: "科技",
      icon: "/icons/ithome.svg",
      updatedAtText: "科技 / 首页热点",
      sourceUrl: url,
      items,
    });
  },
};
