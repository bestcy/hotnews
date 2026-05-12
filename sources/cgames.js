const {
  absoluteUrl,
  buildCard,
  fetchText,
  loadHtml,
  normalizeText,
} = require("./helpers");

module.exports = {
  name: "cgames",
  async scrape() {
    const url = "https://www.cgames.com/channels/2.html";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $('a[href*="/contents/2/"]').each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(
        node.find("h1,h2,h3,h4").first().text() || node.attr("title") || node.text()
      );
      const href = absoluteUrl(node.attr("href") || "", url);

      if (
        title.length < 8 ||
        !/^https:\/\/www\.cgames\.com\/contents\/2\/\d+\.html$/.test(href) ||
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
      platform: "竞核",
      category: "游戏",
      icon: "/icons/cgames.svg",
      updatedAtText: "游戏 / 深度观察",
      sourceUrl: url,
      items,
    });
  },
};
