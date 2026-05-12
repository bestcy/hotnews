const { absoluteUrl, buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "hupu",
  async scrape() {
    const url = "https://bbs.hupu.com/all-gambia";
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

      if (title.length < 8 || !/\/\d+\.html?$/.test(href)) {
        return undefined;
      }

      const absolute = absoluteUrl(href, "https://bbs.hupu.com");
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
      platform: "虎扑",
      category: "娱乐",
      icon: "/icons/hupu.svg",
      updatedAtText: "娱乐 / 步行街",
      sourceUrl: url,
      items,
    });
  },
};
