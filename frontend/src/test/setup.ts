import "@testing-library/jest-dom/vitest";

// Mock matchMedia for jsdom — jsdom does not implement it, and components
// that read prefers-reduced-motion (useReducedMotion in site-ui-primitives)
// call window.matchMedia on mount.
if (!globalThis.matchMedia) {
  globalThis.matchMedia = ((query: string) => {
    const listeners = new Set<(e: MediaQueryListEvent) => void>();
    const mql = {
      matches: false,
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: (e: MediaQueryListEvent) => void) =>
        listeners.add(listener),
      removeEventListener: (_type: string, listener: (e: MediaQueryListEvent) => void) =>
        listeners.delete(listener),
      addListener: (listener: (e: MediaQueryListEvent) => void) => listeners.add(listener),
      removeListener: (listener: (e: MediaQueryListEvent) => void) => listeners.delete(listener),
      dispatchEvent: () => false,
    };
    return mql as unknown as MediaQueryList;
  }) as unknown as typeof globalThis.matchMedia;
}

// Mock IntersectionObserver for jsdom
if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor(_callback: any, _options?: any) {}
    disconnect() {}
    observe(_target: Element) {}
    unobserve(_target: Element) {}
    takeRecords() {
      return [];
    }
  } as any;
}

// Mock ResizeObserver for jsdom
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    constructor(_callback: any) {}
    disconnect() {}
    observe(_target: Element) {}
    unobserve(_target: Element) {}
  } as any;
}
