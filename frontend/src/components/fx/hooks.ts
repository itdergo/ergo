/**
 * components/fx/hooks.ts — Shared gating hooks for the Higgsfield-style FX layer.
 *
 * Every pointer-driven effect in this layer must be gated on TWO signals:
 *
 * 1. `prefers-reduced-motion` — vestibular safety. A visitor who asked the OS
 *    for less motion must not get a cursor that chases them or a deck that
 *    rotates under scroll.
 * 2. `pointer: fine` — there is no cursor to follow on touch or coarse-pointer
 *    devices. Mounting the custom cursor there would be dead weight (and a
 *    continuous requestAnimationFrame battery cost) for zero visual effect.
 *
 * Components that only need the motion signal can use `useReducedMotion` from
 * `@/lib/site-ui-primitives` directly.
 */
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/site-ui-primitives";

/** True when the visitor has a fine pointer (mouse / trackpad / stylus). */
export function useFinePointer() {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setFine(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setFine(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return fine;
}

/** True when the pointer-driven FX layer should mount at all. */
export function useFxEnabled() {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  return !reduced && fine;
}
