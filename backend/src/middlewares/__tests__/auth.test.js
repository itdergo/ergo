import { describe, it, expect, vi } from "vitest";
import { signToken } from "../../lib/auth";
import { requireAuth, requireRole } from "../auth";

function createReq(overrides = {}) {
  return {
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

describe("requireAuth", () => {
  it("rejects a request with no Authorization header", () => {
    const req = createReq();
    const res = createRes();
    const next = vi.fn();
    requireAuth(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Authentication required" });
  });

  it("rejects a non-Bearer Authorization header", () => {
    const req = createReq({ headers: { authorization: "Basic abc" } });
    const res = createRes();
    const next = vi.fn();
    requireAuth(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });

  it("rejects an invalid token", () => {
    const req = createReq({ headers: { authorization: "Bearer not-a-real-token" } });
    const res = createRes();
    const next = vi.fn();
    requireAuth(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Invalid or expired token" });
  });

  it("accepts a valid token and attaches the user", () => {
    const token = signToken({ id: "u1", email: "a@b.c", role: "admin", name: "A" });
    const req = createReq({ headers: { authorization: `Bearer ${token}` } });
    const res = createRes();
    const next = vi.fn();
    requireAuth(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toMatchObject({ id: "u1", role: "admin" });
    expect(res.statusCode).toBe(200);
  });

  it("accepts a token with surrounding whitespace", () => {
    const token = signToken({ id: "u1", email: "a@b.c", role: "viewer", name: "A" });
    const req = createReq({ headers: { authorization: `Bearer   ${token}  ` } });
    const res = createRes();
    const next = vi.fn();
    requireAuth(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(req.user.role).toBe("viewer");
  });
});

describe("requireRole", () => {
  it("rejects when no user is attached", () => {
    const req = createReq();
    const res = createRes();
    const next = vi.fn();
    requireRole("admin")(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Authentication required" });
  });

  it("allows a user with a permitted role", () => {
    const req = createReq({ user: { id: "u1", role: "admin" } });
    const res = createRes();
    const next = vi.fn();
    requireRole("admin")(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it("rejects a user without the required role", () => {
    const req = createReq({ user: { id: "u1", role: "viewer" } });
    const res = createRes();
    const next = vi.fn();
    requireRole("admin")(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Insufficient permissions" });
  });

  it("accepts any of multiple permitted roles", () => {
    const next = vi.fn();
    requireRole("admin", "staff")(
      createReq({ user: { id: "u1", role: "staff" } }),
      createRes(),
      next,
    );
    expect(next).toHaveBeenCalledOnce();
  });
});
