const {
  absoluteUrl,
  buildCard,
  fetchText,
  loadHtml,
  normalizeText,
} = require("./helpers");

module.exports = {
  name: "aibase",
  async scrape() {
    const url = "https://www.aibase.com/zh/news";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $('a[href*="/news/"]').each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(
        node.attr("title") ||
          node.find("h1,h2,h3,h4").first().text() ||
          node.text()
      );
      const href = absoluteUrl(node.attr("href") || "", url);

      if (
        title.length < 8 ||
        !/^https:\/\/www\.aibase\.com\/news\/\d+$/.test(href) ||
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
      platform: "AIbase",
      category: "AI",
      icon: "/icons/aibase.svg",
      updatedAtText: "AI / 最新资讯",
      sourceUrl: url,
      items,
    });
  },
};
