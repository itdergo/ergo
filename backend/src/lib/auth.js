import { scrypt, randomBytes, timingSafeEqual, createHash } from "node:crypto";
import jwt from "jsonwebtoken";
const SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024
};
const KEY_LEN = 64;
function scryptAsync(password, salt, keylen, opts) {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, opts, (err, derived) => {
      if (err) reject(err);
      else resolve(derived);
    });
  });
}
async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, KEY_LEN, SCRYPT_PARAMS);
  const { N, r, p } = SCRYPT_PARAMS;
  return `scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${derived.toString("base64")}`;
}
async function verifyPassword(password, stored) {
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
      maxmem: SCRYPT_PARAMS.maxmem
    });
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
function isLegacyHash(stored) {
  return /^[a-f0-9]{64}$/i.test(stored);
}
function verifyLegacyPassword(password, stored) {
  const computed = Buffer.from(createHash("sha256").update(password).digest("hex"));
  const expected = Buffer.from(stored.toLowerCase());
  return computed.length === expected.length && timingSafeEqual(computed, expected);
}
const JWT_SECRET = process.env["JWT_SECRET"];
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required. Set a long random value in the environment.");
}
const SECRET = JWT_SECRET;
const TOKEN_TTL = process.env["JWT_TTL"] || "8h";
const ISSUER = "ergo-api";
function signToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };
  return jwt.sign(payload, SECRET, {
    expiresIn: TOKEN_TTL,
    issuer: ISSUER
  });
}
function verifyToken(token) {
  try {
    const payload = jwt.verify(token, SECRET, {
      issuer: ISSUER
    });
    if (!payload.sub) return null;
    return {
      id: String(payload.sub),
      email: String(payload.email ?? ""),
      role: String(payload.role ?? "viewer"),
      name: String(payload.name ?? "")
    };
  } catch {
    return null;
  }
}
export {
  hashPassword,
  isLegacyHash,
  signToken,
  verifyLegacyPassword,
  verifyPassword,
  verifyToken
};
