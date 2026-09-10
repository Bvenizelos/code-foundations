---
name: aposd-verifying-correctness
description: "Verifies implementation completeness across functional correctness, error handling, concurrency, and security dimensions using APOSD's post-implementation checklist. Run after a coding task is nominally complete, not during active bug investigation (use cc-debugging)."
user-invocable: false
---

# Skill: aposd-verifying-correctness

## Before "Done" — scope check

**Design quality ≠ correctness.** Well-designed code can still have bugs, missing requirements, or safety issues.

**Run every dimension check before claiming done** — "I think I covered everything" without explicit mapping is exactly the gap this skill exists to close.

---

## Dimension Detection & Checks

For each dimension: detect if it applies, then verify.

---

### 1. Requirements Coverage

**Detect:** Were requirements stated? (explicit list, user request, spec)

**If YES, verify:**
- [ ] RC-1: List each requirement explicitly
- [ ] RC-2: For each: point to code that implements it
- [ ] RC-3: Any requirement without code? → **Not done**
- [ ] RC-4: Any code without requirement? → Scope creep or missing requirement

**Red flag:** "I think I covered everything" without explicit mapping

---

### 2. Concurrency Safety

**Detect:** Any of these present?
- Multiple threads/processes accessing same data
- Async/await patterns
- Shared mutable state (class attributes, globals)
- "Thread-safe" in requirements or docstring
- Web handlers, queue workers, background tasks

**If YES, verify:**
- [ ] CS-1: All shared mutable state identified
- [ ] CS-2: Each access point protected (lock, atomic, queue, immutable)
- [ ] CS-3: No time-of-check to time-of-use (TOCTOU) gaps
- [ ] CS-4: Lock ordering consistent (if multiple locks)

**Red flag:** "It's probably fine" or "Python GIL handles it"

---

### 3. Error Handling

**Detect:** Can any operation fail?
- I/O (file, network, database)
- External calls (APIs, subprocesses)
- Resource acquisition (memory, connections)
- User input processing
- Parsing/deserialization

**If YES, verify:**
- [ ] EH-1: Each failure point has explicit handling OR propagates
- [ ] EH-2: No bare `except:` or `except Exception: pass`
- [ ] EH-3: Error messages actionable (what failed, why, how to fix)
- [ ] EH-4: Partial failures handled (rollback, cleanup, consistent state)
- [ ] EH-5: No error path silently continues as if nothing happened (catch-log-continue, default returns on failure, swallowed callbacks all create silent failures — each error path either surfaces to the caller or is observable via logs/metrics/alerts)

**Red flag:** "Errors are rare" or "caller handles it" without checking caller

---

### 4. Resource Management

**Detect:** Does code acquire resources?
- File handles, sockets, connections
- Locks, semaphores
- Memory allocations (large buffers, caches)
- External service handles
- Background threads/processes

**If YES, verify:**
- [ ] RM-1: Every acquire has corresponding release
- [ ] RM-2: Release happens in finally/context manager/destructor
- [ ] RM-3: Release happens on error paths too
- [ ] RM-4: No resource leaks on repeated calls
- [ ] RM-5: Bounded growth (caches have limits, queues have limits)

**Red flag:** "It cleans up eventually" or daemon threads without shutdown

---

### 5. Boundary Conditions

**Detect:** Does code handle variable-size input?
- Collections (lists, dicts, sets)
- Strings, byte arrays
- Numeric ranges
- Optional/nullable values

**If YES, verify:**
- [ ] BC-1: Empty input: What happens with `[]`, `""`, `None`, `0`?
- [ ] BC-2: Single item: Edge case often different from N items
- [ ] BC-3: Maximum size: What if input is huge? Memory? Time?
- [ ] BC-4: Invalid values: Negative numbers, NaN, special characters?
- [ ] BC-5: Type boundaries: int overflow, float precision?

**Red flag:** "Nobody would pass that" or "that's an edge case"

---

### 6. Security (if applicable)

**Detect:** Does code handle untrusted input?
- User-provided data (forms, API requests)
- File contents from external sources
- URLs, paths, identifiers from users
- Data that becomes SQL, shell, HTML, or code

**If YES, verify:**
- [ ] SE-1: Input validated before use
- [ ] SE-2: No string concatenation for SQL/shell/HTML (use parameterized)
- [ ] SE-3: Path traversal prevented (no `../` exploitation)
- [ ] SE-4: Secrets not logged or exposed in errors
- [ ] SE-5: Auth/authz checked before action, not after

**Red flag:** "It's internal only" (internals get exposed)

---

**CHECKER:** every ID'd item above is a checklist item. The Output Format below is the report — one PASS/FAIL/N/A line per dimension with the evidence lines it asks for; individual items appear under their dimension only when they fail (`ID — evidence — location`); close with one line `N items checked, M pass, K n/a`.

---

## Output Format

When verifying, output:

```
## Correctness Verification

### Requirements: [PASS/FAIL/N/A]
- Requirement 1 → implemented in X
- Requirement 2 → implemented in Y

### Concurrency: [PASS/FAIL/N/A]
- Shared state: [list]
- Protection: [how]

### Errors: [PASS/FAIL/N/A]
- Failure points: [list]
- Handling: [approach]

### Resources: [PASS/FAIL/N/A]
- Acquired: [list]
- Released: [how]

### Boundaries: [PASS/FAIL/N/A]
- Edge cases: [list]
- Handling: [approach]

### Security: [PASS/FAIL/N/A]
- Untrusted input: [list]
- Validation: [approach]
- FAIL items only: [ID — evidence — location]   (same line under every dimension that has failures)

N items checked, M pass, K n/a

**Verdict:** [DONE / NOT DONE - list blockers]
```
