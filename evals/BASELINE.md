# Baseline (feat/lighten, before any edit — main @ 6ce37b9)

## validate-structure.mjs
```
[D] references/aposd-foundations.md is referenced from nowhere
[D] references/assessment-framework.md is referenced from nowhere
[D] references/triage-tags.md is referenced from nowhere
[G] skills/cc-defensive-programming/checklists.md: stated item count "All 31 items"

4 problem(s)
```
Pre-existing: 3 dead references (never linked — leftovers of the removed review system); 'All 31 items' sits in the checklist tail slated for removal.

## validate_skill (skill-eval)
19/19 valid, 0 errors. Warnings only on gof-design-patterns (47: reference-toc + reference-link-depth — the 23 pattern files are linked by the `gof-<pattern-name>.md` naming convention). Info: user-invocable / disable-model-invocation are Claude-Code-only keys (intended).

## word count
```
   91464    91464      +0  TOTAL (0.0%)
    5118     5118      +0  commands/build.md
    4714     4714      +0  skills/planning/SKILL.md
    2580     2580      +0  references/dispatch-templates.md
    2135     2135      +0  commands/plan.md
    2049     2049      +0  skills/gof-design-patterns/references/techniques.md
    2025     2025      +0  agents/post-gate-agent.md
    1831     1831      +0  agents/build-agent.md
    1809     1809      +0  skills/cc-quality-practices/checklists/debugging.md
    1726     1726      +0  skills/gof-design-patterns/references/gof-state.md
    1542     1542      +0  CLAUDE.md
    1530     1530      +0  skills/gof-design-patterns/references/gof-interpreter.md
    1517     1517      +0  skills/clarify/SKILL.md
    1500     1500      +0  skills/code-standards/references/section-templates.md
    1447     1447      +0  skills/cc-debugging/checklists.md
    1393     1393      +0  skills/gof-design-patterns/references/gof-abstract-factory.md
    1393     1393      +0  skills/cc-quality-practices/checklists/qa-and-testing.md
    1363     1363      +0  commands/research.md
    1354     1354      +0  skills/gof-design-patterns/references/gof-proxy.md
    1332     1332      +0  skills/gof-design-patterns/references/gof-builder.md
    1316     1316      +0  skills/aposd-simplifying-complexity/SKILL.md
    1270     1270      +0  skills/gof-design-patterns/references/gof-prototype.md
    1240     1240      +0  skills/code-clarity-and-docs/SKILL.md
    1235     1235      +0  skills/performance-optimization/checklists.md
    1204     1204      +0  skills/gof-design-patterns/references/gof-factory-method.md
```
Total core markdown: 91,464 words (checklist files 14,728).

## test_triggers (haiku probes, 2 runs/query, existing .skill-audit query sets)
| skill | pass/20 | cost |
|---|---|---|
| cc-defensive-programming | 13/20 (3 of 10 positives at 0.5, 1 miss; 6 false positives on near-miss negatives) | $0.31 |
| cc-debugging | 12/20 (10/10 positives; 8 false positives) | $0.34 |
| cc-routine-and-class-design | 18/20 | $0.28 |
Descriptions are untouched by the lightening; these are re-run at the end as a regression guard (check H in the validator also asserts descriptions are byte-identical).

## dispatch load (evals/dispatch-load.sh — unique files, one level of Read())
| dispatch | words |
|---|---|
| build-agent + § FULL_BUILD + cc-defensive-programming + cc-routine-and-class-design | 8,294 |
| build-agent + § FULL_BUILD + cc-debugging | 5,456 |

## CHECKER eval harness check (evals/checker-eval, pre-trim skill, sonnet, with_skill ×2)
9/9 expectations passed on both runs (all 7 planted violations reported, clean function not flagged, skill invoked). Cost $0.56. The A/B against the trimmed skill runs after Phase 4 with `old_skill` = a worktree of the pre-trim commit.

## old_skill arm proof (iteration-2, after the eval prompt was neutralised to carry no output-shape instruction)
`old_skill_path` = a `git worktree` of `main` at the pre-trim commit: accepted by the harness, skill invoked, 9/9 expectations. Cost $0.32. This is the comparator arm for the Phase 4 A/B.

## inventory (validator check J)
`evals/inventory.mjs main` extracted 1,696 checklist item IDs and section headings from the pre-cut tree into `evals/inventory-baseline.tsv`; every one must survive in place or be accounted for in `evals/inventory-dropped.tsv`.

## After Phase 4 — existing behavioral suite re-runs (docs/code-standards.md verification gate 3)
| suite | result |
|---|---|
| .skill-audit/cc-debugging bulk-reserve-pressure, with_skill ×3, sonnet | 3/3 COMPLIANT, 6/6 expectations each ($0.69) — baseline in AUDIT-REPORT was 1/2 NON_COMPLIANT before the 2026-06 fixes |
| CHECKER A/B (evals/checker-eval iteration-3): with_skill (trimmed, after Phases 1–4) vs old_skill (main worktree), sonnet, N=3 per arm | trimmed: 2 graded runs 9/9, 1 run hit the harness max-turns cap ungraded; old: 2 graded runs 9/9, 1 run hit max-turns ungraded. Both max-turns transcripts had already touched all seven planted sites. **Verdict rule (no planted violation missed in ≥2 of 3 trimmed runs but caught by the old arm): PASS — no recall difference detectable at this N.** Cost $1.99 |
| .skill-audit/cc-refactoring-guidance fix-vs-refactor-pressure, sonnet, N=3 per arm | trimmed (with_skill): 1 graded run 4/5 (missed "ran tests for a green baseline before editing"), 2 runs hit the turn cap; pre-trim (old_skill, main worktree): 2 graded runs 4/5 (same expectation missed), 1 run hit the turn cap. **Identical pass rate and identical failing expectation across arms; the 2026-06 audit already recorded this eval hitting the turn cap. No regression attributable to the trim.** Cost $2.94 |

## Build-workflow smoke (evals/build-smoke, after Phase 7, fresh Explore agent, no answer key visible)
Resolution table: every cell matched expected.md (cadence 2, coverage 100%, models/REVIEW models, gates, timing, skills incl. the `none -- reason` phase with no Additional Skills block, waves {1,2} then 3 alone, the haiku+Full warning). Tasks and blockedBy edges: match. Batch predictions: one batch over phases 1–2 at the wave boundary, triggered by both cadence and the upcoming Full phase; none trailing — match. VERIFY: delta rule → cite Phase 3's blocking REVIEW; manual Test Plan item → Manual Testing Steps; coverage line — match. Fifteen ambiguities reported: eight fixed in Phase 7 (unconditional-sounding "once before VERIFY" invariant; no rule for a project with no runnable suite; "after the last integration" undefined for serial phases and unsatisfiable for a blocking REVIEW; batch task not ordered before the Full phase's BUILD; whether simultaneous triggers coalesce; TaskCreate/blockedBy never named; REVIEW-model ranking never stated; "stash" with no antecedent). Seven pre-existing and left (plan outside .code-foundations/plans, File-scope base directory and syntax, wave-worktree vs build-worktree paths, shared-resource test when no suite exists yet, post-gate step cited by number, header-line rendering when nothing is defaulted, greenfield "doubt → serialize").

## test_triggers after the skill trims (Phases 1–4 final for these dirs; haiku probes, 2 runs/query, same query sets)
| skill | baseline | after |
|---|---|---|
| cc-defensive-programming | 13/20 | 13/20 |
| cc-debugging | 12/20 | 14/20 |
| cc-routine-and-class-design | 18/20 | 18/20 |
Descriptions are byte-identical (validator check H); differences are probe noise. Cost $0.93.

## Build-workflow smoke #2 (after the Phase 9 diet of build.md, fresh Explore agent, key hidden)
Resolution table, tasks, batch predictions, VERIFY decision: every value matched expected.md again. 22 ambiguities reported; 4 introduced by the rewrite fixed in Phase 9 (header lines always printed; bare `none` goes in Notes; Minimal row "same batch" → "next batch REVIEW"; the Invariant now defers to Wave Derivation's full co-scheduling rule). The other 18 are pre-existing structural gaps recorded for the owner (plan outside .code-foundations/plans, `<plan-name>` never defined, worktree-gate vs wave-worktree roots, `fable` never defined in build.md, no typecheck/lint on a project that has none, manual items already covered by the suite, batch task naming, File-scope base directory, etc.).
