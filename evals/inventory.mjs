#!/usr/bin/env node
// inventory.mjs — extract every checklist item ID and every ##/### heading from the plugin markdown of a git ref.
// Usage: node evals/inventory.mjs [ref]   (default: main)  → TSV on stdout: file \t kind \t id
import { execSync } from 'node:child_process';
const ref = process.argv[2] || 'main'; // pass the pre-cut sha recorded in the baseline header, never a post-cut ref
const files = execSync(`git ls-tree -r --name-only ${ref} -- skills commands agents references`).toString().trim().split('\n').filter(f => f.endsWith('.md'));
for (const f of files) {
  const t = execSync(`git show ${ref}:${f}`, { maxBuffer: 1 << 24 }).toString();
  for (const l of t.split('\n')) {
    const item = l.match(/^- \[ \] ([A-Z]{1,3}-\d+):/); if (item) console.log(`${f}\titem\t${item[1]}`);
    const h = l.match(/^(##|###) (.+?)\s*$/); if (h && !/^(Chain|Evidence)$/.test(h[2])) console.log(`${f}\theading\t${h[2]}`);
  }
}
