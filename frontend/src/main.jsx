import { jsx, jsxs } from "react/jsx-runtime";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Preloader } from "@/components/fx";
import { ErrorBoundary } from "@/components/error-boundary";
import "./index.css";
createRoot(document.getElementById("root"), {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  /* @__PURE__ */ jsxs(ErrorBoundary, {
    children: [/* @__PURE__ */ jsx(Preloader, {}), /* @__PURE__ */ jsx(App, {})],
  }),
);
