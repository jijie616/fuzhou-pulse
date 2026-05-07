const request = require("supertest");
const app = require("../app");

describe("GET /api/health", function () {
  it("should return ok", async function () {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.message).toContain("Fuzhou Pulse");
  });
});

describe("GET /api/featured-cards", function () {
  it("should return cards array with count", async function () {
    const res = await request(app).get("/api/featured-cards");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBe(res.body.data.length);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("each card should have required fields", async function () {
    const res = await request(app).get("/api/featured-cards");
    res.body.data.forEach(function (card) {
      expect(card).toHaveProperty("id");
      expect(card).toHaveProperty("title");
      expect(card).toHaveProperty("category");
      expect(card).toHaveProperty("image");
    });
  });
});

describe("GET /api/routes", function () {
  it("should return routes array with count", async function () {
    const res = await request(app).get("/api/routes");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("each route should have required fields", async function () {
    const res = await request(app).get("/api/routes");
    res.body.data.forEach(function (route) {
      expect(route).toHaveProperty("id");
      expect(route).toHaveProperty("title");
      expect(route).toHaveProperty("stops");
      expect(Array.isArray(route.stops)).toBe(true);
    });
  });
});

describe("GET /api/status", function () {
  it("should return status info", async function () {
    const res = await request(app).get("/api/status");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.name).toBe("Fuzhou Pulse");
    expect(res.body).toHaveProperty("cardsCount");
    expect(res.body).toHaveProperty("routesCount");
    expect(res.body).toHaveProperty("feedbacksCount");
    expect(res.body).toHaveProperty("aiProvider");
    expect(res.body).toHaveProperty("uptime");
  });
});

describe("POST /api/feedbacks", function () {
  it("should reject empty content", async function () {
    const res = await request(app)
      .post("/api/feedbacks")
      .send({ nickname: "tester", content: "" });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  it("should reject content over 200 chars", async function () {
    const res = await request(app)
      .post("/api/feedbacks")
      .send({ nickname: "tester", content: "a".repeat(201) });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("200");
  });

  it("should accept valid feedback", async function () {
    const res = await request(app)
      .post("/api/feedbacks")
      .send({ nickname: "tester", content: "测试留言内容" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.nickname).toBe("tester");
    expect(res.body.data.content).toBe("测试留言内容");
  });

  it("should default empty nickname to 游客", async function () {
    const res = await request(app)
      .post("/api/feedbacks")
      .send({ content: "匿名留言" });
    expect(res.status).toBe(200);
    expect(res.body.data.nickname).toBe("游客");
  });
});

describe("GET /api/feedbacks", function () {
  it("should return feedbacks array", async function () {
    const res = await request(app).get("/api/feedbacks");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBe(res.body.data.length);
  });
});

describe("POST /api/ai/trip-plan", function () {
  jest.setTimeout(15000);

  it("should generate mock trip plan without API key", async function () {
    const res = await request(app)
      .post("/api/ai/trip-plan")
      .send({ days: 1, interest: "美食", pace: "轻松", userPreference: "" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveProperty("title");
    expect(res.body.data).toHaveProperty("plan");
    expect(res.body.data).toHaveProperty("isMock");
  });

  it("should reject days > 3", async function () {
    const res = await request(app)
      .post("/api/ai/trip-plan")
      .send({ days: 4 });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  it("should default missing fields", async function () {
    const res = await request(app)
      .post("/api/ai/trip-plan")
      .send({});
    expect([200, 429]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.ok).toBe(true);
      expect(res.body.data.days).toBe(1);
      expect(res.body.data.interest).toBe("综合");
    } else {
      // Rate limited — acceptable
      expect(res.body.ok).toBe(false);
    }
  });
});

describe("GET /api/unknown", function () {
  it("should return 404 for unknown API routes", async function () {
    const res = await request(app).get("/api/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
  });
});
