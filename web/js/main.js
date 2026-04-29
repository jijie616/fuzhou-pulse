const weatherButton = document.getElementById("weatherButton");
const weatherModal = document.getElementById("weatherModal");
const closeModalButton = document.getElementById("closeModalButton");
const visitorCountElement = document.getElementById("visitor-count");
const detailModal = document.getElementById("detailModal");
const detailModalOverlay = document.getElementById("detailModalOverlay");
const detailModalClose = document.getElementById("detailModalClose");
const detailModalContent = document.getElementById("detailModalContent");
const featuredSearchInput = document.getElementById("featuredSearchInput");
const feedbackForm = document.getElementById("feedbackForm");
const feedbackNicknameInput = document.getElementById("feedbackNickname");
const feedbackContentInput = document.getElementById("feedbackContent");
const feedbackMessage = document.getElementById("feedbackMessage");
const feedbackList = document.getElementById("feedbackList");
const FEEDBACK_API_URL = "http://localhost:3000/api/feedbacks";
const aiTripForm = document.getElementById("aiTripForm");
const aiTripDaysSelect = document.getElementById("aiTripDays");
const aiTripInterestSelect = document.getElementById("aiTripInterest");
const aiTripPaceSelect = document.getElementById("aiTripPace");
const aiTripUserPreferenceInput = document.getElementById("aiTripUserPreference");
const aiTripMessage = document.getElementById("aiTripMessage");
const aiTripResult = document.getElementById("aiTripResult");
const AI_TRIP_API_URL = "http://localhost:3000/api/ai/trip-plan";
const categoryFilters = [
    { label: "全部", value: "all" },
    { label: "历史古城", value: "history" },
    { label: "闽商文化", value: "culture" },
    { label: "福州美食", value: "food" },
    { label: "我的收藏", value: "favorites" }
];
const favoriteStorageKey = "fuzhou_favorite_cards";
let currentFilter = "all";
let currentSearchKeyword = "";
let activeFeaturedCards = Array.isArray(window.featuredCards) ? window.featuredCards : [];
let activeRoutePlans = Array.isArray(window.routePlans) ? window.routePlans : [];

function openWeatherModal() {
    weatherModal.classList.add("is-open");
    weatherModal.setAttribute("aria-hidden", "false");
}

function closeWeatherModal() {
    weatherModal.classList.remove("is-open");
    weatherModal.setAttribute("aria-hidden", "true");
}

function animateVisitorCount(targetValue) {
    const targetNumber = Number.parseInt(targetValue, 10);
    if (!Number.isFinite(targetNumber)) {
        visitorCountElement.textContent = "--";
        return;
    }

    const duration = 1100;
    const startTime = performance.now();
    const startValue = Math.max(0, targetNumber - Math.min(targetNumber, 36));

    visitorCountElement.classList.remove("is-rolling");
    void visitorCountElement.offsetWidth;
    visitorCountElement.classList.add("is-rolling");

    function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(startValue + (targetNumber - startValue) * eased);

        visitorCountElement.textContent = current.toLocaleString("zh-CN");

        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            visitorCountElement.textContent = targetNumber.toLocaleString("zh-CN");
            visitorCountElement.classList.remove("is-rolling");
        }
    }

    requestAnimationFrame(tick);
}

function createTextElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) {
        element.className = className;
    }
    element.textContent = text || "";
    return element;
}

function showEmptyState(container, message) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = message;
    container.appendChild(emptyState);
}

function getFeaturedCards() {
    return Array.isArray(activeFeaturedCards) ? activeFeaturedCards : [];
}

function getRoutePlans() {
    return Array.isArray(activeRoutePlans) ? activeRoutePlans : [];
}

async function loadFeaturedCardsFromBackend() {
    const fallbackCards = Array.isArray(window.featuredCards) ? window.featuredCards : [];

    try {
        const response = await fetch("http://localhost:3000/api/featured-cards");
        if (!response.ok) {
            throw new Error("Failed to load featured cards from backend");
        }

        const result = await response.json();
        if (result && result.ok === true && Array.isArray(result.data)) {
            activeFeaturedCards = result.data;
            return;
        }

        throw new Error("Invalid featured cards response");
    } catch (error) {
        console.warn("Backend featured cards unavailable, using local data.", error);
        activeFeaturedCards = fallbackCards;
    }
}

async function loadRoutePlansFromBackend() {
    const fallbackRoutes = Array.isArray(window.routePlans) ? window.routePlans : [];

    try {
        const response = await fetch("http://localhost:3000/api/routes");
        if (!response.ok) {
            throw new Error("Failed to load route plans from backend");
        }

        const result = await response.json();
        if (result && result.ok === true && Array.isArray(result.data)) {
            activeRoutePlans = result.data;
            return;
        }

        throw new Error("Invalid route plans response");
    } catch (error) {
        console.warn("Backend route plans unavailable, using local route data.", error);
        activeRoutePlans = fallbackRoutes;
    }
}

function setFeedbackMessage(message, type) {
    if (!feedbackMessage) {
        return;
    }

    feedbackMessage.textContent = message || "";
    feedbackMessage.classList.remove("is-success", "is-error", "is-muted");

    if (type) {
        feedbackMessage.classList.add("is-" + type);
    }
}

function formatFeedbackTime(value) {
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

function renderFeedbacks(feedbacks) {
    if (!feedbackList) {
        return;
    }

    feedbackList.innerHTML = "";
    const safeFeedbacks = Array.isArray(feedbacks) ? feedbacks : [];
    if (safeFeedbacks.length === 0) {
        showEmptyState(feedbackList, "还没有留言，期待你的第一条福州印象。");
        return;
    }

    safeFeedbacks.slice().reverse().forEach(function (feedback) {
        const item = document.createElement("article");
        item.className = "feedback-item";

        const meta = document.createElement("div");
        meta.className = "feedback-item__meta";
        meta.appendChild(createTextElement("strong", "", feedback.nickname || "游客"));
        meta.appendChild(createTextElement("time", "", formatFeedbackTime(feedback.createdAt)));

        item.appendChild(meta);
        item.appendChild(createTextElement("p", "feedback-item__content", feedback.content || ""));
        feedbackList.appendChild(item);
    });
}

async function loadFeedbacks() {
    if (!feedbackList) {
        return;
    }

    try {
        const response = await fetch(FEEDBACK_API_URL);
        if (!response.ok) {
            throw new Error("Failed to load feedbacks");
        }

        const result = await response.json();
        if (result && result.ok === true && Array.isArray(result.data)) {
            renderFeedbacks(result.data);
            return;
        }

        throw new Error("Invalid feedbacks response");
    } catch (error) {
        console.warn("Feedback service unavailable.", error);
        feedbackList.innerHTML = "";
        showEmptyState(feedbackList, "留言服务暂时不可用，本地展示功能不受影响。");
        setFeedbackMessage("留言服务暂时不可用，本地展示功能不受影响。", "muted");
    }
}

async function submitFeedback(event) {
    event.preventDefault();

    const nickname = feedbackNicknameInput ? feedbackNicknameInput.value.trim() : "";
    const content = feedbackContentInput ? feedbackContentInput.value.trim() : "";

    if (!content) {
        setFeedbackMessage("反馈内容不能为空", "error");
        return;
    }

    if (content.length > 200) {
        setFeedbackMessage("反馈内容不能超过 200 字", "error");
        return;
    }

    try {
        const response = await fetch(FEEDBACK_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nickname,
                content
            })
        });
        const result = await response.json();

        if (!response.ok) {
            setFeedbackMessage(result.message || "留言提交失败", "error");
            return;
        }

        if (result && result.ok === true) {
            if (feedbackContentInput) {
                feedbackContentInput.value = "";
            }
            setFeedbackMessage("留言提交成功", "success");
            await loadFeedbacks();
            return;
        }

        setFeedbackMessage("留言提交失败", "error");
    } catch (error) {
        console.warn("Feedback submit failed.", error);
        setFeedbackMessage("留言服务暂时不可用，请稍后再试", "error");
    }
}

function setAiTripMessage(message, type) {
    if (!aiTripMessage) {
        return;
    }

    aiTripMessage.textContent = message || "";
    aiTripMessage.classList.remove("is-success", "is-error", "is-muted");

    if (type) {
        aiTripMessage.classList.add("is-" + type);
    }
}

function renderAiTripPlan(planData) {
    if (!aiTripResult) {
        return;
    }

    aiTripResult.innerHTML = "";
    if (!planData) {
        showEmptyState(aiTripResult, "暂未生成行程推荐。");
        return;
    }

    const card = document.createElement("article");
    card.className = "ai-trip-card";

    const meta = document.createElement("div");
    meta.className = "ai-trip-card__meta";
    meta.appendChild(createTextElement("span", "", (planData.days || 1) + " 天"));
    meta.appendChild(createTextElement("span", "", planData.interest || "综合"));
    meta.appendChild(createTextElement("span", "", planData.pace || "适中"));

    const heading = document.createElement("div");
    heading.className = "ai-trip-card__heading";
    heading.appendChild(createTextElement("h3", "", planData.title || "福州行程推荐"));
    if (planData.isMock === true) {
        heading.appendChild(createTextElement("span", "ai-trip-badge", "模拟推荐"));
    }

    card.appendChild(heading);
    card.appendChild(createTextElement("p", "ai-trip-summary", planData.summary || ""));

    const requestText = planData.requestSummary || planData.userPreference || "";
    if (requestText) {
        card.appendChild(createTextElement("p", "ai-trip-request", "你的补充需求：" + requestText));
    }

    card.appendChild(meta);

    const planList = document.createElement("ul");
    planList.className = "ai-trip-plan-list";
    const planItems = Array.isArray(planData.plan) ? planData.plan : [];
    if (planItems.length === 0) {
        const item = document.createElement("li");
        item.textContent = "暂无具体路线建议";
        planList.appendChild(item);
    } else {
        planItems.forEach(function (planItem) {
            const item = document.createElement("li");
            item.textContent = planItem;
            planList.appendChild(item);
        });
    }
    card.appendChild(planList);

    const tips = document.createElement("p");
    tips.className = "ai-trip-tips";
    tips.appendChild(createTextElement("strong", "", "小提示："));
    tips.appendChild(document.createTextNode(planData.tips || "建议根据天气、体力和开放时间灵活调整。"));
    card.appendChild(tips);

    aiTripResult.appendChild(card);
}

async function submitAiTripPlan(event) {
    event.preventDefault();

    const days = Number.parseInt(aiTripDaysSelect ? aiTripDaysSelect.value : "1", 10);
    const interest = aiTripInterestSelect ? aiTripInterestSelect.value : "综合";
    const pace = aiTripPaceSelect ? aiTripPaceSelect.value : "适中";
    const userPreference = aiTripUserPreferenceInput ? aiTripUserPreferenceInput.value.trim() : "";

    if (userPreference.length > 300) {
        setAiTripMessage("补充需求不能超过 300 字", "error");
        return;
    }

    setAiTripMessage("正在生成福州行程推荐...", "muted");

    try {
        const response = await fetch(AI_TRIP_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                days,
                interest,
                pace,
                userPreference
            })
        });
        const result = await response.json();

        if (!response.ok || !result.ok) {
            setAiTripMessage(result.message || "AI 行程推荐生成失败", "error");
            return;
        }

        renderAiTripPlan(result.data);
        setAiTripMessage(result.data && result.data.isMock ? "当前为模拟 AI 推荐结果" : "行程推荐已生成", "success");
    } catch (error) {
        console.warn("AI trip plan service unavailable.", error);
        setAiTripMessage("AI 行程推荐服务暂时不可用，请稍后再试", "error");
    }
}

function findFeaturedCard(cardId) {
    if (!cardId) {
        return null;
    }

    return getFeaturedCards().find(function (card) {
        return card.id === cardId;
    }) || null;
}

function getCategoryLabel(category) {
    const matchedFilter = categoryFilters.find(function (filter) {
        return filter.value === category;
    });
    return matchedFilter ? matchedFilter.label : category;
}

function normalizeSearchKeyword(value) {
    return String(value || "").trim().toLowerCase();
}

function matchesSearchKeyword(card, keyword) {
    if (!keyword) {
        return true;
    }

    const searchableFields = [
        card.title,
        card.subtitle,
        card.tag,
        card.description,
        card.category,
        getCategoryLabel(card.category)
    ];
    return searchableFields.some(function (field) {
        return String(field || "").toLowerCase().indexOf(keyword) !== -1;
    });
}

function getFavoriteCards() {
    try {
        const rawFavorites = window.localStorage.getItem(favoriteStorageKey);
        if (!rawFavorites) {
            return [];
        }

        const parsedFavorites = JSON.parse(rawFavorites);
        if (!Array.isArray(parsedFavorites)) {
            return [];
        }

        return parsedFavorites
            .filter(function (cardId) {
                return typeof cardId === "string" && cardId.trim() !== "";
            })
            .filter(function (cardId, index, favorites) {
                return favorites.indexOf(cardId) === index;
            });
    } catch (error) {
        return [];
    }
}

function saveFavoriteCards(favorites) {
    try {
        const safeFavorites = Array.isArray(favorites) ? favorites : [];
        window.localStorage.setItem(favoriteStorageKey, JSON.stringify(safeFavorites));
    } catch (error) {
        // 浏览器隐私模式或存储限制时，收藏功能降级为不持久化。
    }
}

function isFavoriteCard(cardId) {
    if (!cardId) {
        return false;
    }

    return getFavoriteCards().indexOf(cardId) !== -1;
}

function updateFavoriteButtonState(button, isFavorite) {
    button.classList.toggle("is-favorite", isFavorite);
    button.setAttribute("aria-pressed", String(isFavorite));
    button.textContent = isFavorite ? "♥ 已收藏" : "♡ 收藏";
}

function refreshFavoriteButtons(cardId, isFavorite) {
    document.querySelectorAll(".favorite-button").forEach(function (button) {
        if (button.dataset.cardId === cardId) {
            updateFavoriteButtonState(button, isFavorite);
        }
    });
}

function toggleFavoriteCard(cardId) {
    if (!cardId) {
        return;
    }

    const favorites = getFavoriteCards();
    const favoriteIndex = favorites.indexOf(cardId);
    const nextFavorites = favoriteIndex === -1
        ? favorites.concat(cardId)
        : favorites.filter(function (favoriteId) {
            return favoriteId !== cardId;
        });
    const nextIsFavorite = favoriteIndex === -1;

    saveFavoriteCards(nextFavorites);
    if (currentFilter === "favorites") {
        renderFilteredFeaturedCards();
        return;
    }

    refreshFavoriteButtons(cardId, nextIsFavorite);
}

function createFavoriteButton(cardId) {
    if (!cardId) {
        return null;
    }

    const button = document.createElement("button");
    button.className = "favorite-button";
    button.type = "button";
    button.dataset.cardId = cardId;
    updateFavoriteButtonState(button, isFavoriteCard(cardId));
    button.addEventListener("click", function () {
        toggleFavoriteCard(cardId);
    });

    return button;
}

function createDetailButton(cardId) {
    if (!cardId) {
        return null;
    }

    const button = document.createElement("button");
    button.className = "detail-button";
    button.type = "button";
    button.dataset.cardId = cardId;
    button.textContent = "查看详情";
    button.addEventListener("click", function () {
        openDetailModal(cardId);
    });

    return button;
}

function renderDetailItem(label, value) {
    const item = document.createElement("div");
    item.className = "detail-modal__item";
    item.appendChild(createTextElement("span", "", label));
    item.appendChild(createTextElement("p", "", value || "暂无更多详情"));
    return item;
}

function renderDetailModal(card) {
    if (!detailModalContent || !card) {
        return;
    }

    detailModalContent.innerHTML = "";

    const article = document.createElement("article");
    article.className = "detail-card";

    const image = document.createElement("img");
    image.className = "detail-card__image";
    image.src = card.image || "";
    image.alt = card.alt || card.title || "";

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
        const detailGrid = document.createElement("div");
        detailGrid.className = "detail-modal__grid";
        detailGrid.appendChild(renderDetailItem("游玩时间", detail.bestTime));
        detailGrid.appendChild(renderDetailItem("位置", detail.location));
        detailGrid.appendChild(renderDetailItem("推荐理由", detail.reason));
        detailGrid.appendChild(renderDetailItem("小贴士", detail.tips));
        content.appendChild(detailGrid);
    } else {
        content.appendChild(createTextElement("p", "detail-modal__empty", "暂无更多详情"));
    }

    article.appendChild(image);
    article.appendChild(content);
    detailModalContent.appendChild(article);
}

function openDetailModal(cardId) {
    const card = findFeaturedCard(cardId);
    if (!detailModal || !card) {
        return;
    }

    renderDetailModal(card);
    detailModal.classList.add("is-open");
    detailModal.setAttribute("aria-hidden", "false");
}

function closeDetailModal() {
    if (!detailModal) {
        return;
    }

    detailModal.classList.remove("is-open");
    detailModal.setAttribute("aria-hidden", "true");
}

function renderFeaturedCards(cardsToRender, emptyMessage) {
    const container = document.getElementById("featuredCardsContainer");
    if (!container) {
        return;
    }

    container.innerHTML = "";
    const cards = Array.isArray(cardsToRender) ? cardsToRender : getFeaturedCards();
    if (cards.length === 0) {
        showEmptyState(container, emptyMessage || "暂无推荐内容");
        return;
    }

    cards.forEach(function (card) {
        const article = document.createElement("article");
        article.className = "guide-card";

        const media = document.createElement("div");
        media.className = "card-media";

        const image = document.createElement("img");
        image.src = card.image || "";
        image.alt = card.alt || card.title || "";
        media.appendChild(image);

        const copy = document.createElement("div");
        copy.className = "card-copy";
        copy.appendChild(createTextElement("span", "card-tag", card.tag));
        copy.appendChild(createTextElement("h2", "", card.title));
        copy.appendChild(createTextElement("p", "card-kicker", card.subtitle));
        copy.appendChild(createTextElement("p", "", card.description));

        const actions = document.createElement("div");
        actions.className = "card-actions";
        const detailButton = createDetailButton(card.id);
        const favoriteButton = createFavoriteButton(card.id);
        if (detailButton) {
            actions.appendChild(detailButton);
        }
        if (favoriteButton) {
            actions.appendChild(favoriteButton);
        }
        if (actions.children.length > 0) {
            copy.appendChild(actions);
        }

        article.appendChild(media);
        article.appendChild(copy);
        container.appendChild(article);
    });
}

function updateFilterActiveState(category) {
    const filterBar = document.getElementById("featuredFilterBar");
    if (!filterBar) {
        return;
    }

    filterBar.querySelectorAll(".filter-button").forEach(function (button) {
        const isActive = button.dataset.category === category;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

function getFilteredFeaturedCards() {
    const cards = getFeaturedCards();
    let filteredCards = cards;

    if (currentFilter === "favorites") {
        const favoriteIds = getFavoriteCards();
        filteredCards = cards.filter(function (card) {
            return card.id && favoriteIds.indexOf(card.id) !== -1;
        });
    } else if (currentFilter !== "all") {
        filteredCards = cards.filter(function (card) {
            return card.category === currentFilter;
        });
    }

    return filteredCards.filter(function (card) {
        return matchesSearchKeyword(card, currentSearchKeyword);
    });
}

function getFeaturedEmptyMessage() {
    if (currentSearchKeyword) {
        return "没有找到相关内容，换个关键词试试吧。";
    }

    if (currentFilter === "favorites") {
        return "你还没有收藏任何福州推荐，先去点亮喜欢的地方吧。";
    }

    return "暂无相关内容";
}

function renderFilteredFeaturedCards() {
    renderFeaturedCards(getFilteredFeaturedCards(), getFeaturedEmptyMessage());
    updateFilterActiveState(currentFilter);
}

function filterFeaturedCards(category) {
    currentFilter = category || "all";
    renderFilteredFeaturedCards();
}

function handleFeaturedSearch(event) {
    currentSearchKeyword = normalizeSearchKeyword(event.target.value);
    renderFilteredFeaturedCards();
}

function renderFilterButtons() {
    const filterBar = document.getElementById("featuredFilterBar");
    if (!filterBar) {
        return;
    }

    filterBar.innerHTML = "";
    categoryFilters.forEach(function (filter) {
        const button = document.createElement("button");
        button.className = "filter-button";
        button.type = "button";
        button.dataset.category = filter.value;
        button.setAttribute("aria-pressed", "false");
        button.textContent = filter.label;
        button.addEventListener("click", function () {
            filterFeaturedCards(filter.value || currentFilter);
        });
        filterBar.appendChild(button);
    });
}

function renderRouteStops(stops) {
    const stopsWrap = document.createElement("div");
    stopsWrap.className = "route-stops";

    if (!Array.isArray(stops) || stops.length === 0) {
        stopsWrap.appendChild(createTextElement("span", "route-stop", "暂无路线站点"));
        return stopsWrap;
    }

    stops.forEach(function (stop, index) {
        stopsWrap.appendChild(createTextElement("span", "route-stop", stop));

        if (index < stops.length - 1) {
            stopsWrap.appendChild(createTextElement("span", "route-arrow", "→"));
        }
    });

    return stopsWrap;
}

function renderRoutePlans() {
    const container = document.getElementById("routePlansContainer");
    if (!container) {
        return;
    }

    container.innerHTML = "";
    const plans = getRoutePlans();
    if (plans.length === 0) {
        showEmptyState(container, "暂无路线推荐");
        return;
    }

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

function getIdentityImageClass(cardId) {
    const imageClassMap = {
        "alley-spirit": "alley-image-wrap",
        "flavor-grace": "flavor-image-wrap",
        "banyan-spirit": "banyan-image-wrap"
    };
    return imageClassMap[cardId] || "";
}

function renderIdentityCards() {
    const container = document.getElementById("identityCardsContainer");
    if (!container) {
        return;
    }

    container.innerHTML = "";
    const cards = Array.isArray(window.identityCards) ? window.identityCards : [];
    if (cards.length === 0) {
        showEmptyState(container, "暂无推荐内容");
        return;
    }

    cards.forEach(function (card) {
        const article = document.createElement("article");
        article.className = "city-card spirit-card";

        const imageWrap = document.createElement("div");
        imageWrap.className = "identity-image-wrap " + getIdentityImageClass(card.id);

        const image = document.createElement("img");
        image.src = card.image || "";
        image.alt = card.alt || card.title || "";
        imageWrap.appendChild(image);

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

if (weatherButton) {
    weatherButton.addEventListener("click", openWeatherModal);
}

if (closeModalButton) {
    closeModalButton.addEventListener("click", closeWeatherModal);
}

if (weatherModal) {
    weatherModal.addEventListener("click", function (event) {
        if (event.target instanceof HTMLElement && event.target.dataset.closeModal === "true") {
            closeWeatherModal();
        }
    });
}

if (detailModalClose) {
    detailModalClose.addEventListener("click", closeDetailModal);
}

if (detailModalOverlay) {
    detailModalOverlay.addEventListener("click", closeDetailModal);
}

if (featuredSearchInput) {
    featuredSearchInput.addEventListener("input", handleFeaturedSearch);
}

document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") {
        return;
    }

    if (weatherModal && weatherModal.classList.contains("is-open")) {
        closeWeatherModal();
    }

    if (detailModal && detailModal.classList.contains("is-open")) {
        closeDetailModal();
    }
});

window.addEventListener("DOMContentLoaded", async function () {
    if (aiTripForm) {
        aiTripForm.addEventListener("submit", submitAiTripPlan);
    }

    if (feedbackForm) {
        feedbackForm.addEventListener("submit", submitFeedback);
    }

    await Promise.all([
        loadFeaturedCardsFromBackend(),
        loadRoutePlansFromBackend(),
        loadFeedbacks()
    ]);
    renderFilterButtons();
    filterFeaturedCards("all");
    renderRoutePlans();
    renderIdentityCards();

    console.log("FuzhouPulse data loaded", {
        siteInfo: window.siteInfo,
        featuredCards: window.featuredCards,
        identityCards: window.identityCards,
        routePlans: window.routePlans,
        travelStats: window.travelStats
    });

    fetch("/api/count")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Failed to load visitor count");
            }
            return response.text();
        })
        .then(function (count) {
            animateVisitorCount(count.trim());
        })
        .catch(function () {
            visitorCountElement.textContent = "--";
        });
});
