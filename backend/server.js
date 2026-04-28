const express = require("express");
const cors = require("cors");
const featuredCards = require("./data/featuredCards");
const routePlans = require("./data/routePlans");
const { readFeedbacks, addFeedback } = require("./data/feedbacks");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

app.listen(port, function () {
    console.log("Fuzhou Pulse backend running at http://localhost:" + port);
});
