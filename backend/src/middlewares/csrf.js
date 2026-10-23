import { randomBytes } from "crypto";
const csrfTokens = /* @__PURE__ */ new Map();
function generateCsrfToken(userId) {
  const token = randomBytes(32).toString("hex");
  csrfTokens.set(token, userId);
  return token;
}
function removeCsrfToken(token) {
  csrfTokens.delete(token);
}
function validateCsrfToken(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }
  const token = req.headers["x-csrf-token"];
  if (!token) {
    res.status(403).json({ error: "CSRF token missing" });
    return;
  }
  const userId = csrfTokens.get(token);
  if (!userId) {
    res.status(403).json({ error: "Invalid CSRF token" });
    return;
  }
  if (req.user && req.user.id !== userId) {
    res.status(403).json({ error: "CSRF token mismatch" });
    return;
  }
  next();
}
export {
  generateCsrfToken,
  removeCsrfToken,
  validateCsrfToken
};
