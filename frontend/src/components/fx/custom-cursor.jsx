import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { useFxEnabled } from "./hooks";
const INTERACTIVE = "a, button, input, textarea, select, label, summary, [role='button'], [data-cursor]";
function CustomCursor() {
  const enabled = useFxEnabled();
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("fx-cursor");
    return () => root.classList.remove("fx-cursor");
  }, [enabled]);
  useEffect(() => {
    if (!enabled) return;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dot = { x: target.x, y: target.y };
    const ring = { x: target.x, y: target.y };
    const root = document.documentElement;
    let raf = 0;
    let shown = false;
    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!shown) {
        shown = true;
        root.classList.add("fx-cursor-ready");
      }
      const ringEl = ringRef.current;
      if (!ringEl) return;
      const el = e.target;
      const hit = el && typeof el.closest === "function" ? el.closest(INTERACTIVE) : null;
      ringEl.dataset.variant = hit?.dataset.cursor ?? (hit ? "link" : "default");
      ringEl.dataset.label = hit?.dataset.cursorLabel ?? "";
    };
    const onDown = () => root.classList.add("fx-cursor-press");
    const onUp = () => root.classList.remove("fx-cursor-press");
    const onLeave = () => root.classList.remove("fx-cursor-ready");
    const tick = () => {
      dot.x += (target.x - dot.x) * 0.42;
      dot.y += (target.y - dot.y) * 0.42;
      ring.x += (target.x - ring.x) * 0.17;
      ring.y += (target.y - ring.y) * 0.17;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      root.classList.remove("fx-cursor-press", "fx-cursor-ready");
    };
  }, [enabled]);
  if (!enabled) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fx-cursor-layer", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("span", { ref: ringRef, className: "fx-cursor-ring", "data-variant": "default", "data-label": "" }),
    /* @__PURE__ */ jsx("span", { ref: dotRef, className: "fx-cursor-dot" })
  ] });
}
export {
  CustomCursor
};
