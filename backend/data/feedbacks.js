const { getDb } = require("./db");

function readFeedbacks() {
  try {
    const db = getDb();
    return db.prepare(
      "SELECT id, nickname, content, createdAt FROM feedbacks WHERE deleted = 0 ORDER BY id ASC"
    ).all();
  } catch (error) {
    console.warn("Failed to read feedbacks, using empty list.", error);
    return [];
  }
}

function writeFeedbacks(feedbacks) {
  try {
    const db = getDb();
    const safe = Array.isArray(feedbacks) ? feedbacks : [];
    const replaceAll = db.transaction(function (items) {
      db.prepare("DELETE FROM feedbacks").run();
      const insert = db.prepare(
        "INSERT INTO feedbacks (id, nickname, content, createdAt, deleted) VALUES (?, ?, ?, ?, 0)"
      );
      for (const fb of items) {
        insert.run(fb.id, fb.nickname, fb.content, fb.createdAt);
      }
    });
    replaceAll(safe);
  } catch (error) {
    console.error("Failed to write feedbacks.", error);
  }
}

function addFeedback(feedback) {
  const db = getDb();
  db.prepare(
    "INSERT INTO feedbacks (id, nickname, content, createdAt, deleted) VALUES (?, ?, ?, ?, 0)"
  ).run(feedback.id, feedback.nickname, feedback.content, feedback.createdAt);
  return feedback;
}

module.exports = {
  readFeedbacks,
  writeFeedbacks,
  addFeedback
};
