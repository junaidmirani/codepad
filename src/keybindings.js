/**
 * keybindings.js
 * Global keyboard shortcuts for Codepad.
 * These operate at the window level (above CodeMirror's own keymaps).
 */

import { store } from './store.js'
import {
  newTab,
  openTab,
  closeTab,
  getActiveTab,
  setActiveTab,
  markTabSaved,
} from './tabs.js'
import {
  openFileDialog,
  saveFileDialog,
  writeFile,
} from './fileops.js'
import { getEditorContent } from './editor/index.js'

export function initKeybindings() {
  window.addEventListener('keydown', async e => {
    const ctrl = e.ctrlKey || e.metaKey

    if (ctrl && !e.shiftKey) {
      switch (e.key.toLowerCase()) {
        case 'n': {
          e.preventDefault()
          await newTab()
          break
        }
        case 'o': {
          e.preventDefault()
          await openFileFromDialog()
          break
        }
        case 's': {
          e.preventDefault()
          await saveActiveTab()
          break
        }
        case 'w': {
          e.preventDefault()
          const tab = getActiveTab()
          if (tab) await closeTab(tab.id)
          break
        }
        case 't': {
          e.preventDefault()
          await newTab()
          break
        }
        // Ctrl+Tab / Ctrl+Shift+Tab for cycling
        case 'tab': {
          e.preventDefault()
          cycleTab(1)
          break
        }
      }
    }

    if (ctrl && e.shiftKey) {
      switch (e.key.toLowerCase()) {
        case 's': {
          e.preventDefault()
          await saveActiveTabAs()
          break
        }
        case 'tab': {
          e.preventDefault()
          cycleTab(-1)
          break
        }
      }
    }
  })
}

export async function openFileFromDialog() {
  const file = await openFileDialog()
  if (file) await openTab(file)
}

export async function saveActiveTab() {
  const tab = getActiveTab()
  if (!tab) return

  const content = getEditorContent(tab.id)

  // If no path yet, do Save As
  if (!tab.path) {
    await saveActiveTabAs()
    return
  }

  try {
    await writeFile(tab.path, content)
    markTabSaved(tab.id, { path: tab.path, filename: tab.filename, content })
  } catch (err) {
    console.error('[codepad] Save failed:', err)
    alert(`Failed to save: ${err.message ?? err}`)
  }
}

export async function saveActiveTabAs() {
  const tab = getActiveTab()
  if (!tab) return

  const content = getEditorContent(tab.id)

  try {
    const newPath = await saveFileDialog(content, tab.path)
    if (!newPath) return

    const filename = newPath.split(/[\\/]/).pop()
    markTabSaved(tab.id, { path: newPath, filename, content })
  } catch (err) {
    console.error('[codepad] Save As failed:', err)
    alert(`Failed to save: ${err.message ?? err}`)
  }
}

function cycleTab(direction) {
  const { tabs, activeTabId } = store.get()
  if (tabs.length < 2) return
  const idx = tabs.findIndex(t => t.id === activeTabId)
  const next = (idx + direction + tabs.length) % tabs.length
  setActiveTab(tabs[next].id)
}
