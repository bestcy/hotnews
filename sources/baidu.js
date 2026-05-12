const { absoluteUrl, buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "baidu",
  async scrape() {
    const url = "https://top.baidu.com/board?tab=realtime";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const items = [];

    $(".category-wrap_iQLoo")
      .slice(0, 10)
      .each((index, element) => {
        const node = $(element);
        const href = node.find("a").first().attr("href");
        const title = node.find(".c-single-text-ellipsis").first().text();
        const hotValue = node.find(".hot-index_1Bl1a").first().text();
        items.push({
          rank: index + 1,
          title,
          href: absoluteUrl(href, "https://top.baidu.com"),
          meta: hotValue ? `热搜指数 ${normalizeText(hotValue)}` : "",
        });
      });

    return buildCard({
      platform: "百度",
      category: "综合",
      icon: "/icons/baidu.svg",
      updatedAtText: "综合 / 实时热搜",
      sourceUrl: url,
      items,
    });
  },
};
