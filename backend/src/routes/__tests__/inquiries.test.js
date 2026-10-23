import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock only the `db` client; keep the real drizzle-zod schemas so validation is
// exercised for real. The real database module still loads (a dummy
// DATABASE_URL is set in vitest.config.js) so the schema exports are genuine.
const mocks = vi.hoisted(() => {
  const countWhere = { where: vi.fn().mockResolvedValue([{ count: 1 }]) };
  const countFrom = { from: vi.fn().mockReturnValue(countWhere) };
  return {
    insert: vi.fn(),
    productsFindMany: vi.fn().mockResolvedValue([{ id: "p1", name: "Ergo Chair" }]),
    productsCount: vi.fn().mockReturnValue(countFrom),
  };
});

vi.mock("@ergo/database", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    db: {
      insert: mocks.insert,
      query: {
        inquiries: { findMany: vi.fn(), findFirst: vi.fn() },
        products: { findMany: mocks.productsFindMany, findFirst: vi.fn() },
      },
      update: vi.fn(),
      delete: vi.fn(),
      select: mocks.productsCount,
    },
  };
});

import request from "supertest";
import app from "../../app";
import { generateCsrfToken } from "../../middlewares/csrf";

const validBody = {
  name: "Jane Doe",
  email: "jane@example.com",
  company: "Acme Corp",
  phone: "+63 917 000 0000",
  source: "website",
  message: "We need 200 ergonomic chairs for our HQ.",
};

describe("POST /api/inquiries (public write)", () => {
  let csrfToken;
  beforeEach(() => {
    csrfToken = generateCsrfToken("user-1");
    mocks.insert.mockReset();
    mocks.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "inq-1" }]),
      }),
    });
  });

  it("rejects a request with no CSRF token", async () => {
    const res = await request(app).post("/api/inquiries").send(validBody);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("CSRF token missing");
  });

  it("rejects invalid input with 400 and structured details", async () => {
    const res = await request(app)
      .post("/api/inquiries")
      .set("x-csrf-token", csrfToken)
      .send({ email: "not-an-email" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it("accepts a valid inquiry and returns 201", async () => {
    const res = await request(app)
      .post("/api/inquiries")
      .set("x-csrf-token", csrfToken)
      .send(validBody);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ message: "Inquiry submitted successfully", id: "inq-1" });
    expect(mocks.insert).toHaveBeenCalledOnce();
  });

  it("does not persist an inquiry when validation fails", async () => {
    await request(app).post("/api/inquiries").set("x-csrf-token", csrfToken).send({ email: "bad" });
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});

describe("GET /api/products (public read)", () => {
  it("returns the paginated product envelope with a public cache header", async () => {
    const res = await request(app).get("/api/products?status=active");
    expect(res.status).toBe(200);
    expect(res.headers["cache-control"]).toContain("public");
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("total");
    expect(res.body.data).toEqual([{ id: "p1", name: "Ergo Chair" }]);
  });

  it("returns 404 for an unknown API route", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Not found" });
  });
});
