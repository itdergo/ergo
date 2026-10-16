import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  isLegacyHash,
  verifyLegacyPassword,
  type AuthUser,
} from "../auth";

describe("auth", () => {
  // ---------------------------------------------------------------------------
  // hashPassword
  // ---------------------------------------------------------------------------
  describe("hashPassword", () => {
    it("produces a hash with the correct scrypt format", async () => {
      const hash = await hashPassword("my-password");
      expect(hash).toMatch(/^scrypt\$16384\$8\$1\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/);
    });

    it("produces different hashes for the same password (random salt)", async () => {
      const hash1 = await hashPassword("my-password");
      const hash2 = await hashPassword("my-password");
      expect(hash1).not.toBe(hash2);
    });

    it("produces different hashes for different passwords", async () => {
      const hash1 = await hashPassword("password-one");
      const hash2 = await hashPassword("password-two");
      expect(hash1).not.toBe(hash2);
    });
  });

  // ---------------------------------------------------------------------------
  // verifyPassword
  // ---------------------------------------------------------------------------
  describe("verifyPassword", () => {
    it("returns true for the correct password", async () => {
      const hash = await hashPassword("correct-password");
      expect(await verifyPassword("correct-password", hash)).toBe(true);
    });

    it("returns false for a wrong password", async () => {
      const hash = await hashPassword("correct-password");
      expect(await verifyPassword("wrong-password", hash)).toBe(false);
    });

    it("returns false for an invalid hash format", async () => {
      expect(await verifyPassword("password", "invalid-hash")).toBe(false);
    });

    it("returns false for a hash with wrong number of parts", async () => {
      expect(await verifyPassword("password", "scrypt$16384$8$1$salt")).toBe(false);
    });

    it("returns false for an empty string", async () => {
      expect(await verifyPassword("password", "")).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // signToken / verifyToken
  // ---------------------------------------------------------------------------
  describe("signToken / verifyToken", () => {
    const testUser: AuthUser = {
      id: "user-123",
      email: "test@example.com",
      role: "admin",
      name: "Test User",
    };

    it("signs a token and verifies it back", () => {
      const token = signToken(testUser);
      const result = verifyToken(token);
      expect(result).not.toBeNull();
      expect(result!.id).toBe(testUser.id);
      expect(result!.email).toBe(testUser.email);
      expect(result!.role).toBe(testUser.role);
      expect(result!.name).toBe(testUser.name);
    });

    it("returns null for an invalid token", () => {
      expect(verifyToken("invalid-token")).toBeNull();
    });

    it("returns null for an empty token", () => {
      expect(verifyToken("")).toBeNull();
    });

    it("returns null for a token with a malformed payload", () => {
      // This is a structurally valid JWT but with a payload that doesn't match
      // what verifyToken expects (missing sub).
      const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
        "base64url",
      );
      const payload = Buffer.from(JSON.stringify({ foo: "bar" })).toString("base64url");
      const token = `${header}.${payload}.fakesig`;
      expect(verifyToken(token)).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // isLegacyHash
  // ---------------------------------------------------------------------------
  describe("isLegacyHash", () => {
    it("returns true for a 64-character hex string", () => {
      expect(isLegacyHash("a".repeat(64))).toBe(true);
    });

    it("returns true for an uppercase hex string", () => {
      expect(isLegacyHash("A".repeat(64))).toBe(true);
    });

    it("returns false for a scrypt hash", () => {
      expect(isLegacyHash("scrypt$16384$8$1$salt$hash")).toBe(false);
    });

    it("returns false for a non-hex string", () => {
      expect(isLegacyHash("not-a-hash")).toBe(false);
    });

    it("returns false for a 63-character hex string", () => {
      expect(isLegacyHash("a".repeat(63))).toBe(false);
    });

    it("returns false for a 65-character hex string", () => {
      expect(isLegacyHash("a".repeat(65))).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // verifyLegacyPassword
  // ---------------------------------------------------------------------------
  describe("verifyLegacyPassword", () => {
    it("returns true for the correct password", () => {
      const stored = createHash("sha256").update("password").digest("hex");
      expect(verifyLegacyPassword("password", stored)).toBe(true);
    });

    it("returns false for a wrong password", () => {
      const stored = createHash("sha256").update("password").digest("hex");
      expect(verifyLegacyPassword("wrong-password", stored)).toBe(false);
    });

    it("returns false for an empty stored hash", () => {
      expect(verifyLegacyPassword("password", "")).toBe(false);
    });
  });
});
