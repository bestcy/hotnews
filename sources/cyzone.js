const { absoluteUrl, buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

function isCyzoneArticle(url) {
  return /^https:\/\/www\.cyzone\.cn\/article\/\d+\.html$/.test(url);
}

module.exports = {
  name: "cyzone",
  async scrape() {
    const url = "https://www.cyzone.cn/";
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
      const href = absoluteUrl(node.attr("href") || "", url);

      if (title.length < 8 || title.length > 80 || !isCyzoneArticle(href)) {
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
      platform: "创业邦",
      category: "新闻",
      icon: "/icons/cyzone.svg",
      updatedAtText: "新闻 / 创投",
      sourceUrl: url,
      items,
    });
  },
};
