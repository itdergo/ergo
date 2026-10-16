// @ts-check
/**
 * ESLint flat configuration for the ERGO Contracts monorepo.
 *
 * Configures linting for:
 * - JavaScript/MJS build files (esbuild configs, scripts) with CJS globals
 * - TypeScript files across the monorepo with Node.js globals
 * - Node.js packages (backend, database, scripts, shared) with Node-specific globals
 * - Frontend React/TSX files with browser globals and React hooks rules
 *
 * Uses the new ESLint flat config format (eslint.config.js).
 * Uses @typescript-eslint parser for TypeScript files.
 * React rules are applied only to frontend files.
 *
 * Usage: npm run lint
 */
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    // Ignore generated files, dependencies, and build artifacts
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.turbo/**",
      "**/*.tsbuildinfo",
      "frontend/public/**",
      "shared/api-zod/src/generated/**",
      "shared/api-client-react/src/generated/**",
      "infra/**",
    ],
  },
  // Base recommended rules for all files
  js.configs.recommended,
  {
    // Plain JS/MJS build files (esbuild configs, etc.) — uses CJS globals
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        require: "readonly",
        module: "readonly",
        globalThis: "readonly",
        setTimeout: "readonly",
      },
    },
    rules: {
      // Disable no-undef since we manually define globals above
      "no-undef": "off",
    },
  },
  {
    // TypeScript files — uses @typescript-eslint parser and recommended rules
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
      globals: {
        // Shared (available in both Node and modern browsers)
        console: "readonly",
        process: "readonly",
        fetch: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        AbortController: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        queueMicrotask: "readonly",
        structuredClone: "readonly",
        globalThis: "readonly",
      },
    },
    plugins: { "@typescript-eslint": tseslint },
    rules: {
      ...tseslint.configs.recommended.rules,
      // TypeScript already reports undefined variables — no need for no-undef
      "no-undef": "off",
      "no-unused-vars": "off",
      // Warn on unused vars but allow underscore-prefixed (intentionally unused)
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "off",
    },
  },
  {
    // Node-only packages — adds Node.js-specific globals (Buffer, __dirname, require, etc.)
    files: ["backend/**/*.{ts,tsx}", "database/**/*.{ts,tsx}", "scripts/**/*.{ts,tsx}", "shared/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        require: "readonly",
        module: "readonly",
        Request: "readonly",
        Response: "readonly",
        Headers: "readonly",
        RequestInfo: "readonly",
        RequestInit: "readonly",
        ResponseInit: "readonly",
        NodeJS: "readonly",
      },
    },
  },
  {
    // Browser-only (frontend) — adds DOM and browser API globals
    files: ["frontend/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        navigator: "readonly",
        location: "readonly",
        history: "readonly",
        HTMLElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLFormElement: "readonly",
        Event: "readonly",
        CustomEvent: "readonly",
        FormData: "readonly",
        Request: "readonly",
        Response: "readonly",
        Headers: "readonly",
        RequestInfo: "readonly",
        RequestInit: "readonly",
        ResponseInit: "readonly",
        import: "readonly",
      },
    },
  },
  {
    // React-specific rules — applies only to frontend files
    // Uses the new JSX transform (no need to import React)
    // Includes React Hooks rules (exhaustive-deps, etc.)
    files: ["frontend/**/*.{ts,tsx}"],
    ...react.configs.flat.recommended,
    ...react.configs.flat["jsx-runtime"],
    plugins: { react, "react-hooks": reactHooks },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // Using the new JSX transform — React doesn't need to be in scope
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      // cmdk uses non-standard wrapper attributes that are valid at runtime
      "react/no-unknown-property": "off",
    },
  },
];
