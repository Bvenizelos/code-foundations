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

| `**Check-ins:**` | Checkpoint fires |
|---|---|
| `quiet` | after each batch REVIEW PASS and before VERIFY — silently, except for an ask |
| `checkpoints` | after each batch REVIEW PASS and before VERIFY |
| `per-phase` | after every phase commit, and after each batch REVIEW PASS |

A checkpoint never runs while the un-reviewed set holds a failing batch — fix forward first (gate-failure-protocol.md → Batch Failures).

---

## Inspect

Read only what this stretch produced: the BUILD reports' `### Decisions` (already logged as they arrived), the batch or blocking review files' Notes and Cross-Phase Coherence sections, and the execution-log Summaries. Hold them against the phases not yet built and ask one question: **does the rest of the plan still fit the code that now exists?** Typical misfits: a later phase's file list names files that moved; a phase is now too large because an earlier one surfaced work; a Note shows an edge case a later phase will hit; a recorded decision changes what a later DW item means in practice.

The reviewer cannot answer this — it never sees the plan, by design — so this judgment is yours.

---

## Adjust — bounds

Fix misfits in the remaining plan yourself when the edit **keeps or adds** to what the user approved:

| You may | You may not (it becomes a question) |
|---|---|
| split a phase, or reorder phases with no dependency between them | remove or weaken a DW item, or an edge case |
| add a phase, a DW item, an edge case, or a Test Plan item for work the build surfaced inside the approved scope | change a `**Produces:**` contract |
| correct a phase's file list, File scope, or Notes to match the code | add or drop scope |
| raise a phase's gate, or add `**Security-sensitive:** yes` | lower a gate, drop a security flag, or change a phase's model to a cheaper one |

**never remove or weaken a DW item** without the user — the DW list is the contract the reviewers verify, and the user approved it. Never edit a phase that is already committed; its fixes go forward as code (gate-failure-protocol.md).

Each adjustment is **its own commit**, made before the next dispatch: `plan(adjust): [what changed]`, the body stating which observation forced it, trailers `Plan:` and `AI-Model:` (commit-format.md). The diff is the audit trail — models drift when they rewrite checklists in place, so the plan never changes except through these commits. Then re-run SETUP's resolutions for the changed phases (model, gate, wave derivation, tasks) and reprint only the changed table rows.

---

## Clarify — the message and the ask

**Open questions** are the `open` rows of the plan's `## Decided During Build` log — one-way doors a BUILD agent escalated via UPDATE_PLAN, or adjustments that fell outside the bounds above. Each holds **only** its phase and that phase's dependents; everything else keeps building.

**The message** (`checkpoints` and `per-phase` only) is sent only when the checkpoint adjusted the plan, logged a decision, or has an open question — otherwise say nothing. One block, no narration:

```
Checkpoint 2/4 — phases 1–3 committed, review PASS.
Adjusted: split phase 5 → 5a/5b (migration too large); added a retry test to phase 4.
Assumed (reply to override): #3 webhook retries capped at 3 — plan silent, matches mailer.ts.
Open (holds phase 6 only; 4–5 continue): #4 Purge or keep deleted users' notifications? Default: keep.
```

Then **keep working** — the message does not end your turn. A reply arrives as the user's next message and is handled under User replies.

**The ask** — end the turn and ask only when an open question leaves nothing runnable (every remaining phase is held by it or depends on one that is). Use `AskUserQuestion`, one question per open row (up to four), the agent's proposed default first and marked "(Recommended)". This is the same in every Check-ins mode, and it is the only point at which `quiet` speaks. On the answer, set the row to `decided (user)`, apply it as an adjustment (the bounds no longer apply — the user decided), and resume.

---

## User replies

A reply that overrides an `assumed` row is a decision like any other: set the row to `changed (user)`, adjust the remaining plan to match, and if committed code built on the old assumption, re-dispatch that phase's build agent with the change as a `## Review Findings to Fix` block. Commit it forward as `fix(phase-N): apply user decision #K`, reviewed the way that phase is reviewed (gate-failure-protocol.md → VERIFY row's routing).
