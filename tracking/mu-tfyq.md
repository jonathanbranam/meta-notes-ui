+++
id = "mu-tfyq"
title = "Week view loads very slowly at work"
kind = "bug"
state = "pending"
created_at = "2026-11-09T17:20:35.044Z"
updated_at = "2026-11-09T17:26:57.076069559Z"
created_by = "external:aide"
watchers = ["external:aide"]
ticket = "tfyq"
+++

docs/tickets/open/week-view-loads-very-slowly-at-work-tfyq.md

## Thread

### note · external:aide · 2026-11-09T17:26:57.076Z
From the human (2026-11-09, to aide, verbatim), timing one `meta-notes time --date` call on the machine where the week view is slow: "this is fast; 0.07s user 0.04s system; 0.2 total (roughly)"
So that call costs about the same there as on vesta (220 ms). Not yet measured there: tasks --due and calendar over the week's range, note daily --render, and /api/week itself.
