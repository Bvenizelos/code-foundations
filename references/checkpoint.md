# Checkpoint (Inspect → Adjust → Clarify)

Used by the orchestrator (`commands/build.md` Phase 3: EXECUTE) at every checkpoint. Read once per build.

The build is a loop, not a straight line: after each stretch of work the orchestrator inspects what was learned, adjusts the rest of the plan to fit it, and only then decides whether the user needs to hear anything. The user did their talking in research and planning, so the default answer is no.

## Contents

- When a checkpoint runs
- Inspect
- Adjust — bounds
- Clarify — the message and the ask
- User replies

---

## When a checkpoint runs

In every mode: after each batch REVIEW PASS, and once before VERIFY. `**Check-ins:** per-phase` adds one after each phase commit (in a parallel wave, once the wave has settled). `quiet` runs the same checkpoints but sends no message — only the ask.

A checkpoint never runs while the un-reviewed set holds a failing batch — fix forward first (gate-failure-protocol.md → Batch Failures).

---

## Inspect

Read only what this stretch produced: the decisions logged since the last checkpoint, the batch or blocking review files' Notes and Cross-Phase Coherence sections, and the execution-log Summaries. Hold them against the phases not yet built and ask one question: **does the rest of the plan still fit the code that now exists?** Typical misfits: a later phase's file list names files that moved; a phase is now too large because an earlier one surfaced work; a Note shows an edge case a later phase will hit; a recorded decision changes what a later DW item means in practice.

The reviewer cannot answer this — it never sees the plan, by design — so this judgment is yours.

---

## Adjust — bounds

Fix misfits in the remaining plan yourself when the edit **keeps or adds** to what the user approved:

| You may | You may not (it becomes an `open` row) |
|---|---|
| split a phase (both halves inherit its Model, Gate, Skills, and security flag; the first takes its Depends on, the second depends on the first, and its dependents depend on the second), or reorder phases with no dependency between them | remove or weaken a DW item, or an edge case |
| add a phase, DW item, edge case, or Test Plan item for work the build surfaced inside the approved scope | change a `**Produces:**` contract, or add or drop scope |
| correct a phase's file list, File scope, or Notes to match the code | decide anything on build-agent.md's one-way-door list (security or auth behavior, destructive data changes, a public API) |
| raise a phase's gate, or add `**Security-sensitive:** yes` | lower a gate, drop a security flag, or move a phase to a cheaper model |

**never remove or weaken a DW item** without the user — the DW list is the contract the reviewers verify, and the user approved it. Never edit a committed phase's plan text (except to add a user decision's DW item, below); its fixes go forward as code (gate-failure-protocol.md). A new phase gets Model and Gate by `${CLAUDE_PLUGIN_ROOT}/references/plan-schema.md`'s assignment rules, and Skills from the phase it was carved out of or `none -- added at checkpoint`.

Each adjustment is **its own commit**, made before the next dispatch: `plan(adjust): [what changed]`, the body stating which observation forced it, trailers `Plan:` and `AI-Model:` (commit-format.md). The diff is the audit trail — models drift when they rewrite checklists in place, so the plan never changes except through these commits. Then re-run SETUP's resolutions for the changed phases (model, gate, wave derivation, tasks) and reprint only the changed table rows. No change, no commit.

---

## Clarify — the message and the ask

**Open questions** are the `open` rows of the plan's `## Decided During Build` log — one-way doors a BUILD agent escalated, obstacles a BUILD stayed BLOCKED on (a wave member at once, a serial phase after its retry cap), or adjustments that fell outside the bounds above. Each holds **only** its phase and that phase's dependents; everything else keeps building.

**The message** (`checkpoints` and `per-phase` only) is sent only when, since the last checkpoint, the plan was adjusted, a decision was logged, or a row is open — otherwise say nothing. One block, no narration:

```
Checkpoint — phases 1–3 committed, review PASS.
Adjusted: split phase 5 → 5a/5b (migration too large); added a retry test to phase 4.
Assumed (reply to override): #3 webhook retries capped at 3 — plan silent, matches mailer.ts.
Open (holds phase 6 only; 4–5 continue): #4 Purge or keep deleted users' notifications? Default: keep.
```

Then **keep working** — the message does not end your turn.

**The ask** — whenever an open row exists and nothing is runnable (every remaining phase is held or depends on a held one), end the turn and ask. Check this at every wave boundary, not only at checkpoints. Use `AskUserQuestion`, one question per open row (up to four per ask; any rest in the next), the proposed default first and marked "(Recommended)". This is the same in every Check-ins mode, and it is the only point at which `quiet` speaks. On the answer: replace the row's text with the answer and set it to `decided (user)`; if the answer changes the plan, apply exactly that as a `plan(adjust)` commit; then re-dispatch the held phase's BUILD with the answer among its Decisions in Force, serially on current HEAD (a held wave worktree or stash is discarded).

---

## User replies

A reply may arrive mid-build or after REPORT (the trust report invites overrides). An answer to an `open` row, in any words, is handled as the ask's answer. An override of an `assumed` row: replace its text with the user's choice, set it to `changed (user)`, and adjust the remaining plan to match. If committed code built on the old assumption, add the decision to that phase as a DW item (`DW-N.U[K]`, in a `plan(adjust)` commit — the user decided, so this needs no bounds) and re-dispatch its build agent with that DW item; the fix's review verifies it like any requirement. Commit it forward as `fix(phase-N): apply user decision #K` (`Review:` per commit-format.md), reviewed the way that phase is reviewed (gate-failure-protocol.md → VERIFY row's routing; a blocking re-review writes `<plan>-phase-N-review-user-K.md`). After REPORT, set the plan back to `in-progress` for the fix and re-run VERIFY and REPORT.
