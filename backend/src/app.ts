/**
 * Express application factory.
 *
 * Wires together the full HTTP middleware stack (security headers, CORS,
 * request logging, rate limiting) and mounts all route routers under /api.
 * Also registers a 404 handler and a central error handler.
 *
 * This module does NOT start the server — see index.ts for the entry point.
 *
 * Middleware order matters:
 *   1. pino-http — request logging
 *   2. helmet — security headers
 *   3. CORS — allowlist-based cross-origin policy
 *   4. body parsers — JSON and urlencoded
 *   5. /api — rate limiter + route router
 *
 * Exports:
 *   - app (default): the configured Express application instance
 */

import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { apiLimiter } from "./middlewares/rateLimit";
import { validateCsrfToken } from "./middlewares/csrf";

const app: Express = express();

// Trust the first proxy hop (nginx/ingress in production) so that
// rate limiting sees the real client IP and X-Forwarded-Proto is honored.
app.set("trust proxy", 1);
// Remove the X-Powered-By header to avoid advertising the framework.
app.disable("x-powered-by");

// Request logging middleware — logs method, URL, status code, and latency.
// The serializers redact sensitive query parameters from the URL.
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Security headers — CSP, HSTS, X-Frame-Options, etc.
// These also help technical SEO and trust signals for the frontend.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        scriptSrc: ["'self'"],
        fontSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
      },
    },
  }),
);

// Permissions Policy — helmet v8 removed this, so we set it manually.
// Disables camera, microphone, and geolocation access for all clients.
app.use((_req, res, next) => {
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

// CORS — explicit allowlist. Same-origin and non-browser clients (no Origin
// header) are always allowed; anything else must be listed in CORS_ORIGINS.
// The CORS_ORIGINS env var is a comma-separated list of allowed origins.
const allowedOrigins = (
  process.env["CORS_ORIGINS"] ?? "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    // The origin callback is called for every request. If no Origin header is
    // present (same-origin or non-browser), or the origin is in the allowlist,
    // the request is allowed. Otherwise it's rejected.
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);

// Body parsers — JSON and url-encoded form data, limited to 1MB each.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// CSRF protection — validates X-CSRF-Token header on mutating routes.
// Safe methods (GET/HEAD/OPTIONS) are excluded.
app.use(validateCsrfToken);

// Global API rate limit — 600 requests per 15 minutes per IP.
// Per-route cache policy is applied inside the routers.
app.use("/api", apiLimiter, router);

// 404 handler — no route matched.
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

// Central error handler — must be last and take four arguments (err, req, res, next).
// Express only routes errors to handlers with 4 parameters.
app.use(
  (
    err: Error & { status?: number; statusCode?: number },
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    logger.error({ err }, "Unhandled error");
    // If headers have already been sent, we can't change the status code.
    if (res.headersSent) {
      next(err);
      return;
    }
    // Use a generic message for 5xx errors to avoid leaking internals.
    const status = err.status ?? err.statusCode ?? 500;
    res.status(status).json({
      error: status >= 500 ? "Internal server error" : err.message,
    });
  },
);

export default app;
