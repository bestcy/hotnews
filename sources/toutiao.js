const { absoluteUrl, buildCard, fetchJson } = require("./helpers");

module.exports = {
  name: "toutiao",
  async scrape() {
    const url = "https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc";
    const json = await fetchJson(url);
    const items = (json.data || []).slice(0, 10).map((entry, index) => ({
      rank: index + 1,
      title: entry.Title || entry.QueryWord,
      href: absoluteUrl(entry.Url, "https://www.toutiao.com"),
      meta: entry.HotValue ? `热度 ${entry.HotValue}` : "",
    }));

    return buildCard({
      platform: "今日头条",
      category: "新闻",
      icon: "/icons/toutiao.svg",
      updatedAtText: `新闻 / 更新于 ${new Date().toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Shanghai",
      })}`,
      sourceUrl: url,
      items,
    });
  },
};
