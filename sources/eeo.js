const { absoluteUrl, buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

function cleanEeoTitle(title) {
  return normalizeText(title).replace(/\s+20\d{2}.*$/, "").trim();
}

function isEeoArticle(url) {
  return /^https?:\/\/www\.eeo\.com\.cn\/\d{4}\/\d{4}\/\d+\.shtml$/.test(url);
}

module.exports = {
  name: "eeo",
  async scrape() {
    const url = "https://www.eeo.com.cn/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = cleanEeoTitle(node.text());
      const href = absoluteUrl(node.attr("href") || "", url);

      if (title.length < 8 || title.length > 90 || !isEeoArticle(href)) {
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
      platform: "经济观察网",
      category: "新闻",
      icon: "/icons/eeo.svg",
      updatedAtText: "新闻 / 商业",
      sourceUrl: url,
      items,
    });
  },
};
