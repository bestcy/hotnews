const {
  absoluteUrl,
  buildCard,
  fetchText,
  loadHtml,
  normalizeText,
} = require("./helpers");

function cleanGcoresTitle(title) {
  return normalizeText(title)
    .replace(/\d+\s*(分钟|小时|天)前.*$/, "")
    .trim();
}

module.exports = {
  name: "gcores",
  async scrape() {
    const url = "https://www.gcores.com/news";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a.news").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = cleanGcoresTitle(node.text());
      const href = absoluteUrl(
        node.attr("href") || "",
        "https://www.gcores.com/news"
      );

      if (
        title.length < 10 ||
        /【抽奖】/.test(title) ||
        !/^https:\/\/www\.gcores\.com\/articles\/\d+$/.test(href)
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
      platform: "机核",
      category: "游戏",
      icon: "/icons/gcores.svg",
      updatedAtText: "游戏 / 新闻列表",
      sourceUrl: url,
      items,
    });
  },
};
