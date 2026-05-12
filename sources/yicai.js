const { absoluteUrl, buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

function cleanYicaiTitle(title) {
  const normalized = normalizeText(title)
    .replace(/\s+\d+\s*(刚刚|昨天|\d+分钟前|\d+小时前|\d{2}-\d{2}\s+\d{2}:\d{2})$/, "")
    .trim();

  return normalized.replace(/^(.{8,80}?)\1$/, "$1").trim();
}

module.exports = {
  name: "yicai",
  async scrape() {
    const url = "https://www.yicai.com/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $(".m-banner1 a.f-db, .m-content.m-scrollcontent a.f-db").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const href = absoluteUrl(node.attr("href") || "", "https://www.yicai.com");
      const rawTitle =
        node.find("h2").first().text() ||
        node.attr("title") ||
        node.find("img").attr("alt") ||
        node.text();
      const title = cleanYicaiTitle(rawTitle);

      if (
        title.length < 8 ||
        title.length > 55 ||
        !/^https:\/\/www\.yicai\.com\/news\/\d+\.html$/.test(href) ||
        /公告|举报|版权声明|投诉举报专区|晚间公告/.test(title)
      ) {
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
      platform: "第一财经",
      category: "财经",
      icon: "/icons/yicai.svg",
      updatedAtText: "财经 / 首页文章",
      sourceUrl: url,
      items,
    });
  },
};
