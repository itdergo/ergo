import type { NextFunction, Request, Response } from "express";

/** Domain-specific HTTP errors for the API.

 * Provides a single `HttpError` class that carries both an HTTP status and an
 * optional machine-readable `code`. When thrown inside an async route handler,
 * the error is routed to Express's central error handler (see `app.ts`), which
 * formats it consistently as `{ error: string, code?: string }`.
 *
 * Do NOT throw plain `Error` instances from route handlers — they bypass the
 * central error handler when caught by `asyncHandler` and will result in a
 * 500 with an unhelpful message.
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/**
 * Wraps an async route handler so that both synchronous throws and promise
 * rejections are forwarded to Express's `next(err)` error handler.
 *
 * Usage:
 *   router.get("/", cachePublic(60), asyncHandler(async (req, res) => {
 *     const products = await db.query.products.findMany();
 *     res.json(products);
 *   }));
 *
 * Route-level middleware (auth, cache, rate limit) stays outside the wrapper,
 * exactly as before.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
