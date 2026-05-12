const {
  absoluteUrl,
  buildCard,
  fetchText,
  loadHtml,
  normalizeText,
} = require("./helpers");

const GAME_KEYWORDS =
  /(Game|Steam|Switch|PS5|Xbox|Nintendo|PlayStation|Call of Duty|Forza|Gears of War|God of War|Crimson Desert|Lego Batman|Star Wars|Capcom|Devil May Cry|LEC|VCT|遊戲|游戏|玩家|實況主|主播|補丁|更新|發行|发售|預購|预购|DLC|電競|电竞|季後賽|季后赛|卡普空|任天堂|索尼|主機|主机)/i;
const OFF_TOPIC = /(電影|电影|動畫|动画|影集|迪士尼|DCU|Crunchyroll|The Ring|恐怖大師|詹姆斯·卡麥隆|Avatar)/i;

module.exports = {
  name: "gamereactor",
  async scrape() {
    const url = "https://www.gamereactor.cn/news/";
    const html = await fetchText(url);
    const $ = loadHtml(html);
    const seen = new Set();
    const items = [];

    $("article.areview").each((_, element) => {
      if (items.length >= 10) {
        return false;
      }

      const node = $(element);
      const title = normalizeText(
        node.find("h2").first().text() || node.find("img").first().attr("alt")
      );
      const link = node
        .find("a[href]")
        .filter((_, anchor) => {
          const href = $(anchor).attr("href") || "";
          return !href.includes("#") && !$(anchor).hasClass("username");
        })
        .first();
      const href = absoluteUrl(link.attr("href") || "", url);

      if (
        title.length < 8 ||
        !GAME_KEYWORDS.test(title) ||
        OFF_TOPIC.test(title) ||
        !/^https:\/\/www\.gamereactor\.cn\/[^/]+-\d+\/$/.test(href) ||
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
      platform: "Gamereactor",
      category: "游戏",
      icon: "/icons/gamereactor.svg",
      updatedAtText: "游戏 / 国际资讯",
      sourceUrl: url,
      items,
    });
  },
};
