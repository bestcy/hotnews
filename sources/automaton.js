const {
  absoluteUrl,
  buildCard,
  fetchText,
  loadHtml,
  normalizeText,
} = require("./helpers");

module.exports = {
  name: "automaton",
  async scrape() {
    const url = "https://automaton-china.com/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(
        node.attr("title") ||
          node.find("h1,h2,h3,h4").first().text() ||
          node.text() ||
          node.find("img").first().attr("alt")
      );
      const href = absoluteUrl(node.attr("href") || "", url);

      if (
        title.length < 8 ||
        title.startsWith("#") ||
        !/^https:\/\/automaton-china\.com\/all\/(article|platform)\//.test(href) ||
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
      platform: "AUTOMATON",
      category: "游戏",
      icon: "/icons/automaton.svg",
      updatedAtText: "游戏 / 主机与独立游戏",
      sourceUrl: url,
      items,
    });
  },
};
