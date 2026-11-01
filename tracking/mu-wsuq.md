+++
id = "mu-wsuq"
title = "Recurring task reminders stop when an occurrence is left open"
kind = "bug"
state = "open"
created_at = "2026-11-01T13:14:48.919Z"
updated_at = "2026-11-01T13:18:11.545730667Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
ticket = "wsuq"
+++

Make an open recurring task with a time alert every day its recurrence rule says it is due, even while an older occurrence is still open (overdue).

### Report

The human (2026-11-01 8:12 AM, via aide on notes): "Did we lose the reminder because the recurrence
wasn't marked done the day before? If so, that's a problem we need to address."

Yes. `shared/today.ts` `buildAlerts()` (line 76) pushes a task alert only when `t.due === todayIso`.
A recurring task with a time (e.g. `every day` with `21:00`) that is left open stays dated on the
missed day, and no next occurrence exists until it is completed, so it never alerts again.

Real cases (from aide, notes):
- "Check tomorrow's weather", due 10/28: no 9 PM alert on 10/29, 10/30 or 10/31.
- Coffee, bedtime checklist and Help Zeal (due 10/30): no alert on 10/31.
- Take a lunch (due 10/29): no alert on Fri 10/30.

### Wanted

An open recurring task with a time alerts every day its recurrence rule says it is due, even while
an older occurrence is still open (overdue).

Related, not required here: the human wants routine tasks to lapse (done or forgotten) instead of
piling up as overdue (notes `area/meta-notes/Home.md`, 2026-10-10 12:50 and 2026-10-15). If one
change covers both, say so in the plan; if lapsing needs meta-notes (the CLI) changes, split that
into its own ticket rather than widening this one.

### Check

A unit test for `buildAlerts`: a daily recurring task with a time, due yesterday and still open,
produces an alert today; a non-recurring overdue task with a time still does not. Existing tests
pass.

Model: Sonnet (recurrence-rule evaluation is the tricky part).

## Thread

### note · external:orchestrator · 2026-11-01T13:15:30.096Z
From orchestrator: mu-wsuq filed and ready (bug, normal). Recurring tasks with a time stop alerting once an occurrence is left open: buildAlerts in shared/today.ts only alerts when due === today. The human asked for it to be addressed (quote on the ticket). Brief, check and model (Sonnet) are on the ticket. Please plan and place it.

### note · agent:recur · 2026-11-01T13:18:11.545Z
Implemented recursOn + buildAlerts change, spec s-3c7e, unit tests (shared/today.test.ts). npm run check: all pass except unrelated spec edits s-1f93 (An approximate start): time-log append with start ~09:15 returns 400 with installed meta-notes 2.33.4. Not touched by this change; asking manager whether to commit anyway.
