const { absoluteUrl, buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

function cleanThecoverTitle(title) {
  return normalizeText(title)
    .replace(/\s+[^\s]{2,16}\s+(刚刚|昨天|\d+分钟前|\d+小时前|\d+天前)\s+[\d.]+万?$/, "")
    .trim();
}

module.exports = {
  name: "thecover",
  async scrape() {
    const url = "https://www.thecover.cn/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = cleanThecoverTitle(node.text());
      const href = absoluteUrl(node.attr("href") || "", "https://www.thecover.cn");

      if (
        title.length < 10 ||
        !/^https:\/\/www\.thecover\.cn\/news\//.test(href) ||
        /邀你晒美照赢鲜花|网站自律管理承诺书/.test(title)
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
      platform: "封面新闻",
      category: "新闻",
      icon: "/icons/thecover.svg",
      updatedAtText: "新闻 / 首页",
      sourceUrl: url,
      items,
    });
  },
};
