const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const sources = require("./sources");
const { buildStatus } = require("./sources/helpers");

const app = express();
const PORT = process.env.PORT || 3000;
const CACHE_TTL_MS = 60 * 1000;
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const DATA_DIR = path.join(__dirname, "data");
const CACHE_FILE = path.join(DATA_DIR, "rankings-cache.json");

let cache = {
  data: null,
  fetchedAt: 0,
};

// Prevent overlapping refreshes when several users hit the API together.
let refreshInFlight = null;

app.use(express.static(path.join(__dirname, "public")));

async function collectRankings() {
  // Keep partial results when some upstream sites timeout or block requests.
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
    } else {
      sourceStatus.push(
        buildStatus(
          source.name,
          "error",
          result.reason instanceof Error ? result.reason.message : String(result.reason)
        )
      );
    }
  });

  if (cards.length === 0) {
    throw new Error("All sources failed");
  }

  const filters = ["全部", ...new Set(cards.map((card) => card.category))];
  const fetchedAtIso = new Date().toISOString();
  const fetchedAtLabel = new Date(fetchedAtIso).toLocaleString("zh-CN", {
    hour12: false,
    timeZone: "Asia/Shanghai",
  });

  return {
    title: "HotNews",
    filters,
    cards,
    sourceStatus,
    fetchedAt: fetchedAtIso,
    fetchedAtLabel,
    mode: "multi-source",
  };
}

async function writeCacheToDisk(data) {
  await fs.mkdir(DATA_DIR, { recursive: true });

  // Write through a temp file so a crash cannot leave a half-written JSON file.
  const tempFile = `${CACHE_FILE}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tempFile, CACHE_FILE);
}

async function restoreCacheFromDisk() {
  try {
    const content = await fs.readFile(CACHE_FILE, "utf8");
    const data = JSON.parse(content);
    if (!data || !Array.isArray(data.cards) || data.cards.length === 0) {
      return;
    }

    const fetchedAt = data.fetchedAt ? Date.parse(data.fetchedAt) : Date.now();
    cache = {
      data,
      fetchedAt: Number.isFinite(fetchedAt) ? fetchedAt : Date.now(),
    };
    console.log(`Restored rankings cache from disk: ${CACHE_FILE}`);
  } catch (error) {
    if (error && error.code !== "ENOENT") {
      console.error(`Failed to restore cache: ${error.message}`);
    }
  }
}

async function refreshRankings(force = false) {
  const now = Date.now();
  if (!force && cache.data && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }

  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    try {
      const data = await collectRankings();
      cache = {
        data,
        fetchedAt: Date.now(),
      };
      await writeCacheToDisk(data);
      return data;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function fetchRankings() {
  const now = Date.now();
  if (cache.data && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }

  if (cache.data) {
    // Serve stale data immediately and refresh in the background for low latency.
    refreshRankings().catch((error) => {
      console.error(`Background refresh failed: ${error.message}`);
    });
    return cache.data;
  }

  return refreshRankings(true);
}

app.get("/api/rankings", async (_req, res) => {
  try {
    const data = await fetchRankings();
    res.json(data);
  } catch (error) {
    res.status(502).json({
      message: "Failed to load rankings.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

async function bootstrap() {
  await restoreCacheFromDisk();

  // Warm the cache after startup without blocking the HTTP server.
  refreshRankings(true).catch((error) => {
    console.error(`Initial refresh failed: ${error.message}`);
  });

  setInterval(() => {
    refreshRankings(true).catch((error) => {
      console.error(`Scheduled refresh failed: ${error.message}`);
    });
  }, REFRESH_INTERVAL_MS);

  app.listen(PORT, () => {
    console.log(`Hot news clone running at http://localhost:${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
