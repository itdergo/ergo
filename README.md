# ERGO Contracts Philippines

A fullstack web application for ERGO Contracts Philippines — thoughtfully designed furniture and workplace solutions for offices, institutions, and homes.

## Tech Stack

- **Frontend**: Vite + React 19 (**JSX**, no TypeScript) + Tailwind CSS 4 + wouter + Framer Motion + Lucide React
- **Backend**: Express 5 (ESM) + Drizzle ORM + node-postgres (`pg`)
- **Database**: PostgreSQL (Drizzle ORM, schema-first)
- **Auth**: JWT (`jsonwebtoken`) + `scrypt` password hashing, legacy SHA-256 upgrade
- **API**: OpenAPI-first; Zod schemas (`@ergo/api-zod`) generated from `shared/api-spec/openapi.yaml` via Orval
- **Build**: `npm run build` → `build:api` (esbuild) + `build:frontend` (Vite + prerender); `npm run dev` → concurrently front + back

## Quick Start

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:3000` (served by Vite)
- API: `http://localhost:5000/api/*`
- Admin: created by `npm run seed`. Set `ADMIN_PASSWORD` before seeding, or the seed generates a strong one and prints it once.

## Available Scripts

| Script                      | Description                                                            |
| --------------------------- | ---------------------------------------------------------------------- |
| `npm run dev`               | Start concurrently: `npm run dev:api` + `npm run dev:frontend`         |
| `npm run build`             | Full build: `build:api` + `build:frontend`                             |
| `npm run verify`            | lint + build (CI gate)                                                 |
| `npm run seed`              | Seed the database with admin user + categories + products + industries |
| `npm run db:push`           | Push the Drizzle schema to the database                                |
| `npm run db:generate`       | Generate Drizzle migrations                                            |
| `npm run test`              | Backend unit + frontend unit + e2e                                     |
| `npm run lint` / `lint:fix` | ESLint (flat config)                                                   |
| `npm run format`            | Prettier write                                                         |

## Environment Variables

Copy `.env.example` and adjust as needed:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/ergo_contracts
PORT=5000
NODE_ENV=development
VITE_API_URL=http://localhost:5000/api
JWT_SECRET=<openssl rand -base64 48>
CORS_ORIGINS=http://localhost:3000
ADMIN_EMAIL=admin@ergo.com.ph
ADMIN_PASSWORD=
BASE_PATH=/
```

`JWT_SECRET` must be set and be at least 32 characters — the API refuses to start otherwise.

## Project Structure

```
ergo-main/
├── frontend/          ← Vite + React 19 web app (nginx in prod)
├── backend/           ← Express 5 API (+ Redis cache, helmet, graceful shutdown)
├── database/          ← Drizzle ORM schema + migrations (Postgres)
├── shared/            ← Shared workspace packages (api-zod, api-spec)
├── scripts/           ← Database seed script
├── infra/             ← Dockerfiles, docker-compose, nginx config, cPanel .htaccess
├── .github/workflows/ ← CI/CD (lint, tests, build, bundle budgets, security, docker)
├── docs/              ← Architecture + code review
├── .env.example       ← Environment template (DO NOT commit real creds)
└── package.json       ← npm workspaces monorepo root
```

## Services

| Service  | Package          | Port |
| -------- | ---------------- | ---- |
| Frontend | `@ergo/frontend` | 3000 |
| Backend  | `@ergo/backend`  | 5000 |
| Postgres | (external/infra) | 5432 |
| Redis    | (optional cache) | 6379 |

Redis is optional — the backend runs without it and uses it for caching when `REDIS_URL` is set.

## Security

- **API**: helmet (CSP, HSTS, framing, referrer policy), CORS origin allowlist, layered rate limiting (global + auth + public write), JWT with issuer/TTL, `scrypt` password hashing, Zod validation on every write, parameterized Drizzle queries, path-traversal guard on uploads.
- **Frontend**: `Content-Security-Policy` (script-src pins the inline Plausible loader by SHA-256 hash — no `unsafe-inline` for scripts), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS (cPanel).
- **No secrets in the repo** — `.env` is gitignored; `.env.example` holds placeholders only.

## Docker

```bash
docker compose -f infra/docker-compose.yml up --build
```

Runs api (5000), frontend (80), postgres (5432), and redis (6379) with healthchecks.

## API Endpoints

Auth model: all write endpoints and anything marked (admin) require a Bearer JWT
obtained from `POST /api/auth/login`. Public reads (products, categories,
solutions, industries, resources) are unauthenticated and carry a public
Cache-Control; inquiries and auth responses are `no-store`.

| Method                      | Endpoint                                | Description |
| --------------------------- | --------------------------------------- | ----------- |
| `GET /api/healthz`          | Health check                            |
| `GET /api/categories`       | List all categories                     |
| `GET /api/products`         | List products with pagination/filtering |
| `GET /api/products/:slug`   | Get single product                      |
| `POST /api/products`        | Create product (admin)                  |
| `PATCH /api/products/:id`   | Update product (admin)                  |
| `DELETE /api/products/:id`  | Delete product (admin)                  |
| `GET /api/industries`       | List industries                         |
| `GET /api/resources`        | List resources                          |
| `GET /api/solutions`        | List solutions                          |
| `GET /api/inquiries`        | List inquiries (admin)                  |
| `POST /api/inquiries`       | Submit inquiry (public)                 |
| `PATCH /api/inquiries/:id`  | Update inquiry status (admin)           |
| `DELETE /api/inquiries/:id` | Delete inquiry (admin)                  |
| `GET /api/ai/employees`     | List AI employees (public)              |
| `GET /api/ai/tasks`         | List AI tasks (admin)                   |
| `POST /api/ai/tasks`        | Create AI task (admin)                  |

## SEO & routing

The site uses real routes (wouter) rather than hash anchors, so each page is a
distinct, indexable URL with its own title, description, canonical and Open Graph
tags. `src/routes.json` is the single source of truth and drives the app router,
the sitemap generator and the prerender pass.

| Route             | Page                                             |
| ----------------- | ------------------------------------------------ |
| `/`               | Home — full landing page                         |
| `/products`       | Product index                                    |
| `/products/:slug` | Product detail (Product + BreadcrumbList schema) |
| `/solutions`      | Workplace solutions                              |
| `/industries`     | Industries served                                |
| `/projects`       | Featured installations                           |
| `/resources`      | Catalogues & specifications                      |
| `/contact`        | Consultation request                             |

The build runs three steps:

1. `vite build` — bundles the app.
2. `node scripts/gen-sitemap.mjs` — writes `sitemap.xml` from the route table plus
   the live product list (hash URLs are never emitted; crawlers treat every
   fragment as the same document).
3. `node scripts/prerender.mjs` — serves the built output, renders every route
   with headless Chromium (`--dump-dom`) and writes real HTML to
   `<route>/index.html`, so crawlers get content instead of an empty `<div id="root">`.
   nginx serves those files via its existing `try_files $uri $uri/ /index.html`.

Structured data (Organization, LocalBusiness, WebSite, BreadcrumbList, ItemList,
Product) is injected per route by `src/lib/structured-data.js` and baked into the
prerendered HTML.

Prerendering needs a Chromium binary and a reachable API at build time:

```bash
CHROME_BIN=/usr/bin/chromium API_URL=http://localhost:5000/api npm run build -w frontend
```

If Chromium is absent the step is skipped with a warning (the SPA still works;
crawlers just receive the shell), so a bare CI runner will not fail the build.

## Deployment

The app connects to a **real PostgreSQL** database via `node-postgres` (`pg`). For local development the repo's scripts assume a Postgres instance (see `.env.example`); point `DATABASE_URL` at any managed PostgreSQL for production.

---

Built with modern fullstack practices — JavaScript throughout, API-first with OpenAPI/Orval, accessible/performant React frontend, and proper env hygiene.
