const {
  absoluteUrl,
  buildCard,
  fetchText,
  loadHtml,
  normalizeText,
} = require("./helpers");

function getTitle(node) {
  return (
    normalizeText(node.find("h2").first().text()) ||
    normalizeText(node.find("img").first().attr("alt")) ||
    normalizeText(node.text()).replace(/\s*\d{2}\.\d{2}$/, "")
  );
}

module.exports = {
  name: "chuapp",
  async scrape() {
    const url = "https://www.chuapp.com/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $('a[href^="/article/"]').each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const href = absoluteUrl(node.attr("href") || "", url);
      const title = getTitle(node);

      if (
        title.length < 8 ||
        !/^https:\/\/www\.chuapp\.com\/article\/\d+\.html$/.test(href) ||
        seen.has(href)
      ) {
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
      platform: "触乐",
      category: "游戏",
      icon: "/icons/chuapp.svg",
      updatedAtText: "游戏 / 首页文章",
      sourceUrl: url,
      items,
    });
  },
};
