require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const featuredCards = require("./data/featuredCards");
const routePlans = require("./data/routePlans");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { readFeedbacks, addFeedback } = require("./data/feedbacks");
const { generateTripPlan } = require("./services/tripPlannerService");
const { getDb } = require("./data/db");
const { authMiddleware, JWT_SECRET, JWT_EXPIRY } = require("./middleware/auth");

const app = express();

// --- Security middleware ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.deepseek.com"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json({ limit: "10kb" }));

// --- Logging ---
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// --- Rate limiting ---
const isTest = process.env.NODE_ENV === "test";

const aiTripLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isTest ? 1000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: "AI 请求过于频繁，请 1 分钟后再试" }
});

const feedbackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isTest ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: "留言提交过于频繁，请稍后再试" }
});

// --- Helpers ---
function normalizeTripDays(value) {
  const parsedDays = Number.parseInt(value, 10);
  if (!Number.isFinite(parsedDays) || parsedDays < 1) return 1;
  return parsedDays;
}

// --- API routes ---
app.get("/api/health", function (req, res) {
  res.json({ ok: true, message: "Fuzhou Pulse backend is running" });
});

app.get("/api/featured-cards", function (req, res) {
  res.json({ ok: true, count: featuredCards.length, data: featuredCards });
});

app.get("/api/routes", function (req, res) {
  res.json({ ok: true, count: routePlans.length, data: routePlans });
});

app.get("/api/feedbacks", function (req, res) {
  const feedbacks = readFeedbacks();
  res.json({ ok: true, count: feedbacks.length, data: feedbacks });
});

app.get("/api/status", function (req, res) {
  let feedbacksCount = 0;
  let warning = null;
  try {
    feedbacksCount = readFeedbacks().length;
  } catch (e) {
    warning = "Failed to read feedbacks count.";
  }

  res.json({
    ok: true,
    name: "Fuzhou Pulse",
    version: "v2.0-beta",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cardsCount: featuredCards.length,
    routesCount: routePlans.length,
    feedbacksCount,
    aiProvider: process.env.AI_PROVIDER || "mock",
    ...(warning ? { warning } : {})
  });
});

app.post("/api/feedbacks", feedbackLimiter, function (req, res) {
  const body = req.body || {};
  const nickname = String(body.nickname || "").trim() || "游客";
  const content = String(body.content || "").trim();

  if (!content) {
    return res.status(400).json({ ok: false, message: "反馈内容不能为空" });
  }
  if (content.length > 200) {
    return res.status(400).json({ ok: false, message: "反馈内容不能超过 200 字" });
  }

  const feedback = {
    id: Date.now(),
    nickname,
    content,
    createdAt: new Date().toISOString()
  };

  addFeedback(feedback);
  return res.json({ ok: true, message: "反馈提交成功", data: feedback });
});

app.post("/api/ai/trip-plan", aiTripLimiter, async function (req, res) {
  const body = req.body || {};
  const days = normalizeTripDays(body.days);
  const interest = String(body.interest || "").trim() || "综合";
  const pace = String(body.pace || "").trim() || "适中";
  const userPreference = typeof body.userPreference === "string" ? body.userPreference.trim() : "";

  if (days > 3) {
    return res.status(400).json({ ok: false, message: "当前最多支持 3 天行程推荐" });
  }
  if (userPreference.length > 300) {
    return res.status(400).json({ ok: false, message: "补充需求不能超过 300 字" });
  }

  const tripPlan = await generateTripPlan({ days, interest, pace, userPreference });
  return res.json({ ok: true, message: "已生成福州行程推荐", data: tripPlan });
});

// --- Auth routes ---
app.post("/api/auth/register", async function (req, res) {
  const body = req.body || {};
  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ ok: false, message: "用户名需 3-30 个字符" });
  }
  if (password.length < 6 || password.length > 100) {
    return res.status(400).json({ ok: false, message: "密码需 6-100 个字符" });
  }

  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (existing) {
    return res.status(409).json({ ok: false, message: "用户名已存在" });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    "INSERT INTO users (username, password, role, createdAt) VALUES (?, ?, ?, ?)"
  ).run(username, hash, "user", new Date().toISOString());

  const token = jwt.sign(
    { id: result.lastInsertRowid, username, role: "user" },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

  return res.status(201).json({
    ok: true,
    message: "注册成功",
    data: { id: result.lastInsertRowid, username, role: "user", token }
  });
});

app.post("/api/auth/login", async function (req, res) {
  const body = req.body || {};
  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (!username || !password) {
    return res.status(400).json({ ok: false, message: "用户名和密码不能为空" });
  }

  const db = getDb();
  const user = db.prepare("SELECT id, username, password, role FROM users WHERE username = ?").get(username);
  if (!user) {
    return res.status(401).json({ ok: false, message: "用户名或密码错误" });
  }

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    return res.status(401).json({ ok: false, message: "用户名或密码错误" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

  return res.json({
    ok: true,
    message: "登录成功",
    data: { id: user.id, username: user.username, role: user.role, token }
  });
});

// --- Admin routes (protected) ---
app.get("/api/admin/feedbacks", authMiddleware, function (req, res) {
  const db = getDb();
  const rows = db.prepare(
    "SELECT id, nickname, content, createdAt, deleted FROM feedbacks ORDER BY id DESC"
  ).all();
  res.json({ ok: true, count: rows.length, data: rows });
});

app.delete("/api/admin/feedbacks/:id", authMiddleware, function (req, res) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ ok: false, message: "无效的留言 ID" });
  }
  const db = getDb();
  const result = db.prepare("UPDATE feedbacks SET deleted = 1 WHERE id = ?").run(id);
  if (result.changes === 0) {
    return res.status(404).json({ ok: false, message: "留言不存在" });
  }
  res.json({ ok: true, message: "留言已删除" });
});

app.get("/api/admin/stats", authMiddleware, function (req, res) {
  const db = getDb();
  const total = db.prepare("SELECT COUNT(*) as count FROM feedbacks").get();
  const active = db.prepare("SELECT COUNT(*) as count FROM feedbacks WHERE deleted = 0").get();
  const deleted = db.prepare("SELECT COUNT(*) as count FROM feedbacks WHERE deleted = 1").get();
  const recent = db.prepare(
    "SELECT id, nickname, content, createdAt FROM feedbacks WHERE deleted = 0 ORDER BY id DESC LIMIT 5"
  ).all();

  res.json({
    ok: true,
    data: {
      totalFeedbacks: total.count,
      activeFeedbacks: active.count,
      deletedFeedbacks: deleted.count,
      recentFeedbacks: recent
    }
  });
});

// --- Static files ---
const webRoot = path.join(__dirname, "..", "web");
app.use(express.static(webRoot));
app.use(function (req, res) {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ ok: false, message: "API route not found" });
  }
  res.sendFile(path.join(webRoot, "index.html"));
});

module.exports = app;
