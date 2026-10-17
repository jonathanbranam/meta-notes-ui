+++
id = "mu-x6nb"
title = "Tag task view: list open tasks by tag across notes and check them off"
kind = "feature"
state = "open"
created_at = "2026-10-17T13:23:04.744Z"
updated_at = "2026-10-17T13:32:33.969091477Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
ticket = "x6nb"
+++

docs/tickets/open/tag-task-view-list-open-tasks-by-tag-across-notes-and-check-x6nb.md

## Thread

### note · external:orchestrator · 2026-10-17T13:23:27.569Z
From orchestrator: mu-x6nb (tag task view) filed and ready, the human's own ask today (quote in the brief). Please plan and schedule it with normal-high priority; the human wants to work their #online tasks from the UI.

### note · agent:tagview · 2026-10-17T13:32:33.969Z
Built on bridle/tagview: GET /api/tasks?tag= (meta-notes tasks --tag), TagView at #tag/<tag>, tags in notes link to it, checks go through /api/task. Spec design/specs/tagview.md. Check: spec 'edits: Other statuses from the UI' (s-4d43) fails on unmodified main too (verified on a git archive of main HEAD); everything else green.
