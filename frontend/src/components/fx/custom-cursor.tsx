/**
 * components/fx/custom-cursor.tsx — Higgsfield-style pointer.
 *
 * A small acid dot that tracks the cursor immediately, plus a larger ring that
 * chases it on a lerp. Hovering anything interactive widens the ring; elements
 * can opt into a labelled "view" state with `data-cursor="view"` and
 * `data-cursor-label="…"`.
 *
 * Safety contract (this replaces the OS cursor, so it must never fail silently):
 * - Only mounts when motion is allowed AND the pointer is fine — see hooks.ts.
 * - `pointer-events: none` on the whole layer, so it can never swallow a click
 *   or block a form control.
 * - The native cursor is hidden by adding `.fx-cursor` to `<html>`. That class
 *   is added in an effect that only runs once this component has mounted, so a
 *   JS failure or a touch device leaves the native cursor completely untouched.
 * - Position is written straight to `style.transform` inside rAF rather than
 *   through React state, so mousemove never triggers a re-render.
 */
import { useEffect, useRef } from "react";
import { useFxEnabled } from "./hooks";

/** Anything that should widen the ring when hovered. */
const INTERACTIVE =
  "a, button, input, textarea, select, label, summary, [role='button'], [data-cursor]";

export function CustomCursor() {
  const enabled = useFxEnabled();
  const dotRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);

  // Mount side-effect: hide the native cursor for as long as this layer is up.
  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("fx-cursor");
    return () => root.classList.remove("fx-cursor");
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dot = { x: target.x, y: target.y };
    const ring = { x: target.x, y: target.y };
    const root = document.documentElement;
    let raf = 0;
    let shown = false;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!shown) {
        shown = true;
        root.classList.add("fx-cursor-ready");
      }
      const ringEl = ringRef.current;
      if (!ringEl) return;
      const el = e.target as HTMLElement | null;
      const hit =
        el && typeof el.closest === "function"
          ? (el.closest(INTERACTIVE) as HTMLElement | null)
          : null;
      // Written to the DOM, not to state: mousemove fires far faster than
      // React should re-render.
      ringEl.dataset.variant = hit?.dataset.cursor ?? (hit ? "link" : "default");
      ringEl.dataset.label = hit?.dataset.cursorLabel ?? "";
    };

    const onDown = () => root.classList.add("fx-cursor-press");
    const onUp = () => root.classList.remove("fx-cursor-press");
    const onLeave = () => root.classList.remove("fx-cursor-ready");

    const tick = () => {
      // Dot is nearly instant; ring lags behind for the "chase" feel.
      dot.x += (target.x - dot.x) * 0.42;
      dot.y += (target.y - dot.y) * 0.42;
      ring.x += (target.x - ring.x) * 0.17;
      ring.y += (target.y - ring.y) * 0.17;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      root.classList.remove("fx-cursor-press", "fx-cursor-ready");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="fx-cursor-layer" aria-hidden="true">
      <span ref={ringRef} className="fx-cursor-ring" data-variant="default" data-label="" />
      <span ref={dotRef} className="fx-cursor-dot" />
    </div>
  );
}
