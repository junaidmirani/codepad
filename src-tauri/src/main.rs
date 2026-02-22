// src-tauri/src/main.rs
// Codepad — Rust backend.
// Handles all file I/O and OS integration.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::Path;

// ─── Data types ───────────────────────────────────────────────────────────────

#[derive(serde::Serialize, serde::Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FilePayload {
    pub path: String,
    pub filename: String,
    pub content: String,
    pub language: String,
}

// ─── Language detection ───────────────────────────────────────────────────────

fn detect_language(path: &str) -> &'static str {
    let ext = Path::new(path)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    match ext.as_str() {
        "js" | "mjs" | "cjs" => "javascript",
        "ts"                  => "typescript",
        "jsx"                 => "jsx",
        "tsx"                 => "tsx",
        "py"                  => "python",
        "rs"                  => "rust",
        "html" | "htm"        => "html",
        "css" | "scss" | "less" => "css",
        "json" | "jsonc"      => "json",
        "yaml" | "yml"        => "yaml",
        "md" | "mdx"          => "markdown",
        "cpp" | "cc" | "cxx" | "c++" => "cpp",
        "c" | "h"             => "c",
        "java"                => "java",
        "sql"                 => "sql",
        "xml" | "svg"         => "xml",
        "sh" | "bash" | "zsh" => "shell",
        "go"                  => "go",
        "rb"                  => "ruby",
        "php"                 => "php",
        "toml"                => "toml",
        _                     => "text",
    }
}

fn filename_from_path(path: &str) -> String {
    Path::new(path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("untitled")
        .to_string()
}

// ─── Tauri commands ───────────────────────────────────────────────────────────

/// Read a file by absolute path.
#[tauri::command]
fn read_file(path: String) -> Result<FilePayload, String> {
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read '{}': {}", path, e))?;

    Ok(FilePayload {
        filename: filename_from_path(&path),
        language: detect_language(&path).to_string(),
        path,
        content,
    })
}

/// Write content to a file by absolute path.
#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    // Ensure parent directory exists
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    fs::write(&path, content)
        .map_err(|e| format!("Failed to write '{}': {}", path, e))
}

/// Show the OS file-open dialog and return file contents.
#[tauri::command]
async fn open_file_dialog(window: tauri::Window) -> Result<Option<FilePayload>, String> {
    let (tx, rx) = std::sync::mpsc::channel::<Option<std::path::PathBuf>>();

    tauri::api::dialog::FileDialogBuilder::new()
        .set_parent(&window)
        .add_filter(
            "Code & Text Files",
            &[
                "js", "mjs", "ts", "tsx", "jsx",
                "py", "rs", "go",
                "html", "htm", "css", "scss", "less",
                "json", "jsonc", "yaml", "yml",
                "md", "mdx",
                "cpp", "cc", "c", "h", "java",
                "sql", "xml", "svg", "sh", "bash",
                "rb", "php", "toml", "txt",
            ],
        )
        .add_filter("All Files", &["*"])
        .pick_file(move |path| {
            let _ = tx.send(path);
        });

    match rx.recv().map_err(|e| e.to_string())? {
        Some(path) => {
            let path_str = path.to_string_lossy().to_string();
            let result = read_file(path_str)?;
            Ok(Some(result))
        }
        None => Ok(None),
    }
}

/// Show the OS save dialog and write content. Returns the chosen path.
#[tauri::command]
async fn save_file_dialog(
    window: tauri::Window,
    content: String,
    current_path: Option<String>,
) -> Result<Option<String>, String> {
    let (tx, rx) = std::sync::mpsc::channel::<Option<std::path::PathBuf>>();

    let mut builder = tauri::api::dialog::FileDialogBuilder::new()
        .set_parent(&window);

    // Pre-fill directory from current path
    if let Some(ref cp) = current_path {
        if let Some(parent) = Path::new(cp).parent() {
            builder = builder.set_directory(parent);
        }
        if let Some(name) = Path::new(cp).file_name() {
            builder = builder.set_file_name(&name.to_string_lossy());
        }
    }

    builder.save_file(move |path| {
        let _ = tx.send(path);
    });

    match rx.recv().map_err(|e| e.to_string())? {
        Some(path) => {
            let path_str = path.to_string_lossy().to_string();
            write_file(path_str.clone(), content)?;
            Ok(Some(path_str))
        }
        None => Ok(None),
    }
}

/// Returns CLI arguments passed to the process (for "Open With" support).
#[tauri::command]
fn get_cli_args() -> Vec<String> {
    std::env::args().skip(1).collect()
}


// ─── Entry point ──────────────────────────────────────────────────────────────

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            open_file_dialog,
            save_file_dialog,
            get_cli_args,
        ])
        .run(tauri::generate_context!())
        .expect("error while running codepad");
}
