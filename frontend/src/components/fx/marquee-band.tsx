/**
 * components/fx/marquee-band.tsx — Oversized outlined kinetic-type band.
 *
 * Higgsfield pages put a huge single line of outlined condensed type between
 * chapters. It is decorative: the same string is duplicated purely so the CSS
 * can loop `translateX(-50%)` seamlessly, and the duplicate is `aria-hidden`.
 *
 * Pauses on hover so the words stay readable; under `prefers-reduced-motion`
 * (or on a device where the visitor asked for less motion) it stops animating
 * and drops to a readable size instead.
 */
import { useReducedMotion } from "@/lib/site-ui-primitives";

const DEFAULT_ITEMS = [
  "German Engineering",
  "BIFMA Standards",
  "Designed for Work",
  "Made to Last",
  "Built for the Philippines",
];

export function MarqueeBand({ items = DEFAULT_ITEMS }: { items?: string[] }) {
  const reduced = useReducedMotion();
  // Trailing separator is part of the string so the loop point is invisible.
  const line = `${items.join("   ·   ")}   ·   `;

  return (
    <div className="marquee-band" data-reduced={reduced || undefined}>
      <div className="marquee-band-track">
        <span className="marquee-band-line">{line}</span>
        <span className="marquee-band-line" aria-hidden="true">
          {line}
        </span>
      </div>
    </div>
  );
}
