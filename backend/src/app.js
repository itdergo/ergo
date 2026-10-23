import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { apiLimiter } from "./middlewares/rateLimit";
import { validateCsrfToken } from "./middlewares/csrf";
const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0]
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode
        };
      }
    }
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:"],
        scriptSrc: ["'self'"],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
        connectSrc: ["'self'"]
      }
    }
  })
);
app.use((_req, res, next) => {
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});
const allowedOrigins = (process.env["CORS_ORIGINS"] ?? "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000").split(",").map((s) => s.trim()).filter(Boolean);
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
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(validateCsrfToken);
app.use("/api", apiLimiter, router);
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});
app.use(
  (err, _req, res, next) => {
    logger.error({ err }, "Unhandled error");
    if (res.headersSent) {
      next(err);
      return;
    }
    const status = err.status ?? err.statusCode ?? 500;
    res.status(status).json({
      error: status >= 500 ? "Internal server error" : err.message
    });
  }
);
var stdin_default = app;
export {
  stdin_default as default
};
