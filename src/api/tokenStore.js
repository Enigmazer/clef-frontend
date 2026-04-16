// Module-level singleton.
// Stored in JS module memory — wiped on page refresh (intentional).
// A malicious cross-site page cannot access this memory, making it immune to CSRF.
// Never persisted to localStorage or sessionStorage.
let _accessToken = null;

export const tokenStore = {
  get: () => _accessToken,
  set: (token) => { _accessToken = token; },
  clear: () => { _accessToken = null; },
};
