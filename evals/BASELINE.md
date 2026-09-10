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

# AFTER — feat/lighten final (Phase 10)

## Word counts (evals/wordcount.sh — changed files)
```
  before    after   delta  file
    1831     2026    +195  agents/build-agent.md
    2025     2174    +149  agents/post-gate-agent.md
    1542     1622     +80  CLAUDE.md
    5118     3087   -2031  commands/build.md
     225      244     +19  commands/debug.md
    2135     1776    -359  commands/plan.md
    1073     1237    +164  docs/code-standards.md
    1006     1026     +20  README.md
     387        0    -387  references/aposd-foundations.md
     395        0    -395  references/assessment-framework.md
     883      390    -493  references/cc-foundations.md
     701      743     +42  references/commit-format.md
    2580     2225    -355  references/dispatch-templates.md
     993     1065     +72  references/gate-failure-protocol.md
     682        0    -682  references/pattern-reuse-gate.md
     913      805    -108  references/plan-integration.md
       0     1151   +1151  references/plan-schema.md
     416        0    -416  references/triage-tags.md
     434      555    +121  references/trust-report.md
     738      723     -15  skills/aposd-designing-deep-modules/SKILL.md
     647      669     +22  skills/aposd-reviewing-module-design/checklists.md
     965     1025     +60  skills/aposd-reviewing-module-design/SKILL.md
     711      605    -106  skills/aposd-simplifying-complexity/checklists.md
    1316     1359     +43  skills/aposd-simplifying-complexity/SKILL.md
     538        0    -538  skills/aposd-verifying-correctness/checklists.md
     823      859     +36  skills/aposd-verifying-correctness/SKILL.md
     655      645     -10  skills/ca-architecture-boundaries/SKILL.md
     747      568    -179  skills/cc-control-flow-quality/checklists/conditionals-and-structure.md
    1040      811    -229  skills/cc-control-flow-quality/checklists/loops-and-advanced.md
     960      937     -23  skills/cc-control-flow-quality/SKILL.md
    1447     1209    -238  skills/cc-debugging/checklists.md
     793      773     -20  skills/cc-debugging/SKILL.md
    1139      861    -278  skills/cc-defensive-programming/checklists.md
    1072     1018     -54  skills/cc-defensive-programming/SKILL.md
     999      386    -613  skills/cc-pseudocode-programming/checklists.md
     717      619     -98  skills/cc-pseudocode-programming/SKILL.md
       0     1286   +1286  skills/cc-quality-practices/checklists.md
    1809        0   -1809  skills/cc-quality-practices/checklists/debugging.md
    1393        0   -1393  skills/cc-quality-practices/checklists/qa-and-testing.md
     551      579     +28  skills/cc-quality-practices/SKILL.md
     757      600    -157  skills/cc-refactoring-guidance/checklists.md
     804      788     -16  skills/cc-refactoring-guidance/SKILL.md
    1109      922    -187  skills/cc-routine-and-class-design/checklists.md
    1076     1051     -25  skills/cc-routine-and-class-design/SKILL.md
    1157      999    -158  skills/code-clarity-and-docs/checklists.md
    1240     1210     -30  skills/code-clarity-and-docs/SKILL.md
     772      743     -29  skills/code-standards/SKILL.md
    1235     1205     -30  skills/performance-optimization/checklists.md
    1075     1041     -34  skills/performance-optimization/SKILL.md
    4714     3789    -925  skills/planning/SKILL.md
    1030     1010     -20  skills/welc-legacy-code/SKILL.md
   91464    82512   -8952  TOTAL (-9.8%)
```

## Dispatch-relevant set (core minus skills/gof-design-patterns/references/**)
baseline 63901 → now 54949 (-14.0%)

## Dispatch load
```
  2026  agents/build-agent.md
   473  references/dispatch-templates.md (§ FULL_BUILD only)
  1018  skills/cc-defensive-programming/SKILL.md
   861  skills/cc-defensive-programming/checklists.md
  1051  skills/cc-routine-and-class-design/SKILL.md
   390  references/cc-foundations.md
   922  skills/cc-routine-and-class-design/checklists.md
------
  6741  TOTAL loaded words for BUILD dispatch with skills: cc-defensive-programming cc-routine-and-class-design
  4481  TOTAL loaded words for BUILD dispatch with skills: cc-debugging
```

## Per-section: commands/build.md (main → HEAD)
| section | main | HEAD | delta |
|---|---:|---:|---:|
| (preamble) | 58 | 58 | +0 |
| Invariants | 224 | 143 | -81 |
| Phase 1: LOAD | 468 | 281 | -187 |
| Phase 2: SETUP | 1961 | 1108 | -853 |
| Phase 3: EXECUTE | 1831 | 1080 | -751 |
| Phase 4: VERIFY | 379 | 320 | -59 |
| Phase 5: REPORT | 126 | 57 | -69 |
| Error Handling | 32 | 18 | -14 |
| Integration with /code-foundations:plan | 39 | 22 | -17 |
| **total** | **5118** | **3087** | **-2031** |

## Per-section: references/dispatch-templates.md (main → HEAD)
| section | main | HEAD | delta |
|---|---:|---:|---:|
| (preamble) | 38 | 38 | +0 |
| Contents | 407 | 291 | -116 |
| § FULL_BUILD | 502 | 473 | -29 |
| § MINIMAL_BUILD | 272 | 319 | +47 |
| § REVIEW | 714 | 576 | -138 |
| § BATCH_REVIEW | 647 | 528 | -119 |
| **total** | **2580** | **2225** | **-355** |

## Final gates
- validate_skill: 19/19 valid, 0 errors (gof warnings pre-existing)
- validate-structure.mjs: OK — 77 files, 19 skills, 0 problems
- descriptions byte-identical (check H); rules registry 165 rows; inventory-dropped 400 rows accounting for the pre-cut inventory
- CHECKER A/B: not re-run after Phase 4 — the skill directories are unchanged since (Phases 5–9 touched agents, commands, references, docs only)
