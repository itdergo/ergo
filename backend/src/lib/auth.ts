/**
 * Authentication and password hashing library.
 *
 * Provides two independent auth mechanisms:
 *
 * 1. Password hashing (scrypt):
 *    - hashPassword() creates a salted scrypt hash
 *    - verifyPassword() checks a password against a stored scrypt hash
 *    - Legacy SHA-256 hashes are detected and transparently migrated to scrypt
 *
 * 2. JWT token signing and verification:
 *    - signToken() creates a signed JWT for an authenticated user
 *    - verifyToken() validates a JWT and returns the user info
 *
 * Environment variables:
 *   - JWT_SECRET (required): the HMAC secret used to sign/verify tokens
 *   - JWT_TTL (optional): token time-to-live, defaults to "8h"
 *
 * Exports:
 *   - hashPassword, verifyPassword (scrypt password hashing)
 *   - isLegacyHash, verifyLegacyPassword (legacy SHA-256 migration)
 *   - signToken, verifyToken (JWT)
 *   - AuthUser interface (the authenticated user shape attached to req.user)
 */

import { scrypt, randomBytes, timingSafeEqual, createHash, type ScryptOptions } from "node:crypto";
import jwt, { type SignOptions, type JwtPayload } from "jsonwebtoken";
import { logger } from "./logger";

/**
 * scrypt parameters — N=16384, r=8, p=1 is the OWASP-recommended minimum
 * for password hashing. The maxmem option raises Node's internal memory
 * limit to accommodate scrypt's memory-hard requirements.
 *
 * Format of stored hashes: scrypt$N$r$p$<salt-b64>$<hash-b64>
 */
const SCRYPT_PARAMS: ScryptOptions = {
  N: 16384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
};
const KEY_LEN = 64;

/**
 * Promise wrapper around node:crypto scrypt callback API.
 *
 * @param password - the plaintext password
 * @param salt - random salt bytes
 * @param keylen - desired output length in bytes
 * @param opts - scrypt cost parameters
 * @returns the derived key as a Buffer
 */
function scryptAsync(
  password: string,
  salt: Buffer,
  keylen: number,
  opts: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, opts, (err, derived) => {
      if (err) reject(err);
      else resolve(derived as Buffer);
    });
  });
}

/**
 * Hash a password using scrypt with a random 16-byte salt.
 *
 * @param password - the plaintext password
 * @returns a string in format "scrypt$N$r$p$<salt-b64>$<hash-b64>"
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, KEY_LEN, SCRYPT_PARAMS);
  const { N, r, p } = SCRYPT_PARAMS;
  return `scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${derived.toString("base64")}`;
}

/**
 * Verify a password against a stored scrypt hash.
 *
 * Extracts the salt and parameters from the stored hash string,
 * recomputes the scrypt hash, and performs a timing-safe comparison.
 *
 * @param password - the plaintext password to check
 * @param stored - the stored hash string
 * @returns true if the password matches, false otherwise
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const parts = stored.split("$");
    if (parts.length !== 6 || parts[0] !== "scrypt") return false;
    const [, n, r, p, saltB64, hashB64] = parts;
    const salt = Buffer.from(saltB64, "base64");
    const expected = Buffer.from(hashB64, "base64");
    if (salt.length === 0 || expected.length === 0) return false;

    const derived = await scryptAsync(password, salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: SCRYPT_PARAMS.maxmem,
    });

    // timingSafeEqual prevents timing attacks by comparing in constant time.
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/**
 * Legacy migration helpers — the original code stored unsalted sha256 hex.
 * Existing rows still verify once, then are transparently re-hashed to scrypt.
 */

/**
 * Check if a stored hash is a legacy unsalted SHA-256 hex string (64 hex chars).
 */
export function isLegacyHash(stored: string): boolean {
  return /^[a-f0-9]{64}$/i.test(stored);
}

/**
 * Verify a password against a legacy unsalted SHA-256 hash.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyLegacyPassword(password: string, stored: string): boolean {
  const computed = Buffer.from(createHash("sha256").update(password).digest("hex"));
  const expected = Buffer.from(stored.toLowerCase());
  return computed.length === expected.length && timingSafeEqual(computed, expected);
}

/** JWT configuration — loaded from environment at module init time. */

const JWT_SECRET = process.env["JWT_SECRET"];

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required. Set a long random value in the environment.");
}

const SECRET: string = JWT_SECRET;
const TOKEN_TTL: string = process.env["JWT_TTL"] || "8h";
const ISSUER = "ergo-api";

/** The authenticated user shape attached to req.user by the auth middleware. */
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

/**
 * Sign a JWT token for an authenticated user.
 *
 * The token payload contains the user's id (sub), email, role, and name.
 * The token expires after TOKEN_TTL and is signed with the HS256 algorithm
 * using the JWT_SECRET.
 *
 * @param user - the authenticated user
 * @returns the signed JWT string
 */
export function signToken(user: AuthUser): string {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  return jwt.sign(payload, SECRET, {
    expiresIn: TOKEN_TTL,
    issuer: ISSUER,
  } as SignOptions);
}

/**
 * Verify a JWT token and extract the user information.
 *
 * Checks the signature, expiration, and issuer. Returns null if the token
 * is invalid, expired, or has an unexpected issuer.
 *
 * @param token - the JWT string to verify
 * @returns the AuthUser if valid, null otherwise
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    const payload = jwt.verify(token, SECRET, {
      issuer: ISSUER,
    }) as JwtPayload;
    if (!payload.sub) return null;
    return {
      id: String(payload.sub),
      email: String(payload.email ?? ""),
      role: String(payload.role ?? "viewer"),
      name: String(payload.name ?? ""),
    };
  } catch {
    return null;
  }
}
