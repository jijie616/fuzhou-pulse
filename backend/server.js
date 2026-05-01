require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const featuredCards = require("./data/featuredCards");
const routePlans = require("./data/routePlans");
const { readFeedbacks, addFeedback } = require("./data/feedbacks");
const { generateTripPlan } = require("./services/tripPlannerService");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function normalizeTripDays(value) {
    const parsedDays = Number.parseInt(value, 10);
    if (!Number.isFinite(parsedDays) || parsedDays < 1) {
        return 1;
    }

    return parsedDays;
}

app.get("/api/health", function (req, res) {
    res.json({
        ok: true,
        message: "Fuzhou Pulse backend is running"
    });
});

app.get("/api/featured-cards", function (req, res) {
    res.json({
        ok: true,
        count: featuredCards.length,
        data: featuredCards
    });
});

app.get("/api/routes", function (req, res) {
    res.json({
        ok: true,
        count: routePlans.length,
        data: routePlans
    });
});

app.get("/api/feedbacks", function (req, res) {
    const feedbacks = readFeedbacks();

    res.json({
        ok: true,
        count: feedbacks.length,
        data: feedbacks
    });
});

app.get("/api/status", function (req, res) {
    let feedbacksCount = 0;
    let warning = null;

    try {
        feedbacksCount = readFeedbacks().length;
    } catch (error) {
        warning = "Failed to read feedbacks count.";
        feedbacksCount = 0;
    }

    const status = {
        ok: true,
        name: "Fuzhou Pulse",
        version: "v2.0-beta",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        cardsCount: featuredCards.length,
        routesCount: routePlans.length,
        feedbacksCount,
        aiProvider: process.env.AI_PROVIDER || "mock",
        aiModel: process.env.AI_MODEL || "mock-trip-planner",
        hasDeepSeekKey: Boolean(process.env.DEEPSEEK_API_KEY),
        render: {
            service: process.env.RENDER_SERVICE_NAME || null,
            externalUrl: process.env.RENDER_EXTERNAL_URL || null
        }
    };

    if (warning) {
        status.warning = warning;
    }

    res.json(status);
});

app.post("/api/feedbacks", function (req, res) {
    const body = req.body || {};
    const nickname = String(body.nickname || "").trim() || "游客";
    const content = String(body.content || "").trim();

    if (!content) {
        return res.status(400).json({
            ok: false,
            message: "反馈内容不能为空"
        });
    }

    if (content.length > 200) {
        return res.status(400).json({
            ok: false,
            message: "反馈内容不能超过 200 字"
        });
    }

    const feedback = {
        id: Date.now(),
        nickname,
        content,
        createdAt: new Date().toISOString()
    };

    addFeedback(feedback);

    return res.json({
        ok: true,
        message: "反馈提交成功",
        data: feedback
    });
});

app.post("/api/ai/trip-plan", async function (req, res) {
    const body = req.body || {};
    const days = normalizeTripDays(body.days);
    const interest = String(body.interest || "").trim() || "综合";
    const pace = String(body.pace || "").trim() || "适中";
    const userPreference = typeof body.userPreference === "string"
        ? body.userPreference.trim()
        : "";

    if (days > 3) {
        return res.status(400).json({
            ok: false,
            message: "当前最多支持 3 天行程推荐"
        });
    }

    if (userPreference.length > 300) {
        return res.status(400).json({
            ok: false,
            message: "补充需求不能超过 300 字"
        });
    }

    const tripPlan = await generateTripPlan({
        days,
        interest,
        pace,
        userPreference
    });

    return res.json({
        ok: true,
        message: "已生成福州行程推荐",
        data: tripPlan
    });
});

const webRoot = path.join(__dirname, "..", "web");
app.use(express.static(webRoot));
app.use(function (req, res) {
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({ ok: false, message: "API route not found" });
    }
    res.sendFile(path.join(webRoot, "index.html"));
});

app.listen(PORT, function () {
    console.log(`Fuzhou Pulse backend running at http://localhost:${PORT}`);
});
