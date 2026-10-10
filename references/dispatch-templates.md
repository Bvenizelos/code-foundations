# Dispatch Templates

Subagent dispatch prompts used by the orchestrator (`commands/build.md`) when dispatching the build and post-gate agents. Templates are referenced by section header (e.g., `§ FULL_BUILD`) from the orchestrator and substituted with phase-specific values at dispatch time.

## Contents

| Section | Used for |
|---------|----------|
| `§ FULL_BUILD` | Full and Standard gate BUILD sub-phases |
| `§ MINIMAL_BUILD` | Minimal gate BUILD sub-phases (no discovery) |
| `§ REVIEW` | **Blocking** REVIEW — Full gate phases and security-sensitive phases at any gate |
| `§ BATCH_REVIEW` | **Deferred** REVIEW — the primary review path for Standard and Minimal phases, covering the whole un-reviewed set in one dispatch |

**Substitution rules (orchestrator):**
- `[bracketed]` placeholders → phase-specific values; each names its source. Conditional blocks (`[if …]`) are emitted only when the condition holds, items pasted verbatim.
- `## Additional Skills`: emitted only when the phase's `**Skills:**` lists at least one skill (a `none` / `none -- [reason]` phase gets no block). One `Skill(<plugin:name>)` line per skill — this plugin's as `Skill(code-foundations:<name>)`, other plugins' as `Skill(<plugin>:<name>)`. An explicit `Skill(...)` line invokes the skill even though subagents don't inherit the register, and each skill self-loads its own checklists — emit no checklist `Read()` lines and never Read-inject SKILL.md text.
- **Skills propagate BUILD → REVIEW:** skills the BUILD agent's `### Skills Loaded` reports beyond the plan's assignment are added to the REVIEW dispatch's block too.
- Test/typecheck/lint command placeholders → exact runnable commands resolved from project config (package.json scripts, Makefile, Cargo.toml…), not descriptions.
- **Wave mode:** when a phase runs in its own phase worktree (build.md → Parallel Waves), every path is rooted at that worktree and the BUILD prompt gains: "Work ONLY inside `<worktree-root>`; run all commands from there. End with exactly ONE commit: `wip(phase-N): <name>` — squash if you made more. Report the worktree path and wip sha." No REVIEW template needs a wave variant — wave members are batch-reviewed later against the integrated build worktree.

---

## § FULL_BUILD

Full and Standard gate phases (discovery + design + implementation in one pass).

```
Agent tool:
- subagent_type: "code-foundations:build-agent"
- model: [from plan's **Model:** field — required; a plan without it stops the build at LOAD]
- description: "BUILD Phase N"
- prompt: |
    [Depth per build's Effort Alignment: if the phase Model is haiku, open with "Answer directly without deliberating."; otherwise open with "This task involves multi-step reasoning. Think carefully before responding."]

    Build Phase N of the build plan. This is a two-part task:
    1. Discovery + Design — scope the phase work, identify gaps vs plan, make design decisions, map DW items to test cases
    2. Implementation — stub the interface, implement it, then write tests that validate each DW item (all tests must pass)

    Write discovery file before implementing.

    The phase body and its skills carry the design reasoning — implement steadily
    within them. When the plan is silent, decide and record it (Decide or Escalate);
    when the plan doesn't fit reality at a one-way door, return UPDATE_PLAN rather
    than re-architecting on your own.

    ## Plan Context
    [paste the Context section from the plan file — the 2-3 sentence problem statement]

    ## Progress
    [For Phase 1: "This is the first phase."]
    [For Phase N>1: "Completed: Phase 1: [name] — [1 sentence summary from execution log]. Phase 2: ..."]
    Current: Phase N of M

    [if the plan's ## Decided During Build log has decided rows, include:]
    ## Decisions in Force
    Earlier phases settled these where the plan was silent — follow them:
    [paste each decided row: "#K (Phase N): [decision]"]

    ## Phase N: [name]
    [paste phase description and file list from plan]

    ## Done-When Items (DW-IDs)
    These are the acceptance criteria from the plan. Each DW item must
    have corresponding test(s) (e.g., `test_DW_1_1_creates_user`).
    Any DW item without a test is a visible gap.
    If any item cannot be met, return UPDATE_PLAN.
    [paste ALL DW items from the plan phase, verbatim:]
    - [ ] DW-N.1: [done-when item 1]
    - [ ] DW-N.2: [done-when item 2]
    - [ ] DW-N.X: [done-when item N...]

    ## Test Coverage Level
    [paste the plan's level — 100% / Targeted: <layers> / Per-phase / None]

    [if the phase's **Skills:** lists at least one skill — not `none` / `none -- [reason]` — include:]
    ## Additional Skills
    Invoke EVERY Skill() below, in order, BEFORE starting work:
    - Skill([plugin:name from plan -- this plugin's own skills as code-foundations:<name>])
    [repeat the Skill() line for each assigned skill; each self-loads its own checklists]

    [if plan has Assumptions with "Verify Before Phase: N", include:]
    ## Assumption Verification
    Before proceeding with discovery, verify these assumptions from the plan:
    - [assumption text] (Confidence: [level])
    If any assumption is wrong, return UPDATE_PLAN with the invalidated assumption
    and what you found instead.

    [ONLY on a gate-failure re-dispatch after a REVIEW FAIL, include:]
    ## Review Findings to Fix
    An independent review found these defects — fix each, keeping all existing
    tests passing (the passing set only grows):
    [paste the Issues section from the review file verbatim]

    ## Inputs
    - Plan file: .code-foundations/plans/<plan-name>.md
    - Phase: N - [name]

    ## Output Files
    - Discovery + Design: .code-foundations/build/<plan-name>-phase-N-discovery.md
```

---

## § MINIMAL_BUILD

Minimal gate phases: no discovery — stub, implement, validate from the plan description.

```
Agent tool:
- subagent_type: "code-foundations:build-agent"
- model: [from plan's **Model:** field — required; a plan without it stops the build at LOAD]
- description: "BUILD Phase N (minimal)"
- prompt: |
    [Depth per build's Effort Alignment: if the phase Model is haiku, open with "Answer directly without deliberating — this is trivial, mechanical work."; otherwise open with "This task involves multi-step reasoning. Think carefully before responding."]

    Build Phase N of the build plan. This phase uses minimal gate
    policy — skip discovery, implement directly from the plan
    description: stub the interface, implement it, then write tests
    that validate each DW item (all tests must pass).

    ## Plan Context
    [paste the Context section from the plan file]

    ## Progress
    [For Phase N>1: "Completed: Phase 1: [name] — [1 sentence summary]. Phase 2: ..."]
    Current: Phase N of M

    [if the plan's ## Decided During Build log has decided rows, include:]
    ## Decisions in Force
    Earlier phases settled these where the plan was silent — follow them:
    [paste each decided row: "#K (Phase N): [decision]"]

    [if the phase's **Skills:** lists at least one skill — not `none` / `none -- [reason]` — include:]
    ## Additional Skills
    Invoke EVERY Skill() below, in order, BEFORE starting work:
    - Skill([plugin:name from plan -- this plugin's own skills as code-foundations:<name>])
    [repeat the Skill() line for each assigned skill; each self-loads its own checklists]

    ## Phase N: [name]
    [paste the full phase description from the plan]

    ## Done-When Items (DW-IDs)
    These are the acceptance criteria from the plan. Each DW item must
    have corresponding test(s) (e.g., `test_DW_1_1_creates_user`).
    Any DW item without a test is a visible gap.
    If any item cannot be met, return UPDATE_PLAN.
    [paste ALL DW items from the plan phase, verbatim:]
    - [ ] DW-N.1: [done-when item 1]
    - [ ] DW-N.2: [done-when item 2]
    - [ ] DW-N.X: [done-when item N...]

    ## Test Coverage Level
    [paste the plan's level — 100% / Targeted: <layers> / Per-phase / None]

    ## Inputs
    - Plan file: .code-foundations/plans/<plan-name>.md
    - Phase: N - [name]
```

---

## § REVIEW

Blocking REVIEW — Full gate phases and security-sensitive phases at any gate (Standard and Minimal go through `§ BATCH_REVIEW`).

**Debiasing rules (do not violate):** the reviewer receives NO intent-framing — no plan Context, no progress summary, no Decisions in Force, no discovery file, no account of what the build agent did or intended (per-file change notes — which routines were added or changed — are not intent). Requirements + files + commands only.

**Security-sensitive (3-sample):** the procedure is in `commands/build.md` → Sub-Phase N.2: REVIEW. The template's part: substitute `K`=1,2,3 so each sample's review path is `<plan-name>-phase-N-review-sample-K.md` (otherwise the samples overwrite one file); each sample uses a sample-unique scratch directory and runs no mutating commands (no `lint --fix`, no dependency installs). A single review drops the suffix.

```
Agent tool:
- subagent_type: "code-foundations:post-gate-agent"
- model: [resolved REVIEW model per the orchestrator's Model Resolution — the phase's BUILD model downgraded one tier, floored at sonnet (fable→sonnet, opus→sonnet, sonnet→sonnet, never haiku); fable for security-sensitive samples]
- description: "REVIEW Phase N"
- prompt: |
    This task involves multi-step reasoning. Think carefully before responding.

    Independently verify the implementation in the files below against the
    requirements below. You did not write this code and have no information
    about how or why it was written. Do NOT assume it is correct or complete.
    Assume requirements may be unmet and bugs may be present; verify each item
    from scratch against the actual code and executed test results. Do NOT
    introduce requirements that are not listed here.

    ## Requirements to verify (Done-When items)
    For EACH item, fill the template. A PASS verdict REQUIRES execution
    evidence (a passing test you ran, or observed behavior) — not "implemented".
    Do NOT skip items.
    [paste ALL DW items from the plan phase, verbatim:]
    - DW-N.1: [done-when item 1]
      PREMISE: ___  EVIDENCE (file:line): ___  TRACE (input→output): ___  VERDICT: ___
    - DW-N.2: [done-when item 2]
      PREMISE: ___  EVIDENCE (file:line): ___  TRACE (input→output): ___  VERDICT: ___
    - DW-N.X: ...

    [if plan phase has **Edge cases:**, include:]
    ## Edge cases — verify handling
    These are explicit plan requirements with the same verdict standing as the
    DW items above: an unhandled case listed here is a FAIL, not a Note.
    Verify the implementation handles each.
    [paste the phase's Edge cases verbatim]

    ## Test Coverage Level
    [paste the plan's level — 100% / Targeted: <layers> / Per-phase / None]

    ## Files to review
    [implementation + test file paths from the BUILD agent's report, each with its
    "what was done" note (new file / routines added or changed) — paths and change
    notes only, no rationale; "new or changed routines" under 100% means these]

    ## How to run the suite
    [exact test command + typecheck/lint commands for this project]
    Run these directly via Bash and capture the output.

    [ONLY if this phase consumes an interface from a prior phase — neutral
    wording, no "completed/done/working" language:]
    ## Dependency
    Phase N consumes [interface X] defined in [file:line]. Treat its contract
    as given; do not re-review it, but flag if this phase misuses it.

    [if the phase's **Skills:** lists at least one skill (not `none -- [reason]`) OR the BUILD agent reported additional skills, include:]
    ## Additional Skills
    Invoke EVERY Skill() below BEFORE reviewing:
    - Skill([plugin:name from plan -- this plugin's own skills as code-foundations:<name>])
    [repeat the Skill() line for each skill; also include skills from BUILD's "Skills Loaded" output not already listed]

    ## Output
    Write review to: [review path — `.code-foundations/build/<plan-name>-phase-N-review.md`,
    or `.code-foundations/build/<plan-name>-phase-N-review-sample-K.md` for
    security-sensitive sample K]
```

---

## § BATCH_REVIEW

The review path for Standard and Minimal phases, inserted when a batch trigger fires (build.md → Batch REVIEW), covering **every** phase in the un-reviewed set in one dispatch — the cross-phase coherence check is the point. Same debiasing rules as § REVIEW.

**Model:** the highest resolved REVIEW model among the covered phases (ranking fable > opus > sonnet > haiku); when the batch fires ahead of a Full phase, the higher of that and the Full phase's REVIEW model.

This review runs against **committed** code. Say nothing about that in the prompt — a reviewer told the code already shipped reviews it more leniently.

```
Agent tool:
- subagent_type: "code-foundations:post-gate-agent"
- model: [highest resolved REVIEW model among covered phases]
- description: "Batch REVIEW for Phases X-Y"
- prompt: |
    This task involves multi-step reasoning. Think carefully before responding.

    Independently verify the implementations below against their requirements.
    You did not write this code and have no information about how or why it was
    written. Do NOT assume it is correct or complete. Assume requirements may be
    unmet and bugs may be present; verify each item from scratch against the
    actual code and executed test results. Do NOT introduce requirements that
    are not listed here.

    You are reviewing several phases at once. Verify each phase's requirements
    on their own terms first, then check the phases against each other
    (Cross-Phase Coherence below) — defects that live in the seams between
    phases are the ones only a batch review is positioned to find.

    ## Phases to verify
    [For each phase in the un-reviewed set, in plan order:]
    ### Phase X: [name]
    Requirements (fill the template per item; PASS requires execution evidence):
    - DW-X.1: [item]
      PREMISE: ___  EVIDENCE (file:line): ___  TRACE (input→output): ___  VERDICT: ___
    Files: [implementation + test file paths, each with the BUILD report's "what was done"
    note — new or changed routines are the ones it names]

    [if the phase has **Edge cases:** in the plan, include them here — same
    verdict standing as the DW items, exactly as in § REVIEW:]
    Edge cases (an unhandled case listed here is a FAIL, not a Note):
    - [paste verbatim]

    ### Phase Y: [name]
    Requirements:
    - DW-Y.1: [item]
      PREMISE: ___  EVIDENCE (file:line): ___  TRACE (input→output): ___  VERDICT: ___
    Files: [paths with their "what was done" notes, as for Phase X]

    ## Test Coverage Level
    [paste the plan's level — 100% / Targeted: <layers> / Per-phase / None]

    ## How to run the suite
    [exact test command + typecheck/lint commands]
    Run these directly via Bash and capture the output.

    ## Cross-Phase Coherence
    Check that the covered phases work together:
    - No contradictions between phase outputs
    - No regressions introduced by later phases
    - Tests still pass for earlier phases' functionality
    - Each phase uses the interfaces the earlier phases actually expose, not
      the ones it assumes they expose

    [if any covered phase lists at least one skill (not `none -- [reason]`) OR its
    BUILD agent reported additional skills, include the union across all covered phases:]
    ## Additional Skills
    Invoke EVERY Skill() below BEFORE reviewing:
    - Skill([plugin:name -- this plugin's own skills as code-foundations:<name>])

    ## Output
    Write review to: .code-foundations/build/<plan-name>-batch-phases-X-Y-review.md
```
