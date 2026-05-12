const {
  absoluteUrl,
  buildCard,
  fetchText,
  loadHtml,
  normalizeText,
} = require("./helpers");

module.exports = {
  name: "a9vg",
  async scrape() {
    const url = "https://www.a9vg.com/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("a.a9-plain-list_item-content:not(.is-factory), a.vd-flexbox.vdp-align_center").each(
      (_, element) => {
        if (items.length >= 10) {
          return false;
        }

        const node = $(element);
        const title = normalizeText(
          node.find(".a9-plain-list_label").first().text() || node.text()
        );
        const href = absoluteUrl(node.attr("href") || "", url);

        if (
          title.length < 8 ||
          !/^https:\/\/www\.a9vg\.com\/article\/\d+$/.test(href) ||
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
      }
    );

    return buildCard({
      platform: "A9VG",
      category: "游戏",
      icon: "/icons/a9vg.svg",
      updatedAtText: "游戏 / 主机资讯",
      sourceUrl: url,
      items,
    });
  },
};
