export function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  element.textContent = text || "";
  return element;
}

export function showEmptyState(container, message) {
  const emptyState = document.createElement("p");
  emptyState.className = "empty-state";
  emptyState.textContent = message;
  container.appendChild(emptyState);
}

export function formatFeedbackTime(value) {
  if (!value) {
    return "刚刚";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "刚刚";
  }
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function normalizeSearchKeyword(value) {
  return String(value || "").trim().toLowerCase();
}

export function matchesSearchKeyword(card, keyword, categoryLabelMap) {
  if (!keyword) {
    return true;
  }
  const searchableFields = [
    card.title,
    card.subtitle,
    card.tag,
    card.description,
    card.category,
    categoryLabelMap[card.category] || card.category
  ];
  return searchableFields.some(function (field) {
    return String(field || "").toLowerCase().indexOf(keyword) !== -1;
  });
}

export function getCategoryLabel(category, categoryFilters) {
  const matchedFilter = categoryFilters.find(function (filter) {
    return filter.value === category;
  });
  return matchedFilter ? matchedFilter.label : category;
}
