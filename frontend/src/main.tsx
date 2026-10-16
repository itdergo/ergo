/**
 * main.tsx — Application entry point.
 *
 * Bootstraps the React application by:
 * - Creating a React root on the #root DOM element
 * - Wrapping the entire app in an ErrorBoundary to catch rendering errors
 * - Importing global CSS (index.css) for Tailwind and custom styles
 *
 * The onCaughtError callback prevents the Vite dev overlay from showing
 * for errors caught by the ErrorBoundary, logging them to console instead.
 */
import { createRoot } from "react-dom/client";

import App from "./App";
import { ErrorBoundary } from "@/components/error-boundary";

import "./index.css";

createRoot(document.getElementById("root")!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    // Suppress Vite dev overlay for boundary-caught errors; log to console instead
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
