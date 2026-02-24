import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOTS = ['src', 'supabase/functions'];
const TEXT_EXTENSIONS = new Set(['.ts', '.html', '.css', '.scss', '.json', '.md', '.js', '.mjs']);
const IGNORE_PARTS = ['node_modules', '.git', 'tmp_zip_', '.bak', '.snapshot_'];

const suspiciousPattern = /(�|Ã[¡-¿]|Â[^\s]|â[-¿]|ðŸ)/;
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
      text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      console.error(`❌ Invalid UTF-8: ${file}`);
      hasError = true;
      continue;
    }

    const lines = text.split('\n');
    lines.forEach((line, index) => {
      if (suspiciousPattern.test(line)) {
        console.error(`❌ Possible mojibake: ${file}:${index + 1}: ${line.trim()}`);
        hasError = true;
      }
    });
  }
}

if (hasError) {
  process.exit(1);
}

console.log('✅ Encoding check passed (UTF-8 + no common mojibake markers).');
