const express = require("express");
const cors = require("cors");
const featuredCards = require("./data/featuredCards");
const routePlans = require("./data/routePlans");

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

app.listen(port, function () {
    console.log("Fuzhou Pulse backend running at http://localhost:" + port);
});
