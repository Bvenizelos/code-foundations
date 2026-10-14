# build-smoke — read-through smoke test of the trimmed build workflow

**What it checks:** that an agent that has never seen the pre-lighten `commands/build.md` can execute SETUP (resolve every phase and print the resolution table) and describe VERIFY from the document alone, for `plan.md`, and arrive at `expected.md`.

**Protocol:** dispatch a fresh `Explore` agent (read-only) with: "Read commands/build.md and every reference it tells you to read for SETUP and VERIFY. Then, for evals/build-smoke/plan.md, produce the SETUP resolution table exactly as build.md specifies, list the tasks you would create, predict when batch REVIEWs fire, and describe what VERIFY does for this plan. Do not run anything. Report every sentence in build.md you found ambiguous or contradictory." Compare the output with `expected.md`; log mismatches and reported ambiguities in the plan's execution log; fix build.md or explain.

**Scripted events (the loop, v6.5.0):** after the SETUP read-through, give the same agent these two BUILD results as if returned during wave 1, and ask it to narrate, from build.md and the references it names (including references/checkpoint.md), every step the orchestrator takes until VERIFY. It must count the turns it ends to ask the user and the non-blocking messages it sends.
- **E1:** Phase 1 returns `Status: DONE`, all DW items covered, with `### Decisions`: "greet() strips surrounding whitespace from name — default — reversible yes".
- **E2:** Phase 2 returns `Status: UPDATE_PLAN`, with "Question: the repo already has project/settings.toml read by project/settings.py; should Phase 3 read punctuation from it instead of a new greeting.json? This changes the config seam Phase 3 consumes. · Proposed default: greeting.json · Blocks: DW-2.1, DW-2.2". The user, when asked, picks the default.

- **E3 (separate run):** suppose Phase 1 had no `File scope`, so Phases 1 and 2 run serially in plan order. Phase 1 returns UPDATE_PLAN with "Question: should greet() accept non-Latin names, which changes its public contract? · Proposed default: yes · Blocks: DW-1.2" after editing project/greet.py. Phase 2 then returns DONE with no decisions. Narrate until the user is asked.

Compare against expected.md → Scripted events.

**What it cannot see:** real subagent dispatch, template substitution, batch trigger evaluation at a live wave boundary, gate failures, cherry-pick integration, the trust report's git-trailer dump. Those are exercised only by a real build.
