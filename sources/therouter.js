const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "therouter",
  async scrape() {
    const url = "https://therouter.ai/zh/news/rss.xml";
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
        !/^https:\/\/therouter\.ai\/zh\/news\/[^/]+\/$/.test(href) ||
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
      platform: "TheRouter",
      category: "AI",
      icon: "/icons/therouter.svg",
      updatedAtText: "AI / 模型与 API",
      sourceUrl: "https://therouter.ai/zh/news/",
      items,
    });
  },
};
