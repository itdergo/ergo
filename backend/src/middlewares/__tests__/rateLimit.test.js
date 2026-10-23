import { describe, it, expect, vi, beforeEach } from "vitest";
function createMockReq(ip = "127.0.0.1") {
  const req = {
    ip,
    method: "GET",
    headers: {},
    socket: { remoteAddress: ip },
    connection: { remoteAddress: ip },
    // express-rate-limit calls req.app.get("trust proxy") during validation
    app: {
      get: (key) => key === "trust proxy" ? false : void 0,
      set: vi.fn()
    }
  };
  return req;
}
function createMockRes() {
  const listeners = {};
  const res = {
    statusCode: 200,
    finished: false,
    headers: {},
    body: void 0,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    getHeader(name) {
      return this.headers[name];
    },
    removeHeader(name) {
      delete this.headers[name];
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      this.finished = true;
      return this;
    },
    send(data) {
      this.body = data;
      this.finished = true;
      return this;
    },
    end() {
      this.finished = true;
      return this;
    },
    // EventEmitter-like methods that express-rate-limit relies on
    once(event, callback) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(callback);
    },
    on(event, callback) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(callback);
    },
    off(event) {
      delete listeners[event];
    },
    emit(event, ...args) {
      if (listeners[event]) {
        listeners[event].forEach((cb) => cb(...args));
      }
    },
    writeHead: vi.fn(() => res),
    setTimeout: vi.fn()
  };
  return res;
}
function createMockNext() {
  return vi.fn();
}
describe("rate limiting", () => {
  beforeEach(() => {
    vi.resetModules();
  });
  describe("publicWriteLimiter", () => {
    it("allows requests under the limit", async () => {
      const { publicWriteLimiter } = await import("../rateLimit");
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();
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
      for (let i = 0; i < 5; i++) {
        await publicWriteLimiter(req1, res1, next);
        await publicWriteLimiter(req2, res2, next);
      }
      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);
      await publicWriteLimiter(req1, res1, next);
      expect(res1.statusCode).toBe(429);
      await publicWriteLimiter(req2, res2, next);
      expect(res2.statusCode).toBe(429);
    });
  });
  describe("authLimiter", () => {
    it("allows requests under the limit", async () => {
      const { authLimiter } = await import("../rateLimit");
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();
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
      for (let i = 0; i < 11; i++) {
        await authLimiter(req, res, next);
      }
      expect(res.statusCode).toBe(429);
    });
  });
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
