// Polyfill for localStorage in Node environment (build time)
// This strictly prevents "TypeError: localStorage.getItem is not a function" in libraries like expo-notifications
if (
  typeof localStorage === "undefined" ||
  typeof localStorage.getItem !== "function"
) {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  } as any;
}
