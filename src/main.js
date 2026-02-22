/**
 * main.js
 * Codepad entry point.
 */

import { store, loadPrefs, loadSession } from "./store.js";
import { newTab, openTab } from "./tabs.js";
import { initKeybindings, openFileFromDialog } from "./keybindings.js";
import {
  updateAllThemes,
  updateAllFontSizes,
  updateAllWordWrap,
} from "./editor/index.js";
import { detectLanguage, readFile } from "./fileops.js";
(async function boot() {
  loadPrefs();
  applyTheme(store.get().theme);
  initKeybindings();
  wireWindowControls();
  wireToolbar();
  wireWelcomeButtons();
  wireWordWrap();
  wireFileDrop();
  await restoreSession();
  wireTauriFileOpen();
})();

// ─── Window controls ──────────────────────────────────────────────────────────

function wireWindowControls() {
  // Try Tauri window API — silently no-op in browser mode
  async function getWindow() {
    try {
      const { appWindow } = await import("@tauri-apps/api/window");
      return appWindow;
    } catch (_) {
      return null;
    }
  }

  document.getElementById("btn-close").addEventListener("click", async () => {
    const w = await getWindow();
    w ? w.close() : window.close();
  });

  document
    .getElementById("btn-minimize")
    .addEventListener("click", async () => {
      const w = await getWindow();
      if (w) w.minimize();
    });

  document
    .getElementById("btn-maximize")
    .addEventListener("click", async () => {
      const w = await getWindow();
      if (w) w.toggleMaximize();
    });
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

function wireToolbar() {
  document.getElementById("btn-theme").addEventListener("click", () => {
    const next = store.get().theme === "dark" ? "light" : "dark";
    store.set({ theme: next });
    applyTheme(next);
    updateAllThemes(next);
  });

  document.getElementById("btn-font-increase").addEventListener("click", () => {
    const sz = Math.min(store.get().fontSize + 1, 24);
    store.set({ fontSize: sz });
    updateAllFontSizes(sz);
  });

  document.getElementById("btn-font-decrease").addEventListener("click", () => {
    const sz = Math.max(store.get().fontSize - 1, 10);
    store.set({ fontSize: sz });
    updateAllFontSizes(sz);
  });

  document
    .getElementById("btn-new-tab")
    .addEventListener("click", () => newTab());
}

// ─── Welcome buttons ──────────────────────────────────────────────────────────

function wireWelcomeButtons() {
  document
    .getElementById("btn-open-file")
    .addEventListener("click", openFileFromDialog);
  document.getElementById("btn-new-file").addEventListener("click", newTab);
}

// ─── Word wrap ────────────────────────────────────────────────────────────────

function wireWordWrap() {
  const btn = document.getElementById("btn-wordwrap");

  // Sync button state with stored pref on boot
  updateWrapButton(store.get().wordWrap);

  btn.addEventListener("click", () => {
    const next = !store.get().wordWrap;
    store.set({ wordWrap: next });
    updateAllWordWrap(next);
    updateWrapButton(next);
  });

  // Alt+Z shortcut
  window.addEventListener("keydown", (e) => {
    if (e.altKey && e.key.toLowerCase() === "z") {
      e.preventDefault();
      btn.click();
    }
  });
}

function updateWrapButton(enabled) {
  const btn = document.getElementById("btn-wordwrap");
  btn.textContent = `Wrap: ${enabled ? "On" : "Off"}`;
  btn.classList.toggle("active", enabled);
}

// ─── Theme application ────────────────────────────────────────────────────────

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

// ─── Session restore ──────────────────────────────────────────────────────────

async function restoreSession() {
  const session = loadSession();
  if (!session?.sessionTabs?.length) return;

  for (const saved of session.sessionTabs) {
    try {
      const file = await readFile(saved.path);
      await openTab(file);
    } catch (_) {
      // File may have moved — skip silently
    }
  }
}

// ─── File drag and drop ───────────────────────────────────────────────────────

function wireFileDrop() {
  const overlay = document.createElement("div");
  overlay.id = "drag-overlay";
  overlay.textContent = "Drop files to open";
  document.body.appendChild(overlay);

  let depth = 0;

  document.addEventListener("dragenter", (e) => {
    e.preventDefault();
    depth++;
    if (hasFiles(e)) overlay.classList.add("active");
  });

  document.addEventListener("dragleave", () => {
    depth--;
    if (depth <= 0) {
      depth = 0;
      overlay.classList.remove("active");
    }
  });

  document.addEventListener("dragover", (e) => e.preventDefault());

  document.addEventListener("drop", async (e) => {
    e.preventDefault();
    overlay.classList.remove("active");
    depth = 0;
    for (const file of Array.from(e.dataTransfer?.files ?? [])) {
      try {
        const content = await file.text();
        await openTab({
          path: null,
          filename: file.name,
          content,
          language: detectLanguage(file.name),
        });
      } catch (err) {
        console.error("[codepad] Drop error:", err);
      }
    }
  });
}

function hasFiles(e) {
  return Array.from(e.dataTransfer?.types ?? []).includes("Files");
}

// ─── Tauri file-open integration ──────────────────────────────────────────────

async function wireTauriFileOpen() {
  try {
    const { invoke } = await import("@tauri-apps/api/tauri");
    const { listen } = await import("@tauri-apps/api/event");

    const args = await invoke("get_cli_args").catch(() => []);
    for (const arg of args) {
      if (arg && !arg.startsWith("-")) {
        try {
          await openTab(await invoke("read_file", { path: arg }));
        } catch (_) {}
      }
    }

    await listen("tauri://file-drop", async ({ payload }) => {
      const paths = Array.isArray(payload) ? payload : [payload];
      for (const path of paths) {
        try {
          await openTab(await invoke("read_file", { path }));
        } catch (_) {}
      }
    });
  } catch (_) {}
}
