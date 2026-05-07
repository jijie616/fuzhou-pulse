import { createTextElement } from "./utils.js";
import { findFeaturedCard } from "./cards.js";

/* --- Weather Modal --- */
export function openWeatherModal(modal) {
  if (!modal) return;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

export function closeWeatherModal(modal) {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

/* --- Detail Modal --- */
function renderDetailItem(label, value) {
  const item = document.createElement("div");
  item.className = "detail-modal__item";
  item.appendChild(createTextElement("span", "", label));
  item.appendChild(createTextElement("p", "", value || "暂无更多详情"));
  return item;
}

function renderDetailModal(contentEl, card) {
  if (!contentEl || !card) return;
  contentEl.innerHTML = "";

  const article = document.createElement("article");
  article.className = "detail-card";

  const img = document.createElement("img");
  img.className = "detail-card__image";
  img.src = card.image || "";
  img.alt = card.alt || card.title || "";
  img.loading = "lazy";
  img.width = 800;
  img.height = 600;

  const content = document.createElement("div");
  content.className = "detail-card__content";
  content.appendChild(createTextElement("span", "card-tag", card.tag));
  const title = createTextElement("h2", "", card.title);
  title.id = "detailModalTitle";
  content.appendChild(title);
  content.appendChild(createTextElement("p", "card-kicker", card.subtitle));
  content.appendChild(createTextElement("p", "detail-card__description", card.description));

  const detail = card.detail || null;
  if (detail) {
    const grid = document.createElement("div");
    grid.className = "detail-modal__grid";
    grid.appendChild(renderDetailItem("游玩时间", detail.bestTime));
    grid.appendChild(renderDetailItem("位置", detail.location));
    grid.appendChild(renderDetailItem("推荐理由", detail.reason));
    grid.appendChild(renderDetailItem("小贴士", detail.tips));
    content.appendChild(grid);
  } else {
    content.appendChild(createTextElement("p", "detail-modal__empty", "暂无更多详情"));
  }

  article.appendChild(img);
  article.appendChild(content);
  contentEl.appendChild(article);
}

export function openDetailModal(cardId, modal, contentEl) {
  const card = findFeaturedCard(cardId);
  if (!modal || !card) return;
  renderDetailModal(contentEl, card);
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

export function closeDetailModal(modal) {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}
