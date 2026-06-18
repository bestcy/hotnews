const { absoluteUrl, buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

function isCaijingArticle(url) {
  return /^http:\/\/[a-z]+\.caijing\.com\.cn\/\d{8}\/\d+\.shtml$/.test(url);
}

module.exports = {
  name: "caijing-news",
  async scrape() {
    const url = "https://www.caijing.com.cn/";
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

      if (title.length < 8 || title.length > 80 || !isCaijingArticle(href)) {
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
      platform: "财经网",
      category: "新闻",
      icon: "/icons/caijing-news.svg",
      updatedAtText: "新闻 / 商业",
      sourceUrl: url,
      items,
    });
  },
};
