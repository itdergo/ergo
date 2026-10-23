import { defineConfig } from "drizzle-kit";
import path from "path";
var stdin_default = defineConfig({
  // Path to the schema file — all table and enum definitions live here
  schema: path.join(__dirname, "./src/schema/index.js"),
  dialect: "postgresql",
  dbCredentials: {
    // DATABASE_URL is used when connecting to the database for migrations.
    // "memory://" is a safe fallback that allows generate to run offline.
    url: process.env.DATABASE_URL || "memory://",
  },
});
export { stdin_default as default };
