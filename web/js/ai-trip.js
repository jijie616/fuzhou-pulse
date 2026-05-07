import { createTextElement, showEmptyState } from "./utils.js";
import { submitAiTripPlan as apiSubmitAiTrip } from "./api.js";
import { getActiveCards } from "./cards.js";

export function setAiTripMessage(el, message, type) {
  if (!el) return;
  el.textContent = message || "";
  el.classList.remove("is-success", "is-error", "is-muted");
  if (type) el.classList.add("is-" + type);
}

function renderAiTripPlan(container, planData, openDetailFn) {
  if (!container) return;
  container.innerHTML = "";

  if (!planData) { showEmptyState(container, "暂未生成行程推荐。"); return; }

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
  const items = Array.isArray(planData.plan) ? planData.plan : [];
  if (items.length === 0) {
    const li = document.createElement("li");
    li.textContent = "暂无具体路线建议";
    planList.appendChild(li);
  } else {
    items.forEach(function (item) {
      const li = document.createElement("li");
      li.textContent = item;
      planList.appendChild(li);
    });
  }
  card.appendChild(planList);

  const relatedPlaces = Array.isArray(planData.relatedPlaces) ? planData.relatedPlaces : [];
  if (relatedPlaces.length > 0) {
    const relatedSection = document.createElement("div");
    relatedSection.className = "ai-trip-related";
    relatedSection.appendChild(createTextElement("h4", "", "参考地点"));

    const relatedList = document.createElement("div");
    relatedList.className = "ai-trip-related__list";
    relatedPlaces.forEach(function (place) {
      if (!place || (!place.title && !place.reason)) return;

      const relatedItem = document.createElement("button");
      relatedItem.type = "button";
      relatedItem.className = "ai-trip-related__item ai-related-place-button";
      relatedItem.appendChild(createTextElement("strong", "", place.title || "推荐地点"));
      if (place.reason) {
        relatedItem.appendChild(createTextElement("span", "", place.reason));
      }
      relatedItem.addEventListener("click", function () {
        const cards = getActiveCards();
        let matched = null;
        if (place.id) matched = cards.find(function (c) { return c.id === place.id; });
        if (!matched && place.title) matched = cards.find(function (c) { return c.title === place.title; });
        if (matched && matched.id && typeof openDetailFn === "function") {
          openDetailFn(matched.id);
        }
      });
      relatedList.appendChild(relatedItem);
    });

    if (relatedList.children.length > 0) {
      relatedSection.appendChild(relatedList);
      card.appendChild(relatedSection);
    }
  }

  const tips = document.createElement("p");
  tips.className = "ai-trip-tips";
  tips.appendChild(createTextElement("strong", "", "小提示："));
  tips.appendChild(document.createTextNode(planData.tips || "建议根据天气、体力和开放时间灵活调整。"));
  card.appendChild(tips);

  container.appendChild(card);
}

export async function handleSubmitAiTrip(event, daysEl, interestEl, paceEl, prefEl, msgEl, resultEl, openDetailFn) {
  event.preventDefault();

  const days = Number.parseInt(daysEl ? daysEl.value : "1", 10);
  const interest = interestEl ? interestEl.value : "综合";
  const pace = paceEl ? paceEl.value : "适中";
  const userPreference = prefEl ? prefEl.value.trim() : "";

  if (userPreference.length > 300) { setAiTripMessage(msgEl, "补充需求不能超过 300 字", "error"); return; }

  setAiTripMessage(msgEl, "正在生成福州行程推荐...", "muted");

  try {
    const { ok, result } = await apiSubmitAiTrip(days, interest, pace, userPreference);
    if (!ok) { setAiTripMessage(msgEl, result.message || "AI 行程推荐生成失败", "error"); return; }
    renderAiTripPlan(resultEl, result.data, openDetailFn);
    setAiTripMessage(msgEl, result.data && result.data.isMock ? "当前为模拟 AI 推荐结果" : "行程推荐已生成", "success");
  } catch (error) {
    console.warn("AI trip plan unavailable.", error);
    setAiTripMessage(msgEl, "AI 行程推荐服务暂时不可用，请稍后再试", "error");
  }
}
