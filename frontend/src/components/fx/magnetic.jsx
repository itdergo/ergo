import { jsx } from "react/jsx-runtime";
import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "@/lib/site-ui-primitives";
function Magnetic({ children, className, strength = 0.32, radius = 24 }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 190, damping: 15, mass: 0.45 });
  const springY = useSpring(y, { stiffness: 190, damping: 15, mass: 0.45 });
  const handleMove = (e) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(Math.max(-radius, Math.min(radius, relX * strength)));
    y.set(Math.max(-radius, Math.min(radius, relY * strength)));
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };
  return /* @__PURE__ */ jsx(motion.div, {
    ref,
    className,
    onMouseMove: reduced ? void 0 : handleMove,
    onMouseLeave: reduced ? void 0 : handleLeave,
    style: {
      x: reduced ? 0 : springX,
      y: reduced ? 0 : springY,
      display: "inline-block",
      willChange: reduced ? "auto" : "transform",
    },
    children,
  });
}
export { Magnetic };
