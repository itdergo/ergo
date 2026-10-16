/**
 * lib/site-ui-types.ts — Shared TypeScript interfaces for UI primitives.
 */
import type { ReactNode, MouseEvent } from "react";

export interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

export interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
}
