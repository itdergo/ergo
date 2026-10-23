/**
 * components/fx/magnetic.tsx — Magnetic hover wrapper.
 *
 * Pulls its child toward the cursor while the pointer is over it, then springs
 * back on leave. Higgsfield buttons feel "alive" rather than merely hovered.
 *
 * The child is translated by a springed motion value (not a CSS transition), so
 * the motion is damped and weighty instead of linear. Disabled under
 * `prefers-reduced-motion`, where it renders as a plain inline-block.
 */
import { useRef, type MouseEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "@/lib/site-ui-primitives";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  /** Fraction of the pointer offset applied to the element (0–1). */
  strength?: number;
  /** Clamp on travel in either axis, px. */
  radius?: number;
}

export function Magnetic({ children, className, strength = 0.32, radius = 24 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 190, damping: 15, mass: 0.45 });
  const springY = useSpring(y, { stiffness: 190, damping: 15, mass: 0.45 });

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
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

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={reduced ? undefined : handleMove}
      onMouseLeave={reduced ? undefined : handleLeave}
      style={{
        x: reduced ? 0 : springX,
        y: reduced ? 0 : springY,
        display: "inline-block",
        willChange: reduced ? "auto" : "transform",
      }}
    >
      {children}
    </motion.div>
  );
}
