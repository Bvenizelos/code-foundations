#!/usr/bin/env node
// validate-structure.mjs — structural validator for the code-foundations plugin markdown.
// Checks (each reports every violation, exit 1 if any):
//   A. every non-SKILL.md file bundled in skills/<s>/ is linked from that SKILL.md
//   B. every Read(${CLAUDE_PLUGIN_ROOT}/...) and Read(${CLAUDE_SKILL_DIR}/...) path resolves
//   C. every Skill(code-foundations:<name>) names a real skill dir
//   D. every references/*.md is referenced from at least one other file
//   E. section anchors: `§ NAME` → heading in references/dispatch-templates.md;
//      `<file>.md → Section` → heading in that file; plus evals/anchors.tsv (file \t heading substring)
//   F. frontmatter: skills (name == dir, quoted description, user-invocable: false; planning also
//      disable-model-invocation: true), commands (quoted description), agents (name + quoted description)
//   G. no stated item counts ("Total items: N", "All N items")
//   H. every description: in skills/commands/agents is byte-identical to evals/descriptions-baseline.tsv
//   I. evals/rules-registry.tsv: each (file, phrase) — the phrase must appear verbatim in that file (relocated rules keep a home)
//   J. evals/inventory-baseline.tsv (extracted from `main` by evals/inventory.mjs — not written by the cutter): every checklist item ID
//      and ##/### heading either still exists in the same file, or is accounted for in evals/inventory-dropped.tsv
// Usage: node evals/validate-structure.mjs   (from repo root)
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, basename } from 'node:path';

const ROOT = process.cwd();
const CORE = ['skills', 'commands', 'agents', 'references', 'docs', 'CLAUDE.md', 'README.md'];
const problems = [];
const fail = (check, msg) => problems.push(`[${check}] ${msg}`);

function walk(p) {
  const abs = join(ROOT, p);
  if (!existsSync(abs)) return [];
  if (statSync(abs).isFile()) return [p];
  return readdirSync(abs).flatMap(n => walk(join(p, n)));
}
const mdFiles = CORE.flatMap(walk).filter(f => f.endsWith('.md'));
const text = Object.fromEntries(mdFiles.map(f => [f, readFileSync(join(ROOT, f), 'utf8')]));
const headings = f => (text[f] || '').split('\n').filter(l => /^#{1,6} /.test(l)).map(l => l.replace(/^#+ /, '').trim());
const skillDirs = readdirSync(join(ROOT, 'skills')).filter(d => existsSync(join(ROOT, 'skills', d, 'SKILL.md')));

// A. bundled files linked from SKILL.md
for (const s of skillDirs) {
  const skill = text[`skills/${s}/SKILL.md`];
  // a naming-convention link like `gof-<pattern-name>.md` covers every file with that prefix
  const prefixes = [...skill.matchAll(/`([a-z-]+)<[a-z-]+>\.md`/g)].map(m => m[1]);
  for (const f of walk(`skills/${s}`)) {
    if (!f.endsWith('.md') || f.endsWith('SKILL.md')) continue;
    const rel = relative(`skills/${s}`, f);
    const linked = skill.includes(rel) || skill.includes(basename(f)) || prefixes.some(p => basename(f).startsWith(p));
    if (!linked) fail('A', `${f} is not linked from skills/${s}/SKILL.md`);
  }
}

// B. Read() paths resolve
for (const f of mdFiles) {
  for (const m of text[f].matchAll(/Read\(\$\{CLAUDE_(PLUGIN_ROOT|SKILL_DIR)\}\/([^)\s]+)\)/g)) {
    const base = m[1] === 'PLUGIN_ROOT' ? ROOT : join(ROOT, dirname(f).replace(/^(skills\/[^/]+).*/, '$1'));
    if (m[1] === 'SKILL_DIR' && !f.startsWith('skills/')) fail('B', `${f}: CLAUDE_SKILL_DIR used outside a skill`);
    if (!existsSync(join(base, m[2]))) fail('B', `${f}: Read path does not resolve: ${m[0]}`);
  }
  if (!f.startsWith('docs/')) // docs/code-standards.md quotes the unbraced form as a counter-example
    for (const m of text[f].matchAll(/(?<!\$\{)(?<!\{)\$CLAUDE_(PLUGIN_ROOT|SKILL_DIR)\b/g)) fail('B', `${f}: unbraced ${m[0]}`);
}

// C. Skill(code-foundations:x) exists
for (const f of mdFiles) for (const m of text[f].matchAll(/Skill\(code-foundations:([a-z0-9-]+)\)/g))
  if (!skillDirs.includes(m[1])) fail('C', `${f}: unknown skill ${m[0]}`);

// D. references/*.md referenced from somewhere else
for (const r of walk('references').filter(f => f.endsWith('.md'))) {
  const stem = basename(r, '.md');
  const used = mdFiles.some(f => f !== r && (text[f].includes(basename(r)) || text[f].includes(`references/${stem}`)));
  if (!used) fail('D', `${r} is referenced from nowhere`);
}

// E. anchors
const dispatch = headings('references/dispatch-templates.md');
const fileByName = Object.fromEntries(mdFiles.map(f => [basename(f), f]));
for (const f of mdFiles) {
  for (const m of text[f].matchAll(/§ ([A-Z][A-Z_]+)\b/g))
    if (!dispatch.some(h => h.startsWith(`§ ${m[1]}`))) fail('E', `${f}: § ${m[1]} is not a heading in dispatch-templates.md`);
  for (const m of text[f].matchAll(/\b([a-z-]+\.md) → ([A-Z][A-Za-z -]+?)(?= step|\)|,|\.|;|$| —)/gm)) {
    const target = fileByName[m[1]];
    if (!target) { fail('E', `${f}: arrow ref to unknown file ${m[1]}`); continue; }
    if (!headings(target).some(h => h.includes(m[2].trim()))) fail('E', `${f}: "${m[1]} → ${m[2].trim()}" has no matching heading`);
  }
  for (const m of text[f].matchAll(/Gate Failure Protocol → ([A-Z][A-Za-z ]+?)(?=\)|\.|,|;|$)/gm))
    if (!headings('references/gate-failure-protocol.md').some(h => h.includes(m[1].trim()))) fail('E', `${f}: Gate Failure Protocol → ${m[1].trim()} has no heading`);
}
if (existsSync(join(ROOT, 'evals/anchors.tsv'))) {
  for (const line of readFileSync(join(ROOT, 'evals/anchors.tsv'), 'utf8').split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    const [file, anchor] = line.split('\t');
    if (!text[file]) { fail('E', `anchors.tsv: file ${file} missing`); continue; }
    if (!headings(file).some(h => h.includes(anchor))) fail('E', `anchors.tsv: ${file} has no heading containing "${anchor}"`);
  }
}

// F. frontmatter
function fm(f) {
  const t = text[f];
  if (!t.startsWith('---\n')) return null;
  const end = t.indexOf('\n---', 4);
  if (end < 0) return null;
  const o = {};
  for (const l of t.slice(4, end).split('\n')) { const i = l.indexOf(':'); if (i > 0) o[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }
  return o;
}
const quoted = v => typeof v === 'string' && /^".*"$/.test(v);
for (const s of skillDirs) {
  const f = `skills/${s}/SKILL.md`, o = fm(f);
  if (!o) { fail('F', `${f}: no frontmatter`); continue; }
  if (o.name !== s) fail('F', `${f}: name "${o.name}" != dir "${s}"`);
  if (!quoted(o.description)) fail('F', `${f}: description missing or not double-quoted`);
  if (o['user-invocable'] !== 'false') fail('F', `${f}: user-invocable must be false`);
  if (s === 'planning' && o['disable-model-invocation'] !== 'true') fail('F', `${f}: planning must keep disable-model-invocation: true`);
}
for (const f of mdFiles.filter(f => f.startsWith('commands/'))) {
  const o = fm(f); if (!o) { fail('F', `${f}: no frontmatter`); continue; }
  if (!quoted(o.description)) fail('F', `${f}: description missing or not double-quoted`);
}
for (const f of mdFiles.filter(f => f.startsWith('agents/'))) {
  const o = fm(f); if (!o) { fail('F', `${f}: no frontmatter`); continue; }
  if (!o.name || o.name !== basename(f, '.md')) fail('F', `${f}: name must equal filename`);
  if (!quoted(o.description)) fail('F', `${f}: description missing or not double-quoted`);
}

// G. stated item counts
for (const f of mdFiles) for (const m of text[f].matchAll(/(Total items:\s*\d+|All \d+ items)/g)) fail('G', `${f}: stated item count "${m[1]}"`);

// H. descriptions byte-identical to baseline
if (existsSync(join(ROOT, 'evals/descriptions-baseline.tsv'))) {
  for (const line of readFileSync(join(ROOT, 'evals/descriptions-baseline.tsv'), 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const [file, expected] = line.split('\t');
    const actual = (text[file] || '').split('\n').find(l => l.startsWith('description:'));
    if (actual !== expected) fail('H', `${file}: description differs from baseline`);
  }
}

// I. rules registry — relocated or load-bearing rules must still be present where the registry says
if (existsSync(join(ROOT, 'evals/rules-registry.tsv'))) {
  for (const line of readFileSync(join(ROOT, 'evals/rules-registry.tsv'), 'utf8').split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    const [file, phrase] = line.split('\t');
    if (!text[file]) { fail('I', `rules-registry: file ${file} missing`); continue; }
    if (!text[file].includes(phrase)) fail('I', `rules-registry: ${file} no longer contains "${phrase}"`);
  }
}

// J. pre-cut inventory — a dropped item or section the cutter never noticed fails here
if (existsSync(join(ROOT, 'evals/inventory-baseline.tsv'))) {
  const dropped = new Set();
  if (existsSync(join(ROOT, 'evals/inventory-dropped.tsv')))
    for (const line of readFileSync(join(ROOT, 'evals/inventory-dropped.tsv'), 'utf8').split('\n')) {
      if (!line.trim() || line.startsWith('#')) continue;
      const [file, kind, id] = line.split('\t'); dropped.add(`${file}\t${kind}\t${id}`);
      if (!line.split('\t')[3]?.trim()) fail('J', `inventory-dropped: ${file} ${id} has no "carried by" note`);
    }
  for (const line of readFileSync(join(ROOT, 'evals/inventory-baseline.tsv'), 'utf8').split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    const [file, kind, id] = line.split('\t');
    if (dropped.has(line)) { if (text[file] && (kind === 'item' ? new RegExp(`^- \\[ \\] ${id}:`, 'm') : new RegExp(`^#{2,3} ${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm')).test(text[file])) fail('J', `inventory-dropped lists ${file} ${id} but it still exists`); continue; }
    if (!text[file]) { fail('J', `${file} (${kind} ${id}) was deleted without an inventory-dropped entry`); continue; }
    const present = kind === 'item' ? new RegExp(`^- \\[ \\] ${id}:`, 'm').test(text[file]) : new RegExp(`^#{2,3} ${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm').test(text[file]);
    if (!present) fail('J', `${file}: ${kind} "${id}" gone and not in inventory-dropped.tsv`);
  }
}

if (problems.length) { console.log(problems.join('\n')); console.log(`\n${problems.length} problem(s)`); process.exit(1); }
console.log(`OK — ${mdFiles.length} files, ${skillDirs.length} skills, 0 problems`);
