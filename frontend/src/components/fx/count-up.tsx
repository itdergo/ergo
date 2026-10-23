/**
 * components/fx/count-up.tsx — Animated metric counter.
 *
 * Counts from 0 to `to` on an ease-out-cubic curve the first time it scrolls
 * into view. Used for the hero and "at a glance" stat strips, where a number
 * that assembles itself reads as more considered than one that is simply there.
 *
 * Under `prefers-reduced-motion` it renders the final value immediately, with no
 * timer and no rAF loop.
 */
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useReducedMotion } from "@/lib/site-ui-primitives";

interface CountUpProps {
  to: number;
  prefix?: string;
  suffix?: string;
  /** Seconds. */
  duration?: number;
  decimals?: number;
  className?: string;
}

export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1.7,
  decimals = 0,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
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
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      setValue(to * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
