# Plan File Schema and Field Rules

The one home for what a plan file looks like and how its per-phase fields are assigned. Read by `commands/plan.md` (Quick track, at Detail and Finalize) and `skills/planning/SKILL.md` (SAVE). The phase template itself stays in each caller — the tracks differ in which optional lines they carry.

## Contents

- Plan file schema
- Model assignment
- Gate assignment
- Review cadence
- Check-ins
- Dependencies and file scope
- Skills validation

---

## Plan file schema

```markdown
# Plan: [Topic]
**Created:** YYYY-MM-DD
**Status:** draft   <- flipped to `ready` when the user confirms the presented plan; build refuses a draft plan
**Complexity:** [simple/medium/complex]
**Review cadence:** 3   <- un-reviewed phases allowed before a batch REVIEW fires; 1-5
**Check-ins:** checkpoints   <- quiet | checkpoints | per-phase; how often build talks to the user
---
## Context
[Confirmed problem statement]
## Constraints
- [constraints]

[Medium/Complex only]
## Chosen Approach
**[Name]** -- [Rationale]. **Fallback:** [1 sentence]
## Rejected Approaches
- **[Name]:** [1 sentence why rejected]
[/Medium/Complex only]

---
## Implementation Phases
(Phase bodies from the caller's phase template -- each carries **Skills:**, **Model:**, **Gate:**, **Depends on:**, and usually **File scope:**)
---
## Test Coverage
**Level:** [100% / Targeted: <layers the user named> / Per-phase / None]
  <!-- 100% = unit tests for every new or changed routine in the phase's implementation files + the Test Plan's integration tests; Targeted = the named layers; Per-phase = whatever each phase's Done-when items and Edge cases require; None = no requirement beyond the per-DW evidence every reviewer demands (a deliberate debt, warned in the trust report) -->
## Test Plan
- [ ] [tests derived from the done-when items, plus at least one dirty test per code-touching phase] [Medium/Complex only] + Integration + Manual [/Medium/Complex only]

[Medium/Complex only]
## Assumptions
| Assumption | Confidence | Verify Before Phase | Fallback If Wrong |

## Decision Log
| Decision | Alternatives Considered | Rationale | Phase |
[/Medium/Complex only]

---
## Notes
- [edge cases, gotchas, open questions -- omit if none]
---
## Decided During Build
_Filled by /code-foundations:build — one row per decision an agent made or question it raised:_
| # | Phase | Decision or question | Source | Status |
---
## Execution Log
_To be filled during /code-foundations:build_
```

Build hard-requires, on every phase, `**Model:**`, `**Gate:**`, `**Depends on:**`, and `**Skills:**` (a list or `none -- [reason]`) and stops with "re-run /code-foundations:plan" when any is missing; a `**Status:**` that is not `ready` stops it too; a missing `**Review cadence:**` is defaulted to 3 and a missing `**Check-ins:**` to `checkpoints` (write both anyway). These rules mirror `commands/build.md` LOAD and Gate Policy. Do not commit the plan — it is a working document; build copies it into its worktree.

---

## Model assignment (`**Model:**` — every phase)

Two models, decided per phase against its name + Goal (keywords) and its DW list + file hints (counts; on the Quick track `File scope` stands in); an "area" is a distinct top-level directory:

```
HAIKU_KEYWORDS = [config, rename, typo, bump, cleanup, delete, remove,
                  backfill, data fix, sql update, doc update]

1. not Security-sensitive AND DW items <= 2 AND file hints <= 1 area
   AND any HAIKU_KEYWORD                                         -> haiku
2. Otherwise                                                     -> sonnet
```

**sonnet is the default — never omit the field:** omit means inherit the session model, which then propagates to every subagent. Never assign fable or opus yourself; either is valid only when the user asks for it on a phase. Build reviews every phase on sonnet (never haiku: haiku's planted-defect recall proved unreliable on review-shaped tasks in the round-2 model-tier benchmark).

---

## Gate assignment (`**Gate:**` — every phase)

Build consumes the field verbatim — `Full`, `Standard`, or `Minimal`. The gate decides review **timing**, not whether a review happens: Standard and Minimal phases commit on a green suite and are covered by a later batch REVIEW (one reviewer over several phases); a Full phase blocks its commit on its own REVIEW.

| Signal in the phase | Gate |
|---|---|
| Docs-only or config-only change | Minimal |
| The user asked for this phase to be reviewed before it commits | Full |
| (everything else — including payment, auth, and cross-phase seams) | Standard |

Do not assign Full on your own: the batch review already covers every phase, and a blocking review on every phase multiplies agents for little gain. A phase doing auth/crypto/secrets/deserialization/untrusted-input work gets `**Security-sensitive:** yes` instead — one blocking REVIEW before its commit, at any gate — and, if it performs destructive or irreversible actions, a `**Rollback:**` line (the compensating action, or "point of no return -- [mitigation]"). Skill presence does not decide the gate.

---

## Review cadence (`**Review cadence:**` — one field in the header)

How many un-reviewed phases may accumulate before a batch REVIEW fires. **Default 3; write it explicitly even when you take the default**, so the choice is visible to the user at confirmation.

| Signal in the plan | Cadence |
|---|---|
| Phases tightly coupled — a defect in one propagates fast through the others | 1–2 |
| Ordinary mixed plan | 3 (default) |
| Phases genuinely independent (disjoint `File scope`, few shared seams) | 4–5 |

Build clamps to 1–5: a batch reviewer must verify every DW item across every covered phase, and per-item recall degrades as that list grows. Pick the cadence from the plan's coupling, not from how risky the feature feels overall — per-phase risk is what `**Gate:**` is for.

---

## Check-ins (`**Check-ins:**` — one field in the header)

How often build talks to the user while it runs. Research and planning are where the conversation happens; build is quiet by default. **Default `checkpoints`; write it explicitly.**

| Value | Build behavior |
|---|---|
| `quiet` | No status messages. Stops only when an open question leaves nothing else runnable; everything else lands in the trust report |
| `checkpoints` (default) | One short message after each batch review and before VERIFY, sent only when something was adjusted, assumed, or needs the user |
| `per-phase` | The same message after every phase commit, for users who want to steer closely |

Pick `per-phase` only when the user asks to follow along; the value never changes which phases are reviewed or when.

---

## Dependencies and file scope

1. Every phase has `**Depends on:**` (`none` or `Phase X` refs) — build derives its execution waves from these edges.
2. Every referenced phase exists; a phase consuming another's `Produces` depends on it.
3. Phases with no dependency path between them and disjoint `**File scope:**` globs run their BUILDs in parallel — verify the declared scopes are genuinely disjoint. A phase without `File scope` never runs in parallel (that is the opt-out, not an error). Build adds its own co-scheduling conditions (only Standard/Minimal gates share a wave, width ≤ 3, no shared mutable test resources), so don't promise parallelism for Full-gate phases.

---

## Skills validation (`**Skills:**` — every phase)

1. Populated on every phase — `none -- [reason]` valid, omission not valid.
2. Every name matches a real skill in the available-skills register — internal (code-foundations) or external (another plugin); reject typos and nonexistent names.
3. No workflow commands or pipeline skills (plan, build, debug, research, code-standards, clarify, planning).
4. A code-writing phase with `none` justifies why no skill's triggers match — on any gap, re-run the matching procedure for that phase.
