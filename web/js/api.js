const API_BASE = (function () {
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return "http://localhost:3000";
  }
  return "";
})();

export const API_BASE_URL = API_BASE;

export async function loadFeaturedCardsFromBackend() {
  try {
    const response = await fetch(API_BASE + "/api/featured-cards");
    if (!response.ok) throw new Error("Failed to load featured cards");
    const result = await response.json();
    if (result && result.ok === true && Array.isArray(result.data)) {
      return { ok: true, data: result.data };
    }
    throw new Error("Invalid response");
  } catch (error) {
    console.warn("Backend featured cards unavailable.", error);
    return { ok: false, data: null };
  }
}

export async function loadRoutePlansFromBackend() {
  try {
    const response = await fetch(API_BASE + "/api/routes");
    if (!response.ok) throw new Error("Failed to load routes");
    const result = await response.json();
    if (result && result.ok === true && Array.isArray(result.data)) {
      return { ok: true, data: result.data };
    }
    throw new Error("Invalid response");
  } catch (error) {
    console.warn("Backend route plans unavailable.", error);
    return { ok: false, data: null };
  }
}

export async function loadFeedbacks() {
  const response = await fetch(API_BASE + "/api/feedbacks");
  if (!response.ok) throw new Error("Failed to load feedbacks");
  const result = await response.json();
  if (result && result.ok === true && Array.isArray(result.data)) {
    return result.data;
  }
  throw new Error("Invalid feedbacks response");
}

export async function submitFeedback(nickname, content) {
  const response = await fetch(API_BASE + "/api/feedbacks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname, content })
  });
  const result = await response.json();
  return { ok: response.ok && result.ok, result };
}

export async function submitAiTripPlan(days, interest, pace, userPreference) {
  const response = await fetch(API_BASE + "/api/ai/trip-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ days, interest, pace, userPreference })
  });
  const result = await response.json();
  return { ok: response.ok && result.ok, result };
}

export async function fetchVisitorCount() {
  const response = await fetch("/api/count");
  if (!response.ok) throw new Error("Failed to load visitor count");
  return response.text();
}
