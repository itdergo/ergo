/**
 * Server entry point.
 *
 * Reads the PORT environment variable, starts the Express server, and
 * registers graceful shutdown handlers for SIGTERM and SIGINT.
 *
 * On shutdown:
 *   1. Stop accepting new connections (server.close)
 *   2. Close the Redis connection pool
 *   3. Force-exit after 10s if connections linger
 *
 * Environment variables:
 *   - PORT (required): the TCP port to listen on
 *
 * Exports: nothing — this module runs side effects on import.
 */

import app from "./app";
import { logger } from "./lib/logger";
import { closeRedis } from "./lib/redis";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

/**
 * Graceful shutdown handler.
 *
 * Stops the HTTP server, closes Redis, and exits.
 * A 10-second force-exit timer ensures the process doesn't hang indefinitely
 * if open connections prevent server.close from completing.
 */
async function shutdown(signal: string) {
  logger.info({ signal }, "Shutting down");
  server.close(async () => {
    await closeRedis();
    process.exit(0);
  });
  // Force-exit if connections linger after 10 seconds.
  setTimeout(() => process.exit(0), 10_000).unref();
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
