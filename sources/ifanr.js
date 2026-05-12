const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "ifanr",
  async scrape() {
    const url = "https://www.ifanr.com/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a.js-title-transform").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(node.text());
      const href = node.attr("href") || "";

      if (title.length < 12 || !/^https:\/\/www\.ifanr\.com\/\d+/.test(href)) {
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
      platform: "爱范儿",
      category: "科技",
      icon: "/icons/ifanr.svg",
      updatedAtText: "科技 / 首页热点",
      sourceUrl: url,
      items,
    });
  },
};
