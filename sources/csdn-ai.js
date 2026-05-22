const {
  absoluteUrl,
  buildCard,
  fetchText,
  loadHtml,
  normalizeText,
} = require("./helpers");

module.exports = {
  name: "csdn-ai",
  async scrape() {
    const url = "https://blog.csdn.net/nav/ai";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $('a.article-title[href*="/article/details/"]').each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(node.text() || node.attr("title"));
      const href = absoluteUrl(node.attr("href") || "", url);

      if (
        title.length < 8 ||
        !/^https:\/\/blog\.csdn\.net\/[^/]+\/article\/details\/\d+$/.test(href) ||
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
      platform: "CSDN AI",
      category: "AI",
      icon: "/icons/csdn.svg",
      updatedAtText: "AI / 开发实践",
      sourceUrl: url,
      items,
    });
  },
};
