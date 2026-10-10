#!/usr/bin/env node
// dup-spans.mjs — reports 12-word spans that appear in more than one core markdown file (informational; not a gate).
import { readFileSync } from 'node:fs'; import { execSync } from 'node:child_process';
const files = execSync("git ls-files skills commands agents references docs CLAUDE.md README.md | grep '\\.md$'").toString().trim().split('\n');
const N = 12, seen = new Map();
for (const f of files) {
  const w = readFileSync(f, 'utf8').toLowerCase().replace(/[`*_|#>\[\]()"'-]/g, ' ').split(/\s+/).filter(Boolean);
  const local = new Set();
  for (let i = 0; i + N <= w.length; i++) { const k = w.slice(i, i + N).join(' '); if (local.has(k)) continue; local.add(k); if (!seen.has(k)) seen.set(k, new Set()); seen.get(k).add(f); }
}
const pairs = new Map();
for (const [k, fs] of seen) if (fs.size > 1) { const key = [...fs].sort().join('  <->  '); pairs.set(key, (pairs.get(key) || 0) + 1); }
console.log('shared 12-gram windows (≈ duplicated words ~ count+11) per file pair:');
for (const [k, c] of [...pairs].sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(String(c).padStart(5), k);
