const filterBar = document.querySelector("#filterBar");
const grid = document.querySelector("#grid");
const statusNode = document.querySelector("#status");
const cardTemplate = document.querySelector("#cardTemplate");
const itemTemplate = document.querySelector("#itemTemplate");
const analyticsWidget = document.querySelector("#analyticsWidget");
const analyticsValue = document.querySelector("#analyticsValue");

let cards = [];
let activeFilter = "游戏";

// These categories remain in the data but are not shown as top-level tabs.
const hiddenFilters = new Set(["综合", "娱乐"]);

// Hidden categories are merged into the news tab so their cards stay discoverable.
const mergedFilters = new Map([
  ["综合", "新闻"],
  ["娱乐", "新闻"],
]);

function setStatus(message, type = "") {
  statusNode.textContent = message;
  statusNode.className = type ? `status ${type}` : "status";
}

function renderFilters(filters) {
  filterBar.innerHTML = "";

  const visibleFilters = filters.filter((filter) => !hiddenFilters.has(filter));
  if (!visibleFilters.includes(activeFilter)) {
    activeFilter = visibleFilters[0] || "全部";
  }

  visibleFilters.forEach((filter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `filter-btn${filter === activeFilter ? " active" : ""}`;
    button.dataset.filter = filter;
    button.textContent = filter;
    filterBar.appendChild(button);
  });
}

function renderCards() {
  grid.innerHTML = "";

  const visibleCards = cards.filter((card) => {
    const category = mergedFilters.get(card.category) || card.category;
    return activeFilter === "全部" || category === activeFilter;
  });

  visibleCards.forEach((card) => {
    const fragment = cardTemplate.content.cloneNode(true);
    const cardNode = fragment.querySelector(".card");
    const iconNode = fragment.querySelector(".platform-icon img");
    const platformNode = fragment.querySelector(".platform-name-span");
    const listNode = fragment.querySelector(".list");
    const footerNode = fragment.querySelector(".update-footer");

    cardNode.dataset.filter = card.category;
    iconNode.src = normalizeAssetUrl(card.icon);
    iconNode.alt = `${card.platform} 图标`;
    platformNode.textContent = card.platform;
    footerNode.textContent = card.updatedAtText;

    card.items.forEach((item) => {
      const itemFragment = itemTemplate.content.cloneNode(true);
      const itemNode = itemFragment.querySelector(".list-item");
      const titleNode = itemFragment.querySelector("span");

      itemNode.dataset.rank = item.rank;
      itemNode.href = item.href || "#";
      titleNode.textContent = item.title;
      listNode.appendChild(itemFragment);
    });

    grid.appendChild(fragment);
  });

  setStatus(`已加载 ${visibleCards.length} 个榜单`);
}

function bindEvents() {
  filterBar.addEventListener("click", (event) => {
    const button = event.target.closest(".filter-btn");
    if (!button) {
      return;
    }

    activeFilter = button.dataset.filter;
    filterBar.querySelectorAll(".filter-btn").forEach((node) => {
      node.classList.toggle("active", node === button);
    });
    renderCards();
  });
}

async function loadRankings() {
  setStatus("加载中...");

  try {
    const data = await fetchRankingsData();
    document.title = data.title || document.title;
    cards = Array.isArray(data.cards) ? data.cards : [];

    const filters =
      Array.isArray(data.filters) && data.filters.length > 0 ? data.filters : ["全部"];
    if (!filters.includes("全部")) {
      filters.unshift("全部");
    }

    renderFilters(filters);
    renderCards();
  } catch (error) {
    setStatus("加载失败，请稍后重试。", "error");
    console.error(error);
  }
}

async function fetchRankingsData() {
  // Local/server deployments expose an API; GitHub Pages reads the static JSON.
  const endpoints = ["api/rankings", "rankings.json"];
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`${endpoint} HTTP ${response.status}`);
      }
      return response.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("No rankings endpoint available");
}

function normalizeAssetUrl(value) {
  const url = String(value || "");
  if (/^https?:\/\//.test(url)) {
    return url;
  }

  // GitHub Pages serves this project under /hotnews/, so root-relative asset
  // paths from API data need to become page-relative paths.
  return url.replace(/^\/+/, "");
}

async function loadAnalytics() {
  try {
    const response = await fetch("analytics.json", { cache: "no-store" });
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    enableGoatCounter(data.goatcounterCode);

    if (Number.isFinite(data.yesterdayVisits)) {
      analyticsValue.textContent = formatNumber(data.yesterdayVisits);
      analyticsWidget.title = `统计日期 ${data.yesterdayDate || "昨日"}`;
      return;
    }

    analyticsWidget.title = data.message || "统计未配置";
  } catch (error) {
    analyticsWidget.title = "统计加载失败";
    console.error(error);
  }
}

function enableGoatCounter(code) {
  if (!code || document.querySelector("script[data-goatcounter]")) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://gc.zgo.at/count.js";
  script.dataset.goatcounter = `https://${code}.goatcounter.com/count`;
  document.head.appendChild(script);
}

function formatNumber(value) {
  return new Intl.NumberFormat("zh-CN").format(value);
}

document.querySelector("#footerYear").textContent = new Date().getFullYear();
bindEvents();
loadAnalytics();
loadRankings();
