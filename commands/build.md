---
description: "Execute an approved plan through gated phases (BUILD → REVIEW → commit) with subagent dispatch. Use when a plan exists in .code-foundations/plans/ and the user wants it implemented — phased implementation, per-phase quality gates, orchestrator commits, and a final trust report."
---

# Command: build

**Load Plan → Setup → Execute → Verify → Report**

---

## Invariants

- **Worktree isolation** — never build on main/master; commits there have no rollback boundary.
- **Load the plan before coding** — it is the checklist; unlisted tasks get forgotten.
- **One wave at a time** — phases run in parallel only when Wave Derivation's co-scheduling rule holds, each in its own phase worktree. The commit is the phase boundary.
- **Every phase is reviewed; not every phase blocks on it** — Full-gate and security-sensitive phases review before their commit; Standard and Minimal phases commit on green tests and are covered by a later batch REVIEW. The batch fires at the cadence, before any Full phase, and at VERIFY if anything is still un-reviewed. Nothing reaches the trust report unreviewed.
- **Mark complete only when gates pass; keep the execution log current** — it debugs failed builds and anchors later phases.
- **Quiet by default** — the user talked in research and planning. Agents settle what the plan leaves open; a one-way door becomes a question that holds only its own phase and that phase's dependents, and the build ends its turn to ask only when nothing else can run.

---

## Phase 1: LOAD

**Locate the plan.** Read the given path under `.code-foundations/plans/`; if none was given, `ls .code-foundations/plans/*.md` and ask which to execute.

**Worktree gate — immediately, it needs the plan filename.** Read `${CLAUDE_PLUGIN_ROOT}/references/worktree-gate.md` and clear it before any other work (workspace-mode detection, worktree or feature-branch creation, dependency setup, record-keeping for REPORT). "Build worktree" below means the workspace this gate produced.

**Parse the plan.** Context (goal anchoring for BUILD prompts); phases with their `**Done when:**` items (passed verbatim to build and review agents), `**Model:**`, `**Gate:**` (plus optional `**Pipeline:**` override), `**Depends on:**` and optional `**File scope:**` (wave derivation), `**Skills:**`, optional `**Security-sensitive:** yes` (immediate 3-sample REVIEW, never deferred) and `**Edge cases:**`; the Assumptions table with its `Verify Before Phase` timing; Test Coverage and Test Plan; `**Review cadence:** N` in the header (missing or unparseable → 3; clamped to 1–5; either noted in SETUP's table); `**Check-ins:**` in the header (`quiet` | `checkpoints` | `per-phase`; missing or unrecognized → `checkpoints`, noted in the table); the `## Decided During Build` log (add the section if absent).

**Required fields:** every phase must carry `**Model:**`, `**Gate:**`, `**Depends on:**`, and `**Skills:**` (a list, `none -- [reason]`, or bare `none`). Any missing → stop and tell the user to re-run `/code-foundations:plan`; the planner always emits them. Missing Test Coverage → default to 100%, noted in SETUP's table.

**Plan status:**

| Status | Action |
|---|---|
| `draft`, missing, or unrecognized | **Stop.** The user never confirmed the plan — the planner flips draft → ready on approval. Send them back to `/code-foundations:plan` |
| `ready` | Proceed |
| `in-progress` | Resume: derive completed phases from the execution log + commit trailers, re-run SETUP for the remainder, continue from the first incomplete phase; `open` rows in Decided During Build still hold their phases (discard any held wave worktree or stash; they re-dispatch serially) — ask them first if nothing else is runnable |
| `complete` | Ask: re-execute or archive? |
| `blocked` | Show the blockers as a short list, ask how to proceed |

---

## Phase 2: SETUP (Resolve, Print One Table)

Set in the plan file: `**Status:** in-progress`, `**Started:** YYYY-MM-DD HH:MM`, `**Current Phase:** 1`.

### Skill Resolution (name validation only)

The planner matched skills with the phase bodies in hand; build validates names and edits nothing.

1. Each listed name must match a skill in your available-skills register — internal (bare `cc-debugging` or `code-foundations:cc-debugging`) or external (plugin-qualified, e.g. `oberskills:skill-craft`). Workflow commands and pipeline skills (plan, build, debug, research, code-standards, clarify, planning) are rejected like unknown names.
2. **Unknown name → stop and ask the user.**
3. `none -- [reason]` is accepted as planned (a bare `none` too, noted in the table's Notes column); such a phase dispatches with **no `## Additional Skills` block** — each agent's own protocol is sufficient.
4. Dispatch emits one `Skill(<plugin:name>)` line per skill (bare internal names get the `code-foundations:` prefix); each skill self-loads its own checklists.
5. Skill presence does not affect the gate.

### Model Resolution

BUILD uses the phase's `**Model:**`. REVIEW runs one tier below, **floored at sonnet** (haiku's planted-defect recall proved unreliable on review-shaped tasks; a reviewer that misses defects is false insurance):

| BUILD model | REVIEW model |
|---|---|
| fable / opus | sonnet |
| sonnet / haiku | sonnet (floor) |

For a sonnet-built phase the reviewer is the same tier; independence comes from the intent-stripped dispatch, not the tier gap. **Exception:** security-sensitive phases run their 3-sample REVIEW on **fable** regardless.

### Gate Policy

The gate decides BUILD rigor and **whether REVIEW blocks the commit or is deferred into a batch** — every phase is reviewed; the question is when.

| Level | Sub-phases | Review timing | When |
|---|---|---|---|
| **Full** | BUILD → REVIEW → commit | **Blocking** — commit waits for PASS | High-risk work where errors cascade |
| **Standard** | BUILD → commit | **Deferred** — next batch REVIEW | Medium work; tests gate the commit |
| **Minimal** | BUILD (no discovery) → commit | **Deferred** — next batch REVIEW | Trivial docs/config work |
| **Batch** | REVIEW over every un-reviewed committed phase | — | At the cadence, before any Full phase, at VERIFY if the set is non-empty |

`**Security-sensitive:** yes` overrides the timing: immediate 3-sample REVIEW before the commit, at any gate. A batch runs against committed code, so its FAIL is fixed forward (Gate Failure Protocol → Batch Failures) — the trade that buys the cross-phase coherence check.

**Resolution order:** `**Pipeline:** full` forces Full and `**Pipeline:** direct` forces Minimal; otherwise the phase's `**Gate:**` field verbatim.

### Review Cadence

`**Review cadence:** N` — how many deferred-review phases may accumulate before a batch fires. 1 reviews each Standard/Minimal phase right after its commit; 2–3 is the intended range; 4–5 is bounded by reviewer recall (a batch verifies every DW item of every covered phase).

### Effort Alignment

Subagent depth is steered by the dispatch wording (the Agent tool has no `effort` parameter — see § FULL_BUILD / § MINIMAL_BUILD / § REVIEW):

| Phase Model | BUILD depth | REVIEW depth |
|---|---|---|
| fable / opus / sonnet | Think carefully | Think carefully |
| haiku | Answer directly | Think carefully — REVIEW never skims |

**haiku + Full** and **fable / opus + Minimal** are the two combinations where effort and risk disagree: print a one-line warning in the table's Notes column and continue. **This never blocks** — the plan is the user's; a haiku Full phase's blocking REVIEW is the backstop, and a fable Minimal phase still thinks carefully. If the user changes a phase's model or gate, edit the plan, re-run these resolutions including Wave Derivation (gate is a wave input), and reprint the table; it applies to phases not yet dispatched.

### Wave Derivation

1. **Layers:** group phases by `**Depends on:**` — a phase's layer is one past its deepest dependency.
2. **Co-scheduling** — two phases in one layer share a wave only when ALL hold: no transitive dependency between them; both declare `**File scope:**` with pairwise-disjoint globs; both gates Standard or Minimal and neither security-sensitive (those always run alone); the test suite uses no shared mutable resources (fixed ports, docker services, global test DBs, on-disk fixtures — evident from the test command or the plan's Notes).
3. **Width cap 3.** Wider layers split into consecutive waves in plan order; a Full phase forms its own wave.
4. Any doubt → serialize in plan order. A phase without `File scope` never shares a wave.

Waves are derived here, never stored in the plan.

### The Resolution Table (the only SETUP output)

```
Review cadence: 3 (defaulted)        Test Coverage: 100% (defaulted)        Check-ins: checkpoints (defaulted)
| Phase | Model | REVIEW model | Gate | Security | Review timing | Skills | Wave | Notes |
|-------|-------|--------------|------|----------|---------------|--------|------|-------|
| 1 | sonnet | sonnet | Standard | — | deferred (batch) | cc-defensive-programming | 1 | |
| 2 | sonnet | fable | Standard | yes | blocking (3-sample) | cc-defensive-programming | 2 (alone) | security-sensitive overrides gate timing |
| 3 | haiku | sonnet | Full | — | blocking | none -- docs only | 3 (alone) | ⚠ haiku + Full: mechanical effort on high-risk work |
```

The header's three values are always printed; a cadence default or clamp, a defaulted Test Coverage, and a defaulted Check-ins are annotated there. `Security: yes` sets REVIEW model fable, timing blocking (3-sample), wave alone; a Full phase is also `(alone)`. Notes carries effort warnings, a bare `none`, and pipeline overrides.

### Create Phase Tasks Upfront

Via `TaskCreate` (`blockedBy` is the task tool's dependency field):

- **Blocking-review phases (Full, or security-sensitive at any gate) — 2 tasks:** `Phase N.1: BUILD - [name]` and `Phase N.2: REVIEW - [name]` (Model: the REVIEW model; must return PASS), N.2 blockedBy N.1.
- **Deferred-review phases — 1 task:** `Phase N.1: BUILD - [name]`, noting "review deferred to batch".
- **Edges follow the DAG:** each BUILD task is blockedBy the last task of every phase it depends on. Same-wave phases have no edges between them.
- Batch-review tasks are inserted when a trigger fires, never upfront. Commits are yours — no commit tasks.

Example — five phases at cadence 3 (Standard, two independent Standards, Minimal, Full):
```
Wave 1: 1.1 BUILD → commit                                   (1 un-reviewed)
Wave 2: 2.1 BUILD ∥ 3.1 BUILD → integrate + commit in plan order (3 → cadence hit)
        → BATCH REVIEW 1–3 → PASS                            (0)
Wave 3: 4.1 BUILD (Minimal) → commit                         (1)
Wave 4: batch fires before the Full phase → BATCH REVIEW 4 → PASS
        → 5.1 BUILD → 5.2 REVIEW (blocking) → commit
```

---

## Phase 3: EXECUTE

**You dispatch; agents do the work.** Code reading, editing, and test-writing happen only inside dispatched agents — direct edits bypass the gates that make the trust report honest. A task is skipped only via a BUILD agent's SKIP status; a task starts only when its blockedBy list is empty; a gate task that returned FAIL is never marked completed. **You handle git directly:** worktrees, cherry-pick integration, commits, the wave-integration test run.

| Sub-phase | Agent |
|---|---|
| N.1 BUILD | `code-foundations:build-agent` |
| N.2 REVIEW | `code-foundations:post-gate-agent` |
| Commit | you |

Each agent definition carries its own protocol and works with zero skills assigned; skills arrive only via the dispatch prompt's `## Additional Skills` block (construction and BUILD→REVIEW propagation rules are in the dispatch-templates Substitution rules).

### Execution Loop

Execute wave by wave. Single-phase waves run the serial flow; parallel waves add the worktree steps below.

```
1. TaskGet → blockedBy empty?   2. TaskUpdate in_progress   3. Dispatch   4. Wait
5. FAIL/BLOCKED → not completed → Gate Failure Protocol
6. Success → TaskUpdate completed → if this was the phase's last task, commit;
   if the phase's review is deferred, add it to the un-reviewed set
7. At the wave boundary, evaluate the batch trigger (Batch REVIEW), then run any due Checkpoint,
   then — if an `open` row exists and nothing is runnable — ask (checkpoint.md → the ask),
   before opening the next wave
```

### Parallel Waves (2–3 phases)

Isolation is what makes a wave sound: agents run the suite as their evidence, and two agents in one tree would see each other's half-written code. This replaces serial steps 3–7 for the wave's members; commits happen at integration.

```
1. Per member: git worktree add --detach .code-foundations/wave-worktrees/phase-N HEAD (from the
   build worktree); copy in the plan file and docs/code-standards.md if untracked; run the
   dependency setup from worktree-gate.md.
2. ONE message, one BUILD Agent call per phase (its plan Model). Add to the template: "Work ONLY
   inside <worktree-root>; run all commands from there. End with exactly ONE commit:
   wip(phase-N): <name> — squash if you made more. Report the worktree path and wip sha."
3. Statuses: DONE → step 4. SKIP → mark completed, append the SKIP log entry, remove the
   worktree (settled for step 8). UPDATE_PLAN → log the open question (After BUILD returns),
   keep that member's worktree uncommitted (settled for step 8). BLOCKED → the same, with its
   obstacle as the question (a wave member is not auto-retried). Siblings never wait on a held
   member: same-wave phases share no dependency and no files, by construction.
4. Members are deferred-review phases by construction; DONE with a green suite is the
   integration signal — no REVIEW runs in a phase worktree.
5. Integrate DONE phases strictly in plan order (an earlier phase still working holds later
   finishers; a held phase does not — it commits whenever its question is answered): git cherry-pick -n <latest wip-sha> in the build worktree → real commit per
   commit-format.md → execution-log entry → copy discovery artifacts into
   .code-foundations/build/ → git worktree remove. A cherry-pick conflict means File scope
   was violated: drop that WIP, re-dispatch its BUILD serially on current HEAD.
6. Integrated members join the un-reviewed set together; evaluate the batch trigger only at
   step 8, once the wave has settled.
7. Wave integration: after the last member commits, run the full suite once in the build
   worktree. Red → gate failure attributed to the last-integrated member, fix forward.
8. The next wave opens only when every member is committed, SKIPped, or escalated — then
   evaluate the batch trigger.
```

### Sub-Phase N.1: BUILD

Dispatch templates: `${CLAUDE_PLUGIN_ROOT}/references/dispatch-templates.md` — read once per build; its Substitution rules govern every placeholder. Full and Standard phases use `§ FULL_BUILD` (discovery file `.code-foundations/build/<plan-name>-phase-N-discovery.md`; only the review timing differs between the two gates); Minimal uses `§ MINIMAL_BUILD` (no discovery).

**After BUILD returns:** first append each line of its `### Decisions` to the plan's `## Decided During Build` log as an `assumed` row (they reach later BUILD prompts as Decisions in Force, never a reviewer). SKIP → mark completed, skip any REVIEW task, append a SKIP execution-log entry (the `### Phase N` entry from commit-format.md with a single `- [x] SKIPPED — [reason]` line, no commit hash), next phase. UPDATE_PLAN → log an `open` row (question, proposed default, blocked DW items); the phase and its dependents are held — set its task back to `pending` (a task whose phase has an `open` row is not runnable), and in serial mode `git stash push -u -m held-phase-N` its uncommitted changes so the next phase starts clean — and every other runnable phase continues. Once the current wave has settled, if nothing else is runnable, ask (checkpoint.md → the ask); otherwise the question waits for the next Checkpoint. BLOCKED → Gate Failure Protocol (the 3-retry cap applies). DONE → completed; deferred review → commit now and add the phase to the un-reviewed set; blocking review → REVIEW.

### Sub-Phase N.2: REVIEW (blocking — Full gate and security-sensitive phases only)

Dispatch `code-foundations:post-gate-agent` with `§ REVIEW`, only after the BUILD task is completed.

**The reviewer is a debiased independent critic — give it NO intent-framing.** No plan Context, no Progress block, no discovery file, no account of what the BUILD agent did or intended (per-file change notes are not intent) — intent-framing collapses defect detection. Requirements + files + commands only.

**Security-sensitive phases:** dispatch THREE independent REVIEW agents on **fable** as three Agent calls in one message (independence is contextual, not temporal). The prompts are identical except the review path: substitute `K`=1,2,3 so each writes `<plan>-phase-N-review-sample-K.md` — otherwise they race and overwrite one file. Each sample uses a sample-unique scratch dir and runs no mutating commands. If the suite uses shared mutable resources (DB, ports, docker, on-disk fixtures), run the samples sequentially. Take the majority verdict; all three files are the record; the commit records `Review: pass (3-sample)`.

**After REVIEW:** PASS (2-of-3 when sampled) → completed → commit. FAIL → not completed → Gate Failure Protocol.

### Batch REVIEW (inserted dynamically)

The primary review path for Standard and Minimal phases, run against **committed** code. **The un-reviewed set:** every phase that commits with a deferred review joins it; a batch PASS empties it; phases reviewed at their own gate never enter it.

Triggers, evaluated at wave boundaries: the set has reached the cadence; the next phase to open is Full (it should build on reviewed ground); VERIFY is next and the set is non-empty. Triggers coalesce — one batch fires. Insert it as a task and make the next phase's BUILD blockedBy it. Dispatch `§ BATCH_REVIEW` (model rule in its header) over **every** phase in the set — the cross-phase coherence check is the point.

PASS → empty the set and append a dated `Covered by batch review (phases X–Y)` line to each covered phase's execution-log entry. FAIL → Gate Failure Protocol → Batch Failures: fixes land as forward commits; the set stays non-empty until a batch PASS.

### Checkpoint (Inspect → Adjust → Clarify)

The loop's turn: after a batch REVIEW PASS, before VERIFY, and — when `**Check-ins:** per-phase` — after every phase commit, read `${CLAUDE_PLUGIN_ROOT}/references/checkpoint.md` (once per build) and run it: inspect whether the rest of the plan still fits the code that exists, fix misfits in the remaining plan within its bounds as `plan(adjust)` commits, then message the user only if something changed or needs them. It never removes or weakens a DW item on its own, and it ends the turn to ask only when an open question leaves nothing runnable.

### Commit After Phase

You commit directly, per `${CLAUDE_PLUGIN_ROOT}/references/commit-format.md` (read once per build: recipe, message rules, wave-member cherry-pick variant, execution-log entry). Required trailers: `Phase:`, `Plan:`, `AI-Model:`, `AI-Epistemic-Status:`, `Gate-Policy:`, `Review:`. Then append the phase's execution-log entry; its Summary line feeds later dispatches' `## Progress` block — write it as goal anchoring, not telemetry. Say nothing to the user — the Checkpoint is the only status message.

### Gate Failure Protocol

On REVIEW FAIL or BUILD BLOCKED, read `${CLAUDE_PLUGIN_ROOT}/references/gate-failure-protocol.md` (per-failure actions, batch and wave failures, escalation template). The failed task stays `in_progress`; re-dispatch at most 3 times, then stop and escalate.

---

## Phase 4: VERIFY (Close the Review Set, One Suite on HEAD)

1. **Trailing batch REVIEW** if the un-reviewed set is non-empty (see Batch REVIEW), then the final Checkpoint — VERIFY starts with no `open` row left.
2. **One suite on integrated HEAD** — tests, typecheck, lint; the commands the reviewers run. **Delta rule:** skip it iff a full-suite run already executed in the build worktree on the code that is now HEAD (the trailing batch, the final phase's blocking REVIEW, or the wave-integration run) and `git status` is clean apart from the plan file and `.code-foundations/` artifacts — then cite that run. Otherwise run it once. Red (any failing test, typecheck or lint error) → attribute each failure to the phase whose files it exercises, re-dispatch that phase's build agent with the failures, commit the fix as `fix(phase-N): verification fixes` (`Review:` per commit-format.md), then review it the way that phase is reviewed: Full or security-sensitive → its blocking REVIEW again (review path `<plan>-phase-N-review-verify[-sample-K].md`), then back to step 2; Standard or Minimal absent a security flag → the un-reviewed set, back to step 1. No task bookkeeping — the execution log's fix line is the record. The Gate Failure Protocol's caps apply, counted together with the phase's own gate (see its VERIFY row). Lint warnings are reported as they are. No runnable suite → `not run: [reason]` in the trust report; never invent a command.
3. **Test Plan items the suite does not cover** (integration or manual): run what can be run; record the rest under Manual Testing Steps.

Coverage is enforced by the reviewers (post-gate Step 2 fails a gap against the plan's level); VERIFY reports it. `Coverage: None` → one report line: "Coverage: None — per-DW evidence only; technical debt noted."

**Done when** the set is empty, the suite on HEAD is green (run or cited) or recorded as not run, and every Test Plan item is run or recorded. Retry cap exhausted → stop and escalate (Error Handling).

---

## Phase 5: REPORT

Set `**Status:** complete`, `**Completed:** YYYY-MM-DD HH:MM`, `**Duration:**`. If VERIFY changed anything or the plan file changed, commit: `chore(build): verification fixes + plan completion`, standard trailers. Then write the **trust report** per `${CLAUDE_PLUGIN_ROOT}/references/trust-report.md` (trailer-dump commands; Build & Test Summary — suite on HEAD, coverage, review shape — Decided During Build, Manual Testing Steps, Follow-up, Merge Instructions).

---

## Error Handling

For blockers beyond the Gate Failure Protocol, and for resuming a `blocked` plan, read `${CLAUDE_PLUGIN_ROOT}/references/build-failure-resume.md`.

## Integration with /code-foundations:plan

Chained plan→build flow, parallel builds, plan-file model syntax, thinking-effort guidance: `${CLAUDE_PLUGIN_ROOT}/references/plan-integration.md`. Parallel builds must target different plan files.
