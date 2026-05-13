const { absoluteUrl, buildCard, fetchJson, normalizeText } = require("./helpers");

function questionUrl(entry) {
  const apiUrl = normalizeText(entry?.target?.url);
  const id =
    apiUrl.match(/\/questions\/(\d+)/)?.[1] ||
    normalizeText(entry?.card_id).match(/^Q_(\d+)/)?.[1];

  return id ? `https://www.zhihu.com/question/${id}` : absoluteUrl(apiUrl, "https://www.zhihu.com");
}

module.exports = {
  name: "zhihu",
  async scrape() {
    const url = "https://api.zhihu.com/topstory/hot-lists/total?limit=10&desktop=true";
    const json = await fetchJson(url, {
      headers: {
        accept: "application/json,*/*",
        referer: "https://www.zhihu.com/hot",
      },
    });

    const items = (json.data || []).slice(0, 10).map((entry, index) => ({
      rank: index + 1,
      title: entry?.target?.title,
      href: questionUrl(entry),
      meta: normalizeText(entry?.detail_text),
    }));

    return buildCard({
      platform: "知乎",
      category: "新闻",
      icon: "/icons/zhihu.svg",
      updatedAtText: "新闻 / 热榜",
      sourceUrl: "https://www.zhihu.com/hot",
      items,
    });
  },
};
