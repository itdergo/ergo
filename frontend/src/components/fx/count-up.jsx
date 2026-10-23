import { jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useReducedMotion } from "@/lib/site-ui-primitives";
function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1.7,
  decimals = 0,
  className
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (reduced) {
      setValue(to);
      return;
    }
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / (duration * 1e3));
      setValue(to * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, to, duration]);
  return /* @__PURE__ */ jsxs("span", { ref, className, children: [
    prefix,
    value.toFixed(decimals),
    suffix
  ] });
}
export {
  CountUp
};
