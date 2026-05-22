const {
  absoluteUrl,
  buildCard,
  fetchText,
  loadHtml,
  normalizeText,
} = require("./helpers");

module.exports = {
  name: "cto51-ai",
  async scrape() {
    const url = "https://www.51cto.com/ai";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $('a.article-irl-ct_title[href*="/article/"]').each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(node.text() || node.attr("title"));
      const href = absoluteUrl(node.attr("href") || "", url);

      if (
        title.length < 8 ||
        !/^https:\/\/www\.51cto\.com\/article\/\d+\.html$/.test(href) ||
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
      platform: "51CTO AI",
      category: "AI",
      icon: "/icons/cto51.svg",
      updatedAtText: "AI / 技术文章",
      sourceUrl: url,
      items,
    });
  },
};
