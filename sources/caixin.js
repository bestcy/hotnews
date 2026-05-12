const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

function isAllowedCaixinUrl(url) {
  return /^https:\/\/(?:www|economy|finance|china|international)\.caixin\.com\/\d{4}-\d{2}-\d{2}\/\d+\.html$/.test(
    url
  );
}

module.exports = {
  name: "caixin",
  async scrape() {
    const url = "https://www.caixin.com/";
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

      if (title.length < 8 || title.length > 80 || !isAllowedCaixinUrl(href)) {
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
      platform: "财新",
      category: "财经",
      icon: "/icons/caixin.svg",
      updatedAtText: "财经 / 首页文章",
      sourceUrl: url,
      items,
    });
  },
};
