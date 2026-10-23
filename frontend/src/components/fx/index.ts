/**
 * components/fx/index.ts — Barrel for the Higgsfield-style FX layer.
 *
 * Import from here rather than deep paths:
 *   import { CustomCursor, Grain, Magnetic } from "@/components/fx";
 */
export { CustomCursor } from "./custom-cursor";
export { CountUp } from "./count-up";
export { Grain } from "./grain";
export { KineticHeading } from "./kinetic-heading";
export { Magnetic } from "./magnetic";
export { MarqueeBand } from "./marquee-band";
export { Preloader } from "./preloader";
export { ScrollRail } from "./scroll-rail";
export { ThreeDeck } from "./three-deck";
export { useFxEnabled, useFinePointer } from "./hooks";
