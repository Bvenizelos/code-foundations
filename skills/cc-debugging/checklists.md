# cc-debugging - Checklists

Source: Code Complete 2nd Edition, Chapter 23 (pp. 559-560)

---

## Techniques for Finding Defects

- [ ] FD-1: "Did you use all available data to make your hypothesis?" → Red flag: Guessing without examining logs, variables, stack traces
- [ ] FD-2: "Did you refine the test cases that produce the error?" (Good: Minimal repro case, Bad: Only testing in full app context)
- [ ] FD-3: "Did you exercise the code in your unit test suite?"
- [ ] FD-4: "Did you use available tools?" (debugger, profiler, lint)
- [ ] FD-5: "Did you reproduce the error several different ways?" → Reveals root cause vs symptoms
- [ ] FD-6: "Did you generate more data to generate more hypotheses?"
- [ ] FD-7: "Did you use the results of negative tests?" (what DOESN'T cause it?)
- [ ] FD-8: "Did you brainstorm for possible hypotheses?"
- [ ] FD-9: "Did you keep a notepad and make a list of things to try?" → Prevents circular debugging
- [ ] FD-10: "Did you narrow the suspicious region of the code?" (binary search)
- [ ] FD-11: "Were you suspicious of classes and routines that have had defects before?" → Defects cluster
- [ ] FD-12: "Did you check code that's changed recently?"
- [ ] FD-13: "Did you expand the suspicious region if narrowing failed?"
- [ ] FD-14: "Did you integrate incrementally to isolate the change that broke it?"
- [ ] FD-15: "Did you check for common defects?" (off-by-one, null pointer, etc.)
- [ ] FD-16: "Did you talk to someone else about the problem?" (confessional debugging)
- [ ] FD-17: "Did you take a break from the problem?" → Fresh eyes prevent tunnel vision
- [ ] FD-18: "Is every change after the first few guesses backed by a recorded hypothesis — the systematic method, and then brute force, once quick guesses fail?" → Red flag: a run of unrecorded changes
- [ ] FD-19: "Did you make a list of brute-force techniques and use them?"

---

## Techniques for Syntax Errors

- [ ] SE-1: "Did you distrust line numbers in compiler messages?" → Check the lines before and after the reported one; the real error is usually earlier, occasionally later
- [ ] SE-2: "Did you read between the lines of compiler messages?" (Good: Understand root cause, Bad: Trust cryptic message literally)
- [ ] SE-3: "Did you fix only the first error and recompile?" → Later errors often spurious cascades
- [ ] SE-4: "Did you divide and conquer?" (remove part of code, compile again)
- [ ] SE-5: "Did you check for misplaced comments and quotation marks?" (syntax-directed editor, or insert `/*"/**/` to locate the unbalanced one)

---

## Techniques for Fixing Defects

- [ ] FF-1: "Did you understand the problem before fixing it?" → Red flag: Applying fixes without diagnosis
- [ ] FF-2: "Did you understand the program vicinity?" (hundreds of lines, not just the error line)
- [ ] FF-3: "Did you confirm the defect diagnosis?" (rule out competing hypotheses)
- [ ] FF-4: "Did you relax if you were rushing?" → Red flag: Panic-driven debugging
- [ ] FF-5: "Did you save the original source code?"
- [ ] FF-6: "Did you fix the problem, not the symptom?" (Good: Root cause fix, Bad: Special-case workarounds)
- [ ] FF-7: "Did you change the code only for good reason?" → Red flag: Superstitious changes
- [ ] FF-8: "Did you make one change at a time?" (Good: Single variable experiment, Bad: Shotgun debugging)
- [ ] FF-9: "Did you check your fix with triangulation test cases?"
- [ ] FF-10: "Did you add a unit test that exposes the defect?" → Prevents regression
- [ ] FF-11: "Did you look for similar defects?" → Defects cluster; if one bug exists, similar ones likely nearby

---

## General Approach to Debugging

- [ ] GA-1: "Do you use debugging as an opportunity to learn?" (program structure, mistakes, code quality, problem-solving)
- [ ] GA-2: "Do you avoid the trial-and-error, superstitious approach?" → Red flag: Random code changes hoping something works
- [ ] GA-3: "Do you assume that errors are your fault?" (Good: Own the bug, Bad: Blame compiler/library/hardware)
- [ ] GA-4: "Do you use the scientific method to stabilize intermittent errors?"
- [ ] GA-5: "Do you use the scientific method to find defects?" (hypothesis → experiment → prove/disprove)
- [ ] GA-6: "Do you use several different techniques?" → Red flag: Using same failed approach repeatedly
- [ ] GA-7: "Do you verify that the fix is correct?" (triangulation + regression tests)
- [ ] GA-8: "Do you use all available tools?" (compiler warnings, execution profiling, test framework, scaffolding, interactive debugging)

---

## Scientific Debugging Steps

The canonical 7-step list (STABILIZE → LOCATE → HYPOTHESIZE → EXPERIMENT → FIX → TEST → SEARCH) and its gate preconditions live in `SKILL.md` — follow that order; this file holds the supporting checklists below.

---

## Brute-Force Techniques Checklist

When systematic approaches fail, use these guaranteed (but tedious) methods:

- [ ] BF-1: "Did you perform a full design and/or code review on the broken code?"
- [ ] BF-2: "Did you consider throwing away the section and redesigning/recoding from scratch?"
- [ ] BF-3: "Did you consider throwing away the whole program and redesigning/recoding from scratch?"
- [ ] BF-4: "Did you compile code with full debugging information?"
- [ ] BF-5: "Did you compile at pickiest warning level and fix all warnings?"
- [ ] BF-6: "Did you strap on a unit test harness and test the code in isolation?"
- [ ] BF-7: "Did you create an automated test suite and run it extensively?"
- [ ] BF-8: "Did you step through a big loop in the debugger manually?"
- [ ] BF-9: "Did you instrument the code with print, display, or other logging statements?"
- [ ] BF-10: "Did you try compiling the code with a different compiler?"
- [ ] BF-11: "Did you compile and run the program in a different environment?"
- [ ] BF-12: "Did you link or run against special libraries that produce warnings?"
- [ ] BF-13: "Did you replicate the end-user's full machine configuration?"
- [ ] BF-14: "Did you integrate new code in small pieces, fully testing each piece?"

---

## Common Defect Checklist

Quick checks for common bugs:

- [ ] CD-1: "Off-by-one errors?" (loop bounds, array indices) → Red flag: Using `<=` where `<` is correct
- [ ] CD-2: "Null/undefined references?" → Red flag: Missing null checks before dereferencing
- [ ] CD-3: "Uninitialized variables?"
- [ ] CD-4: "Use-after-free / dangling pointers?"
- [ ] CD-5: "Race conditions?" (timing-dependent behavior)
- [ ] CD-6: "Integer overflow/underflow?"
- [ ] CD-7: "Incorrect operator precedence?" (Good: Use parentheses for clarity, Bad: Rely on memorized precedence)
- [ ] CD-8: "String encoding issues?" (UTF-8, etc.)
- [ ] CD-9: "Floating-point comparison?" → Red flag: Using `==` instead of epsilon comparison
- [ ] CD-10: "Incorrect type conversions?"
- [ ] CD-11: "Resource leaks?" (memory, file handles, connections)
- [ ] CD-12: "Logic inversion?" (wrong branch taken) → Red flag: Inverted conditional logic

