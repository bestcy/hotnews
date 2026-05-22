const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "qbitai",
  async scrape() {
    const url = "https://www.qbitai.com/feed";
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
        !/^https:\/\/www\.qbitai\.com\/\d{4}\/\d{2}\/\d+\.html$/.test(href) ||
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
      platform: "量子位",
      category: "AI",
      icon: "/icons/qbitai.svg",
      updatedAtText: "AI / 人工智能资讯",
      sourceUrl: "https://www.qbitai.com/",
      items,
    });
  },
};
