require("@testing-library/jest-dom");

// jsdom has no IntersectionObserver; framer-motion's whileInView needs one.
if (typeof window !== "undefined" && typeof window.IntersectionObserver === "undefined") {
  class IntersectionObserverStub {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  window.IntersectionObserver = IntersectionObserverStub;
  global.IntersectionObserver = IntersectionObserverStub;
}
