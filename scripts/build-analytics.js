const fs = require("fs/promises");
const path = require("path");

const OUTPUT_FILE = path.join(__dirname, "..", "public", "analytics.json");
const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000;

function getYesterdayRange() {
  const beijingNow = new Date(Date.now() + BEIJING_OFFSET_MS);
  const year = beijingNow.getUTCFullYear();
  const month = beijingNow.getUTCMonth();
  const day = beijingNow.getUTCDate();

  const start = new Date(Date.UTC(year, month, day - 1, -8, 0, 0));
  const end = new Date(Date.UTC(year, month, day, -8, 0, 0));
  const date = new Date(Date.UTC(year, month, day - 1))
    .toISOString()
    .slice(0, 10);

  return {
    start,
    end,
    date,
  };
}

function basePayload(extra = {}) {
  return {
    provider: "goatcounter",
    generatedAt: new Date().toISOString(),
    yesterdayVisits: null,
    ...extra,
  };
}

async function fetchYesterdayVisits(code, token, range) {
  const url = new URL(`https://${code}.goatcounter.com/api/v0/stats/total`);
  url.searchParams.set("start", range.start.toISOString());
  url.searchParams.set("end", range.end.toISOString());

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`GoatCounter HTTP ${response.status}`);
  }

  const data = await response.json();
  const totalFromStats = Array.isArray(data.stats)
    ? data.stats.reduce((sum, item) => sum + Number(item?.count || item?.total || 0), 0)
    : 0;

  return Number(data.total_utc ?? data.total ?? totalFromStats);
}

async function writeAnalytics(payload) {
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Generated ${OUTPUT_FILE}.`);
}

async function run() {
  const code = process.env.GOATCOUNTER_CODE;
  const token = process.env.GOATCOUNTER_TOKEN;
  const range = getYesterdayRange();

  if (!code) {
    await writeAnalytics(
      basePayload({
        configured: false,
        yesterdayDate: range.date,
        message: "Set GOATCOUNTER_CODE and GOATCOUNTER_TOKEN in GitHub Actions secrets.",
      })
    );
    return;
  }

  if (!token) {
    await writeAnalytics(
      basePayload({
        configured: true,
        goatcounterCode: code,
        yesterdayDate: range.date,
        message: "Set GOATCOUNTER_TOKEN to show yesterday visits.",
      })
    );
    return;
  }

  try {
    const yesterdayVisits = await fetchYesterdayVisits(code, token, range);
    await writeAnalytics(
      basePayload({
        configured: true,
        goatcounterCode: code,
        yesterdayDate: range.date,
        yesterdayVisits,
      })
    );
  } catch (error) {
    await writeAnalytics(
      basePayload({
        configured: true,
        goatcounterCode: code,
        yesterdayDate: range.date,
        message: error instanceof Error ? error.message : String(error),
      })
    );
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
