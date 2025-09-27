if (typeof globalThis !== "undefined" && typeof (globalThis as any).indexedDB === "undefined") {
  try {
    (globalThis as any).indexedDB = undefined;
  } catch (error) {
    console.warn("Failed to polyfill indexedDB", error);
  }
}
