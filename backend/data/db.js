const path = require("path");
const fs = require("fs");
let Database;

try {
  Database = require("better-sqlite3");
} catch (e) {
  console.error("better-sqlite3 is required. Run: npm install better-sqlite3");
  process.exit(1);
}

const isTest = process.env.NODE_ENV === "test";
const DB_PATH = isTest ? ":memory:" : path.join(__dirname, "fuzhou-pulse.db");

let db = null;

function getDb() {
  if (db) return db;
  db = new Database(DB_PATH);
  if (!isTest) db.pragma("journal_mode = WAL");
  initializeTables();
  return db;
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

function initializeTables() {
  const conn = db;
  conn.exec(`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id INTEGER PRIMARY KEY,
      nickname TEXT NOT NULL DEFAULT '游客',
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      createdAt TEXT NOT NULL
    );
  `);
}

function migrateFromJson() {
  if (isTest) return;
  const conn = getDb();
  const count = conn.prepare("SELECT COUNT(*) as cnt FROM feedbacks").get();
  if (count.cnt > 0) return;

  const jsonPath = path.join(__dirname, "feedbacks.json");
  if (!fs.existsSync(jsonPath)) return;

  try {
    const raw = fs.readFileSync(jsonPath, "utf8");
    const parsed = JSON.parse(raw);
    const feedbacks = parsed.feedbacks || [];
    if (feedbacks.length === 0) return;

    const insert = conn.prepare(
      "INSERT OR IGNORE INTO feedbacks (id, nickname, content, createdAt, deleted) VALUES (?, ?, ?, ?, 0)"
    );
    const migrate = conn.transaction(function (items) {
      for (const fb of items) {
        insert.run(fb.id, fb.nickname, fb.content, fb.createdAt);
      }
    });
    migrate(feedbacks);
    console.log("Migrated " + feedbacks.length + " feedbacks from JSON to SQLite.");
  } catch (e) {
    console.warn("JSON migration skipped:", e.message);
  }
}

function seedAdminUser() {
  const bcrypt = require("bcryptjs");
  const conn = getDb();
  const existing = conn.prepare("SELECT id FROM users WHERE username = ?").get("admin");
  if (!existing) {
    const password = process.env.ADMIN_PASSWORD || "admin123";
    const hash = bcrypt.hashSync(password, 10);
    conn.prepare(
      "INSERT INTO users (username, password, role, createdAt) VALUES (?, ?, ?, ?)"
    ).run("admin", hash, "admin", new Date().toISOString());
    console.log("Default admin user seeded (username: admin).");
  }
}

module.exports = { getDb, closeDb, initializeTables, migrateFromJson, seedAdminUser };
