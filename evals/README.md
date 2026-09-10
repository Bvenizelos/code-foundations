# evals — lighten regression suite

Built before any lightening edit (2026-09-10) so every cut can be checked against the pre-cut behavior.

| Check | Command | What it guards |
|---|---|---|
| Structural validator | `node evals/validate-structure.mjs` | orphan bundled files, unresolved `Read()` paths, unknown `Skill()` names, orphan references, dead section anchors (`§ X`, `file.md → Section`, `evals/anchors.tsv`), frontmatter, stated item counts |
| Word count delta | `evals/wordcount.sh` (`--all`, `--snapshot`) | the metric the owner cares about, per file vs `evals/wc-baseline.tsv` |
| Skill lint | skill-eval `validate_skill` on every `skills/*` dir | spec + house rules; zero errors required |
| Trigger regression | skill-eval `test_triggers` with `.skill-audit/trigger-workspaces/<skill>-workspace/trigger-queries.json` | descriptions are untouched by the lightening, so trigger rates must not move |
| CHECKER behavior | skill-eval `run_eval` on `evals/checker-eval/evals.json` (`checker-planted-violations`), configurations `with_skill` + `old_skill` (old = `git worktree` of the pre-trim commit) | the trimmed cc-defensive-programming CHECKER still catches all 7 planted violations and does not flag the clean function |
| Build-workflow smoke | `evals/build-smoke/` — a 2-phase `Status: ready` plan read through by a fresh agent executing SETUP/VERIFY from the doc | collapsed SETUP/VERIFY are executable by an agent that never saw the old version |

Baseline results live in `evals/BASELINE.md`.
