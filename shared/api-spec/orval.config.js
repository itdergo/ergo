import { defineConfig } from "orval";
import path from "path";
const root = path.resolve(__dirname, "..", "..");
const apiClientReactSrc = path.resolve(root, "lib", "api-client-react", "src");
const apiZodSrc = path.resolve(root, "lib", "api-zod", "src");
const titleTransformer = (config) => {
  config.info ??= {};
  config.info.title = "Api";
  return config;
};
var stdin_default = defineConfig({
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
        transformer: titleTransformer
      }
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
          includeHttpResponseReturnType: false
        },
        mutator: {
          // Use our custom fetch implementation instead of Orval's generated one
          path: path.resolve(apiClientReactSrc, "custom-fetch.ts"),
          name: "customFetch"
        }
      }
    }
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
        transformer: titleTransformer
      }
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
            response: ["bigint", "date"]
          }
        },
        useDates: true,
        useBigInt: true
      }
    }
  }
});
export {
  stdin_default as default
};
