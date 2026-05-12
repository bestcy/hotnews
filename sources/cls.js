const { absoluteUrl, buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "cls",
  async scrape() {
    const url = "https://www.cls.cn/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(node.text());
      const href = node.attr("href") || "";
      const absolute = absoluteUrl(href, "https://www.cls.cn");

      if (
        title.length < 8 ||
        title.length > 80 ||
        !/^https:\/\/www\.cls\.cn\/detail\/\d+$/.test(absolute)
      ) {
        return undefined;
      }

      if (seen.has(absolute)) {
        return undefined;
      }

      seen.add(absolute);
      items.push({
        rank: items.length + 1,
        title,
        href: absolute,
      });

      return undefined;
    });

    return buildCard({
      platform: "财联社",
      category: "财经",
      icon: "/icons/cls.svg",
      updatedAtText: "财经 / 首页文章",
      sourceUrl: url,
      items,
    });
  },
};
