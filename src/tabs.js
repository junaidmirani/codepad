/**
 * tabs.js
 * Tab state + DOM rendering. Includes inline rename for new files.
 */

import { store, saveSession } from "./store.js";
import { createEditor, destroyEditor, activateEditor } from "./editor/index.js";
import {
  languageBadge,
  languageColor,
  languageLabel,
  detectLanguage,
} from "./fileops.js";

let tabIdCounter = 0;
const tabsEl = document.getElementById("tabs");
const welcomeEl = document.getElementById("welcome");
const statusLang = document.getElementById("status-language");

export function makeTab({
  path = null,
  filename = "untitled",
  content = "",
  language = "text",
} = {}) {
  return {
    id: `tab-${++tabIdCounter}`,
    path,
    filename,
    content,
    savedContent: content,
    language,
    isDirty: false,
  };
}

export async function newTab() {
  const tab = makeTab();
  await addTab(tab, true); // true = trigger inline rename
}

export async function openTab(filePayload) {
  const { tabs } = store.get();
  const existing = tabs.find((t) => t.path && t.path === filePayload.path);
  if (existing) {
    await setActiveTab(existing.id);
    return;
  }
  const tab = makeTab(filePayload);
  await addTab(tab, false);
}

async function addTab(tab, triggerRename = false) {
  const { tabs } = store.get();
  store.set({ tabs: [...tabs, tab] });
  renderTab(tab);
  await createEditor(tab);
  await setActiveTab(tab.id);
  saveSession();
  if (triggerRename) {
    // Small delay so the tab is fully rendered and active
    setTimeout(() => startRename(tab.id), 80);
  }
}

export async function closeTab(tabId) {
  const { tabs } = store.get();
  const tab = tabs.find((t) => t.id === tabId);
  if (!tab) return;
  if (tab.isDirty) {
    const ok = confirm(`"${tab.filename}" has unsaved changes. Close anyway?`);
    if (!ok) return;
  }
  const idx = tabs.indexOf(tab);
  const remaining = tabs.filter((t) => t.id !== tabId);
  store.set({ tabs: remaining });
  destroyEditor(tabId);
  removeTabEl(tabId);
  saveSession();
  if (remaining.length === 0) {
    store.set({ activeTabId: null });
    showWelcome();
    return;
  }
  const next = remaining[Math.min(idx, remaining.length - 1)];
  await setActiveTab(next.id);
}

export async function closeOtherTabs(keepTabId) {
  const { tabs } = store.get();
  for (const t of tabs.filter((t) => t.id !== keepTabId)) await closeTab(t.id);
}

export async function closeAllTabs() {
  for (const t of [...store.get().tabs]) await closeTab(t.id);
}

export async function setActiveTab(tabId) {
  const { tabs } = store.get();
  const tab = tabs.find((t) => t.id === tabId);
  if (!tab) return;
  store.set({ activeTabId: tabId });
  document.querySelectorAll(".tab").forEach((el) => {
    el.classList.toggle("active", el.dataset.id === tabId);
    el.setAttribute("aria-selected", el.dataset.id === tabId);
  });
  activateEditor(tabId);
  hideWelcome();
  updateStatusBar(tab);
}

export function markTabSaved(tabId, { path, filename, content }) {
  const { tabs } = store.get();
  const updated = tabs.map((t) =>
    t.id === tabId
      ? { ...t, path, filename, content, savedContent: content, isDirty: false }
      : t,
  );
  store.set({ tabs: updated });
  const tab = updated.find((t) => t.id === tabId);
  const nameEl = document.querySelector(`.tab[data-id="${tabId}"] .tab-name`);
  if (nameEl) nameEl.textContent = filename;
  const tabEl = document.querySelector(`.tab[data-id="${tabId}"]`);
  if (tabEl) {
    tabEl.classList.remove("dirty");
    tabEl.title = path ?? filename;
  }
  updateStatusBar(tab);
  saveSession();
}

export function getActiveTab() {
  const { tabs, activeTabId } = store.get();
  return tabs.find((t) => t.id === activeTabId) ?? null;
}

// ─── Inline rename ────────────────────────────────────────────────────────────

export function startRename(tabId) {
  const tabEl = document.querySelector(`.tab[data-id="${tabId}"]`);
  if (!tabEl) return;
  const nameEl = tabEl.querySelector(".tab-name");
  if (!nameEl) return;

  const { tabs } = store.get();
  const tab = tabs.find((t) => t.id === tabId);
  if (!tab) return;

  const input = document.createElement("input");
  input.className = "tab-rename-input";
  input.value = tab.filename;
  input.spellcheck = false;
  input.setAttribute("aria-label", "Rename file");

  nameEl.replaceWith(input);
  input.select();

  function commit() {
    const raw = input.value.trim();
    const value = raw || tab.filename;
    const span = document.createElement("span");
    span.className = "tab-name";
    span.textContent = value;
    input.replaceWith(span);
    if (value !== tab.filename) applyRename(tabId, value);
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      commit();
    }
    e.stopPropagation(); // don't trigger global shortcuts while typing
  });

  input.addEventListener("blur", commit);
}

function applyRename(tabId, newFilename) {
  const lang = detectLanguage(newFilename);
  const { tabs } = store.get();
  const updated = tabs.map((t) =>
    t.id === tabId ? { ...t, filename: newFilename, language: lang } : t,
  );
  store.set({ tabs: updated });

  // Update lang icon in tab
  const tabEl = document.querySelector(`.tab[data-id="${tabId}"]`);
  const icon = tabEl?.querySelector(".tab-lang-icon");
  if (icon) {
    icon.textContent = languageBadge(lang);
    icon.style.color = languageColor(lang);
    icon.title = languageLabel(lang);
  }

  const tab = updated.find((t) => t.id === tabId);
  updateStatusBar(tab);
}

// ─── DOM rendering ────────────────────────────────────────────────────────────

function renderTab(tab) {
  const el = document.createElement("div");
  el.className = "tab";
  el.dataset.id = tab.id;
  el.role = "tab";
  el.setAttribute("aria-selected", "false");
  el.title = tab.path ?? tab.filename;
  el.innerHTML = `
    <span class="tab-lang-icon" style="color:${languageColor(tab.language)}" title="${languageLabel(tab.language)}">${languageBadge(tab.language)}</span>
    <span class="tab-name">${esc(tab.filename)}</span>
    <span class="tab-dirty" aria-hidden="true"></span>
    <button class="tab-close" title="Close tab" aria-label="Close ${esc(tab.filename)}">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/>
      </svg>
    </button>
  `;
  el.addEventListener("click", (e) => {
    if (!e.target.closest(".tab-close")) setActiveTab(tab.id);
  });
  el.addEventListener("mousedown", (e) => {
    if (e.button === 1) {
      e.preventDefault();
      closeTab(tab.id);
    }
  });
  el.addEventListener("dblclick", (e) => {
    if (!e.target.closest(".tab-close")) startRename(tab.id);
  });
  el.querySelector(".tab-close").addEventListener("click", (e) => {
    e.stopPropagation();
    closeTab(tab.id);
  });
  el.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    showContextMenu(e, tab.id);
  });
  tabsEl.appendChild(el);
  setTimeout(
    () => el.scrollIntoView({ behavior: "smooth", inline: "nearest" }),
    50,
  );
}

function removeTabEl(tabId) {
  document.querySelector(`.tab[data-id="${tabId}"]`)?.remove();
}

function showWelcome() {
  welcomeEl.classList.remove("hidden");
  statusLang.textContent = "—";
  document.title = "Codepad";
}
function hideWelcome() {
  welcomeEl.classList.add("hidden");
}

function updateStatusBar(tab) {
  statusLang.textContent = languageLabel(tab.language);
  document.title = `${tab.filename} — Codepad`;
}

// ─── Context menu ─────────────────────────────────────────────────────────────

let ctxTabId = null;
const ctxMenu = document.getElementById("context-menu");

function showContextMenu(e, tabId) {
  ctxTabId = tabId;
  ctxMenu.classList.remove("hidden");
  const x = Math.min(e.clientX, window.innerWidth - ctxMenu.offsetWidth - 8);
  const y = Math.min(e.clientY, window.innerHeight - ctxMenu.offsetHeight - 8);
  ctxMenu.style.left = `${x}px`;
  ctxMenu.style.top = `${y}px`;
}

document.addEventListener("click", () => ctxMenu.classList.add("hidden"));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") ctxMenu.classList.add("hidden");
});

ctxMenu.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn || !ctxTabId) return;
  const action = btn.dataset.action;
  ctxMenu.classList.add("hidden");
  switch (action) {
    case "rename-tab":
      startRename(ctxTabId);
      break;
    case "close-tab":
      await closeTab(ctxTabId);
      break;
    case "close-others":
      await closeOtherTabs(ctxTabId);
      break;
    case "close-all":
      await closeAllTabs();
      break;
    case "copy-path": {
      const tab = store.get().tabs.find((t) => t.id === ctxTabId);
      if (tab?.path) await navigator.clipboard.writeText(tab.path);
      break;
    }
  }
  ctxTabId = null;
});

function esc(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
