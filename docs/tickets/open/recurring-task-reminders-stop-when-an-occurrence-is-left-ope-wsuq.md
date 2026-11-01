---
id: mu-wsuq
title: Recurring task reminders stop when an occurrence is left open
kind: bug
created: 2026-11-01
created_by: external:orchestrator
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
---

## The ask

Make an open recurring task with a time alert every day its recurrence rule says it is due, even
while an older occurrence is still open (overdue). Details, check and model below.

## Report

The human (2026-11-01 8:12 AM, via aide on notes): "Did we lose the reminder because the recurrence
wasn't marked done the day before? If so, that's a problem we need to address."

Yes. `shared/today.ts` `buildAlerts()` (line 76) pushes a task alert only when `t.due === todayIso`.
A recurring task with a time (e.g. `every day` with `21:00`) that is left open stays dated on the
missed day, and no next occurrence exists until it is completed, so it never alerts again.

Real cases (from aide, notes):
- "Check tomorrow's weather", due 10/28: no 9 PM alert on 10/29, 10/30 or 10/31.
- Coffee, bedtime checklist and Help Zeal (due 10/30): no alert on 10/31.
- Take a lunch (due 10/29): no alert on Fri 10/30.

## Wanted

An open recurring task with a time alerts every day its recurrence rule says it is due, even while
an older occurrence is still open (overdue).

Related, not required here: the human wants routine tasks to lapse (done or forgotten) instead of
piling up as overdue (notes `area/meta-notes/Home.md`, 2026-10-10 12:50 and 2026-10-15). If one
change covers both, say so in the plan; if lapsing needs meta-notes (the CLI) changes, split that
into its own ticket rather than widening this one.

## Check

A unit test for `buildAlerts`: a daily recurring task with a time, due yesterday and still open,
produces an alert today; a non-recurring overdue task with a time still does not. Existing tests
pass.

Model: Sonnet (recurrence-rule evaluation is the tricky part).
