const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "csdn",
  async scrape() {
    const url = "https://www.csdn.net/";
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

      const className = node.attr("class") || "";

      if (
        title.length < 16 ||
        !/^https:\/\/blog\.csdn\.net\//.test(href) ||
        /^mailto:/.test(href) ||
        /project-item|article-desc|user-info/.test(className) ||
        /查看详情|收藏 \d+/.test(title) ||
        /账号管理规范|版权申诉/.test(title)
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
      platform: "CSDN",
      category: "科技",
      icon: "/icons/csdn.svg",
      updatedAtText: "科技 / 开发者社区",
      sourceUrl: url,
      items,
    });
  },
};
