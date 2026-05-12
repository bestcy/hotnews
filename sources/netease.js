const { absoluteUrl, buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "netease",
  async scrape() {
    const url = "https://news.163.com/rank/";
    const html = await fetchText(url);
    const $ = loadHtml(html, { decodeEntities: false });
    const items = [];

    $("table")
      .first()
      .find("tr")
      .slice(1, 11)
      .each((_, element) => {
        const row = $(element);
        const link = row.find("a").first();
        const rank = row.find("span").first().text();
        const hot = row.find("td").last().text();
        items.push({
          rank: normalizeText(rank),
          title: normalizeText(link.text()),
          href: absoluteUrl(link.attr("href"), "https://news.163.com"),
          meta: hot ? `点击 ${normalizeText(hot)}` : "",
        });
      });

    return buildCard({
      platform: "网易新闻",
      category: "新闻",
      icon: "/icons/netease.svg",
      updatedAtText: "新闻 / 排行榜",
      sourceUrl: url,
      items,
    });
  },
};
