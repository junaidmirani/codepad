# Codepad

A lightweight, fast, and beautiful code editor for reading and editing code files.
No bloat. Nothing you don't need.(vibecoded)

---

## Philosophy

Notepad is old & VS Code is heavy.
Codepad lives in between — instant startup, syntax highlighting for the languages you actually use, and a UI that respects your screen.

**Feature set is intentionally minimal:**
- Syntax highlighting (15+ languages)
- Multi-tab editing
- Open / Save / Save As
- Dark and light themes (hand-tuned, not defaults)
- Font size control
- Find & replace (built into CodeMirror)
- Drag and drop files
- Remembers your theme + font size

That's it. No terminal. No git panel. No extensions. No 400mb.

---

## Stack

| Layer | Technology |
|---|---|
| Shell | [Tauri 1.x](https://tauri.app) — native webview, no Chromium |
| Backend | Rust — file I/O, OS dialogs, CLI arg handling |
| Editor | [CodeMirror 6](https://codemirror.net) — modular, fast, battle-tested |
| UI | Vanilla JS + ES modules — no framework overhead |
| Bundler | [Vite 5](https://vitejs.dev) |
| Fonts | JetBrains Mono (editor), Inter (UI) |

**Binary target: < 10mb installed. Cold start: < 300ms.**

---

## Prerequisites

- [Node.js](https://nodejs.org) ≥ 18
- [Rust](https://rustup.rs) (stable, 1.70+)
- Tauri system dependencies — follow the [Tauri prerequisites guide](https://tauri.app/v1/guides/getting-started/prerequisites) for your OS

---

## Getting Started

```bash
# 1. Clone
git clone https://github.com/you/codepad
cd codepad

# 2. Install JS dependencies
npm install

# 3. Run in development mode
npm run tauri dev

# 4. Build for production
npm run tauri build
```

The release binary will be in `src-tauri/target/release/` and the installers in `src-tauri/target/release/bundle/`.

---

## Project Structure

```
codepad/
├── index.html              # App shell HTML
├── package.json
├── vite.config.js
├── src/
│   ├── main.js             # Entry point — boots app, wires events
│   ├── store.js            # Reactive state store
│   ├── tabs.js             # Tab state + DOM rendering
│   ├── fileops.js          # File I/O + language detection
│   ├── keybindings.js      # Global keyboard shortcuts
│   ├── editor/
│   │   ├── index.js        # CodeMirror instance manager
│   │   ├── themes.js       # Hand-tuned dark + light themes
│   │   └── languages.js    # Lazy language loader
│   └── styles/
│       └── main.css        # Full design system
└── src-tauri/
    ├── Cargo.toml
    ├── build.rs
    ├── tauri.conf.json
    └── src/
        └── main.rs         # Rust: file commands + OS integration
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+N` / `Ctrl+T` | New tab |
| `Ctrl+O` | Open file |
| `Ctrl+S` | Save |
| `Ctrl+Shift+S` | Save As |
| `Ctrl+W` | Close tab |
| `Ctrl+Tab` | Next tab |
| `Ctrl+Shift+Tab` | Previous tab |
| `Ctrl+F` | Find (CodeMirror built-in) |
| `Middle click tab` | Close tab |

---

## Adding Languages

To add a language not currently included:

1. Install the CodeMirror language package: `npm install @codemirror/lang-<name>`
2. Add a case in `src/editor/languages.js`
3. Add the extension mapping in `src/fileops.js` → `detectLanguage()`
4. Add display name in `languageLabel()` and badge in `languageBadge()`

---

## Performance Notes

- Each tab gets one persistent CodeMirror instance. Switching tabs shows/hides existing instances rather than recreating — zero re-parse cost.
- Language support is lazy-loaded: the parser for Python isn't loaded until you open a `.py` file.
- Release builds use `opt-level = "z"` (size), LTO, and symbol stripping. This keeps the Rust binary small.
- The Vite build tree-shakes CodeMirror — only language support you actually `import` is bundled.

---

## Icons

Place your icon files in `src-tauri/icons/`:
- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns` (macOS)
- `icon.ico` (Windows)

You can generate all sizes from a single source PNG using the Tauri CLI:
```bash
npx tauri icon path/to/your-icon.png
```

---

## License

MIT
