const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "deepmind",
  async scrape() {
    const url = "https://deepmind.google/blog/rss.xml";
    const xml = await fetchText(url, {
      headers: {
        accept: "application/rss+xml,application/xml,text/xml,*/*",
      },
    });
    const $ = loadHtml(xml, { xmlMode: true });
    const seen = new Set();
    const items = [];

    $("item").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(node.find("title").first().text());
      const href = normalizeText(node.find("link").first().text());

      if (
        title.length < 8 ||
        !/^https:\/\/deepmind\.google\/blog\/[^/]+\/$/.test(href) ||
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
      platform: "DeepMind",
      category: "AI",
      icon: "/icons/deepmind.svg",
      updatedAtText: "AI / 研究博客",
      sourceUrl: "https://deepmind.google/discover/blog/",
      items,
    });
  },
};
