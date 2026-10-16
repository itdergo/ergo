/**
 * lib/utils.ts — Shared utility functions.
 *
 * Currently provides:
 * - cn(): className merger combining clsx (conditional classes) with
 *   tailwind-merge (deduplication of conflicting Tailwind classes)
 *
 * This is the standard shadcn/ui utility for merging CSS classes.
 * Usage: cn("base-class", condition && "conditional-class", props.className)
 */
import { twMerge } from "tailwind-merge";

import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
