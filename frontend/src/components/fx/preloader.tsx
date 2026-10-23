/**
 * components/fx/preloader.tsx — Higgsfield-style boot loader.
 *
 * Counts 0 → 100 on an ease-out-expo curve, then lifts away and unmounts.
 *
 * Safety contract:
 * - `pointer-events: none` on the overlay, so it can never block a click. This
 *   matters for automated checks and for a visitor who tries to interact
 *   during the ~1.1s it is on screen.
 * - Scroll is NOT locked — locking body scroll shifts layout and traps
 *   keyboard users mid-page.
 * - Under `prefers-reduced-motion` it never mounts at all.
 * - `aria-hidden`, and it unmounts itself, so it can never sit in the
 *   accessibility tree or the tab order.
 */
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/site-ui-primitives";

const DURATION_MS = 1100;
const EXIT_MS = 420;

export function Preloader() {
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

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      // ease-out-expo: fast out of the gate, long settle onto 100.
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

  return (
    <div className={`preloader${leaving ? " preloader-leaving" : ""}`} aria-hidden="true">
      <div className="preloader-inner">
        <div className="preloader-mark">ERGO</div>
        <div className="preloader-sub">Contracts Philippines</div>
        <div className="preloader-track">
          <span style={{ transform: `scaleX(${count / 100})` }} />
        </div>
        <div className="preloader-count">{count}</div>
      </div>
    </div>
  );
}
