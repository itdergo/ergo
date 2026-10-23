import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
describe("api client", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    localStorage.clear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  it("adds Authorization header when token is set", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: "1" } })
    });
    vi.stubGlobal("fetch", mockFetch);
    localStorage.setItem("auth_token", "test-token-123");
    const { api } = await import("../api");
    await api.getMe();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["Authorization"]).toBe("Bearer test-token-123");
  });
  it("does not add Authorization header when token is not set", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] })
    });
    vi.stubGlobal("fetch", mockFetch);
    const { api } = await import("../api");
    await api.getCategories();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["Authorization"]).toBeUndefined();
  });
  it("includes Content-Type header", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({})
    });
    vi.stubGlobal("fetch", mockFetch);
    const { api } = await import("../api");
    await api.getCategories();
    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["Content-Type"]).toBe("application/json");
  });
});
