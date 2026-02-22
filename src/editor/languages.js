/**
 * languages.js
 * Lazy-loads CodeMirror language support.
 * Official packages for the big ones, @codemirror/legacy-modes for the rest.
 */

import { StreamLanguage } from "@codemirror/language";

const cache = new Map();

export async function getLanguageExtension(lang) {
  if (cache.has(lang)) return cache.get(lang);

  let ext = [];

  try {
    switch (lang) {
      // ── Official packages ──────────────────────────────────────────
      case "javascript":
      case "jsx": {
        const { javascript } = await import("@codemirror/lang-javascript");
        ext = javascript({ jsx: lang === "jsx" });
        break;
      }
      case "typescript":
      case "tsx": {
        const { javascript } = await import("@codemirror/lang-javascript");
        ext = javascript({ typescript: true, jsx: lang === "tsx" });
        break;
      }
      case "python": {
        const { python } = await import("@codemirror/lang-python");
        ext = python();
        break;
      }
      case "rust": {
        const { rust } = await import("@codemirror/lang-rust");
        ext = rust();
        break;
      }
      case "html": {
        const { html } = await import("@codemirror/lang-html");
        ext = html({ matchClosingTags: true, selfClosingTags: true });
        break;
      }
      case "css": {
        const { css } = await import("@codemirror/lang-css");
        ext = css();
        break;
      }
      case "json": {
        const { json } = await import("@codemirror/lang-json");
        ext = json();
        break;
      }
      case "yaml": {
        const { yaml } = await import("@codemirror/lang-yaml");
        ext = yaml();
        break;
      }
      case "markdown": {
        const { markdown } = await import("@codemirror/lang-markdown");
        ext = markdown();
        break;
      }
      case "cpp":
      case "c": {
        const { cpp } = await import("@codemirror/lang-cpp");
        ext = cpp();
        break;
      }
      case "java": {
        const { java } = await import("@codemirror/lang-java");
        ext = java();
        break;
      }
      case "sql": {
        const { sql } = await import("@codemirror/lang-sql");
        ext = sql();
        break;
      }
      case "xml": {
        const { xml } = await import("@codemirror/lang-xml");
        ext = xml();
        break;
      }
      case "php": {
        const { php } = await import("@codemirror/lang-php");
        ext = php();
        break;
      }

      // ── Legacy-modes (StreamLanguage) ─────────────────────────────
      case "go": {
        const { go } = await import("@codemirror/legacy-modes/mode/go");
        ext = StreamLanguage.define(go);
        break;
      }
      case "ruby": {
        const { ruby } = await import("@codemirror/legacy-modes/mode/ruby");
        ext = StreamLanguage.define(ruby);
        break;
      }
      case "csharp": {
        const { csharp } = await import("@codemirror/legacy-modes/mode/clike");
        ext = StreamLanguage.define(csharp);
        break;
      }
      case "kotlin": {
        const { kotlin } = await import("@codemirror/legacy-modes/mode/clike");
        ext = StreamLanguage.define(kotlin);
        break;
      }
      case "swift": {
        const { swift } = await import("@codemirror/legacy-modes/mode/swift");
        ext = StreamLanguage.define(swift);
        break;
      }
      case "dart": {
        const { dart } = await import("@codemirror/legacy-modes/mode/clike");
        ext = StreamLanguage.define(dart);
        break;
      }
      case "shell": {
        const { shell } = await import("@codemirror/legacy-modes/mode/shell");
        ext = StreamLanguage.define(shell);
        break;
      }
      case "dockerfile": {
        const { dockerfile } =
          await import("@codemirror/legacy-modes/mode/dockerfile");
        ext = StreamLanguage.define(dockerfile);
        break;
      }
      case "lua": {
        const { lua } = await import("@codemirror/legacy-modes/mode/lua");
        ext = StreamLanguage.define(lua);
        break;
      }
      case "perl": {
        const { perl } = await import("@codemirror/legacy-modes/mode/perl");
        ext = StreamLanguage.define(perl);
        break;
      }
      case "r": {
        const { r } = await import("@codemirror/legacy-modes/mode/r");
        ext = StreamLanguage.define(r);
        break;
      }
      case "scala": {
        const { scala } = await import("@codemirror/legacy-modes/mode/clike");
        ext = StreamLanguage.define(scala);
        break;
      }
      case "haskell": {
        const { haskell } =
          await import("@codemirror/legacy-modes/mode/haskell");
        ext = StreamLanguage.define(haskell);
        break;
      }
      case "toml": {
        const { toml } = await import("@codemirror/legacy-modes/mode/toml");
        ext = StreamLanguage.define(toml);
        break;
      }
      case "nginx": {
        const { nginx } = await import("@codemirror/legacy-modes/mode/nginx");
        ext = StreamLanguage.define(nginx);
        break;
      }
      case "ini": {
        const { ini } =
          await import("@codemirror/legacy-modes/mode/properties");
        ext = StreamLanguage.define(ini);
        break;
      }
      case "diff": {
        const { diff } = await import("@codemirror/legacy-modes/mode/diff");
        ext = StreamLanguage.define(diff);
        break;
      }

      case "erlang": {
        const { erlang } = await import("@codemirror/legacy-modes/mode/erlang");
        ext = StreamLanguage.define(erlang);
        break;
      }
      case "elixir": {
        // Elixir shares the ruby tokenizer closely enough for highlighting
        const { ruby } = await import("@codemirror/legacy-modes/mode/ruby");
        ext = StreamLanguage.define(ruby);
        break;
      }
      case "clojure": {
        const { clojure } =
          await import("@codemirror/legacy-modes/mode/clojure");
        ext = StreamLanguage.define(clojure);
        break;
      }
      case "vb": {
        const { vb } = await import("@codemirror/legacy-modes/mode/vb");
        ext = StreamLanguage.define(vb);
        break;
      }

      default:
        ext = [];
    }
  } catch (err) {
    console.warn(`[codepad] Language "${lang}" failed to load:`, err);
    ext = [];
  }

  cache.set(lang, ext);
  return ext;
}
