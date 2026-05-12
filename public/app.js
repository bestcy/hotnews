const filterBar = document.querySelector("#filterBar");
const grid = document.querySelector("#grid");
const statusNode = document.querySelector("#status");
const cardTemplate = document.querySelector("#cardTemplate");
const itemTemplate = document.querySelector("#itemTemplate");

let cards = [];
let activeFilter = "游戏";
const hiddenFilters = new Set(["综合", "娱乐"]);

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
    return activeFilter === "全部" || card.category === activeFilter;
  });

  visibleCards.forEach((card) => {
    const fragment = cardTemplate.content.cloneNode(true);
    const cardNode = fragment.querySelector(".card");
    const iconNode = fragment.querySelector(".platform-icon img");
    const platformNode = fragment.querySelector(".platform-name-span");
    const listNode = fragment.querySelector(".list");
    const footerNode = fragment.querySelector(".update-footer");

    cardNode.dataset.filter = card.category;
    iconNode.src = card.icon;
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
    const response = await fetch("/api/rankings");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
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

document.querySelector("#footerYear").textContent = new Date().getFullYear();
bindEvents();
loadRankings();
