#!/usr/bin/env node
// section-wc.mjs — per-`## ` section word counts of a file at two git refs, side by side.
// Usage: node evals/section-wc.mjs <file> [refA=main] [refB=HEAD]   (use WORKTREE as a ref for the working copy)
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const [file, a = 'main', b = 'HEAD'] = process.argv.slice(2);
const text = ref => ref === 'WORKTREE' ? readFileSync(file, 'utf8') : execSync(`git show ${ref}:${file}`).toString();
const sections = t => { const m = new Map(); let cur = '(preamble)'; for (const l of t.split('\n')) { if (/^## /.test(l)) cur = l.replace(/^## /, '').replace(/\s*\(.*$/, '').trim(); m.set(cur, (m.get(cur) || 0) + l.split(/\s+/).filter(Boolean).length); } return m; };
const A = sections(text(a)), B = sections(text(b)); const keys = [...new Set([...A.keys(), ...B.keys()])];
let ta = 0, tb = 0; console.log(`| section | ${a} | ${b} | delta |\n|---|---:|---:|---:|`);
for (const k of keys) { const x = A.get(k) || 0, y = B.get(k) || 0; ta += x; tb += y; console.log(`| ${k} | ${x} | ${y} | ${y - x >= 0 ? '+' : ''}${y - x} |`); }
console.log(`| **total** | **${ta}** | **${tb}** | **${tb - ta}** |`);
