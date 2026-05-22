const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

function createArxivSource({ name, platform, sourceUrl, updatedAtText }) {
  return {
    name,
    async scrape() {
      const xml = await fetchText(sourceUrl, {
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
          !/^https:\/\/arxiv\.org\/abs\/\d+\.\d+/.test(href) ||
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
        platform,
        category: "AI",
        icon: "/icons/arxiv.svg",
        updatedAtText,
        sourceUrl,
        items,
      });
    },
  };
}

module.exports = createArxivSource({
  name: "arxiv-ai",
  platform: "arXiv AI",
  sourceUrl: "https://rss.arxiv.org/rss/cs.AI",
  updatedAtText: "AI / 论文 cs.AI",
});
