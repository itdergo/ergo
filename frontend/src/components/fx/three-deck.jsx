import { jsx } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useReducedMotion } from "@/lib/site-ui-primitives";
function ThreeDeck({
  items,
  className,
  spread = 118,
  fan = 15,
  depth = 105,
  drop = 12,
  height = 440
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const [progress, setProgress] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!reduced) setProgress(v);
  });
  const count = items.length;
  const focus = progress * (count - 1);
  const tail = count * 0.75;
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className: `three-deck${className ? ` ${className}` : ""}`,
      "data-reduced": reduced || void 0,
      style: { ["--three-deck-height"]: `${height}px` },
      children: /* @__PURE__ */ jsx("div", { className: "three-deck-stage", children: items.map((child, i) => {
        const rel = i - focus;
        const abs = Math.abs(rel);
        const transform = reduced ? "translate3d(0, 0, 0) rotateY(0deg)" : `translate3d(${rel * spread}px, ${abs * drop}px, ${-abs * depth}px) rotateY(${rel * -fan}deg)`;
        return /* @__PURE__ */ jsx(
          motion.div,
          {
            className: "three-deck-card",
            style: {
              transform,
              opacity: 1 - Math.min(abs / tail, 0.74),
              zIndex: Math.round(count - abs)
            },
            children: child
          },
          i
        );
      }) })
    }
  );
}
export {
  ThreeDeck
};
