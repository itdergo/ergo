/**
 * hooks/use-mobile.tsx — Mobile viewport detection hook.
 *
 * Uses the matchMedia API to detect when the viewport crosses the
 * 768px breakpoint. Returns a boolean indicating mobile state.
 *
 * The hook initializes with the correct value and listens for
 * viewport changes, updating state accordingly.
 *
 * Usage: const isMobile = useIsMobile();
 */
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    // Create media query listener for mobile breakpoint (max-width: 767px)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
