/**
 * lib/site-ui-primitives.tsx — Shared UI primitive components.
 *
 * Provides reusable building blocks used across multiple sections:
 * - TiltCard: 3D mouse-tracking tilt effect wrapper (perspective + rotateX/Y)
 * - ScrollReveal: scroll-triggered fade-in-up animation wrapper
 * - ParallaxImage: scroll-based parallax effect for images
 *
 * These primitives use Framer Motion for animations and are memoized
 * for performance.
 */
import { useState, useRef, memo } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import type { TiltCardProps, ScrollRevealProps, ParallaxImageProps } from "./site-ui-types";

// 3D Tilt Card Component
const TiltCard = memo(function TiltCard({
  children,
  className = "",
  maxTilt = 8,
  onClick,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
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
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ transform, transition: "transform 0.15s ease-out", transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  );
});

// Scroll Reveal Component
const ScrollReveal = memo(function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 1, y: 0 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
});

// Parallax Image Component
const ParallaxImage = memo(function ParallaxImage({
  src,
  alt,
  className = "",
  speed = 0.3,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);

  return (
    <div ref={ref} className={className} style={{ overflow: "hidden" }}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y, scale: 1.15, willChange: "transform" }}
        className="w-full h-full object-cover"
      />
    </div>
  );
});

export { TiltCard, ScrollReveal, ParallaxImage };
