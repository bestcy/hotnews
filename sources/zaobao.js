const { absoluteUrl, buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "zaobao",
  async scrape() {
    const url = "https://www.zaobao.com.sg/news/china";
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

      if (title.length < 8 || !/^\/news\/china\/story[\d-]+$/.test(href)) {
        return undefined;
      }

      const absolute = absoluteUrl(href, "https://www.zaobao.com.sg");
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
      platform: "联合早报",
      category: "新闻",
      icon: "/icons/zaobao.svg",
      updatedAtText: "新闻 / 中国",
      sourceUrl: url,
      items,
    });
  },
};
