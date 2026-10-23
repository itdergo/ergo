import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/site-ui-primitives";
const DURATION_MS = 1100;
const EXIT_MS = 420;
function Preloader() {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (reduced) {
      setGone(true);
      return;
    }
    let raf = 0;
    let timer = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setCount(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setLeaving(true);
        timer = window.setTimeout(() => setGone(true), EXIT_MS);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [reduced]);
  if (gone) return null;
  return /* @__PURE__ */ jsx("div", { className: `preloader${leaving ? " preloader-leaving" : ""}`, "aria-hidden": "true", children: /* @__PURE__ */ jsxs("div", { className: "preloader-inner", children: [
    /* @__PURE__ */ jsx("div", { className: "preloader-mark", children: "ERGO" }),
    /* @__PURE__ */ jsx("div", { className: "preloader-sub", children: "Contracts Philippines" }),
    /* @__PURE__ */ jsx("div", { className: "preloader-track", children: /* @__PURE__ */ jsx("span", { style: { transform: `scaleX(${count / 100})` } }) }),
    /* @__PURE__ */ jsx("div", { className: "preloader-count", children: count })
  ] }) });
}
export {
  Preloader
};
