const { absoluteUrl, buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

function cleanTimeweeklyTitle(title) {
  return normalizeText(title).replace(/\s+来源\s+.+$/, "").trim();
}

function isTimeweeklyArticle(url) {
  return /^https:\/\/www\.time-weekly\.com\/post\/\d+$/.test(url);
}

module.exports = {
  name: "timeweekly",
  async scrape() {
    const url = "https://www.time-weekly.com/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = cleanTimeweeklyTitle(node.text());
      const href = absoluteUrl(node.attr("href") || "", url);

      if (title.length < 8 || title.length > 90 || !isTimeweeklyArticle(href)) {
        return undefined;
      }

      if (seen.has(href)) {
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
      platform: "时代周报",
      category: "新闻",
      icon: "/icons/timeweekly.svg",
      updatedAtText: "新闻 / 首页",
      sourceUrl: url,
      items,
    });
  },
};
