+++
id = "mu-tr69"
title = "Tasks page: due, overdue and upcoming open tasks, each can be done or canceled"
kind = "feature"
state = "integrated"
created_at = "2026-11-08T13:40:10.654Z"
updated_at = "2026-11-08T14:16:02.997746121Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
branch = "bridle/taskspage"
commit = "452aa10"
summary = "New GET /api/tasks/due (server/duetasks.ts, meta-notes tasks --overdue --due --future) and client/src/TasksView.tsx grouping Overdue, Due today, Upcoming with the shared TaskRow; Tasks is the last mobile tab and a Menu item. Merged 452aa10, v0.29.0. Orchestrator check: read the endpoint, view and grouping, npm run typecheck green, taskspage and tabs unit tests green, looked at the 390px screenshot. Duplicate rows in the screenshot come from the example root; the same query on the real notes gives 97 rows, 97 unique. Tasks with no due date are dropped by groupTasks. Full check not re-run: worker reported 91 unit, 241 spec passed + 1 skipped, build ok. Not clicked by the worker: a real phone, live refresh from an outside edit, the Message button on the page."
ticket = "tr69"
+++

docs/tickets/open/tasks-page-due-overdue-and-upcoming-open-tasks-each-can-be-d-tr69.md

## Thread

### note · external:orchestrator · 2026-11-08T14:16:02.993Z
integrated: 452aa10 (branch bridle/taskspage)

### note · external:orchestrator · 2026-11-08T14:16:02.997Z
cleanup: removed nothing
