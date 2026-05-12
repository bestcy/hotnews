const { absoluteUrl, buildCard, fetchText } = require("./helpers");

module.exports = {
  name: "sina",
  async scrape() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const url = `https://top.news.sina.com.cn/ws/GetTopDataList.php?top_type=day&top_cat=www_www_all_suda_suda&top_time=${y}${m}${d}&top_show_num=10&top_order=DESC&js_var=all_1_data01`;
    const script = await fetchText(url);
    const match = script.match(/=\s*({[\s\S]*});?\s*$/);

    if (!match) {
      throw new Error("Unexpected Sina payload");
    }

    const json = JSON.parse(match[1]);
    const items = (json.data || []).slice(0, 10).map((entry, index) => ({
      rank: index + 1,
      title: entry.title,
      href: absoluteUrl(entry.url, "https://news.sina.com.cn"),
      meta: [entry.media, entry.top_num ? `热度 ${entry.top_num}` : ""]
        .filter(Boolean)
        .join(" / "),
    }));

    return buildCard({
      platform: "新浪新闻",
      category: "新闻",
      icon: "/icons/sina.svg",
      updatedAtText: "新闻 / 浏览排行",
      sourceUrl: url,
      items,
    });
  },
};
