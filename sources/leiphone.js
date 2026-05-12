const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "leiphone",
  async scrape() {
    const url = "https://www.leiphone.com/category/ai";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a.headTit, .txt a, a").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(node.text());
      const href = node.attr("href") || "";

      if (
        title.length < 12 ||
        !/^https:\/\/www\.leiphone\.com\/category\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9]+\.html$/.test(href)
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
      platform: "雷峰网",
      category: "科技",
      icon: "/icons/leiphone.svg",
      updatedAtText: "科技 / AI 分类",
      sourceUrl: url,
      items,
    });
  },
};
