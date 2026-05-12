const { absoluteUrl, buildCard, decodeHtml, fetchJson } = require("./helpers");

module.exports = {
  name: "tieba",
  async scrape() {
    const url = "https://tieba.baidu.com/hottopic/browse/topicList";
    const json = await fetchJson(url);
    const items = (((json || {}).data || {}).bang_topic || {}).topic_list || [];

    return buildCard({
      platform: "百度贴吧",
      category: "综合",
      icon: "/icons/tieba.svg",
      updatedAtText: "综合 / 话题榜",
      sourceUrl: url,
      items: items.slice(0, 10).map((entry, index) => ({
        rank: entry.idx_num || index + 1,
        title: entry.topic_name,
        href: absoluteUrl(decodeHtml(entry.topic_url), "https://tieba.baidu.com"),
        meta: entry.discuss_num ? `讨论 ${entry.discuss_num}` : "",
      })),
    });
  },
};
