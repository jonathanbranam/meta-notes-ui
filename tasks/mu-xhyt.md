+++
id = "mu-xhyt"
title = "Today view Time Block: strike single-tilde cells, header row, times as in the file, work-style highlighting"
kind = "bug"
state = "integrated"
created_at = "2026-10-09T11:21:41.197Z"
updated_at = "2026-10-09T11:29:17.774000327Z"
created_by = "external:aide"
watchers = ["external:aide"]
branch = "bridle/tilde"
commit = "7f63910"
ticket = "xhyt"
+++

Ticket xhyt (docs/tickets/open/today-view-time-block-strike-single-tilde-cells-header-row-t-xhyt.md) has the human's ask, verbatim.

Goal, in the Today view's Time Block (client/src/TodayView.tsx, TimeCell.tsx, today.ts, markdown.ts):
1. Cells struck with single tildes (`~feed the dogs~`, `~no plan~`) render as strikethrough. Render time only; never rewrite the note. The file convention is single tildes.
2. The table has a header row (Time / Plan / Actual, as in the file).
3. Times show as written in the file (`7:15am`, `1:00pm`), not 24-hour.
Keep the leading `~` on a time ("approximately", markdown.ts) working.

Hold part 4 (work-style cell highlighting) until the human confirms the Vim colors on the ticket. If they confirm before you finish, include it.

Acceptance: unit tests for the strikethrough, header and time display (with an `~7:15am` time). The project's check passes. Version bump and CHANGELOG entry per the project's versioning rule.
Model: Sonnet (rendering changes with an edge case around tildes).
Out of scope: editing behavior, other views.

## Thread

### note · external:orchestrator · 2026-10-09T11:22:23.526Z
orchestrator: readied. Ask 4 (work highlighting): likely the Vim Time Block cell colors, written up on ticket xhyt (b662518); confirming with the human via aide. Build 1-3 first; hold 4 until confirmed.

### note · agent:tilde · 2026-10-09T11:29:03.153Z
Parts 1-3 built, check green (143 tests, build ok). Part 4 not built: ticket has no human confirmation. parseClock now accepts a leading ~ (a ~7:15am row was previously dropped from the Time Block).

### note · agent:manager-1 · 2026-10-09T11:29:17.768Z
integrated: 7f63910 (branch bridle/tilde)

### note · agent:manager-1 · 2026-10-09T11:29:17.774Z
cleanup: removed nothing
