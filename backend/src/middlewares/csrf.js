import { randomBytes } from "crypto";

// CSRF tokens are stored in-process with a TTL. They are intentionally NOT
// tied to the JWT (which lives in the browser): the token proves the request
// came from a page this server handed a token to. Tokens expire after
// CSRF_TOKEN_TTL_MS and a periodic sweep evicts stale entries so the Map does
// not grow unbounded across restarts.
const CSRF_TOKEN_TTL_MS = Number(process.env["CSRF_TOKEN_TTL_MS"]) || 60 * 60 * 1e3;
const csrfTokens = /* @__PURE__ */ new Map();

function generateCsrfToken(userId) {
  const token = randomBytes(32).toString("hex");
  csrfTokens.set(token, { userId, expiresAt: Date.now() + CSRF_TOKEN_TTL_MS });
  return token;
}

function removeCsrfToken(token) {
  csrfTokens.delete(token);
}

function evictExpiredTokens(now = Date.now()) {
  for (const [token, entry] of csrfTokens) {
    if (entry.expiresAt <= now) csrfTokens.delete(token);
  }
}

// Run a sweep every TTL/2, unref'd so it never keeps the process alive.
const sweep = setInterval(() => evictExpiredTokens(), CSRF_TOKEN_TTL_MS / 2);
sweep.unref?.();

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
  const entry = csrfTokens.get(token);
  if (!entry || entry.expiresAt <= Date.now()) {
    if (entry) csrfTokens.delete(token);
    res.status(403).json({ error: "Invalid or expired CSRF token" });
    return;
  }
  if (req.user && req.user.id !== entry.userId) {
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
