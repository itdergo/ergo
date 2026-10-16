/**
 * @file Orval configuration — controls how API client code is generated from the OpenAPI spec.
 *
 * Orval is a code generator that reads an OpenAPI specification and produces
 * typed API clients. This config defines two generation targets:
 *
 * 1. **api-client-react** — Generates React Query hooks and TypeScript types for the frontend.
 *    Output goes to `shared/api-client-react/src/generated/`.
 *
 * 2. **zod** — Generates Zod schemas for runtime request/response validation.
 *    Output goes to `shared/api-zod/src/generated/`.
 *
 * Both targets read from `./openapi.yaml` as the single source of truth for the API contract.
 *
 * ## How it works
 * 1. Update `openapi.yaml` with new endpoints, schemas, or modifications.
 * 2. Run `npx orval --config ./shared/api-spec/orval.config.ts` to regenerate all code.
 * 3. The generated files appear in the `generated/` directories of each package.
 *
 * ## Why the title transformer?
 * Orval derives the output file name from the `info.title` field in the OpenAPI spec.
 * Our exports assume the title is "Api" (so the generated file is `api.ts`).
 * The `titleTransformer` forces this regardless of what the spec says.
 *
 * ## Zod version pinning
 * The `zod.version: 3` override is critical: the shared/api-spec package.json has no
 * zod dependency, so Orval >= 8.23 would default to Zod 4 syntax. The catalog installs
 * Zod 3, so we pin the generated output to match.
 *
 * ## Usage
 * ```bash
 # Generate all API client code
 * npx orval --config ./shared/api-spec/orval.config.ts
 * ```
 */
import { defineConfig, InputTransformerFn } from "orval";
import path from "path";

// Resolve paths relative to the monorepo root (two levels up from this file)
const root = path.resolve(__dirname, "..", "..");
const apiClientReactSrc = path.resolve(root, "lib", "api-client-react", "src");
const apiZodSrc = path.resolve(root, "lib", "api-zod", "src");

/**
 * Ensures the OpenAPI spec's `info.title` is set to "Api".
 * Orval uses this title to name the generated files (e.g., `api.ts`).
 * Without this transformer, a different title in the spec would break imports.
 */
const titleTransformer: InputTransformerFn = (config) => {
  config.info ??= {};
  config.info.title = "Api";

  return config;
};

export default defineConfig({
  /**
   * api-client-react target — generates React Query hooks and types.
   *
   * Output: shared/api-client-react/src/generated/
   * Client type: react-query (TanStack Query hooks)
   * Mode: split (one file per endpoint)
   * Base URL: /api (relative to the same origin)
   *
   * The `mutator` override tells Orval to use our custom `customFetch` function
   * (from `custom-fetch.ts`) instead of generating its own fetch wrapper.
   */
  "api-client-react": {
    input: {
      target: "./openapi.yaml",
      override: {
        transformer: titleTransformer,
      },
    },
    output: {
      workspace: apiClientReactSrc,
      target: "generated",
      client: "react-query",
      mode: "split",
      baseUrl: "/api",
      clean: true,
      prettier: true,
      override: {
        fetch: {
          // Don't include the full Response type in return types (we return parsed bodies directly)
          includeHttpResponseReturnType: false,
        },
        mutator: {
          // Use our custom fetch implementation instead of Orval's generated one
          path: path.resolve(apiClientReactSrc, "custom-fetch.ts"),
          name: "customFetch",
        },
      },
    },
  },

  /**
   * zod target — generates Zod schemas for runtime validation.
   *
   * Output: shared/api-zod/src/generated/
   * Client type: zod (Zod schemas)
   * Mode: split (one file per schema type)
   * Types are output to a separate `generated/types/` directory.
   *
   * The `coerce` settings enable automatic type coercion for query params and
   * body fields (e.g., converting string "true" to boolean true).
   */
  zod: {
    input: {
      target: "./openapi.yaml",
      override: {
        transformer: titleTransformer,
      },
    },
    output: {
      workspace: apiZodSrc,
      client: "zod",
      target: "generated",
      schemas: { path: "generated/types", type: "typescript" },
      mode: "split",
      clean: true,
      prettier: true,
      override: {
        zod: {
          // Orval resolves `auto` from shared/api-spec/package.json, which has no
          // zod dependency, so orval >= 8.23 falls back to Zod 4 syntax while
          // the catalog installs zod 3. Pin to match the catalog.
          version: 3,
          coerce: {
            query: ["boolean", "number", "string"],
            param: ["boolean", "number", "string"],
            body: ["bigint", "date"],
            response: ["bigint", "date"],
          },
        },
        useDates: true,
        useBigInt: true,
      },
    },
  },
});
