const { absoluteUrl, buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

function canonicalizeSohuUrl(url) {
  const absolute = absoluteUrl(url, "https://news.sohu.com");
  try {
    const parsed = new URL(absolute);
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch (_error) {
    return absolute;
  }
}

module.exports = {
  name: "sohu",
  async scrape() {
    const url = "https://news.sohu.com/";
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

      if (title.length < 12 || !/\/a\/\d+_/.test(href)) {
        return undefined;
      }

      const absolute = canonicalizeSohuUrl(href);
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
      platform: "搜狐新闻",
      category: "新闻",
      icon: "/icons/sohu.svg",
      updatedAtText: "新闻 / 首页热点",
      sourceUrl: url,
      items,
    });
  },
};
