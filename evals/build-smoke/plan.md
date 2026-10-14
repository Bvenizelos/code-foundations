# Plan: Smoke — greeting service
**Created:** 2026-09-10
**Status:** ready
**Complexity:** simple
**Review cadence:** 2
---
## Context
A throwaway fixture for the build-workflow smoke test. Nothing here is real; the point is that a fresh orchestrator can resolve SETUP and VERIFY from commands/build.md alone.
## Constraints
- Scratch project at evals/build-smoke/project (no test suite exists — the smoke agent must say what it would run, not run it)
---
## Implementation Phases

### Phase 1: Greeting formatter
**Skills:** cc-defensive-programming
**Model:** sonnet
**Gate:** Standard
**Depends on:** none
**File scope:** `project/greet.py, project/test_greet.py`

**Goal:** A `greet(name)` function that validates its input and returns a greeting.

**Scope:**
- IN: greet.py, its tests
- OUT: any CLI

**Produces:** `greet(name: str) -> str` → Phase 3

**Done when:**
- [ ] DW-1.1: `greet("Ada")` returns "Hello, Ada"
- [ ] DW-1.2: empty or non-string input raises ValueError

### Phase 2: Config loader
**Skills:** none -- a two-line JSON read, no doctrine dimension in scope
**Model:** haiku
**Gate:** Standard
**Depends on:** none
**File scope:** `project/config.py, project/test_config.py`

**Goal:** Load `greeting.json` into a dict with a default when the file is absent.

**Done when:**
- [ ] DW-2.1: `load_config(path)` returns the parsed dict
- [ ] DW-2.2: a missing file returns `{"punctuation": "!"}`

### Phase 3: CLI entry point
**Skills:** cc-defensive-programming, cc-control-flow-quality
**Model:** haiku
**Gate:** Full
**Depends on:** Phase 1, Phase 2
**File scope:** `project/cli.py, project/test_cli.py`

**Goal:** `python -m project.cli NAME` prints the greeting using the loaded config.

**Done when:**
- [ ] DW-3.1: running the CLI with a name prints the greeting with the configured punctuation
- [ ] DW-3.2: running it with no argument exits non-zero with a usage line

---
## Test Coverage
**Level:** 100%
## Test Plan
- [ ] `pytest evals/build-smoke/project` (the suite the three phases would create; the smoke agent names it, nothing more)
- [ ] Manual: run the CLI once with and once without an argument
---
## Notes
- Fixture only. Never executed by a real build.
- The three test files share no fixtures, ports, or mutable state; pytest runs them independently (co-scheduling condition for Phases 1 and 2).
---
## Execution Log
_To be filled during /code-foundations:build_
