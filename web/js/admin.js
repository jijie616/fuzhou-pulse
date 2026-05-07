import { API_BASE_URL } from "./api.js";

const API = API_BASE_URL;

/* DOM refs */
const loginSection = document.getElementById("loginSection");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const dashboardSection = document.getElementById("dashboardSection");
const adminUser = document.getElementById("adminUser");
const logoutButton = document.getElementById("logoutButton");
const statTotal = document.getElementById("statTotal");
const statActive = document.getElementById("statActive");
const statDeleted = document.getElementById("statDeleted");
const recentList = document.getElementById("recentList");
const feedbackTableContainer = document.getElementById("feedbackTableContainer");

function getToken() {
  return localStorage.getItem("fz_admin_token");
}

function setToken(token) {
  localStorage.setItem("fz_admin_token", token);
}

function clearToken() {
  localStorage.removeItem("fz_admin_token");
  localStorage.removeItem("fz_admin_user");
}

function authHeaders() {
  return { "Authorization": "Bearer " + getToken(), "Content-Type": "application/json" };
}

function showMessage(el, msg, type) {
  if (!el) return;
  el.textContent = msg || "";
  el.classList.remove("is-error", "is-success");
  if (type) el.classList.add("is-" + type);
}

function checkAuth() {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) { clearToken(); return false; }
    return true;
  } catch (e) { return false; }
}

async function loadDashboard() {
  try {
    const [statsRes, feedbacksRes] = await Promise.all([
      fetch(API + "/api/admin/stats", { headers: authHeaders() }),
      fetch(API + "/api/admin/feedbacks", { headers: authHeaders() })
    ]);

    if (statsRes.status === 401 || feedbacksRes.status === 401) {
      clearToken();
      showLogin();
      return;
    }

    const stats = await statsRes.json();
    const feedbacks = await feedbacksRes.json();

    if (stats.ok) renderStats(stats.data);
    if (feedbacks.ok) renderRecent(stats.data.recentFeedbacks);
    if (feedbacks.ok) renderFeedbackTable(feedbacks.data);
  } catch (e) {
    console.error("Dashboard load failed:", e);
  }
}

function renderStats(data) {
  statTotal.textContent = data.totalFeedbacks || 0;
  statActive.textContent = data.activeFeedbacks || 0;
  statDeleted.textContent = data.deletedFeedbacks || 0;
}

function renderRecent(feedbacks) {
  if (!recentList) return;
  recentList.innerHTML = "";
  if (!Array.isArray(feedbacks) || feedbacks.length === 0) {
    recentList.innerHTML = '<p style="color:#666">暂无留言</p>';
    return;
  }
  feedbacks.forEach(function (fb) {
    var div = document.createElement("div");
    div.className = "feedback-item-admin";
    var meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = '<span class="nickname">' + escapeHtml(fb.nickname || "游客") + '</span>' +
      '<span class="time">' + formatTime(fb.createdAt) + '</span>';
    div.appendChild(meta);
    var content = document.createElement("p");
    content.className = "content";
    content.textContent = fb.content || "";
    div.appendChild(content);
    recentList.appendChild(div);
  });
}

function renderFeedbackTable(feedbacks) {
  if (!feedbackTableContainer) return;
  feedbackTableContainer.innerHTML = "";
  if (!Array.isArray(feedbacks) || feedbacks.length === 0) {
    feedbackTableContainer.innerHTML = '<p style="color:#666">暂无留言</p>';
    return;
  }
  feedbacks.forEach(function (fb) {
    var div = document.createElement("div");
    div.className = "feedback-item-admin";
    var meta = document.createElement("div");
    meta.className = "meta";
    var left = document.createElement("div");
    left.innerHTML = '<span class="nickname">' + escapeHtml(fb.nickname || "游客") + '</span>' +
      (fb.deleted ? ' <span class="status-deleted">已删除</span>' : '');
    var right = document.createElement("span");
    right.className = "time";
    right.textContent = formatTime(fb.createdAt);
    meta.appendChild(left);
    meta.appendChild(right);
    div.appendChild(meta);

    var content = document.createElement("p");
    content.className = "content";
    content.textContent = fb.content || "";
    div.appendChild(content);

    if (!fb.deleted) {
      var delBtn = document.createElement("button");
      delBtn.className = "delete-button";
      delBtn.textContent = "删除";
      delBtn.addEventListener("click", function () {
        deleteFeedback(fb.id);
      });
      div.appendChild(delBtn);
    }

    feedbackTableContainer.appendChild(div);
  });
}

async function deleteFeedback(id) {
  try {
    var res = await fetch(API + "/api/admin/feedbacks/" + id, {
      method: "DELETE",
      headers: authHeaders()
    });
    if (res.status === 401) { clearToken(); showLogin(); return; }
    var data = await res.json();
    if (data.ok) loadDashboard();
  } catch (e) { console.error("Delete failed:", e); }
}

function formatTime(value) {
  if (!value) return "";
  var d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("zh-CN", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit"
  });
}

function escapeHtml(str) {
  var div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function showLogin() {
  loginSection.style.display = "flex";
  dashboardSection.style.display = "none";
}

function showDashboard() {
  loginSection.style.display = "none";
  dashboardSection.style.display = "block";
  adminUser.textContent = localStorage.getItem("fz_admin_user") || "";
  loadDashboard();
}

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  var username = document.getElementById("adminUsername").value.trim();
  var password = document.getElementById("adminPassword").value;

  try {
    var res = await fetch(API + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password })
    });
    var data = await res.json();
    if (!data.ok) {
      showMessage(loginMessage, data.message || "登录失败", "error");
      return;
    }
    setToken(data.data.token);
    localStorage.setItem("fz_admin_user", data.data.username);
    showMessage(loginMessage, "", null);
    showDashboard();
  } catch (err) {
    showMessage(loginMessage, "网络错误，请稍后再试", "error");
  }
});

logoutButton.addEventListener("click", function () {
  clearToken();
  showLogin();
});

document.addEventListener("DOMContentLoaded", function () {
  if (checkAuth()) { showDashboard(); } else { showLogin(); }
});
