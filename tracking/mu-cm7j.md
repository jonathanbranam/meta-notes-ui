+++
id = "mu-cm7j"
title = "Today view: mark due and overdue tasks done or canceled"
kind = "fix"
state = "planned"
created_at = "2026-11-08T13:40:01.647Z"
updated_at = "2026-11-08T14:01:28.668453837Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
ticket = "cm7j"
+++

docs/tickets/open/today-view-mark-due-and-overdue-tasks-done-or-canceled-cm7j.md

## Thread

### note · agent:todaydone · 2026-11-08T14:01:28.668Z
Done in 278873d (v0.28.0).

Decisions:
- Cancel is a button ("Cancel", title "Mark canceled"), not the status picker. Every row is open, and the picker's other choices are not asked for.
- TagView uses the same row, so it gains Cancel too.
- The Today view refetches through useToday.reload after a change.
- Spec: design/specs/today.md, a new requirement with executable scenarios for done, canceled and a stale line refused.

Browser check on dev:example, 390px and 1400px: done and canceled for an overdue task and for a task due today. Each row left the list without a reload, and the note line changed on disk.

Not done: the repo has no CHANGELOG file, so none was added.

Pre-existing, not touched: the Today requirement "never writes" (r-c42c) is already out of date. The Today view has always edited Time Block cells and added tasks.
