# Security Policy

ERGO Contracts Philippines takes the security of our website and API seriously. This policy describes how to report a vulnerability, what is in scope, and how we handle reports.

## Supported Versions

| Version | Supported |
| ------- | --------- |
| `main`  | Yes       |

Security fixes are applied to the current `main` branch and deployed to production (https://www.ergo.com.ph).

## Reporting a Vulnerability

**Please do not open a public GitHub issue for a security vulnerability.**

Report privately by email:

- **Email:** sales_ergo@ergo.com.ph
- **Subject:** `[SECURITY] <short description>`
- Include: affected component, reproduction steps, impact, and any proof-of-concept.

You can also reach us via the contact page at https://ergo.com.ph/contact.

### What to expect

1. **Acknowledgement** within 3 business days.
2. **Triage** — we confirm the report and determine severity.
3. **Fix** — we develop and test a remediation.
4. **Disclosure** — once a fix ships, we will credit reporters who wish to be named (coordinated disclosure).

## Scope

In scope:

- The public website (https://www.ergo.com.ph) and its static assets.
- The API (`/api/*`) — authentication, authorization, input validation, rate limiting, upload handling.
- The database schema and seed data.

Out of scope:

- Third-party services we integrate with (Google Maps, Plausible analytics, Google Fonts, SMTP provider).
- Attacks requiring physical access to a user's device or account credentials.
- Denial-of-service attacks from botnets or volumetric floods (handled at the network layer).
- Self-inflicted issues such as a user sharing their own credentials.

## Security posture

The application is built with defense in depth:

- **API:** helmet security headers, allowlist-based CORS, layered in-memory rate limiting (global + auth + public writes), JWT auth with issuer/TTL and a minimum secret-strength check, `scrypt` password hashing with constant-time comparison, Zod validation on every write, parameterized Drizzle queries, and a path-traversal guard on uploads.
- **Frontend:** `Content-Security-Policy` (script-src pins the inline loader by hash — no `unsafe-inline` for scripts), framing/referrer/MIME headers, and no `dangerouslySetInnerHTML`.
- **Supply chain:** no secrets committed, `.env` gitignored, `npm audit` and secret scanning run in CI.

## Safe harbor

We will not pursue legal action against researchers who:

- Act in good faith and avoid privacy violations, data destruction, or service disruption.
- Do not exploit a vulnerability beyond what is needed to confirm it.
- Give us a reasonable opportunity to fix the issue before public disclosure.

Thank you for helping keep ERGO Contracts secure.
