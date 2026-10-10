# Code Complete Foundations Reference

> Shared vocabulary and thresholds for the CC skills that reason about routine and class structure (cc-routine-and-class-design, cc-refactoring-guidance). Source: "Code Complete" 2nd Ed. (McConnell)

---

## Cohesion Spectrum

How well a routine's operations relate to each other. Higher = better.

| Level | Type | Definition | Quality |
|-------|------|------------|---------|
| 1 | **Functional** | Routine performs ONE operation | **Best** |
| 2 | **Sequential** | Operations must occur in specific order, sharing data | Good |
| 3 | **Communicational** | Operations use same data but no order dependency | Acceptable |
| 4 | **Temporal** | Operations grouped by when they happen (e.g., startup) | Marginal |
| 5 | **Procedural** | Operations in specified order but don't share data | Poor |
| 6 | **Logical** | Operations related by control flag selecting behavior | Bad |
| 7 | **Coincidental** | No meaningful relationship between operations | **Worst** |

**Quick test:** can you describe what the routine does without using "and"? If not, cohesion is too low. (Card et al. 1986: 50% of high-cohesion routines were fault-free vs 18% of low-cohesion ones.)

---

## Coupling Criteria

Degree of interdependence between modules. Lower = better.

| Criterion | Good | Bad |
|-----------|------|-----|
| **Size** | Few parameters, small interfaces | Many parameters, large interfaces |
| **Visibility** | Obvious connections (parameters) | Hidden connections (globals, side effects) |
| **Flexibility** | Can easily change one without affecting other | Changes cascade |

**Coupling types (worst to best):** content coupling (module modifies another's internals — eliminate) → common coupling (shared globals — minimize) → control coupling (one module steers another's flow — reduce) → stamp coupling (composite passed, partly used — acceptable) → data coupling (only the needed data passed — the goal).

---

## Key Metrics

| Metric | Threshold | Source |
|--------|-----------|--------|
| **Parameters** | 7±2 maximum | Miller 1956; Basili/Perricone: routines with >5 params had more errors |
| **Inheritance depth** | ≤2 ideal, 3 warning, >3 violation | pp. 147-148 |
| **Routine length** | 100-200 lines optimal for comprehension | Basili/Perricone 1984 |
| **Fan-out** | ≤7 routines called | Card et al. — lower fan-out = fewer errors |
| **Complexity** | Low cyclomatic complexity | McCabe — high complexity = more defects |
