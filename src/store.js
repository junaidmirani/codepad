/**
 * store.js
 * Central reactive state store.
 */

const listeners = new Map();

function createStore(initial) {
  let state = { ...initial };

  function get() {
    return state;
  }

  function set(partial) {
    const prev = state;
    state = { ...state, ...partial };
    Object.keys(partial).forEach((key) => {
      if (prev[key] !== state[key] && listeners.has(key)) {
        listeners.get(key).forEach((fn) => fn(state[key], prev[key]));
      }
    });
  }

  function on(key, fn) {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key).add(fn);
    return () => listeners.get(key).delete(fn);
  }

  return { get, set, on };
}

export const store = createStore({
  tabs: [],
  activeTabId: null,
  theme: "dark",
  fontSize: 13,
  wordWrap: false,
});

const PREFS_KEY = "codepad:prefs";

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return;
    const prefs = JSON.parse(raw);
    store.set({
      theme: prefs.theme ?? "dark",
      fontSize: prefs.fontSize ?? 13,
      wordWrap: prefs.wordWrap ?? false,
    });
  } catch (_) {}
}

export function savePrefs() {
  const { theme, fontSize, wordWrap } = store.get();
  try {
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ theme, fontSize, wordWrap }),
    );
  } catch (_) {}
}

store.on("theme", savePrefs);
store.on("fontSize", savePrefs);
store.on("wordWrap", savePrefs);

// ─── Session persistence ──────────────────────────────────────────────────────
const SESSION_KEY = "codepad:session";

export function saveSession() {
  const { tabs, activeTabId } = store.get();
  // Only save tabs that have a real file path (not untitled new files)
  const sessionTabs = tabs
    .filter((t) => t.path && !t.isDirty)
    .map((t) => ({ path: t.path, filename: t.filename, language: t.language }));
  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ sessionTabs, activeTabId }),
    );
  } catch (_) {}
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}
