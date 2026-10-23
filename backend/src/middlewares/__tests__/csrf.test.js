import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function createReq(overrides = {}) {
  return {
    method: "GET",
    headers: {},
    user: void 0,
    ...overrides,
  };
}

function createRes() {
  return {
    statusCode: 200,
    body: void 0,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

describe("csrf middleware", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Re-evaluate the module so its TTL/sweep are bound to the fake clock.
    vi.resetModules();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("generates a 64-char hex token", async () => {
    const { generateCsrfToken } = await import("../csrf");
    const token = generateCsrfToken("user-1");
    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it("skips validation for safe methods (GET/HEAD/OPTIONS)", async () => {
    const { validateCsrfToken } = await import("../csrf");
    for (const method of ["GET", "HEAD", "OPTIONS"]) {
      const req = createReq({ method });
      const res = createRes();
      const next = vi.fn();
      validateCsrfToken(req, res, next);
      expect(next).toHaveBeenCalledOnce();
      expect(res.statusCode).toBe(200);
    }
  });

  it("rejects a mutating request with no token", async () => {
    const { validateCsrfToken } = await import("../csrf");
    const req = createReq({ method: "POST" });
    const res = createRes();
    const next = vi.fn();
    validateCsrfToken(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "CSRF token missing" });
  });

  it("rejects a mutating request with an unknown token", async () => {
    const { validateCsrfToken } = await import("../csrf");
    const req = createReq({ method: "POST", headers: { "x-csrf-token": "deadbeef" } });
    const res = createRes();
    const next = vi.fn();
    validateCsrfToken(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Invalid or expired CSRF token" });
  });

  it("accepts a valid token and calls next()", async () => {
    const { generateCsrfToken, validateCsrfToken } = await import("../csrf");
    const token = generateCsrfToken("user-1");
    const req = createReq({ method: "POST", headers: { "x-csrf-token": token } });
    const res = createRes();
    const next = vi.fn();
    validateCsrfToken(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(res.statusCode).toBe(200);
  });

  it("rejects a token issued to a different user", async () => {
    const { generateCsrfToken, validateCsrfToken } = await import("../csrf");
    const token = generateCsrfToken("user-1");
    const req = createReq({
      method: "POST",
      headers: { "x-csrf-token": token },
      user: { id: "user-2" },
    });
    const res = createRes();
    const next = vi.fn();
    validateCsrfToken(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "CSRF token mismatch" });
  });

  it("accepts a valid token for the matching user", async () => {
    const { generateCsrfToken, validateCsrfToken } = await import("../csrf");
    const token = generateCsrfToken("user-1");
    const req = createReq({
      method: "POST",
      headers: { "x-csrf-token": token },
      user: { id: "user-1" },
    });
    const res = createRes();
    const next = vi.fn();
    validateCsrfToken(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it("rejects an expired token", async () => {
    const { generateCsrfToken, validateCsrfToken } = await import("../csrf");
    const token = generateCsrfToken("user-1");
    // Advance past the default 1h TTL.
    vi.advanceTimersByTime(60 * 60 * 1000 + 1);
    const req = createReq({ method: "POST", headers: { "x-csrf-token": token } });
    const res = createRes();
    const next = vi.fn();
    validateCsrfToken(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Invalid or expired CSRF token" });
  });

  it("removeCsrfToken invalidates a previously valid token", async () => {
    const { generateCsrfToken, removeCsrfToken, validateCsrfToken } = await import("../csrf");
    const token = generateCsrfToken("user-1");
    removeCsrfToken(token);
    const req = createReq({ method: "POST", headers: { "x-csrf-token": token } });
    const res = createRes();
    const next = vi.fn();
    validateCsrfToken(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
  });
});
