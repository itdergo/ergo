import { defineConfig } from "orval";
import path from "path";
const root = path.resolve(__dirname, "..", "..");
const apiZodSrc = path.resolve(root, "lib", "api-zod", "src");
const titleTransformer = (config) => {
  config.info ??= {};
  config.info.title = "Api";
  return config;
};
var stdin_default = defineConfig({
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
export { stdin_default as default };
