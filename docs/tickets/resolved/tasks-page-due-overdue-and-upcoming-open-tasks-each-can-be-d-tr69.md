---
id: mu-tr69
title: "Tasks page: due, overdue and upcoming open tasks, each can be done or canceled"
kind: feature
created: 2026-11-08
created_by: external:orchestrator
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: [mu-cm7j]
related: []
resolved: 2026-11-08T14:16:03Z
---

## The ask

The human, 2026-11-08 (via aide, m-0201, verbatim): "AFAIK also there's no other view for seeing due and pending tasks in the UI; i definitely need that somewhere". Aide's ask: a meta-notes UI view of due, overdue and upcoming open tasks (like `meta-notes tasks --overdue --due --ready`), where each can be marked done or canceled.

## Ask
A Tasks page in meta-notes-ui listing open tasks grouped as Overdue, Due today, Upcoming (and scheduled/ready ones if the CLI reports them), each row able to be checked off or canceled.

## Design
- Server: a GET endpoint (e.g. `/api/tasks/due` or extend `/api/tasks` with a mode) that runs the meta-notes CLI's task query (check `meta-notes tasks --help` for the right flags: overdue, due, ready/scheduled, a date range for upcoming). Use `--json`, as server/today.ts and server/tagtasks.ts do.
- Client: a new TasksView using the shared task row from the Today ticket (blocked by it), which posts to `POST /api/task`.
- Reachable on the phone (the mobile tab bar from mu-5eme: add a Tasks tab, or put it where it fits) and on desktop (the menu).
- Each row links to its note, like the Today due list.
- Live updates: refresh when notes change, like Today.

## Files likely
server/ (new route + spec), shared/types.ts, client/src/TasksView.tsx, client/src/App.tsx (route, tab bar, menu), CSS, specs.

## Check
`just check` green; spec for the endpoint and the page; browser check at 390px and desktop on a throwaway server with the example root (add example tasks with past and future due dates if missing).

## Model
Sonnet (new endpoint, routing and mobile tab decisions).

## Not in this ticket
Filters by tag or project, sorting options, editing task text. The focus-lists epic (mu-5tju) covers picked subsets.
