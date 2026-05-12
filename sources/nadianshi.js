const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

function cleanTitle(title) {
  return normalizeText(title).replace(/^(原创|观察|投稿|报告)[丨｜\s|]+/, "");
}

module.exports = {
  name: "nadianshi",
  async scrape() {
    const url = "http://www.nadianshi.com/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $('.list a[href*="nadianshi.com/2026/"]').each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = cleanTitle(node.text());
      const href = node.attr("href") || "";

      if (
        title.length < 8 ||
        !/^http:\/\/www\.nadianshi\.com\/\d{4}\/\d{2}\/\d+$/.test(href) ||
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
      platform: "手游那点事",
      category: "游戏",
      icon: "/icons/nadianshi.svg",
      updatedAtText: "游戏 / 手游行业",
      sourceUrl: url,
      items,
    });
  },
};
