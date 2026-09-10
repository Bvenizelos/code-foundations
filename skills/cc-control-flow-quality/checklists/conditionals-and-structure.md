# Checklists: Control Flow — Conditionals & Structure

Source: Code Complete 2nd Edition, Chapters 14-15, 19

---

## Organizing Sequential Code (Ch 14)

- [ ] SC-1: "Are dependencies among statements made obvious through code structure?"
- [ ] SC-2: "Do routine names make dependencies obvious?"
- [ ] SC-3: "Do parameters make dependencies obvious?"
- [ ] SC-4: "Do comments describe dependencies that would otherwise be unclear?"
- [ ] SC-5: "Are housekeeping variables used to check sequential dependencies in critical code?"
- [ ] SC-6: "Does code read from top to bottom?" (Good: linear flow, Bad: jumping around)
- [ ] SC-7: "Are related statements grouped together?"
- [ ] SC-8: "Have independent statement groups been moved into their own routines?"

---

## Using Conditionals (Ch 15)

### if-then Statements

- [ ] IT-1: "Is the nominal path through the code clear?" (Good: normal case first, Bad: error case first)
- [ ] IT-2: "Do if-then tests branch correctly on equality?"
- [ ] IT-3: "Is the else clause present and documented?"
- [ ] IT-4: "Is the else clause correct?"
- [ ] IT-5: "Are if and else clauses used correctly (not reversed)?" → Red flag: logic inverted
- [ ] IT-6: "Does the normal case follow the if rather than the else?"

### if-then-else-if Chains

- [ ] IC-1: "Are complicated tests encapsulated in boolean function calls?"
- [ ] IC-2: "Are the most common cases tested first?" (Good: frequent first, Bad: rare first)
- [ ] IC-3: "Are all cases covered?"
- [ ] IC-4: "Is the chain the best implementation vs. a case statement?"

### case Statements

- [ ] CS-1: "Are cases ordered meaningfully?"
- [ ] CS-2: "Are actions for each case simple (calling routines if necessary)?"
- [ ] CS-3: "Does the case test a real variable (not a manufactured one)?"
- [ ] CS-4: "Is the default clause used legitimately?"
- [ ] CS-5: "Is the default clause (or a final `else`) used to detect and report unexpected cases?" → Red flag: an empty `default`/`else` that lets unexpected values pass silently — log or throw
- [ ] CS-6: "Does each case end with a break (in C, C++, Java)?" → Red flag: fall-through without comment

---

## Control-Structure Issues (Ch 19)

- [ ] CI-1: "Do expressions use true/false rather than 1/0?"
- [ ] CI-2: "Are boolean values compared implicitly (not to true/false explicitly)?" (Good: if(isReady), Bad: if(isReady == true))
- [ ] CI-3: "Are numeric values compared to test values explicitly?"
- [ ] CI-4: "Have expressions been simplified using boolean variables, functions, or decision tables?"
- [ ] CI-5: "Are boolean expressions stated positively?" (Good: if(isValid), Bad: if(!isInvalid))
- [ ] CI-6: "Do pairs of braces balance?"
- [ ] CI-7: "Are braces used everywhere needed for clarity?"
- [ ] CI-8: "Are logical expressions fully parenthesized?"
- [ ] CI-9: "Have tests been written in number-line order?" (Good: MIN <= x && x <= MAX, Bad: x <= MAX && MIN <= x)
- [ ] CI-10: "Do Java tests use a.equals(b) style when appropriate?"
- [ ] CI-11: "Are null statements obvious?"
- [ ] CI-12: "Have nested statements been simplified (retesting, if-then-else, case, routines, OO design)?"
- [ ] CI-13: "If routine has more than 10 decision points, is there good reason not to redesign?" → Red flag: >10 decision points
