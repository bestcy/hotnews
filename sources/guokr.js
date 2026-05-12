const { absoluteUrl, buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

function cleanGuokrTitle(title) {
  return normalizeText(title).replace(/^果壳/, "").replace(/果壳网官方帐号$/, "").trim();
}

module.exports = {
  name: "guokr",
  async scrape() {
    const url = "https://www.guokr.com/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const rawTitle = node.text();
      const title = cleanGuokrTitle(rawTitle);
      const href = node.attr("href") || "";

      if (title.length < 12 || !/^\/article\/\d+/.test(href)) {
        return undefined;
      }

      const absolute = absoluteUrl(href, "https://www.guokr.com");
      if (seen.has(absolute)) {
        return undefined;
      }

      seen.add(absolute);
      items.push({
        rank: items.length + 1,
        title,
        href: absolute,
      });

      return undefined;
    });

    return buildCard({
      platform: "果壳",
      category: "科技",
      icon: "/icons/guokr.svg",
      updatedAtText: "科技 / 首页文章",
      sourceUrl: url,
      items,
    });
  },
};
