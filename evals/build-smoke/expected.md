# Expected resolution for evals/build-smoke/plan.md (written before any smoke run)

The smoke agent reads commands/build.md and the references it names, then resolves SETUP for the fixture plan and describes what VERIFY does. Its output is compared against this key.

## Resolution table

```
Review cadence: 2        Test Coverage: 100%        Check-ins: checkpoints (defaulted)
| Phase | Model  | REVIEW model | Gate     | Security | Review timing      | Skills                                              | Wave | Notes |
| 1     | sonnet | sonnet       | Standard | —        | deferred (batch)   | cc-defensive-programming                            | 1    | |
| 2     | haiku  | sonnet       | Standard | —        | deferred (batch)   | none -- a two-line JSON read, no doctrine dimension in scope | 1 | |
| 3     | haiku  | sonnet       | Full     | —        | blocking           | cc-defensive-programming, cc-control-flow-quality   | 2 (alone) | ⚠ haiku + Full: mechanical effort on high-risk work |
```

Why: Phases 1 and 2 have no dependency between them, disjoint File scopes, both Standard, neither security-sensitive, and the plan's Notes say the tests share no fixtures or state → one wave of two (wave width ≤ 3). Skills print as the plan writes them (bare names; Phase 2's cell is its `none -- reason` verbatim). Phase 3 depends on both and is Full → its own wave. REVIEW model is one tier below BUILD floored at sonnet (fable→sonnet would apply if any phase were fable; haiku→sonnet floor here). Phase 2's `none -- reason` is accepted as planned. Test Coverage 100% is stated, not defaulted, so its header line carries no "(defaulted)". The fixture has no `**Check-ins:**` line, so it defaults to `checkpoints` and is annotated.

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

## Scripted events (the loop) — see README "Scripted events"

**E1 — Phase 1 DONE with a decision.**
- The decision is appended to the plan's `## Decided During Build` log as row #1, status `assumed`.
- Phase 1 integrates and commits (`Review: deferred (batch pending)`) and joins the un-reviewed set.
- No message to the user and no question, because a recorded decision is not an open question.

**E2 — Phase 2 UPDATE_PLAN on a one-way door (the Phase 2 → 3 seam).**
- Logged as row #2, status `open`, with the question, the default (`greeting.json`) and the blocked DW items.
- Phase 2's worktree is held uncommitted. Phase 1 still integrates, because wave siblings never wait on a held member.
- Phase 3 depends on Phase 2, so it is held too. Nothing is runnable.
- Because nothing is runnable, the orchestrator asks now and ends its turn: `AskUserQuestion` with one question, "greeting.json (Recommended)" first, and "settings.toml" second.
- It does not wait for a checkpoint and does not batch-review first; neither is required.

**After the user picks greeting.json:**
- Row #2's text is replaced with the answer (greeting.json) and its status becomes `decided (user)`.
- Any plan edit is a `plan(adjust)` commit; none is strictly needed when the answer is the default.
- Phase 2's held worktree is discarded and its BUILD is re-dispatched serially on current HEAD, with Decisions in Force #1 and #2.
- Phase 2 commits, so the un-reviewed set is {1, 2}. That hits cadence 2, and the next phase is Full, so a batch REVIEW over Phases 1–2 fires.
- On PASS a checkpoint runs (`checkpoints` mode). It sends one message, because rows #1 and #2 exist. Inspect may also adjust the remaining plan. The message does not end the turn.
- Phase 3 BUILD's prompt carries `## Decisions in Force` with #1 and #2. Phase 3's REVIEW prompt carries neither the decisions nor any account of them.
- After Phase 3's blocking REVIEW passes and commits, the final checkpoint runs before VERIFY. It finds nothing new, so it stays silent.

**Turn-ends to ask the user:** 1 with E2; 0 if E2 is removed.
**Non-blocking messages:** 1 (the post-batch checkpoint).
**Trust report:** a `Decided During Build` section, with #1 under "Confirm or override:" and #2 as a user decision, plus any `plan(adjust)` commits.

**In `quiet` mode:** the same single ask; zero non-blocking messages.

**E3 — serial hold: a held phase leaks nothing, siblings aren't blocked, and the ask isn't lost.**
- Phase 1's open row is #1. Its task goes back to `pending`. Its uncommitted greet.py edit is stashed (`held-phase-1`, with `.code-foundations` excluded so the plan file and its open row stay) before Phase 2 dispatches, so Phase 2's commit contains only Phase 2's files and the plan. Phase 1's attempt logs no `assumed` rows.
- Phase 2 commits first. This is out of plan order, which is allowed because a held phase is exempt. The un-reviewed set becomes {2}.
- No batch: cadence 2 is not reached, and the next phase to open (Phase 3) is held. So no checkpoint either.
- At that wave boundary an open row exists and nothing is runnable, so it asks: one `AskUserQuestion`, "yes (Recommended)" first.
- After the answer, the stash is discarded and Phase 1 re-dispatches serially on current HEAD.
- **Turn-ends to ask:** 1.
