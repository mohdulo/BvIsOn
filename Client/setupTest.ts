// src/setupTests.ts
/// <reference types="vitest/globals" />
import i18n from "./src/i18n/i18n";
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  
  globalThis.ResizeObserver = MockResizeObserver;
}
beforeAll(() => {
  i18n.changeLanguage("en");
});
