const {
  absoluteUrl,
  buildCard,
  fetchText,
  loadHtml,
  normalizeText,
} = require("./helpers");

module.exports = {
  name: "huaweicloud-ai",
  async scrape() {
    const url = "https://bbs.huaweicloud.com/blogs?tag=AI";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a.blogs-title[href]").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(node.attr("title") || node.text());
      const href = absoluteUrl(node.attr("href") || "", url);

      if (
        title.length < 8 ||
        !/^https:\/\/bbs\.huaweicloud\.com\/blogs\/\d+$/.test(href) ||
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
      platform: "华为云 AI",
      category: "AI",
      icon: "/icons/huaweicloud.svg",
      updatedAtText: "AI / 云端技术博客",
      sourceUrl: url,
      items,
    });
  },
};
