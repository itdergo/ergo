import { createClient } from "redis";
import { logger } from "./logger";
const REDIS_URL = process.env["REDIS_URL"];
const redisEnabled = Boolean(REDIS_URL);
let client = null;
let connecting = null;
async function getClient() {
  if (!REDIS_URL) return null;
  if (client?.isOpen) return client;
  if (connecting) return connecting;
  connecting = (async () => {
    try {
      const c = createClient({ url: REDIS_URL });
      c.on("error", (err) => logger.warn({ err }, "Redis client error"));
      await c.connect();
      client = c;
      logger.info("Redis connected");
      return client;
    } catch (err) {
      logger.warn({ err }, "Redis unavailable \u2014 running without cache");
      return null;
    } finally {
      connecting = null;
    }
  })();
  return connecting;
}
async function cacheGet(key) {
  const c = await getClient();
  if (!c) return null;
  try {
    const raw = await c.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    logger.warn({ err, key }, "cacheGet failed");
    return null;
  }
}
async function cacheSet(key, value, ttlSeconds = 60) {
  const c = await getClient();
  if (!c) return;
  try {
    await c.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (err) {
    logger.warn({ err, key }, "cacheSet failed");
  }
}
async function cacheDel(pattern) {
  const c = await getClient();
  if (!c) return;
  try {
    const keys = await c.keys(pattern);
    if (keys.length) await c.del(keys);
  } catch (err) {
    logger.warn({ err, pattern }, "cacheDel failed");
  }
}
async function cacheAside(key, ttlSeconds, fn) {
  const cached = await cacheGet(key);
  if (cached !== null) return cached;
  const fresh = await fn();
  await cacheSet(key, fresh, ttlSeconds);
  return fresh;
}
async function closeRedis() {
  if (client?.isOpen) {
    await client.quit();
    client = null;
  }
}
export { cacheAside, cacheDel, cacheGet, cacheSet, closeRedis, redisEnabled };
