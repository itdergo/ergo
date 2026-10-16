import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Hoisted mock state — vi.hoisted ensures these are available inside vi.mock
// ---------------------------------------------------------------------------
const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  keys: vi.fn(),
  quit: vi.fn(),
  connect: vi.fn(),
  on: vi.fn(),
}));

vi.mock("redis", () => ({
  createClient: vi.fn(() => ({
    get: mocks.get,
    set: mocks.set,
    del: mocks.del,
    keys: mocks.keys,
    quit: mocks.quit,
    connect: mocks.connect,
    on: mocks.on,
    isOpen: true,
  })),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("redis cache", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // cacheGet
  // -------------------------------------------------------------------------
  describe("cacheGet", () => {
    it("returns parsed value on cache hit", async () => {
      mocks.get.mockResolvedValue(JSON.stringify({ id: 1, name: "Test" }));
      const { cacheGet } = await import("../redis");
      const result = await cacheGet<{ id: number; name: string }>("test-key");
      expect(result).toEqual({ id: 1, name: "Test" });
    });

    it("returns null on cache miss", async () => {
      mocks.get.mockResolvedValue(null);
      const { cacheGet } = await import("../redis");
      const result = await cacheGet("test-key");
      expect(result).toBeNull();
    });

    it("returns null on Redis error", async () => {
      mocks.get.mockRejectedValue(new Error("Redis connection lost"));
      const { cacheGet } = await import("../redis");
      const result = await cacheGet("test-key");
      expect(result).toBeNull();
    });

    it("returns null when cached value is not valid JSON", async () => {
      mocks.get.mockResolvedValue("not-json{{{");
      const { cacheGet } = await import("../redis");
      const result = await cacheGet("test-key");
      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // cacheSet
  // -------------------------------------------------------------------------
  describe("cacheSet", () => {
    it("stores value with TTL", async () => {
      mocks.set.mockResolvedValue("OK");
      const { cacheSet } = await import("../redis");
      await cacheSet("test-key", { id: 1 }, 120);
      expect(mocks.set).toHaveBeenCalledWith("test-key", JSON.stringify({ id: 1 }), {
        EX: 120,
      });
    });

    it("uses default TTL of 60 seconds", async () => {
      mocks.set.mockResolvedValue("OK");
      const { cacheSet } = await import("../redis");
      await cacheSet("test-key", { id: 1 });
      expect(mocks.set).toHaveBeenCalledWith("test-key", JSON.stringify({ id: 1 }), {
        EX: 60,
      });
    });

    it("does not throw on Redis error", async () => {
      mocks.set.mockRejectedValue(new Error("Redis error"));
      const { cacheSet } = await import("../redis");
      await expect(cacheSet("test-key", { id: 1 })).resolves.toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // cacheDel
  // -------------------------------------------------------------------------
  describe("cacheDel", () => {
    it("deletes matching keys", async () => {
      mocks.keys.mockResolvedValue(["key1", "key2"]);
      mocks.del.mockResolvedValue(2);
      const { cacheDel } = await import("../redis");
      await cacheDel("test:*");
      expect(mocks.keys).toHaveBeenCalledWith("test:*");
      expect(mocks.del).toHaveBeenCalledWith(["key1", "key2"]);
    });

    it("does nothing when no keys match", async () => {
      mocks.keys.mockResolvedValue([]);
      const { cacheDel } = await import("../redis");
      await cacheDel("test:*");
      expect(mocks.del).not.toHaveBeenCalled();
    });

    it("does not throw on Redis error", async () => {
      mocks.keys.mockRejectedValue(new Error("Redis error"));
      const { cacheDel } = await import("../redis");
      await expect(cacheDel("test:*")).resolves.toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // cacheAside
  // -------------------------------------------------------------------------
  describe("cacheAside", () => {
    it("returns cached value when present", async () => {
      mocks.get.mockResolvedValue(JSON.stringify({ id: 1, cached: true }));
      const { cacheAside } = await import("../redis");
      const fn = vi.fn().mockResolvedValue({ id: 1, cached: false });
      const result = await cacheAside("test-key", 60, fn);
      expect(result).toEqual({ id: 1, cached: true });
      expect(fn).not.toHaveBeenCalled();
      expect(mocks.set).not.toHaveBeenCalled();
    });

    it("calls fn and caches result on miss", async () => {
      mocks.get.mockResolvedValue(null);
      mocks.set.mockResolvedValue("OK");
      const { cacheAside } = await import("../redis");
      const freshData = { id: 2, cached: false };
      const fn = vi.fn().mockResolvedValue(freshData);
      const result = await cacheAside("test-key", 120, fn);
      expect(result).toEqual(freshData);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(mocks.set).toHaveBeenCalledWith("test-key", JSON.stringify(freshData), { EX: 120 });
    });
  });

  // -------------------------------------------------------------------------
  // redisEnabled
  // -------------------------------------------------------------------------
  describe("redisEnabled", () => {
    it("is true when REDIS_URL is set", async () => {
      const { redisEnabled } = await import("../redis");
      expect(redisEnabled).toBe(true);
    });
  });
});
