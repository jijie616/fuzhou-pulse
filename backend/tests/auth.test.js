const request = require("supertest");
const app = require("../app");
const { getDb } = require("../data/db");

beforeEach(function () {
  const db = getDb();
  db.prepare("DELETE FROM users").run();
  db.prepare("DELETE FROM feedbacks").run();
});

describe("POST /api/auth/register", function () {
  it("should register a new user", async function () {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "testuser", password: "test123456" });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.username).toBe("testuser");
    expect(res.body.data.role).toBe("user");
  });

  it("should reject short username", async function () {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "ab", password: "test123456" });
    expect(res.status).toBe(400);
  });

  it("should reject short password", async function () {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "validuser", password: "12345" });
    expect(res.status).toBe(400);
  });

  it("should reject duplicate username", async function () {
    await request(app)
      .post("/api/auth/register")
      .send({ username: "dupe", password: "test123456" });
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "dupe", password: "test123456" });
    expect(res.status).toBe(409);
  });
});

describe("POST /api/auth/login", function () {
  beforeEach(async function () {
    await request(app)
      .post("/api/auth/register")
      .send({ username: "loginuser", password: "pass123456" });
  });

  it("should login with correct credentials", async function () {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "loginuser", password: "pass123456" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.username).toBe("loginuser");
  });

  it("should reject wrong password", async function () {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "loginuser", password: "wrongpassword" });
    expect(res.status).toBe(401);
  });

  it("should reject nonexistent user", async function () {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "nobody", password: "pass123456" });
    expect(res.status).toBe(401);
  });

  it("should reject empty credentials", async function () {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "", password: "" });
    expect(res.status).toBe(400);
  });
});
