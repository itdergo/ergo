/**
 * components/fx/three-deck.tsx — Scroll-driven 3D cascading card deck.
 *
 * The signature Higgsfield "card deck": every card sits in the same grid cell
 * but is pushed out along X, Y and Z. As the section travels through the
 * viewport, the focus point walks across the deck, so the cards fan into a
 * cascade in front of you and collapse behind — depth is driven by the scroll
 * position, not by a timer.
 *
 * Layout is one composited grid cell per card with a `transform`, so this costs
 * one layer per card rather than a reflow per frame.
 *
 * Reduced-motion fallback: the deck renders as a plain horizontally scrollable
 * row with no transforms, because a rotating 3D stack is exactly the thing a
 * reduced-motion visitor asked not to see.
 */
import { useRef, useState, type ReactNode } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useReducedMotion } from "@/lib/site-ui-primitives";

interface ThreeDeckProps {
  items: ReactNode[];
  className?: string;
  /** Horizontal px per step away from the focused card. */
  spread?: number;
  /** Degrees of rotateY per step. */
  fan?: number;
  /** px of translateZ falloff per step (pushed away from the viewer). */
  depth?: number;
  /** px of vertical drop per step. */
  drop?: number;
  /** Stage height, px. */
  height?: number;
}

export function ThreeDeck({
  items,
  className,
  spread = 118,
  fan = 15,
  depth = 105,
  drop = 12,
  height = 440,
}: ThreeDeckProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const [progress, setProgress] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!reduced) setProgress(v);
  });

  const count = items.length;
  const focus = progress * (count - 1);
  const tail = count * 0.75;

  return (
    <div
      ref={ref}
      className={`three-deck${className ? ` ${className}` : ""}`}
      data-reduced={reduced || undefined}
      style={{ ["--three-deck-height" as string]: `${height}px` }}
    >
      <div className="three-deck-stage">
        {items.map((child, i) => {
          const rel = i - focus;
          const abs = Math.abs(rel);
          const transform = reduced
            ? "translate3d(0, 0, 0) rotateY(0deg)"
            : `translate3d(${rel * spread}px, ${abs * drop}px, ${-abs * depth}px) rotateY(${
                rel * -fan
              }deg)`;
          return (
            <motion.div
              key={i}
              className="three-deck-card"
              style={{
                transform,
                opacity: 1 - Math.min(abs / tail, 0.74),
                zIndex: Math.round(count - abs),
              }}
            >
              {child}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
