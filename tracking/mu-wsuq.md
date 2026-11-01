+++
id = "mu-wsuq"
title = "Recurring task reminders stop when an occurrence is left open"
kind = "bug"
state = "open"
created_at = "2026-11-01T13:14:48.919Z"
updated_at = "2026-11-01T13:22:08.423248244Z"
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

### note · external:orchestrator · 2026-11-01T13:21:52.331Z
HOLD (orchestrator, human via aide m-0147): no implementation until the human approves a proposed solution. The human (via aide, 2026-11-01 8:21 AM): "I dont know whos going to work on that reminder thing, but I want to understand the solution proposed and approve it. I dont want any work done without my approval for that." Next step: the planner writes the proposal in plain terms (what changes in alert behavior, the options, a recommendation) on this thread and sends it to external:aide on notes, who brings it to the human. Only after the human's approval, quoted here, does code start.

### note · external:orchestrator · 2026-11-01T13:21:52.513Z
From orchestrator: STOP implementing mu-wsuq now. The human put it on hold until they approve a proposed solution (quote on the ticket). Don't commit or merge code for it. If you have findings, write them as a plain-terms proposal (alert behavior change, options, recommendation) on the ticket thread and tell manager-1.

### note · external:orchestrator · 2026-11-01T13:21:52.914Z
From orchestrator: HOLD on mu-wsuq, human's quote on the ticket. No implementation or merge until the human approves a proposal. Please stop worker recur's implementation, then send the proposal in plain terms (what changes in alert behavior, options, your recommendation) to external:aide on notes (bridle --project notes send external:aide ...) and put it on the ticket. Wait for the human's approval relayed back before any code.

### note · agent:manager-1 · 2026-11-01T13:22:08.423Z
Proposal (manager-1), for the human's approval. No code lands until approved; worker recur is stopped (an unmerged draft is on bridle/recur, f1f5cc5; not to be merged unless A below is approved as is). WRONG: buildAlerts (shared/today.ts) alerts for a task only when its due date is today. A daily task with a time (say 9 PM) left open keeps its old due date, and meta-notes makes no new occurrence until it is completed, so after one missed day it never alerts again. OPTION A (recommended, small, UI only): for an open task that recurs and has a time, alert on every day its recurrence rule says it is due, even while an older occurrence is still open. Non-recurring overdue tasks still do not alert. One alert per day per task, not one per missed day. No meta-notes change. This is what the draft does. OPTION B: also let routine tasks lapse (done or forgotten) instead of piling up overdue. Needs meta-notes (the CLI) to change how it rolls recurring tasks, so its own ticket in meta-notes, not this fix. OPTION C: alert for every overdue task with a time. Rejected: it nags about one-off tasks you dropped on purpose. RECOMMENDATION: A now; B separately when you want routines to lapse. A does not conflict with B. AWAITING: the human's yes or no on A, quoted here via aide.
