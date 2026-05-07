import { loadFeaturedCardsFromBackend, loadRoutePlansFromBackend, fetchVisitorCount } from "./api.js";
import { openWeatherModal, closeWeatherModal, openDetailModal, closeDetailModal } from "./modals.js";
import { setActiveCards, setActiveRoutes, renderFilterButtons, renderFilteredFeaturedCards, handleFeaturedSearch, renderRoutePlans, renderIdentityCards } from "./cards.js";
import { handleSubmitFeedback, loadAndRenderFeedbacks } from "./feedback.js";
import { handleSubmitAiTrip } from "./ai-trip.js";

/* --- DOM refs --- */
const weatherButton = document.getElementById("weatherButton");
const weatherModal = document.getElementById("weatherModal");
const closeModalButton = document.getElementById("closeModalButton");
const detailModal = document.getElementById("detailModal");
const detailModalOverlay = document.getElementById("detailModalOverlay");
const detailModalClose = document.getElementById("detailModalClose");
const detailModalContent = document.getElementById("detailModalContent");
const featuredSearchInput = document.getElementById("featuredSearchInput");
const feedbackForm = document.getElementById("feedbackForm");
const feedbackNickname = document.getElementById("feedbackNickname");
const feedbackContent = document.getElementById("feedbackContent");
const feedbackMessage = document.getElementById("feedbackMessage");
const feedbackList = document.getElementById("feedbackList");
const aiTripForm = document.getElementById("aiTripForm");
const aiTripDays = document.getElementById("aiTripDays");
const aiTripInterest = document.getElementById("aiTripInterest");
const aiTripPace = document.getElementById("aiTripPace");
const aiTripUserPref = document.getElementById("aiTripUserPreference");
const aiTripMessage = document.getElementById("aiTripMessage");
const aiTripResult = document.getElementById("aiTripResult");
const visitorCountElement = document.getElementById("visitor-count");

/* --- Visitor counter animation --- */
function animateVisitorCount(targetValue) {
  const target = Number.parseInt(targetValue, 10);
  if (!Number.isFinite(target)) {
    visitorCountElement.textContent = "--";
    return;
  }

  const duration = 1100;
  const startTime = performance.now();
  const startValue = Math.max(0, target - Math.min(target, 36));

  visitorCountElement.classList.remove("is-rolling");
  void visitorCountElement.offsetWidth;
  visitorCountElement.classList.add("is-rolling");

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startValue + (target - startValue) * eased);
    visitorCountElement.textContent = current.toLocaleString("zh-CN");

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      visitorCountElement.textContent = target.toLocaleString("zh-CN");
      visitorCountElement.classList.remove("is-rolling");
    }
  }

  requestAnimationFrame(tick);
}

/* --- Event listeners --- */
if (weatherButton) {
  weatherButton.addEventListener("click", function () { openWeatherModal(weatherModal); });
}
if (closeModalButton) {
  closeModalButton.addEventListener("click", function () { closeWeatherModal(weatherModal); });
}
if (weatherModal) {
  weatherModal.addEventListener("click", function (event) {
    if (event.target instanceof HTMLElement && event.target.dataset.closeModal === "true") {
      closeWeatherModal(weatherModal);
    }
  });
}
if (detailModalClose) {
  detailModalClose.addEventListener("click", function () { closeDetailModal(detailModal); });
}
if (detailModalOverlay) {
  detailModalOverlay.addEventListener("click", function () { closeDetailModal(detailModal); });
}

if (featuredSearchInput) {
  featuredSearchInput.addEventListener("input", function (event) {
    handleFeaturedSearch(event.target.value, function (cardId) {
      openDetailModal(cardId, detailModal, detailModalContent);
    });
  });
}

document.addEventListener("keydown", function (event) {
  if (event.key !== "Escape") return;
  if (weatherModal && weatherModal.classList.contains("is-open")) closeWeatherModal(weatherModal);
  if (detailModal && detailModal.classList.contains("is-open")) closeDetailModal(detailModal);
});

/* --- Init --- */
window.addEventListener("DOMContentLoaded", async function () {
  // Bind form handlers
  if (aiTripForm) {
    aiTripForm.addEventListener("submit", function (e) {
      handleSubmitAiTrip(e, aiTripDays, aiTripInterest, aiTripPace, aiTripUserPref, aiTripMessage, aiTripResult, function (cardId) {
        openDetailModal(cardId, detailModal, detailModalContent);
      });
    });
  }

  if (feedbackForm) {
    feedbackForm.addEventListener("submit", function (e) {
      handleSubmitFeedback(e, feedbackNickname, feedbackContent, feedbackMessage, feedbackList);
    });
  }

  // Load data from backend, fall back to local data
  const [cardsResult, routesResult] = await Promise.all([
    loadFeaturedCardsFromBackend(),
    loadRoutePlansFromBackend()
  ]);

  if (cardsResult.ok) { setActiveCards(cardsResult.data); } else { console.warn("Using local fallback data for cards (backend unavailable)."); }
  if (routesResult.ok) { setActiveRoutes(routesResult.data); } else { console.warn("Using local fallback data for routes (backend unavailable)."); }

  // Render
  renderFilterButtons(function (cardId) {
    openDetailModal(cardId, detailModal, detailModalContent);
  });
  renderFilteredFeaturedCards(function (cardId) {
    openDetailModal(cardId, detailModal, detailModalContent);
  });
  renderRoutePlans();
  renderIdentityCards();
  loadAndRenderFeedbacks(feedbackList, feedbackMessage);

  // Visitor count
  fetchVisitorCount()
    .then(function (count) { animateVisitorCount(count.trim()); })
    .catch(function () { visitorCountElement.textContent = "--"; });
});
