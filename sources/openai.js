const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "openai",
  async scrape() {
    const url = "https://openai.com/news/rss.xml";
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
        !/^https:\/\/openai\.com\/index\/[^/]+\/?$/.test(href) ||
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
      platform: "OpenAI",
      category: "AI",
      icon: "/icons/openai.svg",
      updatedAtText: "AI / 官方动态",
      sourceUrl: "https://openai.com/news/",
      items,
    });
  },
};
