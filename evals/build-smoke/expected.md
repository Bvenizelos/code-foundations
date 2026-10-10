# Expected resolution for evals/build-smoke/plan.md (written before any smoke run)

The smoke agent reads commands/build.md and the references it names, then resolves SETUP for the fixture plan and describes what VERIFY does. Its output is compared against this key.

## Resolution table

```
Review cadence: 2        Test Coverage: 100%
| Phase | Model  | REVIEW model | Gate     | Security | Review timing      | Skills                                              | Wave | Notes |
| 1     | sonnet | sonnet       | Standard | —        | deferred (batch)   | cc-defensive-programming                            | 1    | |
| 2     | haiku  | sonnet       | Standard | —        | deferred (batch)   | none -- a two-line JSON read, no doctrine dimension in scope | 1 | |
| 3     | haiku  | sonnet       | Full     | —        | blocking           | cc-defensive-programming, cc-control-flow-quality   | 2 (alone) | ⚠ haiku + Full: mechanical effort on high-risk work |
```

Why: Phases 1 and 2 have no dependency between them, disjoint File scopes, both Standard, neither security-sensitive, and the plan's Notes say the tests share no fixtures or state → one wave of two (wave width ≤ 3). Skills print as the plan writes them (bare names; Phase 2's cell is its `none -- reason` verbatim). Phase 3 depends on both and is Full → its own wave. REVIEW model is one tier below BUILD floored at sonnet (fable→sonnet would apply if any phase were fable; haiku→sonnet floor here). Phase 2's `none -- reason` is accepted as planned. Test Coverage 100% is stated, not defaulted, so its header line carries no "(defaulted)".

## Tasks created upfront
- Phase 1.1 BUILD (deferred review), Phase 2.1 BUILD (deferred review) — no edges between them
- Phase 3.1 BUILD blockedBy 1.1 and 2.1; Phase 3.2 REVIEW blockedBy 3.1
- No batch-review tasks upfront

## Batch triggers the agent should predict
1. After wave 1 integrates (Phases 1 and 2 both commit): un-reviewed set = {1, 2} → reaches cadence 2 → batch REVIEW over Phases 1–2 fires at the wave boundary.
2. Phase 3 is Full: even if the set were smaller, a batch fires before a Full phase opens (already emptied by trigger 1 here).
3. Before VERIFY: the set is empty (Phase 3 reviewed at its own gate) → no trailing batch.

## VERIFY on this plan
- Trailing batch: none (set empty).
- Suite on HEAD: the delta rule applies — Phase 3's blocking REVIEW ran the full suite in the build worktree after the last integration; if `git status` is clean apart from the plan file and .code-foundations/ artifacts, cite that run instead of re-running. Otherwise run `pytest evals/build-smoke/project` plus the project's typecheck/lint commands once.
- Test Plan items the suite does not cover: the manual CLI run → recorded under the trust report's Manual Testing Steps.
- Coverage line in the trust report: "100% — enforced by the reviewers"; Review shape: "1 phase reviewed at its gate, 2 by batch review (batch 1–2: PASS); 0 SKIPped".
- Then commit any changes and REPORT.

## Ambiguities the agent may legitimately report
- What "the project's typecheck/lint commands" are for a fixture with no project config (expected answer: none exist → say so, run tests only).
Every other ambiguity it reports is logged against build.md and either fixed or explained in the plan's execution log.
