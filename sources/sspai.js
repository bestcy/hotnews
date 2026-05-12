const { absoluteUrl, buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

function cleanSspaiTitle(title) {
  return normalizeText(title).replace(/周[一二三四五六日天]\d*$/, "").trim();
}

module.exports = {
  name: "sspai",
  async scrape() {
    const url = "https://sspai.com/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a.article__card__link, a.comp__MorningPaperBoardCard").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = cleanSspaiTitle(node.text());
      const href = node.attr("href") || "";

      if (title.length < 12 || !/^\/post\/\d+|^https:\/\/sspai\.com\/post\/\d+/.test(href)) {
        return undefined;
      }

      const absolute = absoluteUrl(href, "https://sspai.com");
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
      platform: "少数派",
      category: "科技",
      icon: "/icons/sspai.svg",
      updatedAtText: "科技 / 首页推荐",
      sourceUrl: url,
      items,
    });
  },
};
