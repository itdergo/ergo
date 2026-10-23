import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
function Lightbox({ src, alt, onClose }) {
  const handleKey = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );
  useEffect(() => {
    if (!src) return;
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [src, handleKey]);
  if (!src) return null;
  return /* @__PURE__ */ jsxs("div", {
    className: "lightbox-overlay",
    onClick: onClose,
    role: "dialog",
    "aria-modal": "true",
    "aria-label": alt,
    children: [
      /* @__PURE__ */ jsx("button", {
        className: "lightbox-close",
        onClick: onClose,
        "aria-label": "Close",
        children: /* @__PURE__ */ jsx(X, { size: 24 }),
      }),
      /* @__PURE__ */ jsx("img", {
        className: "lightbox-img",
        src,
        alt,
        onClick: (e) => e.stopPropagation(),
      }),
    ],
  });
}
export { Lightbox };
