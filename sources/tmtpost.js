const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

module.exports = {
  name: "tmtpost",
  async scrape() {
    const url = "https://www.tmtpost.com/";
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
        title.length < 8 ||
        title.length > 90 ||
        className.includes("_des") ||
        !/^https:\/\/www\.tmtpost\.com\/\d+\.html$/.test(href)
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
      platform: "钛媒体",
      category: "科技",
      icon: "/icons/tmtpost.svg",
      updatedAtText: "科技 / 首页文章",
      sourceUrl: url,
      items,
    });
  },
};
