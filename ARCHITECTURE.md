# ErgoContractsWEB V1 — Architecture Overview

A full-stack product catalog and marketing website for ERGO, built as an npm workspaces monorepo.

## Stack

| Layer      | Tech                                                        |
| ---------- | ----------------------------------------------------------- |
| Frontend   | React 18, Vite, TypeScript, TailwindCSS, shadcn/ui, Framer Motion |
| Backend    | Node.js, Express, TypeScript, ESM                           |
| Database   | PostgreSQL, Drizzle ORM                                     |
| Auth       | JWT (jsonwebtoken), bcrypt password hashing                |
| Cache      | Redis (ioredis) — rate limiting + response cache            |
| Validation | Zod (shared schemas, code-generated API client)            |
| Build      | esbuild (custom build.mjs for backend), Vite (frontend)    |

## Workspace Map

```
ErgoContractsWEBV1/
├── frontend/            # React SPA (port 3000)
│   └── src/
│       ├── components/  # UI components (ui/ = shadcn, sections/ = marketing, admin/ = CMS)
│       ├── pages/       # Route pages (home, products, product-detail, industries, solutions, projects, resources, contact, not-found)
│       ├── lib/         # api.ts (fetch client), seo.ts, structured-data.ts, site-context.tsx, types.ts
│       ├── hooks/       # use-mobile, use-toast
│       └── App.tsx      # Router setup + admin panel mounting
├── backend/             # Express API (port 5000)
│   └── src/
│       ├── index.ts     # Entry point — connects DB, starts server
│       ├── app.ts       # Express app — middleware + route mounting
│       ├── lib/         # auth.ts (JWT), logger.ts (Pino), redis.ts (cache client)
│       ├── middlewares/ # auth (JWT verify), cache (Redis), rateLimit (sliding window)
│       └── routes/      # CRUD: products, categories, industries, solutions, projects, resources, inquiries, uploads, auth, health
├── database/            # Drizzle schema + migrations
│   └── src/schema/      # pgTable definitions for all entities
├── shared/
│   ├── api-zod/         # Zod schemas (single source of truth for API contract)
│   ├── api-client-react/# Generated React Query hooks for every endpoint
│   └── api-spec/        # Orval config (generates api-client-react from OpenAPI)
└── scripts/
    └── src/seed.ts      # Database seed script (npm run seed)
```

## Request Flow

```
Browser → Vite dev server (:3000) → /api/* proxy → Express API (:5000)
  → middlewares/auth.ts     — JWT verification (except public routes)
  → middlewares/cache.ts    — Redis cache lookup (cache-aside)
  → middlewares/rateLimit.ts — Redis sliding-window rate limit
  → routes/*.ts             — Handler: validate with Zod → DB query via Drizzle → JSON response
```

## Data Model (Drizzle / PostgreSQL)

- **products** — catalog items with name, slug, category, industry, images, specs, pricing
- **categories** — product categorization
- **industries** — verticals ERGO serves
- **solutions** — solution offerings linked to products
- **projects** — case studies / past work
- **resources** — downloadable assets (datasheets, whitepapers, etc.)
- **inquiries** — contact form submissions
- **uploads** — file upload metadata

## Scripts (root package.json)

| Command           | Action                                              |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | concurrently: backend (build + node) + frontend (vite) |
| `npm run build`   | Build shared → database → backend → frontend        |
| `npm run seed`    | Seed the database                                   |
| `npm run lint`    | ESLint                                              |
| `npm run format`  | Prettier                                            |
| `npm run typecheck`| TypeScript noEmit check (frontend + backend)       |

## Environment

Backend expects a `.env` file with:
- `PORT` (default 5000)
- `DATABASE_URL` (PostgreSQL connection string)
- `REDIS_URL` (Redis connection string)
- `JWT_SECRET` (signing secret)
- `NODE_ENV` (development/production)
