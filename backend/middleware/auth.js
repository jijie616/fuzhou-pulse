const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fuzhou-pulse-dev-secret";
const JWT_EXPIRY = "24h";

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({ ok: false, message: "请先登录" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: "登录已过期，请重新登录" });
  }
}

module.exports = { authMiddleware, JWT_SECRET, JWT_EXPIRY };
