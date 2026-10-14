# Checklists: Pseudocode Programming Process

Source: Code Complete 2nd Edition, pp. 233-234

---

## Prerequisites

- [ ] PR-1: "Have you checked that the prerequisites have been satisfied?"
- [ ] PR-2: "Have you defined the problem that the class will solve?" → Red flag: Fuzzy requirements

---

## Design Quality

- [ ] DQ-1: "Is the high-level design clear enough to give the class and each of its routines a good name?" → Red flag: If naming is hard, design is unclear
- [ ] DQ-2: "Have you thought about how to test the class and each of its routines?" (Good: Test plan exists, Bad: "I'll figure it out later")
- [ ] DQ-3: "Have you checked the standard libraries and other code libraries for applicable routines or components?" → Red flag: Reinventing the wheel
- [ ] DQ-4: "Have you checked reference books for helpful algorithms?" → Red flag: Guessing at approach
- [ ] DQ-5: "For each failure mode identified, is there a plan for how callers learn about it — error result, exception, observable state change, or a documented reason for silencing?" → Red flag: error handling considered but no failure-surfacing plan

---

## Pseudocode Quality

- [ ] PQ-1: "Have you designed each routine by using detailed pseudocode?"
- [ ] PQ-2: "Have you mentally checked the pseudocode? Is it easy to understand?"
- [ ] PQ-3: "Is the pseudocode at the right level of detail?" (Good: Level of intent, Bad: Too high-level or language-specific)
- [ ] PQ-4: "Is the pseudocode language-independent?" → Red flag: Target language syntax in pseudocode

---

## Implementation

- [ ] IM-1: "Did you translate the pseudocode to code accurately?" (Good: Pseudocode becomes comments, Bad: Comments diverge from code)
- [ ] IM-2: "Did you apply the PPP recursively, breaking routines into smaller routines when needed?"
- [ ] IM-3: "Have you chosen the best of several iterations?" → Red flag: Stopping after first iteration only
- [ ] IM-4: "Did you compile clean with ALL warnings eliminated?" → Red flag: "Warnings don't matter" attitude

---

## Understanding

- [ ] UN-1: "Do you thoroughly understand your code? Is it easy to understand?"
- [ ] UN-2: "Can you explain WHY the code works, not just that it works?" → Red flag: Works but mysterious
