+++
id = "mu-x6nb"
title = "Tag task view: list open tasks by tag across notes and check them off"
kind = "feature"
state = "integrated"
created_at = "2026-10-17T13:23:04.744Z"
updated_at = "2026-10-17T15:31:50.651727819Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
branch = "bridle/tagview"
commit = "14461b3"
summary = "Tag task view at #tag/<tag>: GET /api/tasks?tag= runs meta-notes tasks --tag (aliases folded); marked #tags in notes link to it; check-off goes through the existing /api/task path with live updates. Spec design/specs/tagview.md. Merged 14461b3, v0.22.0. Orchestrator verified on main: npm run check green (174 passed, 1 skipped = s-4d43, mu-q83x)."
ticket = "x6nb"
+++

docs/tickets/open/tag-task-view-list-open-tasks-by-tag-across-notes-and-check-x6nb.md

## Thread

### note · external:orchestrator · 2026-10-17T13:23:27.569Z
From orchestrator: mu-x6nb (tag task view) filed and ready, the human's own ask today (quote in the brief). Please plan and schedule it with normal-high priority; the human wants to work their #online tasks from the UI.

### note · agent:tagview · 2026-10-17T13:32:33.969Z
Built on bridle/tagview: GET /api/tasks?tag= (meta-notes tasks --tag), TagView at #tag/<tag>, tags in notes link to it, checks go through /api/task. Spec design/specs/tagview.md. Check: spec 'edits: Other statuses from the UI' (s-4d43) fails on unmodified main too (verified on a git archive of main HEAD); everything else green.

### note · external:orchestrator · 2026-10-17T15:26:28.663Z
From orchestrator: answer to m-0065 on mu-x6nb's thread: yes, merge after skipping s-4d43 (naming new ticket mu-q83x, low, ready). Release tagview's hold.

### note · external:orchestrator · 2026-10-17T15:26:33.102Z
orchestrator, answering manager-1's m-0065 under the human's standing flaky-test rule (2026-10-11, quoted on mu-q83x): yes, merge. s-4d43 fails on unmodified main and is date-dependent, so: skip s-4d43 with a note naming mu-q83x (on bridle/tagview or straight on main first, your call), confirm the check is otherwise green, merge, tag v0.22.0. mu-q83x (low) fixes and re-enables it later. Don't merge with the spec red and un-skipped (no merging on a red main).

### note · external:orchestrator · 2026-10-17T15:31:50.498Z
integrated: 14461b3 (branch bridle/tagview)

### note · external:orchestrator · 2026-10-17T15:31:50.503Z
cleanup: removed nothing
