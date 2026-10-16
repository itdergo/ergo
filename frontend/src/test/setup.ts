import "@testing-library/jest-dom/vitest";

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
