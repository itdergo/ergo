import { jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect, memo } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}
const TiltCard = memo(function TiltCard2({ children, className = "", maxTilt = 8, onClick }) {
  const ref = useRef(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)");
  const reduced = useReducedMotion();
  const handleMouseMove = (e) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * maxTilt;
    const rotateY = (x - 0.5) * maxTilt;
    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
    );
  };
  const handleMouseLeave = () => {
    if (reduced) return;
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  };
  return /* @__PURE__ */ jsx("div", {
    ref,
    className,
    style: {
      transform,
      transition: reduced ? "none" : "transform 0.15s ease-out",
      transformStyle: "preserve-3d",
    },
    onMouseMove: reduced ? void 0 : handleMouseMove,
    onMouseLeave: reduced ? void 0 : handleMouseLeave,
    onClick,
    children,
  });
});
const ScrollReveal = memo(function ScrollReveal2({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  return /* @__PURE__ */ jsx(motion.div, {
    ref,
    className,
    initial: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    animate: reduced || isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] },
    children,
  });
});
const ParallaxImage = memo(function ParallaxImage2({ src, alt, className = "", speed = 0.3 }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);
  return /* @__PURE__ */ jsx("div", {
    ref,
    className,
    style: { overflow: "hidden" },
    children: /* @__PURE__ */ jsx(motion.img, {
      src,
      alt,
      style: { y, scale: 1.15, willChange: "transform" },
      className: "w-full h-full object-cover",
    }),
  });
});
export { ParallaxImage, ScrollReveal, TiltCard, useReducedMotion };
