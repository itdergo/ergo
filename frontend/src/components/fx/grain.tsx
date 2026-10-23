/**
 * components/fx/grain.tsx — Film-grain overlay.
 *
 * Higgsfield pages read as footage, not as flat UI. A single fixed, tiled
 * SVG turbulence layer at ~4% opacity in `overlay` blend does that job for
 * roughly nothing in layout cost (one composited layer, no animation).
 *
 * Static on purpose: an animated grain forces a repaint every frame, which is
 * exactly the kind of cost that shows up on mid-range Android.
 */
export function Grain() {
  return <div className="fx-grain" aria-hidden="true" />;
}
