const {
  absoluteUrl,
  buildCard,
  fetchText,
  loadHtml,
  normalizeText,
} = require("./helpers");

function cleanTitle(title) {
  return normalizeText(title).replace(/^(游戏资讯|数据报告|融资财报|行业活动)\s*/, "");
}

module.exports = {
  name: "youxituoluo",
  async scrape() {
    const url = "https://www.youxituoluo.com/news";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $('a.title[href$=".html"]').each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = cleanTitle(node.text());
      const href = absoluteUrl(node.attr("href") || "", url);

      if (
        title.length < 8 ||
        !/^https:\/\/www\.youxituoluo\.com\/\d+\.html$/.test(href) ||
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
      platform: "游戏陀螺",
      category: "游戏",
      icon: "/icons/youxituoluo.svg",
      updatedAtText: "游戏 / 资讯聚合",
      sourceUrl: url,
      items,
    });
  },
};
