import { createTextElement, showEmptyState, formatFeedbackTime } from "./utils.js";
import { loadFeedbacks as apiLoadFeedbacks, submitFeedback as apiSubmitFeedback } from "./api.js";

export function setFeedbackMessage(el, message, type) {
  if (!el) return;
  el.textContent = message || "";
  el.classList.remove("is-success", "is-error", "is-muted");
  if (type) el.classList.add("is-" + type);
}

function renderFeedbacks(container, feedbacks) {
  if (!container) return;
  container.innerHTML = "";
  const safe = Array.isArray(feedbacks) ? feedbacks : [];
  if (safe.length === 0) {
    showEmptyState(container, "还没有留言，期待你的第一条福州印象。");
    return;
  }

  safe.slice().reverse().forEach(function (fb) {
    const item = document.createElement("article");
    item.className = "feedback-item";

    const meta = document.createElement("div");
    meta.className = "feedback-item__meta";
    meta.appendChild(createTextElement("strong", "", fb.nickname || "游客"));
    meta.appendChild(createTextElement("time", "", formatFeedbackTime(fb.createdAt)));

    item.appendChild(meta);
    item.appendChild(createTextElement("p", "feedback-item__content", fb.content || ""));
    container.appendChild(item);
  });
}

export async function loadAndRenderFeedbacks(container, msgEl) {
  if (!container) return;
  try {
    const data = await apiLoadFeedbacks();
    renderFeedbacks(container, data);
  } catch (error) {
    console.warn("Feedback service unavailable.", error);
    container.innerHTML = "";
    showEmptyState(container, "留言服务暂时不可用，本地展示功能不受影响。");
    if (msgEl) setFeedbackMessage(msgEl, "留言服务暂时不可用，本地展示功能不受影响。", "muted");
  }
}

export async function handleSubmitFeedback(event, nicknameEl, contentEl, msgEl, listEl) {
  event.preventDefault();

  const nickname = nicknameEl ? nicknameEl.value.trim() : "";
  const content = contentEl ? contentEl.value.trim() : "";

  if (!content) { setFeedbackMessage(msgEl, "反馈内容不能为空", "error"); return; }
  if (content.length > 200) { setFeedbackMessage(msgEl, "反馈内容不能超过 200 字", "error"); return; }

  try {
    const { ok, result } = await apiSubmitFeedback(nickname, content);
    if (!ok) { setFeedbackMessage(msgEl, result.message || "留言提交失败", "error"); return; }
    if (contentEl) contentEl.value = "";
    setFeedbackMessage(msgEl, "留言提交成功", "success");
    await loadAndRenderFeedbacks(listEl, msgEl);
  } catch (error) {
    console.warn("Feedback submit failed.", error);
    setFeedbackMessage(msgEl, "留言服务暂时不可用，请稍后再试", "error");
  }
}
