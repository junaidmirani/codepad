/**
 * editor/index.js
 * Manages all CodeMirror editor instances.
 */

import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
} from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import {
  defaultKeymap,
  historyKeymap,
  history,
  indentWithTab,
} from "@codemirror/commands";
import {
  bracketMatching,
  indentOnInput,
  foldGutter,
  foldKeymap,
} from "@codemirror/language";
import {
  closeBrackets,
  closeBracketsKeymap,
  autocompletion,
  completionKeymap,
} from "@codemirror/autocomplete";
import {
  search,
  searchKeymap,
  highlightSelectionMatches,
} from "@codemirror/search";

import { darkTheme, lightTheme } from "./themes.js";
import { getLanguageExtension } from "./languages.js";
import { store } from "../store.js";

const instances = new Map();
const container = document.getElementById("editor-container");

export async function createEditor(tab) {
  const { id, content, language } = tab;
  const themeComp = new Compartment();
  const langComp = new Compartment();
  const fontComp = new Compartment();
  const wrapComp = new Compartment();

  const { theme, fontSize, wordWrap } = store.get();
  const langExt = await getLanguageExtension(language);

  const state = EditorState.create({
    doc: content,
    extensions: [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      search({ top: true }),
      keymap.of([
        indentWithTab,
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        ...searchKeymap,
      ]),
      themeComp.of(theme === "dark" ? darkTheme : lightTheme),
      langComp.of(langExt),
      fontComp.of(
        EditorView.theme({
          ".cm-content, .cm-gutter": { fontSize: `${fontSize}px` },
        }),
      ),
      wrapComp.of(wordWrap ? EditorView.lineWrapping : []),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) onDocChange(id, update.state.doc.toString());
        if (update.selectionSet) onCursorChange(update.state);
      }),
    ],
  });

  const wrap = document.createElement("div");
  wrap.className = "editor-instance";
  wrap.dataset.tabId = id;
  container.appendChild(wrap);

  const view = new EditorView({ state, parent: wrap });
  instances.set(id, { view, wrap, themeComp, langComp, fontComp, wrapComp });
  return view;
}

export function destroyEditor(tabId) {
  const inst = instances.get(tabId);
  if (!inst) return;
  inst.view.destroy();
  inst.wrap.remove();
  instances.delete(tabId);
}

export function activateEditor(tabId) {
  instances.forEach(({ wrap }, id) => {
    wrap.classList.toggle("active", id === tabId);
  });
  instances.get(tabId)?.view.focus();
}

export function getEditorContent(tabId) {
  return instances.get(tabId)?.view.state.doc.toString() ?? "";
}

export function setEditorContent(tabId, content) {
  const inst = instances.get(tabId);
  if (!inst) return;
  inst.view.dispatch({
    changes: { from: 0, to: inst.view.state.doc.length, insert: content },
  });
}

export function updateAllThemes(theme) {
  const ext = theme === "dark" ? darkTheme : lightTheme;
  instances.forEach(({ view, themeComp }) => {
    view.dispatch({ effects: themeComp.reconfigure(ext) });
  });
}

export function updateAllFontSizes(size) {
  instances.forEach(({ view, fontComp }) => {
    view.dispatch({
      effects: fontComp.reconfigure(
        EditorView.theme({
          ".cm-content, .cm-gutter": { fontSize: `${size}px` },
        }),
      ),
    });
  });
}

export function updateAllWordWrap(enabled) {
  instances.forEach(({ view, wrapComp }) => {
    view.dispatch({
      effects: wrapComp.reconfigure(enabled ? EditorView.lineWrapping : []),
    });
  });
}

export async function updateEditorLanguage(tabId, language) {
  const inst = instances.get(tabId);
  if (!inst) return;
  const ext = await getLanguageExtension(language);
  inst.view.dispatch({ effects: inst.langComp.reconfigure(ext) });
}

// ─── Internal ─────────────────────────────────────────────────────────────────

function onDocChange(tabId, newContent) {
  const { tabs } = store.get();
  const tab = tabs.find((t) => t.id === tabId);
  if (!tab) return;
  const isDirty = newContent !== tab.savedContent;
  const updated = tabs.map((t) =>
    t.id === tabId ? { ...t, content: newContent, isDirty } : t,
  );
  store.set({ tabs: updated });
  const tabEl = document.querySelector(`.tab[data-id="${tabId}"]`);
  if (tabEl) tabEl.classList.toggle("dirty", isDirty);
}

function onCursorChange(state) {
  const sel = state.selection.main;
  const line = state.doc.lineAt(sel.head);
  const col = sel.head - line.from + 1;
  document.getElementById("status-cursor").textContent =
    `Ln ${line.number}, Col ${col}`;
}
