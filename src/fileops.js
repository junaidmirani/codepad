/**
 * fileops.js
 * Wraps all Tauri file system commands.
 * Falls back to browser APIs in dev/browser mode.
 */

let invoke, dialog;

async function getTauri() {
  if (invoke) return;
  try {
    const api = await import("@tauri-apps/api/tauri");
    const dlg = await import("@tauri-apps/api/dialog");
    invoke = api.invoke;
    dialog = dlg;
  } catch (_) {
    invoke = null;
    dialog = null;
  }
}

export async function openFileDialog() {
  await getTauri();
  if (invoke) {
    const result = await invoke("open_file_dialog");
    return result ?? null;
  }
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*";
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return resolve(null);
      const content = await file.text();
      resolve({
        path: file.name,
        filename: file.name,
        content,
        language: detectLanguage(file.name),
      });
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}

export async function readFile(path) {
  await getTauri();
  if (invoke) return await invoke("read_file", { path });
  throw new Error("read_file not available in browser mode");
}

export async function writeFile(path, content) {
  await getTauri();
  if (invoke) {
    await invoke("write_file", { path, content });
    return;
  }
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = path.split(/[\\/]/).pop() ?? "file.txt";
  a.click();
  URL.revokeObjectURL(url);
}

export async function saveFileDialog(content, currentPath = null) {
  await getTauri();
  if (invoke) {
    const result = await invoke("save_file_dialog", { content, currentPath });
    return result ?? null;
  }
  await writeFile("file.txt", content);
  return "file.txt";
}

// ─── Language detection ───────────────────────────────────────────────────────

export function detectLanguage(filename) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map = {
    // JavaScript family
    js: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    ts: "typescript",
    jsx: "jsx",
    tsx: "tsx",

    // Python
    py: "python",
    pyw: "python",

    // Systems
    rs: "rust",
    go: "go",
    c: "c",
    h: "c",
    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    "c++": "cpp",
    hpp: "cpp",

    // JVM
    java: "java",
    kt: "kotlin",
    kts: "kotlin",
    scala: "scala",
    sc: "scala",
    groovy: "groovy",

    // .NET
    cs: "csharp",
    vb: "vb",

    // Web
    html: "html",
    htm: "html",
    css: "css",
    scss: "css",
    less: "css",
    php: "php",

    // Data / config
    json: "json",
    jsonc: "json",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    xml: "xml",
    svg: "xml",
    xsl: "xml",
    ini: "ini",
    cfg: "ini",
    conf: "ini",

    // Docs
    md: "markdown",
    mdx: "markdown",
    markdown: "markdown",

    // Shell / scripting
    sh: "shell",
    bash: "shell",
    zsh: "shell",
    fish: "shell",
    ps1: "shell",
    lua: "lua",
    rb: "ruby",
    rake: "ruby",
    gemspec: "ruby",
    pl: "perl",
    pm: "perl",
    r: "r",
    rmd: "r",

    // Mobile / systems
    swift: "swift",
    dart: "dart",

    // DB
    sql: "sql",

    // Functional
    hs: "haskell",
    lhs: "haskell",
    ex: "elixir",
    exs: "elixir",
    erl: "erlang",
    hrl: "erlang",
    clj: "clojure",
    cljs: "clojure",
    edn: "clojure",

    // Infra / devops
    dockerfile: "dockerfile",

    // API
    graphql: "graphql",
    gql: "graphql",

    // Misc
    diff: "diff",
    patch: "diff",
    nginx: "nginx",

    txt: "text",
  };
  return map[ext] ?? "text";
}

export function languageLabel(lang) {
  const labels = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    jsx: "JSX",
    tsx: "TSX",
    python: "Python",
    rust: "Rust",
    go: "Go",
    c: "C",
    cpp: "C++",
    csharp: "C#",
    java: "Java",
    kotlin: "Kotlin",
    scala: "Scala",
    swift: "Swift",
    dart: "Dart",
    html: "HTML",
    css: "CSS",
    php: "PHP",
    json: "JSON",
    yaml: "YAML",
    toml: "TOML",
    xml: "XML",
    markdown: "Markdown",
    sql: "SQL",
    graphql: "GraphQL",
    shell: "Shell",
    dockerfile: "Dockerfile",
    lua: "Lua",
    ruby: "Ruby",
    perl: "Perl",
    r: "R",
    haskell: "Haskell",
    elixir: "Elixir",
    erlang: "Erlang",
    clojure: "Clojure",
    vb: "Visual Basic",
    groovy: "Groovy",
    diff: "Diff",
    nginx: "Nginx",
    ini: "INI",
    text: "Plain Text",
  };
  return labels[lang] ?? lang;
}

export function languageBadge(lang) {
  const badges = {
    javascript: "JS",
    typescript: "TS",
    jsx: "JX",
    tsx: "TX",
    python: "PY",
    rust: "RS",
    go: "GO",
    c: "C",
    cpp: "C+",
    csharp: "C#",
    java: "JV",
    kotlin: "KT",
    scala: "SC",
    swift: "SW",
    dart: "DA",
    html: "HT",
    css: "CS",
    php: "PH",
    json: "JN",
    yaml: "YL",
    toml: "TM",
    xml: "XM",
    markdown: "MD",
    sql: "SQ",
    graphql: "GQ",
    shell: "SH",
    dockerfile: "DF",
    lua: "LU",
    ruby: "RB",
    perl: "PL",
    r: "R",
    haskell: "HS",
    elixir: "EX",
    erlang: "ER",
    clojure: "CJ",
    vb: "VB",
    groovy: "GR",
    diff: "DF",
    nginx: "NG",
    ini: "IN",
    text: "TX",
  };
  return badges[lang] ?? "??";
}

export function languageColor(lang) {
  const colors = {
    javascript: "#f0db4f",
    typescript: "#3178c6",
    jsx: "#61dafb",
    tsx: "#3178c6",
    python: "#3572a5",
    rust: "#dea584",
    go: "#00add8",
    c: "#555555",
    cpp: "#f34b7d",
    csharp: "#178600",
    java: "#b07219",
    kotlin: "#7f52ff",
    scala: "#c22d40",
    swift: "#f05138",
    dart: "#00b4ab",
    html: "#e34c26",
    css: "#563d7c",
    php: "#4f5d95",
    json: "#8bc34a",
    yaml: "#cb171e",
    toml: "#9c4221",
    xml: "#0060ac",
    markdown: "#083fa1",
    sql: "#e38c00",
    graphql: "#e10098",
    shell: "#89e051",
    dockerfile: "#384d54",
    lua: "#000080",
    ruby: "#701516",
    perl: "#0298c3",
    r: "#198ce7",
    haskell: "#5e5086",
    elixir: "#6e4a7e",
    erlang: "#b83998",
    clojure: "#db5855",
    vb: "#945db7",
    groovy: "#e69f56",
    diff: "#88aacc",
    nginx: "#009900",
    ini: "#888888",
    text: "#8b949e",
  };
  return colors[lang] ?? "#8b949e";
}
