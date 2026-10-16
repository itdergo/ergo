/**
 * @file Custom fetch implementation — a drop-in replacement for the native `fetch` with
 * auth token injection, base URL handling, and typed error classes.
 *
 * This is the backbone of the API client. All generated hooks (via Orval) call
 * `customFetch` instead of the global `fetch`. It provides:
 *
 * - **Base URL resolution** — `setBaseUrl()` prepends a configured origin to relative paths
 * - **Auth token injection** — `setAuthTokenGetter()` registers a callback that supplies a
 *   Bearer token before every request (used in mobile/Expo environments where cookies
 *   are not automatically sent)
 * - **Automatic Content-Type detection** — detects JSON request bodies and sets the header
 * - **Error normalization** — throws typed `ApiError` / `ResponseParseError` with structured
 *   data (status, headers, parsed body) instead of raw `Response` objects
 * - **Response type inference** — auto-detects JSON vs text vs blob based on Content-Type
 *
 * ## Configuration (call once at app startup)
 * ```ts
 * import { setBaseUrl, setAuthTokenGetter } from "@repo/api-client-react";
 *
 * setBaseUrl("https://api.example.com");
 * setAuthTokenGetter(() => localStorage.getItem("token"));
 * ```
 *
 * ## Important Notes
 * - In web apps with cookie-based auth, do NOT use `setAuthTokenGetter` — the browser
 *   automatically includes session cookies.
 * - In React Native / Expo, `response.body` is always `undefined` (ReadableStream is not
 *   implemented), so the code uses strict equality (`=== null`) to avoid false positives
 *   in body-detection logic.
 */

// ────────────────────────────────────────────────────────────────────────────
// Type Definitions
// ────────────────────────────────────────────────────────────────────────────

/** Extended fetch options with a `responseType` hint for automatic parsing. */
export type CustomFetchOptions = RequestInit & {
  responseType?: "json" | "text" | "blob" | "auto";
};

/** Shorthand for the typed error thrown by customFetch on non-2xx responses. */
export type ErrorType<T = unknown> = ApiError<T>;

/** Shorthand for the request body type — used by generated hooks. */
export type BodyType<T> = T;

/**
 * Supplies a bearer auth token before each request.
 * Can be sync or async, returns `null` when no token is available.
 */
export type AuthTokenGetter = () => Promise<string | null> | string | null;

// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────

/** HTTP status codes that always have no response body (no parsing needed). */
const NO_BODY_STATUS = new Set([204, 205, 304]);

/** Default Accept header sent when responseType is "json". */
const DEFAULT_JSON_ACCEPT = "application/json, application/problem+json";

// ────────────────────────────────────────────────────────────────────────────
// Module-level Configuration (set once at app startup)
// ────────────────────────────────────────────────────────────────────────────

let _baseUrl: string | null = null;
let _authTokenGetter: AuthTokenGetter | null = null;

/**
 * Set a base URL that is prepended to every relative request URL
 * (i.e. paths that start with `/`).
 *
 * Useful for Expo bundles that need to call a remote API server.
 * Pass `null` to clear the base URL.
 */
export function setBaseUrl(url: string | null): void {
  // Strip trailing slashes to avoid double-slash in resolved URLs
  _baseUrl = url ? url.replace(/\/+$/, "") : null;
}

/**
 * Register a getter that supplies a bearer auth token.  Before every fetch
 * the getter is invoked; when it returns a non-null string, an
 * `Authorization: Bearer *** header is attached to the request.
 *
 * Useful for Expo bundles making token-gated API calls.
 * Pass `null` to clear the getter.
 *
 * NOTE: This function should never be used in web applications where session
 * token cookies are automatically associated with API calls by the browser.
 */
export function setAuthTokenGetter(getter: AuthTokenGetter | null): void {
  _authTokenGetter = getter;
}

// ────────────────────────────────────────────────────────────────────────────
// URL & Request Helpers
// ────────────────────────────────────────────────────────────────────────────

/** Type guard: is the input a `Request` object? */
function isRequest(input: RequestInfo | URL): input is Request {
  return typeof Request !== "undefined" && input instanceof Request;
}

/**
 * Resolve the HTTP method, preferring the explicit option over the Request object's method.
 * Defaults to "GET" when no method is specified anywhere.
 */
function resolveMethod(input: RequestInfo | URL, explicitMethod?: string): string {
  if (explicitMethod) return explicitMethod.toUpperCase();
  if (isRequest(input)) return input.method.toUpperCase();
  return "GET";
}

/** Type guard: is the input a `URL` object? (Loose check for React Native compatibility.) */
function isUrl(input: RequestInfo | URL): input is URL {
  // Use loose check for URL — some runtimes (e.g. React Native) polyfill URL
  // differently, so `instanceof URL` can fail.
  return typeof URL !== "undefined" && input instanceof URL;
}

/**
 * Prepend the configured base URL to the request URL if it's relative (starts with `/`).
 * Absolute URLs (including those already containing a domain) are returned unchanged.
 */
function applyBaseUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (!_baseUrl) return input;
  const url = resolveUrl(input);
  // Only prepend to relative paths (starting with /)
  if (!url.startsWith("/")) return input;

  const absolute = `${_baseUrl}${url}`;
  // Preserve the original input type: string → string, URL → URL, Request → Request
  if (typeof input === "string") return absolute;
  if (isUrl(input)) return new URL(absolute);
  return new Request(absolute, input as Request);
}

/** Extract the URL string from any valid fetch input type. */
function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (isUrl(input)) return input.toString();
  return input.url;
}

// ────────────────────────────────────────────────────────────────────────────
// Header Helpers
// ────────────────────────────────────────────────────────────────────────────

/**
 * Merge multiple HeaderInit sources into a single Headers instance.
 * Later sources override earlier ones (per-header, not whole-Headers).
 */
function mergeHeaders(...sources: Array<HeadersInit | undefined>): Headers {
  const headers = new Headers();

  for (const source of sources) {
    if (!source) continue;
    new Headers(source).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

/** Extract the media type (without parameters) from a Headers instance. */
function getMediaType(headers: Headers): string | null {
  const value = headers.get("content-type");
  return value ? value.split(";", 1)[0].trim().toLowerCase() : null;
}

/** Check if the media type is JSON (including vendor-specific +json types). */
function isJsonMediaType(mediaType: string | null): boolean {
  return mediaType === "application/json" || Boolean(mediaType?.endsWith("+json"));
}

/** Check if the media type is text-based (plain text, XML, form-urlencoded, etc.). */
function isTextMediaType(mediaType: string | null): boolean {
  return Boolean(
    mediaType &&
    (mediaType.startsWith("text/") ||
      mediaType === "application/xml" ||
      mediaType === "text/xml" ||
      mediaType.endsWith("+xml") ||
      mediaType === "application/x-www-form-urlencoded"),
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Response Body Detection
// ────────────────────────────────────────────────────────────────────────────

/**
 * Determine whether a response has no body to parse.
 *
 * Uses strict equality (`=== null`) for `response.body` because in React Native,
 * `response.body` is always `undefined` (ReadableStream is not implemented),
 * and loose equality (`== null`) would incorrectly treat every response as empty.
 */
function hasNoBody(response: Response, method: string): boolean {
  if (method === "HEAD") return true;
  if (NO_BODY_STATUS.has(response.status)) return true;
  if (response.headers.get("content-length") === "0") return true;
  if (response.body === null) return true;
  return false;
}

/** Strip a leading Byte Order Mark (BOM) from a string if present. */
function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** Heuristic: does the text look like a JSON object or array? */
function looksLikeJson(text: string): boolean {
  const trimmed = text.trimStart();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

// ────────────────────────────────────────────────────────────────────────────
// Error Response Parsing
// ────────────────────────────────────────────────────────────────────────────

/** Safely extract a string field from an unknown error response body. */
function getStringField(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== "object") return undefined;

  const candidate = (value as Record<string, unknown>)[key];
  if (typeof candidate !== "string") return undefined;

  const trimmed = candidate.trim();
  return trimmed === "" ? undefined : trimmed;
}

/** Truncate long strings in error messages to avoid log spam. */
function truncate(text: string, maxLength = 300): string {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

/**
 * Build a human-readable error message from a failed response.
 * Attempts to extract structured error details (title, detail, message, error)
 * from JSON error bodies (RFC 7807 Problem Details format).
 */
function buildErrorMessage(response: Response, data: unknown): string {
  const prefix = `HTTP ${response.status} ${response.statusText}`;

  // If the error body is plain text, use it directly
  if (typeof data === "string") {
    const text = data.trim();
    return text ? `${prefix}: ${truncate(text)}` : prefix;
  }

  // Try to extract structured error fields from JSON error bodies
  const title = getStringField(data, "title");
  const detail = getStringField(data, "detail");
  const message =
    getStringField(data, "message") ??
    getStringField(data, "error_description") ??
    getStringField(data, "error");

  if (title && detail) return `${prefix}: ${title} — ${detail}`;
  if (detail) return `${prefix}: ${detail}`;
  if (message) return `${prefix}: ${message}`;
  if (title) return `${prefix}: ${title}`;

  return prefix;
}

// ────────────────────────────────────────────────────────────────────────────
// Error Classes
// ────────────────────────────────────────────────────────────────────────────

/**
 * Error thrown when the server returns a non-2xx response.
 * Contains the full response context (status, headers, parsed body) for debugging.
 */
export class ApiError<T = unknown> extends Error {
  readonly name = "ApiError";
  readonly status: number;
  readonly statusText: string;
  readonly data: T | null;
  readonly headers: Headers;
  readonly response: Response;
  readonly method: string;
  readonly url: string;

  constructor(response: Response, data: T | null, requestInfo: { method: string; url: string }) {
    super(buildErrorMessage(response, data));
    // Restore prototype chain for instanceof checks (needed when targeting ES5)
    Object.setPrototypeOf(this, new.target.prototype);

    this.status = response.status;
    this.statusText = response.statusText;
    this.data = data;
    this.headers = response.headers;
    this.response = response;
    this.method = requestInfo.method;
    this.url = response.url || requestInfo.url;
  }
}

/**
 * Error thrown when the response body cannot be parsed as JSON.
 * Contains the raw text body and the underlying parse error.
 */
export class ResponseParseError extends Error {
  readonly name = "ResponseParseError";
  readonly status: number;
  readonly statusText: string;
  readonly headers: Headers;
  readonly response: Response;
  readonly method: string;
  readonly url: string;
  readonly rawBody: string;
  readonly cause: unknown;

  constructor(
    response: Response,
    rawBody: string,
    cause: unknown,
    requestInfo: { method: string; url: string },
  ) {
    super(
      `Failed to parse response from ${requestInfo.method} ${response.url || requestInfo.url} ` +
        `(${response.status} ${response.statusText}) as JSON`,
    );
    // Restore prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    this.status = response.status;
    this.statusText = response.statusText;
    this.headers = response.headers;
    this.response = response;
    this.method = requestInfo.method;
    this.url = response.url || requestInfo.url;
    this.rawBody = rawBody;
    this.cause = cause;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Response Body Parsers
// ────────────────────────────────────────────────────────────────────────────

/** Parse a response body as JSON, stripping BOM and throwing ResponseParseError on failure. */
async function parseJsonBody(
  response: Response,
  requestInfo: { method: string; url: string },
): Promise<unknown> {
  const raw = await response.text();
  const normalized = stripBom(raw);

  if (normalized.trim() === "") {
    return null;
  }

  try {
    return JSON.parse(normalized);
  } catch (cause) {
    throw new ResponseParseError(response, raw, cause, requestInfo);
  }
}

/**
 * Parse an error response body, attempting JSON first, then falling back
 * to text or blob depending on the Content-Type.
 */
async function parseErrorBody(response: Response, method: string): Promise<unknown> {
  if (hasNoBody(response, method)) {
    return null;
  }

  const mediaType = getMediaType(response.headers);

  // Fall back to text when blob() is unavailable (e.g. some React Native builds).
  if (mediaType && !isJsonMediaType(mediaType) && !isTextMediaType(mediaType)) {
    return typeof response.blob === "function" ? response.blob() : response.text();
  }

  const raw = await response.text();
  const normalized = stripBom(raw);
  const trimmed = normalized.trim();

  if (trimmed === "") {
    return null;
  }

  // Try JSON parse if the content-type indicates JSON or the body looks like JSON
  if (isJsonMediaType(mediaType) || looksLikeJson(normalized)) {
    try {
      return JSON.parse(normalized);
    } catch {
      return raw;
    }
  }

  return raw;
}

/**
 * Infer the response type from Content-Type header.
 * Returns "json" for JSON media types, "text" for text/*, "blob" for everything else.
 */
function inferResponseType(response: Response): "json" | "text" | "blob" {
  const mediaType = getMediaType(response.headers);

  if (isJsonMediaType(mediaType)) return "json";
  if (isTextMediaType(mediaType) || mediaType == null) return "text";
  return "blob";
}

/**
 * Parse a successful (2xx) response body based on the requested responseType.
 * When responseType is "auto", the type is inferred from the Content-Type header.
 */
async function parseSuccessBody(
  response: Response,
  responseType: "json" | "text" | "blob" | "auto",
  requestInfo: { method: string; url: string },
): Promise<unknown> {
  if (hasNoBody(response, requestInfo.method)) {
    return null;
  }

  const effectiveType = responseType === "auto" ? inferResponseType(response) : responseType;

  switch (effectiveType) {
    case "json":
      return parseJsonBody(response, requestInfo);

    case "text": {
      const text = await response.text();
      return text === "" ? null : text;
    }

    case "blob":
      if (typeof response.blob !== "function") {
        throw new TypeError(
          "Blob responses are not supported in this runtime. " +
            'Use responseType "json" or "text" instead.',
        );
      }
      return response.blob();
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Main Export: customFetch
// ────────────────────────────────────────────────────────────────────────────

/**
 * Drop-in replacement for `fetch` with auth token injection, base URL handling,
 * and typed error normalization.
 *
 * This is the function that all Orval-generated hooks call. It should be
 * configured once at app startup via `setBaseUrl()` and `setAuthTokenGetter()`.
 *
 * @param input - URL string, URL object, or Request object
 * @param options - Fetch options with optional `responseType` override
 * @returns Parsed response body (type T)
 * @throws {ApiError} On non-2xx HTTP responses
 * @throws {ResponseParseError} When JSON parsing fails on a successful response
 */
export async function customFetch<T = unknown>(
  input: RequestInfo | URL,
  options: CustomFetchOptions = {},
): Promise<T> {
  // Apply base URL if configured (no-op if _baseUrl is null)
  input = applyBaseUrl(input);
  const { responseType = "auto", headers: headersInit, ...init } = options;

  const method = resolveMethod(input, init.method);

  // Guard against invalid body on GET/HEAD requests
  if (init.body != null && (method === "GET" || method === "HEAD")) {
    throw new TypeError(`customFetch: ${method} requests cannot have a body.`);
  }

  // Merge headers from the Request object (if input is a Request) with explicit headers
  const headers = mergeHeaders(isRequest(input) ? input.headers : headersInit);

  // Auto-detect JSON request bodies and set Content-Type if not already set
  if (typeof init.body === "string" && !headers.has("content-type") && looksLikeJson(init.body)) {
    headers.set("content-type", "application/json");
  }

  // Set Accept header for JSON responses when none is specified
  if (responseType === "json" && !headers.has("accept")) {
    headers.set("accept", DEFAULT_JSON_ACCEPT);
  }

  // Attach bearer token when an auth getter is configured and no
  // Authorization header has been explicitly provided.
  if (_authTokenGetter && !headers.has("authorization")) {
    const token = await _authTokenGetter();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
  }

  const requestInfo = { method, url: resolveUrl(input) };

  // Perform the actual HTTP request
  const response = await fetch(input, { ...init, method, headers });

  // On non-2xx responses, parse the error body and throw a typed ApiError
  if (!response.ok) {
    const errorData = await parseErrorBody(response, method);
    throw new ApiError(response, errorData, requestInfo);
  }

  // On success, parse the body according to responseType and return
  return (await parseSuccessBody(response, responseType, requestInfo)) as T;
}
