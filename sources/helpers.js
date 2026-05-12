const cheerio = require("cheerio");

const REQUEST_TIMEOUT_MS = 12000;

function normalizeText(value) {
  // Titles from different sites often contain newlines or repeated spaces.
  return String(value || "").replace(/\s+/g, " ").trim();
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function absoluteUrl(url, origin) {
  const normalized = normalizeText(url);
  if (!normalized || normalized === "-") {
    return "#";
  }
  try {
    return new URL(normalized, origin).toString();
  } catch (_error) {
    return "#";
  }
}

async function fetchText(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // A browser-like UA avoids basic bot blocks on many news pages.
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/json,*/*",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(url, options = {}) {
  const text = await fetchText(url, options);
  return JSON.parse(text);
}

function loadHtml(html, options) {
  return cheerio.load(html, options);
}

function buildCard({ platform, category, icon, updatedAtText, sourceUrl, items }) {
  // All source modules normalize into this common card shape for the UI.
  return {
    platform,
    category,
    icon,
    updatedAtText,
    sourceUrl,
    items: items
      .filter((item) => normalizeText(item.title))
      .map((item, index) => ({
        rank: String(item.rank || index + 1),
        title: normalizeText(item.title),
        href: item.href || "#",
        meta: normalizeText(item.meta || ""),
      })),
  };
}

function buildStatus(source, status, detail) {
  return {
    source,
    status,
    detail,
  };
}

module.exports = {
  absoluteUrl,
  buildCard,
  buildStatus,
  decodeHtml,
  fetchJson,
  fetchText,
  loadHtml,
  normalizeText,
};
