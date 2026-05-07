import { createTextElement } from "./utils.js";

export const categoryFilters = [
  { label: "全部", value: "all" },
  { label: "历史古城", value: "history" },
  { label: "闽商文化", value: "culture" },
  { label: "福州美食", value: "food" },
  { label: "我的收藏", value: "favorites" }
];

const FAVORITE_KEY = "fuzhou_favorite_cards";

export function getFavoriteCards() {
  try {
    const raw = window.localStorage.getItem(FAVORITE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(function (id) { return typeof id === "string" && id.trim() !== ""; })
      .filter(function (id, index, arr) { return arr.indexOf(id) === index; });
  } catch (e) {
    return [];
  }
}

export function saveFavoriteCards(favorites) {
  try {
    const safe = Array.isArray(favorites) ? favorites : [];
    window.localStorage.setItem(FAVORITE_KEY, JSON.stringify(safe));
  } catch (e) {
    // 浏览器隐私模式或存储限制时静默降级
  }
}

export function isFavoriteCard(cardId) {
  if (!cardId) return false;
  return getFavoriteCards().indexOf(cardId) !== -1;
}

export function toggleFavoriteCard(cardId, onAfterToggle) {
  if (!cardId) return;
  const favorites = getFavoriteCards();
  const idx = favorites.indexOf(cardId);
  if (idx === -1) {
    favorites.push(cardId);
  } else {
    favorites.splice(idx, 1);
  }
  saveFavoriteCards(favorites);
  if (typeof onAfterToggle === "function") {
    onAfterToggle(cardId, idx === -1);
  }
}

export function updateFavoriteButtonState(button, isFav) {
  button.classList.toggle("is-favorite", isFav);
  button.setAttribute("aria-pressed", String(isFav));
  button.textContent = isFav ? "♥ 已收藏" : "♡ 收藏";
}

export function createFavoriteButton(cardId, onToggle) {
  if (!cardId) return null;
  const button = document.createElement("button");
  button.className = "favorite-button";
  button.type = "button";
  button.dataset.cardId = cardId;
  updateFavoriteButtonState(button, isFavoriteCard(cardId));
  button.addEventListener("click", function () {
    toggleFavoriteCard(cardId, onToggle);
    const newState = isFavoriteCard(cardId);
    updateFavoriteButtonState(button, newState);
    document.querySelectorAll(".favorite-button").forEach(function (btn) {
      if (btn.dataset.cardId === cardId) {
        updateFavoriteButtonState(btn, newState);
      }
    });
  });
  return button;
}
