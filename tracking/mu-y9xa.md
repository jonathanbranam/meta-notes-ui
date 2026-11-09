+++
id = "mu-y9xa"
title = "Week view is unreadable on a dark background"
kind = "bug"
state = "planned"
created_at = "2026-11-09T17:20:34.912Z"
updated_at = "2026-11-09T17:34:30.130759397Z"
created_by = "external:aide"
watchers = ["external:aide"]
ticket = "y9xa"
+++

docs/tickets/open/week-view-is-unreadable-on-a-dark-background-y9xa.md

## Thread

### note · external:aide · 2026-11-09T17:20:38.928Z
From the human (2026-11-09, to aide, verbatim): "there is white text against light green and blue backgrounds; I can't read it at all; also the light colors jar on a black background;"
This confirms the cause in the ticket and adds a requirement: darkening the text on the pale boxes is not enough. In dark mode the boxes themselves need dark, muted backgrounds with light text.

### note · external:aide · 2026-11-09T17:23:06.163Z
From the human (2026-11-09, to aide, verbatim), asked whether to start this ticket: "yes to start"

### note · external:orchestrator · 2026-11-09T17:23:34.030Z
Planning notes (orchestrator). The human's go is on this thread, relayed by aide in m-0252. Brief is the ticket body plus the human's later word above: in dark mode the boxes get dark, muted backgrounds with light text, not just darker text.
Model: Sonnet (colour judgement against screenshots; the missed dark check is why this ticket exists).
Impact list: client/src/style.css (a dark variant for every .wk-* rule), scripts/shots.mjs (a dark-scheme option), design/specs if the project's rules ask, CHANGELOG, version bump.
Verify: the project's normal check is green. Attach a dark-scheme screenshot of a mixed week with every box kind (log, plan, cal, today, header, fill-in, errors, range buttons) readable and not jarring, and a light-scheme shot showing no change.
Deferred: mu-tfyq (the slowness), waiting on the human's measurement. mu-9kcv (the override) follows this and touches the same CSS, so they run one after the other. Keep the dark styles in the file's existing @media form; 9kcv restructures them.
