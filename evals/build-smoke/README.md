# build-smoke — read-through smoke test of the trimmed build workflow

**What it checks:** that an agent that has never seen the pre-lighten `commands/build.md` can execute SETUP (resolve every phase and print the resolution table) and describe VERIFY from the document alone, for `plan.md`, and arrive at `expected.md`.

**Protocol:** dispatch a fresh `Explore` agent (read-only) with: "Read commands/build.md and every reference it tells you to read for SETUP and VERIFY. Then, for evals/build-smoke/plan.md, produce the SETUP resolution table exactly as build.md specifies, list the tasks you would create, predict when batch REVIEWs fire, and describe what VERIFY does for this plan. Do not run anything. Report every sentence in build.md you found ambiguous or contradictory." Compare the output with `expected.md`; log mismatches and reported ambiguities in the plan's execution log; fix build.md or explain.

**What it cannot see:** real subagent dispatch, template substitution, batch trigger evaluation at a live wave boundary, gate failures, cherry-pick integration, the trust report's git-trailer dump. Those are exercised only by a real build.
