const {
  absoluteUrl,
  buildCard,
  fetchText,
  loadHtml,
  normalizeText,
} = require("./helpers");

module.exports = {
  name: "anthropic",
  async scrape() {
    const url = "https://www.anthropic.com/news";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $('a[href*="/news/"]').each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const href = absoluteUrl(node.attr("href") || "", url);
      const title = normalizeText(
        node.attr("title") ||
          node.find('[class*="title"],[class*="Title"]').first().text() ||
          node.find("h1,h2,h3,h4").first().text() ||
          node.text()
      );

      if (
        title.length < 8 ||
        !/^https:\/\/www\.anthropic\.com\/news\/[^/#?]+$/.test(href) ||
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
      platform: "Anthropic",
      category: "AI",
      icon: "/icons/anthropic.svg",
      updatedAtText: "AI / 官方动态",
      sourceUrl: url,
      items,
    });
  },
};
