const { absoluteUrl, buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

function cleanInfzmTitle(title) {
  return normalizeText(title)
    .replace(/\s+南方周末.*$/, "")
    .replace(/\s+南方人物周刊.*$/, "")
    .trim();
}

function isInfzmArticle(url) {
  return /^https:\/\/www\.infzm\.com\/contents\/\d+/.test(url);
}

module.exports = {
  name: "infzm",
  async scrape() {
    const url = "https://www.infzm.com/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = cleanInfzmTitle(node.text());
      const href = absoluteUrl(node.attr("href") || "", url);

      if (title.length < 8 || title.length > 90 || !isInfzmArticle(href)) {
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
      platform: "南方周末",
      category: "新闻",
      icon: "/icons/infzm.svg",
      updatedAtText: "新闻 / 深度",
      sourceUrl: url,
      items,
    });
  },
};
