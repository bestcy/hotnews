const {
  absoluteUrl,
  buildCard,
  fetchText,
  loadHtml,
  normalizeText,
} = require("./helpers");

module.exports = {
  name: "sgwenshen",
  async scrape() {
    const url = "https://www.sgwenshen.com/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $('a[href*="/xinwenzixun/"]').each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(
        node.attr("title") ||
          node.find("h1,h2,h3,h4").first().text() ||
          node.text()
      );
      const href = absoluteUrl(node.attr("href") || "", url);

      if (
        title.length < 8 ||
        !/^https:\/\/www\.sgwenshen\.com\/xinwenzixun\/\d+\.html$/.test(href) ||
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
      platform: "问深 AI",
      category: "AI",
      icon: "/icons/sgwenshen.svg",
      updatedAtText: "AI / 行业资讯",
      sourceUrl: url,
      items,
    });
  },
};
