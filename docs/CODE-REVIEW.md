# ERGO Contracts Web — Full Source Code Review

**Date:** 2026-10-23
**Reviewer:** Rico (Cybersecurity Head AI)
**Repo:** `/home/kaliparrot/Desktop/ergo-main` (branch `main`, HEAD `6df9ccd`)
**Scope:** entire repo — frontend, backend, database, shared, scripts, infra, CI, docs

---

## 1. Executive Summary

A well-engineered, security-conscious fullstack monorepo. The recent TypeScript→JavaScript conversion is functionally complete and verified (lint clean, builds pass, 70 tests green, 0 npm vulnerabilities). The core security controls are solid: parameterized queries, Zod validation on every write, scrypt password hashing, JWT with issuer + TTL, role-based access, rate limiting, path-traversal protection, and no hardcoded secrets.

The most important gaps are **operational**, not cryptographic:

- **No Content-Security-Policy on the public frontend** (only on `/api` JSON responses, where it is inert).
- **Upload route path mismatch** in both the nginx and cPanel configs — uploads will 404 in production.

Both are quick, high-value fixes. A secondary cluster of findings is **stale artifacts from the TS→JS conversion** (dead deps, unused packages, inaccurate docs) that should be cleaned up to reduce install time, attack surface, and confusion.

Overall assessment: **healthy, production-ready with two deployment-blocking bugs to fix.**

---

## 2. Scope & Method

- Static review of every source file across all 6 workspace packages.
- Cross-checked configs (Vite, vitest, Playwright, Docker, nginx, `.htaccess`, CI).
- Verified runtime behavior against the live dev servers (API :5000, web :3000) and the prerendered build.
- Validated: lint, build, unit tests, e2e, `npm audit`, bundle budgets, axe accessibility, mobile overflow, console errors.
- Inspected secrets handling, `.gitignore`, and dependency graph.

---

## 3. Architecture Overview

| Layer | Technology |
|---|---|
| Frontend | Vite + React 19 (**JSX**) + Tailwind v4 + wouter + framer-motion + lucide-react |
| Backend | Node + Express 5 (ESM), esbuild bundle → `backend/dist/index.mjs` |
| Database | Drizzle ORM + **node-postgres (`pg`)** against a real PostgreSQL |
| Validation | Zod v4 (`drizzle-zod` insert schemas) on all write routes |
| Auth | JWT (`jsonwebtoken`, HS256) + scrypt password hashing |
| Infra | Docker (multi-stage), nginx, cPanel `.htaccess`, GitHub Actions CI |
| Tests | Vitest (unit) + Playwright (e2e) |

Package graph: `frontend` and `backend` → `database`; `backend` → `shared/api-zod`.

---

## 4. Strengths

1. **No SQL injection.** All queries go through Drizzle's parameterized builders (`ilike`, `eq`, `and`, `sql` count). No raw string concatenation into SQL.
2. **Input validation on every write.** `insertProductSchema`, `insertInquirySchema`, `insertResourceSchema`, etc. via `safeParse` → 400 with structured `issues`.
3. **Strong credential handling.** scrypt (N=16384, r=8, p=1) with per-user salt and `timingSafeEqual`; transparent legacy SHA-256 upgrade path.
4. **JWT hardening.** Issuer pinned (`ergo-api`), configurable TTL, secret required at startup (throws if unset), token re-validated server-side on every protected request.
5. **Role-based access control.** `requireAuth` + `requireRole("admin")` on every mutating route; public read routes are correctly open.
6. **Rate limiting in layers.** Global API limiter (600/15m), auth limiter (10/15m, `skipSuccessfulRequests`), public-write limiter (5/10m) on the inquiry form.
7. **Upload hardening.** Admin-only upload/delete; MIME allowlist; 10 MB cap; UUID filenames; explicit `resolveUploadPath` traversal guard.
8. **No XSS sinks.** No `dangerouslySetInnerHTML`, no `innerHTML`, no `eval`. All external links use `rel="noopener noreferrer"`.
9. **No hardcoded secrets.** `.env` gitignored; `.env.example` has placeholders only; seed generates a strong random admin password.
10. **Defense-in-depth headers** on the API (helmet): `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP.
11. **Accessibility & performance.** axe: 0 violations across all routes; skip-link, reduced-motion support, correct heading order; prerendered HTML, lazy routes, WebP variants, content-hashed assets, bundle budgets enforced in CI.
12. **Graceful degradation.** Redis and SMTP are optional and fail soft with logged warnings.
13. **Responsive.** Verified no horizontal overflow at 390px and 1440px; mobile nav works; no console errors.

---

## 5. Findings

### 🔴 High

#### H1 — No Content-Security-Policy on the public frontend
`infra/nginx.conf` and `infra/cpanel/.htaccess` set `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and COOP — but **no CSP**. The helmet CSP in `backend/src/app.js` only applies to `/api` responses (JSON, no scripts), so it is effectively inert for the site. The prerendered HTML contains no CSP `<meta>` either.

**Impact:** The public marketing site has no CSP mitigation against XSS/defacement or third-party script injection. This is the single biggest defense-in-depth gap.
**Fix:** Add a CSP to nginx and `.htaccess` (and a meta fallback for the SPA). Because the prerender injects inline JSON-LD and the analytics script is external, use a **nonce** or **hash**-based `script-src`. Suggested starting point:
```
default-src 'self';
script-src 'self' 'nonce-{RANDOM}' https://plausible.io;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data:;
font-src 'self' data: https://fonts.gstatic.com;
connect-src 'self';
frame-ancestors 'self';
base-uri 'self';
form-action 'self'
```
(Note: the current `scriptSrc: ['self']` in app.js would *block* the Plausible analytics script — confirm intent before enabling.)

#### H2 — Upload route path mismatch in deployment configs
The API mounts everything under `/api`, so uploads are served at **`/api/uploads`** (verified: `/uploads` → 404, `/api/uploads/:file` → handler).

- `infra/nginx.conf`: `location /uploads { proxy_pass http://api:5000; }` → requests `api:5000/uploads/...` → **404**.
- `infra/cpanel/.htaccess`: `RewriteRule ^uploads/(.*)$ https://api.ergo.com.ph/uploads/$1` → **404** (should be `/api/uploads/$1`).

**Impact:** File uploads/downloads break in both Docker and cPanel deployments.
**Fix:** Proxy to `/api/uploads` in both configs (and update the frontend upload URL if it references `/uploads`).

---

### 🟠 Medium

#### M1 — Admin UI bundled into the public frontend chunk
`frontend/src/App.jsx` imports `AdminPanel` and `LoginPage` **eagerly** (not `React.lazy`), so the entire admin interface ships to every public visitor. Server-side auth is enforced (no data leak), but this inflates the public bundle and discloses admin functionality.
**Fix:** `React.lazy(() => import("@/components/admin/admin-panel"))` behind the auth gate, with a `<Suspense>` fallback.

#### M2 — JWT stored in `localStorage`
The API client persists the token in `localStorage` (`frontend/src/lib/api.js`). With no CSP (H1) and no XSS sink today, the practical risk is low, but any future stored-XSS would exfiltrate the token.
**Fix (hardening):** Move to `httpOnly` + `SameSite=Strict` cookies with the existing CSRF middleware; keep the bearer flow only for non-browser clients.

#### M3 — No minimum-strength check on `JWT_SECRET`
`backend/src/lib/auth.js` only requires that `JWT_SECRET` is *set*. A 6-character secret is accepted and would be brute-forceable.
**Fix:** Enforce a minimum length (e.g., ≥ 32 chars) or require a `base64`/`hex` format at startup.

#### M4 — Dead dependencies and unused packages (TS→JS leftovers)
- `@electric-sql/pglite` declared in **both** `backend` and `database` deps — **never imported anywhere** (heavy WASM package).
- `@ergo/api-client-react` (+ its `@tanstack/react-query` dep) — **never imported**; the frontend uses its own `lib/api.js`.
- Root `devDependencies`: `typescript`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser` — unused after conversion.
- `@types/*` in frontend/backend/database/scripts — unused.
- `tsx` in `scripts` devDeps — unused (seed runs via `node`).
**Impact:** Slower installs, larger attack surface, confusing dependency graph.
**Fix:** Remove the unused packages and devDeps; run `npm audit` + `npm run verify` after.

#### M5 — Documentation is inaccurate after the conversion
- `README.md`: still says **TypeScript**, lists `npm run typecheck` (removed), `npm run build:libs` (removed), and **"PostgreSQL via PGlite (no external DB required)"** — but the app uses `pg` + a real Postgres (port 5433). PGlite is unused.
- `docs/ARCHITECTURE.md`: describes a "TypeScript-first monorepo", `tsconfig.json` project references, TanStack Query, and a `typecheck` CI job — all obsolete.
**Fix:** Update both docs to reflect JavaScript + node-postgres + the current scripts.

#### M6 — `vitest.config.js` exclude references a deleted file
`frontend/vitest.config.js` excludes `**/playwright.config.ts` — should be `.js`. Harmless (the `.js` file is matched by the default include/exclude), but sloppy.

---

### 🟡 Low

- **L1 — Frontend runtime libs in `devDependencies`.** `react`, `react-dom`, `framer-motion`, `lucide-react`, `wouter`, `zod`, `clsx`, `tailwind-merge` are dev deps. Functionally fine for a bundled app, but should be `dependencies` for correctness.
- **L2 — `cachePublic(60)` on query-parameterized `GET /products`.** A shared cache that ignores `?category=`/`?search=` could serve wrong results. Vary by query or drop the public cache on filtered endpoints.
- **L3 — Preloader blocks first paint ~1.5s** (1100ms + 420ms exit). Deliberate design with reduced-motion support, but it hurts LCP. Consider shortening or making it non-blocking.
- **L4 — In-memory CSRF token store.** `csrfTokens` Map never evicts (no TTL) and won't survive restarts or multi-instance deploys. Add TTL eviction or back it with Redis.
- **L5 — Email header injection (low risk).** The nodemailer subject interpolates `inquiry.email`. Zod validation limits the risk, but consider encoding/allowlisting.
- **L6 — `allowedHosts: true` on the Vite dev server.** Disables Host-header protection. Fine for dev; ensure the dev server is never exposed in production.
- **L7 — esbuild conversion artifacts.** Every file ends with `var stdin_default = X; export { stdin_default as default };`. Works, but ugly — a codemod or post-processing pass would clean it.
- **L8 — Thin API route test coverage.** Only `lib`/`middleware` unit tests exist; no route-level integration tests for products/inquiries/auth/ai. The e2e suite covers the public flows well.

---

## 6. Prioritized Recommendations

| # | Action | Effort |
|---|---|---|
| 1 | Fix the `/uploads` → `/api/uploads` proxy path in nginx + `.htaccess` (H2) | 5 min |
| 2 | Add a CSP (nonce/hash) to nginx + `.htaccess` (H1) | 30 min |
| 3 | Remove dead deps/packages: `pglite`, `api-client-react`, `typescript`, `@types/*`, `tsx` (M4) | 20 min |
| 4 | Update `README.md` + `docs/ARCHITECTURE.md` (M5) | 30 min |
| 5 | Lazy-load the admin panel (M1) | 15 min |
| 6 | Enforce `JWT_SECRET` minimum strength (M3) | 10 min |
| 7 | Add TTL eviction to the CSRF token store (L4) | 20 min |
| 8 | Add route-level API integration tests (L8) | 1–2 h |

---

## 7. Verification Snapshot (this review)

| Check | Result |
|---|---|
| `npm run verify` (lint + build) | ✅ pass |
| Unit tests | ✅ 50 pass (40 backend + 10 frontend) |
| E2E tests | ✅ 20 pass |
| `npm audit --omit=dev` | ✅ 0 vulnerabilities |
| Bundle budget | ✅ JS 440.8 KB / CSS 54.4 KB (limits 500 / 120) |
| axe accessibility | ✅ 0 violations, all routes |
| Console errors (1440 / 390) | ✅ none |
| Horizontal overflow (1440 / 390) | ✅ none |
| Mobile nav | ✅ works |
| Hardcoded secrets | ✅ none |
| `.env` tracked in git | ✅ no (only `.env.example`) |

---

## 8. Conclusion

The codebase is **well-built and security-aware**, and the JS conversion is clean and verified. Two deployment-blocking bugs (CSP absence, upload path mismatch) and a set of stale artifacts are the priority. None of the findings indicate a live compromise — the server-side auth, validation, and query layers are correct. Fix H1/H2, clean up M4/M5, and this is a strong, shippable build.
