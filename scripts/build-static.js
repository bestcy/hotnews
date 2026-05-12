const fs = require("fs/promises");
const path = require("path");
const sources = require("../sources");
const { buildStatus } = require("../sources/helpers");

const OUTPUT_FILE = path.join(__dirname, "..", "public", "rankings.json");

async function collectRankings() {
  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const card = await source.scrape();
      return {
        source: source.name,
        card,
      };
    })
  );

  const cards = [];
  const sourceStatus = [];

  results.forEach((result, index) => {
    const source = sources[index];
    if (result.status === "fulfilled") {
      cards.push(result.value.card);
      sourceStatus.push(buildStatus(source.name, "ok", result.value.card.platform));
      return;
    }

    sourceStatus.push(
      buildStatus(
        source.name,
        "error",
        result.reason instanceof Error ? result.reason.message : String(result.reason)
      )
    );
  });

  if (cards.length === 0) {
    throw new Error("All sources failed");
  }

  const fetchedAtIso = new Date().toISOString();
  const fetchedAtLabel = new Date(fetchedAtIso).toLocaleString("zh-CN", {
    hour12: false,
    timeZone: "Asia/Shanghai",
  });

  return {
    title: "HotNews",
    filters: ["全部", ...new Set(cards.map((card) => card.category))],
    cards,
    sourceStatus,
    fetchedAt: fetchedAtIso,
    fetchedAtLabel,
    mode: "static-pages",
  };
}

async function run() {
  const data = await collectRankings();
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(data, null, 2), "utf8");
  console.log(`Generated ${OUTPUT_FILE} with ${data.cards.length} cards.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
