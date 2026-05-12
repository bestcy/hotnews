const { buildCard, fetchText, loadHtml, normalizeText } = require("./helpers");

const GAME_TERMS =
  /游戏|Steam|Switch|PS5|Xbox|任天堂|索尼|GTA|Boss|开发商|工作室|RPG|DLC|发售|试玩|前瞻|评测|玩家|硬核|销量|更新|模式|角色/i;

module.exports = {
  name: "igncn",
  async scrape() {
    const url = "https://www.ign.com.cn/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("article.article.NEWS h3 a, h3.caption a.link").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(node.text()).replace(/\s*\|\s*IGN 中国$/, "");
      const href = node.attr("href") || "";

      if (
        title.length < 8 ||
        !GAME_TERMS.test(title) ||
        !/^https:\/\/www\.ign\.com\.cn\/[^/]+\/\d+\//.test(href) ||
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
      platform: "IGN中国",
      category: "游戏",
      icon: "/icons/igncn.svg",
      updatedAtText: "游戏 / 新闻评测",
      sourceUrl: url,
      items,
    });
  },
};
