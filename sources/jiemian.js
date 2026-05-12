const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "jiemian",
  async scrape() {
    const url = "https://www.jiemian.com/lists/4.html";
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

      if (title.length < 12 || !/^https:\/\/www\.jiemian\.com\/article\/\d+\.html$/.test(href)) {
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
      platform: "界面新闻",
      category: "财经",
      icon: "/icons/jiemian.svg",
      updatedAtText: "财经 / 快报",
      sourceUrl: url,
      items,
    });
  },
};
