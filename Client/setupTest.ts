// src/setupTests.ts

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  
  globalThis.ResizeObserver = MockResizeObserver;
}
