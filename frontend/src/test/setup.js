import "@testing-library/jest-dom/vitest";
if (!globalThis.matchMedia) {
  globalThis.matchMedia = ((query) => {
    const listeners = /* @__PURE__ */ new Set();
    const mql = {
      matches: false,
      media: query,
      onchange: null,
      addEventListener: (_type, listener) => listeners.add(listener),
      removeEventListener: (_type, listener) => listeners.delete(listener),
      addListener: (listener) => listeners.add(listener),
      removeListener: (listener) => listeners.delete(listener),
      dispatchEvent: () => false
    };
    return mql;
  });
}
if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor(_callback, _options) {
    }
    disconnect() {
    }
    observe(_target) {
    }
    unobserve(_target) {
    }
    takeRecords() {
      return [];
    }
  };
}
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    constructor(_callback) {
    }
    disconnect() {
    }
    observe(_target) {
    }
    unobserve(_target) {
    }
  };
}
