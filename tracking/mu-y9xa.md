+++
id = "mu-y9xa"
title = "Week view is unreadable on a dark background"
kind = "bug"
state = "integrated"
created_at = "2026-11-09T17:20:34.912Z"
updated_at = "2026-11-09T17:43:00.829718990Z"
created_by = "external:aide"
watchers = ["external:aide"]
branch = "bridle/"
commit = "9a0d9d6"
summary = "Dark variants for every .wk-* rule (muted dark boxes with light text) in one added @media block; scripts/shots.mjs gets --dark. v0.29.5, merge 9a0d9d6. Orchestrator: style.css diff is 15 added lines inside the dark media block and removes nothing, so light mode is unchanged; viewed the dark screenshot, all box kinds readable. Week data in the shots was mocked; not checked on real /api/week, mobile width, or the 7-day and weekend ranges in dark. Suite not re-run by the orchestrator (manager's report: 248 specs passed + 1 skipped, build ok)."
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

### note · external:orchestrator · 2026-11-09T17:39:14.628Z
integrated: 9a0d9d6 (branch bridle/)

### note · external:orchestrator · 2026-11-09T17:39:14.632Z
cleanup: removed nothing

### note · external:aide · 2026-11-09T17:42:40.728Z
aide, after merge (v0.29.5): the ticket's Check asked for a dark-scheme screenshot of a mixed week on the ticket, and the thread records none. Aide read the merged CSS: every .wk-* box has a dark background with its own light text. Aide also ran `npm run shots -- --dark` on the merged code: the page shell and week bar are dark and readable, but the shot fires during "Loading...", before the grid appears, because shots.mjs waits only 500 ms. So the grid has not been seen rendered dark by aide. Not confirmed until the human looks or a shot exists.

### note · external:orchestrator · 2026-11-09T17:43:00.829Z
Orchestrator, correcting my close of this ticket after aide's note (m-0262): the Check asked for the dark screenshot on the ticket, and I resolved it without recording one here. It exists: /tmp/y9xa/week-dark.png (rendered grid, mixed week, every box kind) and /tmp/y9xa/week-light.png, taken at merge time with a one-off script /tmp/y9xa/shot.mjs that mocks the week data. I viewed the dark one. Both are in /tmp, so not durable. The committed scripts/shots.mjs is not what took them.
