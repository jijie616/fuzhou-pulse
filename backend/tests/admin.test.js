const request = require("supertest");
const app = require("../app");
const { getDb } = require("../data/db");

let adminToken;

beforeAll(async function () {
  // Register a unique user and get token
  const res = await request(app)
    .post("/api/auth/register")
    .send({ username: "admintest_" + Date.now(), password: "adminpass123" });
  adminToken = res.body.data.token;

  // Seed some feedbacks for testing
  const db = getDb();
  const insert = db.prepare(
    "INSERT INTO feedbacks (id, nickname, content, createdAt, deleted) VALUES (?, ?, ?, ?, 0)"
  );
  insert.run(Date.now(), "test1", "feedback one", new Date().toISOString());
  insert.run(Date.now() + 1, "test2", "feedback two", new Date().toISOString());
});

afterAll(function () {
  const db = getDb();
  db.prepare("DELETE FROM feedbacks").run();
  db.prepare("DELETE FROM users").run();
});

describe("GET /api/admin/feedbacks", function () {
  it("should reject without token", async function () {
    const res = await request(app).get("/api/admin/feedbacks");
    expect(res.status).toBe(401);
  });

  it("should return feedbacks with valid token", async function () {
    const res = await request(app)
      .get("/api/admin/feedbacks")
      .set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });
});

describe("DELETE /api/admin/feedbacks/:id", function () {
  it("should reject without token", async function () {
    const res = await request(app).delete("/api/admin/feedbacks/123");
    expect(res.status).toBe(401);
  });

  it("should soft-delete a feedback", async function () {
    const db = getDb();
    const fb = db.prepare("SELECT id FROM feedbacks WHERE deleted = 0 LIMIT 1").get();

    const res = await request(app)
      .delete("/api/admin/feedbacks/" + fb.id)
      .set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.message).toContain("已删除");

    const check = db.prepare("SELECT deleted FROM feedbacks WHERE id = ?").get(fb.id);
    expect(check.deleted).toBe(1);
  });

  it("should return 404 for nonexistent id", async function () {
    const res = await request(app)
      .delete("/api/admin/feedbacks/99999999")
      .set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(404);
  });
});

describe("GET /api/admin/stats", function () {
  it("should reject without token", async function () {
    const res = await request(app).get("/api/admin/stats");
    expect(res.status).toBe(401);
  });

  it("should return stats with valid token", async function () {
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveProperty("totalFeedbacks");
    expect(res.body.data).toHaveProperty("activeFeedbacks");
    expect(res.body.data).toHaveProperty("deletedFeedbacks");
    expect(Array.isArray(res.body.data.recentFeedbacks)).toBe(true);
  });
});
