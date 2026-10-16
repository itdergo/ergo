import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextFunction } from "express";

// ---------------------------------------------------------------------------
// Mock helpers — express-rate-limit v8 needs a fairly complete req/res surface
// ---------------------------------------------------------------------------
function createMockReq(ip = "127.0.0.1") {
  const req: any = {
    ip,
    method: "GET",
    headers: {},
    socket: { remoteAddress: ip },
    connection: { remoteAddress: ip },
    // express-rate-limit calls req.app.get("trust proxy") during validation
    app: {
      get: (key: string) => (key === "trust proxy" ? false : undefined),
      set: vi.fn(),
    },
  };
  return req;
}

function createMockRes() {
  // Internal event listener store so res.once / res.on actually work
  const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};

  const res: any = {
    statusCode: 200,
    finished: false,
    headers: {} as Record<string, any>,
    body: undefined as any,
    setHeader(name: string, value: any) {
      this.headers[name] = value;
    },
    getHeader(name: string) {
      return this.headers[name];
    },
    removeHeader(name: string) {
      delete this.headers[name];
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.body = data;
      this.finished = true;
      return this;
    },
    send(data: any) {
      this.body = data;
      this.finished = true;
      return this;
    },
    end() {
      this.finished = true;
      return this;
    },
    // EventEmitter-like methods that express-rate-limit relies on
    once(event: string, callback: (...args: unknown[]) => void) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(callback);
    },
    on(event: string, callback: (...args: unknown[]) => void) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(callback);
    },
    off(event: string) {
      delete listeners[event];
    },
    emit(event: string, ...args: any[]) {
      if (listeners[event]) {
        listeners[event].forEach((cb) => cb(...args));
      }
    },
    writeHead: vi.fn(() => res),
    setTimeout: vi.fn(),
  };
  return res;
}

function createMockNext(): NextFunction {
  return vi.fn() as any;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("rate limiting", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  // -------------------------------------------------------------------------
  // publicWriteLimiter (limit: 5 per 10 min)
  // -------------------------------------------------------------------------
  describe("publicWriteLimiter", () => {
    it("allows requests under the limit", async () => {
      const { publicWriteLimiter } = await import("../rateLimit");
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      // Make 5 requests (the limit) — await each because middleware is async
      for (let i = 0; i < 5; i++) {
        await publicWriteLimiter(req, res, next);
      }

      expect(next).toHaveBeenCalledTimes(5);
      expect(res.statusCode).toBe(200);
    });

    it("returns 429 when over the limit", async () => {
      const { publicWriteLimiter } = await import("../rateLimit");
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      // Make 6 requests (one over the limit)
      for (let i = 0; i < 6; i++) {
        await publicWriteLimiter(req, res, next);
      }

      expect(res.statusCode).toBe(429);
    });

    it("tracks different IPs independently", async () => {
      const { publicWriteLimiter } = await import("../rateLimit");
      const req1 = createMockReq("192.168.1.1");
      const req2 = createMockReq("192.168.1.2");
      const res1 = createMockRes();
      const res2 = createMockRes();
      const next = createMockNext();

      // Make 5 requests from each IP (both at the limit)
      for (let i = 0; i < 5; i++) {
        await publicWriteLimiter(req1, res1, next);
        await publicWriteLimiter(req2, res2, next);
      }

      // Both should still be at 200
      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);

      // One more from req1 should be rate limited (6th request)
      await publicWriteLimiter(req1, res1, next);
      expect(res1.statusCode).toBe(429);

      // req2 is also at the limit, so its 6th request is rate limited too
      await publicWriteLimiter(req2, res2, next);
      expect(res2.statusCode).toBe(429);
    });
  });

  // -------------------------------------------------------------------------
  // authLimiter (limit: 10 per 15 min, skipSuccessfulRequests: true)
  // -------------------------------------------------------------------------
  describe("authLimiter", () => {
    it("allows requests under the limit", async () => {
      const { authLimiter } = await import("../rateLimit");
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      // Make 10 requests (the limit)
      for (let i = 0; i < 10; i++) {
        await authLimiter(req, res, next);
      }

      expect(next).toHaveBeenCalledTimes(10);
      expect(res.statusCode).toBe(200);
    });

    it("returns 429 when over the limit", async () => {
      const { authLimiter } = await import("../rateLimit");
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      // Make 11 requests (one over the limit)
      for (let i = 0; i < 11; i++) {
        await authLimiter(req, res, next);
      }

      expect(res.statusCode).toBe(429);
    });
  });

  // -------------------------------------------------------------------------
  // apiLimiter (limit: 600 per 15 min)
  // -------------------------------------------------------------------------
  describe("apiLimiter", () => {
    it("allows a small number of requests", async () => {
      const { apiLimiter } = await import("../rateLimit");
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      for (let i = 0; i < 10; i++) {
        await apiLimiter(req, res, next);
      }

      expect(next).toHaveBeenCalledTimes(10);
      expect(res.statusCode).toBe(200);
    });
  });
});
