# Deploying to cPanel

Target: **https://www.ergo.com.ph** (frontend) + a Node.js app for the API, on
cPanel shared hosting. This is a different deployment path from the Docker setup
in `infra/` — cPanel has no Docker and no registry, so the Dockerfiles,
`docker-compose.yml` and `nginx.conf` are **not used here**.

## Layout

| Piece    | Where                                                  |
| -------- | ------------------------------------------------------ |
| Frontend | static build in `public_html` (`www.ergo.com.ph`)      |
| API      | cPanel Node.js app (Passenger), e.g. `api.ergo.com.ph` |
| Database | PostgreSQL created in cPanel                           |
| Redis    | not used (the backend runs without it)                 |

`public_html/.htaccess` reverse-proxies `/api` to the Node app so the browser
still sees a same-origin request (see the caveat below).

## Host prerequisites — check these first

1. **PostgreSQL.** The app is Postgres-only (`drizzle-orm/pg-core` + `pg.Pool`).
   If cPanel offers only MySQL/MariaDB, this will not run without a rewrite.
   Look for "PostgreSQL Databases" in cPanel.
2. **Node.js app support** — cPanel's "Setup Node.js App" (Passenger).
3. **Node 20 or 22** available in the version selector.
4. **`mod_proxy` enabled** for the `/api` proxy (some hosts disable it).

## Setup

### 1. Create the database

cPanel → **PostgreSQL Databases**: create a database and a user, grant the user
to the database. Note the connection string — cPanel prefixes both with your
account name, e.g. `ergoco_ergo` / `ergoco_admin`.

### 2. Create the Node.js app

cPanel → **Setup Node.js App** → Create Application:

- **Node.js version**: 20 or 22
- **Application root**: `ergo-api` (this is `APP_DIR` in the deploy script)
- **Application URL**: `api.ergo.com.ph`
- **Application startup file**: `backend/dist/index.mjs`

Then add the environment variables from `env.production.example` (at minimum
`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`, `NODE_ENV`, `PORT`).

> The backend throws on startup if `PORT` is unset. cPanel's Node.js app sets it
> automatically; if it does not, add `PORT=5000` explicitly.

### 3. Deploy

From the repo root, on a machine with SSH + rsync access to the host:

```bash
CPANEL_HOST=ergoco@server.ergo.com.ph ./infra/cpanel/deploy.sh --seed
```

That builds every workspace, uploads the frontend to `public_html`, uploads the
app, runs `npm ci --omit=dev` and the seed on the server, and restarts Passenger.
Use `--dry-run` to preview, `--build-only` to just build.

### 4. Install the .htaccess

The deploy script uploads `infra/cpanel/.htaccess` to `public_html/.htaccess`.
Confirm the API proxy target inside it matches your setup (subdomain vs local
port) — both variants are listed, only one should be uncommented.

### 5. Verify

- `https://www.ergo.com.ph/` — the site loads
- `https://www.ergo.com.ph/api/healthz` — returns `{"status":"ok"}`
- `https://www.ergo.com.ph/products` — deep link works (SPA fallback)
- Admin login at `/` → floating **Admin** button

## Caveats worth knowing before you deploy

- **`/api` is hardcoded same-origin.** `frontend/src/lib/api.ts` sets
  `API_BASE = "/api"` and does not read `VITE_API_URL`. The reverse proxy in
  `.htaccess` is what makes a separate API host work. If your host has
  `mod_proxy` disabled, point `API_BASE` at the API subdomain instead — a
  one-line change.
- **Uploads are not on a persistent path.** `backend/src/routes/uploads.ts`
  hardcodes `path.resolve(process.cwd(), "uploads")` and ignores `UPLOAD_DIR`.
  Anything uploaded lands inside the app directory and can be lost on redeploy.
- **No Redis** on shared hosting — caching and rate limiting are simply disabled,
  which the backend supports (`REDIS_URL` unset).
- **Migrations.** `npm run db:push` is a dev-style schema push. For a production
  database prefer `drizzle-kit migrate` with generated migrations.
- **Docker artifacts are unused** on this target. The `docker` job in CI still
  builds them, but nothing ships from it to cPanel.

## What CI does and does not do

`.github/workflows/ci.yml` validates every push (lint, typecheck, unit tests, E2E
against a real Postgres, build, Docker build). It does **not** deploy — there is
no CD step yet. Options for adding one: run `deploy.sh` from a workflow with an
SSH key secret, or use cPanel's built-in **Git Version Control** to pull from
GitHub and run a post-pull script.
