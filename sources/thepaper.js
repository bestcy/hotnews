const { absoluteUrl, buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "thepaper",
  async scrape() {
    const url = "https://www.thepaper.cn/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(node.text()).replace(/^推荐/, "").trim();
      const href = node.attr("href") || "";

      if (title.length < 10 || !/^\/newsDetail_forward_\d+/.test(href)) {
        return undefined;
      }

      const absolute = absoluteUrl(href, "https://www.thepaper.cn");
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
      platform: "澎湃新闻",
      category: "新闻",
      icon: "/icons/thepaper.svg",
      updatedAtText: "新闻 / 推荐",
      sourceUrl: url,
      items,
    });
  },
};
