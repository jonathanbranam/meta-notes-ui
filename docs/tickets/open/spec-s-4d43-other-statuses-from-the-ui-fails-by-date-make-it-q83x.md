---
id: mu-q83x
title: "Spec s-4d43 (Other statuses from the UI) fails by date: make it date-independent and re-enable"
kind: fix
created: 2026-10-17
created_by: external:orchestrator
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
---

## The ask

Spec s-4d43 'edits: Other statuses from the UI' (area/health.md line-starting check) fails on
unmodified main as of 2026-10-17; CI was green on main on 2026-10-14. Likely date-dependent: the
example root rolls open tasks over by date, so the line the scenario expects moves. Found by worker
tagview on mu-x6nb (verified on a git archive of main HEAD), reported by manager-1 (m-0065).

Handling, per the human's standing rule for flaky tests (2026-10-11: "if there is a flaky test
that needs addressed, we can either 1. ignore it 2. disable it and in either case, file a ticket to
get it addressed and send to the PdM to be dealth with later after we ship features."): the
scenario is disabled (skipped, naming this ticket) so main is green, and this ticket fixes it later.

Goal: make s-4d43 independent of today's date (pin the clock or pick a fixture line that does not
roll over), then remove the skip.
Verify: s-4d43 passes, un-skipped, `npm run check` green.
Model: Sonnet (fixture/date reasoning). Priority low: after features ship.
