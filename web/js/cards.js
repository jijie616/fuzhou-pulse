import { createTextElement, showEmptyState, normalizeSearchKeyword, matchesSearchKeyword, getCategoryLabel } from "./utils.js";
import { categoryFilters, getFavoriteCards, isFavoriteCard, createFavoriteButton } from "./favorites.js";
import { featuredCards as localCards, identityCards as localIdentity, routePlans as localRoutes } from "./data.js";

let activeFeaturedCards = [...localCards];
let activeRoutePlans = [...localRoutes];
let currentFilter = "all";
let currentSearchKeyword = "";

export function setActiveCards(cards) { activeFeaturedCards = cards; }
export function setActiveRoutes(routes) { activeRoutePlans = routes; }
export function getActiveCards() { return activeFeaturedCards; }
export function getActiveRoutes() { return activeRoutePlans; }
export function getCurrentFilter() { return currentFilter; }

export function getCategoryLabelMap() {
  const map = {};
  categoryFilters.forEach(function (f) { map[f.value] = f.label; });
  return map;
}

export function findFeaturedCard(cardId) {
  if (!cardId) return null;
  return activeFeaturedCards.find(function (c) { return c.id === cardId; }) || null;
}

export function getFilteredFeaturedCards() {
  const cards = activeFeaturedCards;
  let filtered = cards;

  if (currentFilter === "favorites") {
    const favIds = getFavoriteCards();
    filtered = cards.filter(function (c) { return c.id && favIds.indexOf(c.id) !== -1; });
  } else if (currentFilter !== "all") {
    filtered = cards.filter(function (c) { return c.category === currentFilter; });
  }

  const labelMap = getCategoryLabelMap();
  return filtered.filter(function (card) {
    return matchesSearchKeyword(card, currentSearchKeyword, labelMap);
  });
}

function getFeaturedEmptyMessage() {
  if (currentSearchKeyword) return "没有找到相关内容，换个关键词试试吧。";
  if (currentFilter === "favorites") return "你还没有收藏任何福州推荐，先去点亮喜欢的地方吧。";
  return "暂无相关内容";
}

function createDetailButton(cardId, openFn) {
  if (!cardId) return null;
  const button = document.createElement("button");
  button.className = "detail-button";
  button.type = "button";
  button.dataset.cardId = cardId;
  button.textContent = "查看详情";
  button.addEventListener("click", function () {
    if (typeof openFn === "function") openFn(cardId);
  });
  return button;
}

function renderFeaturedCards(cardsToRender, emptyMessage, openDetailFn) {
  const container = document.getElementById("featuredCardsContainer");
  if (!container) return;
  container.innerHTML = "";

  const cards = Array.isArray(cardsToRender) ? cardsToRender : activeFeaturedCards;
  if (cards.length === 0) {
    showEmptyState(container, emptyMessage || "暂无推荐内容");
    return;
  }

  cards.forEach(function (card) {
    const article = document.createElement("article");
    article.className = "guide-card";

    const media = document.createElement("div");
    media.className = "card-media";
    const img = document.createElement("img");
    img.src = card.image || "";
    img.alt = card.alt || card.title || "";
    media.appendChild(img);

    const copy = document.createElement("div");
    copy.className = "card-copy";
    copy.appendChild(createTextElement("span", "card-tag", card.tag));
    copy.appendChild(createTextElement("h2", "", card.title));
    copy.appendChild(createTextElement("p", "card-kicker", card.subtitle));
    copy.appendChild(createTextElement("p", "", card.description));

    const actions = document.createElement("div");
    actions.className = "card-actions";
    const detailBtn = createDetailButton(card.id, openDetailFn);
    const favBtn = createFavoriteButton(card.id, function () {
      if (currentFilter === "favorites") renderFilteredFeaturedCards(openDetailFn);
    });
    if (detailBtn) actions.appendChild(detailBtn);
    if (favBtn) actions.appendChild(favBtn);
    if (actions.children.length > 0) copy.appendChild(actions);

    article.appendChild(media);
    article.appendChild(copy);
    container.appendChild(article);
  });
}

function updateFilterActiveState(category) {
  const filterBar = document.getElementById("featuredFilterBar");
  if (!filterBar) return;
  filterBar.querySelectorAll(".filter-button").forEach(function (btn) {
    const isActive = btn.dataset.category === category;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });
}

export function renderFilteredFeaturedCards(openDetailFn) {
  renderFeaturedCards(getFilteredFeaturedCards(), getFeaturedEmptyMessage(), openDetailFn);
  updateFilterActiveState(currentFilter);
}

export function filterFeaturedCards(category, openDetailFn) {
  currentFilter = category || "all";
  renderFilteredFeaturedCards(openDetailFn);
}

export function handleFeaturedSearch(value, openDetailFn) {
  currentSearchKeyword = normalizeSearchKeyword(value);
  renderFilteredFeaturedCards(openDetailFn);
}

export function renderFilterButtons(filterFn) {
  const filterBar = document.getElementById("featuredFilterBar");
  if (!filterBar) return;
  filterBar.innerHTML = "";
  categoryFilters.forEach(function (filter) {
    const btn = document.createElement("button");
    btn.className = "filter-button";
    btn.type = "button";
    btn.dataset.category = filter.value;
    btn.setAttribute("aria-pressed", "false");
    btn.textContent = filter.label;
    btn.addEventListener("click", function () {
      filterFeaturedCards(filter.value, filterFn);
    });
    filterBar.appendChild(btn);
  });
}

/* --- Route Plans --- */

function renderRouteStops(stops) {
  const wrap = document.createElement("div");
  wrap.className = "route-stops";
  if (!Array.isArray(stops) || stops.length === 0) {
    wrap.appendChild(createTextElement("span", "route-stop", "暂无路线站点"));
    return wrap;
  }
  stops.forEach(function (stop, i) {
    wrap.appendChild(createTextElement("span", "route-stop", stop));
    if (i < stops.length - 1) {
      wrap.appendChild(createTextElement("span", "route-arrow", "→"));
    }
  });
  return wrap;
}

export function renderRoutePlans() {
  const container = document.getElementById("routePlansContainer");
  if (!container) return;
  container.innerHTML = "";
  const plans = activeRoutePlans;
  if (plans.length === 0) { showEmptyState(container, "暂无路线推荐"); return; }

  plans.forEach(function (plan) {
    const article = document.createElement("article");
    article.className = "route-card";

    const meta = document.createElement("div");
    meta.className = "route-card__meta";
    meta.appendChild(createTextElement("span", "route-theme", plan.theme));
    meta.appendChild(createTextElement("span", "route-duration", plan.duration));
    article.appendChild(meta);
    article.appendChild(createTextElement("h3", "", plan.title));
    article.appendChild(createTextElement("p", "route-subtitle", plan.subtitle));
    article.appendChild(renderRouteStops(plan.stops));
    article.appendChild(createTextElement("p", "route-description", plan.description));

    const tips = document.createElement("p");
    tips.className = "route-tips";
    tips.appendChild(createTextElement("strong", "", "小提示："));
    tips.appendChild(document.createTextNode(plan.tips || "暂无路线提示"));
    article.appendChild(tips);
    container.appendChild(article);
  });
}

/* --- Identity Cards --- */

function getIdentityImageClass(cardId) {
  const map = {
    "alley-spirit": "alley-image-wrap",
    "flavor-grace": "flavor-image-wrap",
    "banyan-spirit": "banyan-image-wrap"
  };
  return map[cardId] || "";
}

export function renderIdentityCards() {
  const container = document.getElementById("identityCardsContainer");
  if (!container) return;
  container.innerHTML = "";
  const cards = localIdentity;
  if (cards.length === 0) { showEmptyState(container, "暂无推荐内容"); return; }

  cards.forEach(function (card) {
    const article = document.createElement("article");
    article.className = "city-card spirit-card";

    const imageWrap = document.createElement("div");
    imageWrap.className = "identity-image-wrap " + getIdentityImageClass(card.id);
    const img = document.createElement("img");
    img.src = card.image || "";
    img.alt = card.alt || card.title || "";
    imageWrap.appendChild(img);

    const copy = document.createElement("div");
    copy.className = "city-card-copy";
    copy.appendChild(createTextElement("span", "spirit-name", card.englishTitle));
    copy.appendChild(createTextElement("h3", "", card.title));
    copy.appendChild(createTextElement("p", "", card.description));

    article.appendChild(imageWrap);
    article.appendChild(copy);
    container.appendChild(article);
  });
}
