/**
 * Pino logger instance.
 *
 * Configures structured JSON logging with pino. In production, logs are
 * emitted as JSON (suitable for log aggregation). In development, logs are
 * pretty-printed with colors via pino-pretty.
 *
 * Sensitive headers (authorization, cookie, set-cookie) are automatically
 * redacted from all log output.
 *
 * Environment variables:
 *   - LOG_LEVEL (optional): defaults to "info"
 *
 * Exports:
 *   - logger: the configured pino logger instance
 */

import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  // Redact sensitive headers from all HTTP request/response logs.
  redact: ["req.headers.authorization", "req.headers.cookie", "res.headers['set-cookie']"],
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }),
});
