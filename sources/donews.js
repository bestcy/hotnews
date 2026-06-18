const { absoluteUrl, buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

function isDonewsArticle(url) {
  return /^https:\/\/www\.donews\.com\/news\/detail\/\d+\/\d+\.html$/.test(url);
}

module.exports = {
  name: "donews",
  async scrape() {
    const url = "https://www.donews.com/";
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
      const href = absoluteUrl(node.attr("href") || "", url);

      if (title.length < 8 || title.length > 80 || !isDonewsArticle(href)) {
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
      platform: "DoNews",
      category: "新闻",
      icon: "/icons/donews.svg",
      updatedAtText: "新闻 / 科技商业",
      sourceUrl: url,
      items,
    });
  },
};
