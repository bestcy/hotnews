const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "infoq",
  async scrape() {
    const url = "https://www.infoq.cn/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a.com-article-title").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(node.text());
      const href = node.attr("href") || "";

      if (
        title.length < 12 ||
        !/^https:\/\/www\.infoq\.cn\/article\//.test(href)
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
      platform: "InfoQ",
      category: "科技",
      icon: "/icons/infoq.svg",
      updatedAtText: "科技 / 首页文章",
      sourceUrl: url,
      items,
    });
  },
};
