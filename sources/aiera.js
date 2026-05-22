const {
  absoluteUrl,
  buildCard,
  fetchText,
  loadHtml,
  normalizeText,
} = require("./helpers");

module.exports = {
  name: "aiera",
  async scrape() {
    const url = "https://aiera.com.cn/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $('a[href*="aiera.com.cn/202"]').each((_, element) => {
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
        title.startsWith("点我查看") ||
        !/^https:\/\/aiera\.com\.cn\/202\d\/\d{2}\/\d{2}\//.test(href) ||
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
      platform: "新智元",
      category: "AI",
      icon: "/icons/aiera.svg",
      updatedAtText: "AI / 前沿资讯",
      sourceUrl: url,
      items,
    });
  },
};
