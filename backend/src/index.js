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
async function shutdown(signal) {
  logger.info({ signal }, "Shutting down");
  server.close(async () => {
    await closeRedis();
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 1e4).unref();
}
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
