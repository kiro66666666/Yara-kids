import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const ROOTS = ["src", "supabase/functions"];
const TEXT_EXTENSIONS = new Set([".ts", ".html", ".css", ".scss", ".json", ".md", ".js", ".mjs"]);
const IGNORE_PARTS = ["node_modules", ".git", "tmp_zip_", ".bak", ".snapshot_"];
const suspiciousPattern = /(\uFFFD|\u00C3[\u00A1-\u00BF]|\u00C2[^\s]|\u00E2[\u0080-\u00BF]|\u00F0\u0178)/;

let hasError = false;

function shouldIgnore(path) {
  return IGNORE_PARTS.some((part) => path.includes(part));
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (shouldIgnore(fullPath)) continue;

    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, files);
    } else if (TEXT_EXTENSIONS.has(extname(fullPath))) {
      files.push(fullPath);
    }
  }

  return files;
}

for (const root of ROOTS) {
  const files = walk(root);
  for (const file of files) {
    const bytes = readFileSync(file);

    let text;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      console.error(`[ERROR] Invalid UTF-8: ${file}`);
      hasError = true;
      continue;
    }

    const lines = text.split("\n");
    lines.forEach((line, index) => {
      if (suspiciousPattern.test(line)) {
        console.error(`[ERROR] Possible mojibake: ${file}:${index + 1}: ${line.trim()}`);
        hasError = true;
      }
    });
  }
}

if (hasError) {
  process.exit(1);
}

console.log("[OK] Encoding check passed (UTF-8 + no common mojibake markers).");
