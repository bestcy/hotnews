const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

function cleanBjnewsTitle(title) {
  return normalizeText(title).replace(/\s*\[全文\]$/, "").trim();
}

module.exports = {
  name: "bjnews",
  async scrape() {
    const url = "https://www.bjnews.com.cn/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const className = node.attr("class") || "";
      const href = node.attr("href") || "";
      const title = cleanBjnewsTitle(node.text());

      if (
        title.length < 8 ||
        className.includes("noPadd") ||
        !/^https:\/\/www\.bjnews\.com\.cn\/detail\/\d+\.html$/.test(href)
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
      platform: "新京报",
      category: "新闻",
      icon: "/icons/bjnews.svg",
      updatedAtText: "新闻 / 首页",
      sourceUrl: url,
      items,
    });
  },
};
