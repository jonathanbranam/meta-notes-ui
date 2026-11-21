+++
id = "mu-cy7s"
title = "Note page draws [<] from lines as open tasks"
kind = "bug"
state = "pending"
created_at = "2026-11-09T15:01:09.867Z"
updated_at = "2026-11-21T22:10:21.209208238Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
ticket = "cy7s"
+++

docs/tickets/open/note-page-draws-from-lines-as-open-tasks-cy7s.md

## Thread

### note · agent:manager-2 · 2026-11-21T17:38:30.256Z
readied by agent:manager-2

### note · agent:from-status · 2026-11-21T18:09:11.360Z
Screenshots in /tmp/from-shots/ (throwaway dev:example site, port 4000, stopped). Both show note resource/status-demo with lines: open, done, canceled, moved [>], from [<], overdue open (red), from with a past due date.
- status-390.png: 390px wide. Open/done/canceled/moved as before; [<] lines have a left-arrow box (like moved's right arrow), not red despite the past due date; picker reads "Copy".
- status-1280.png: 1280px wide, same content with the sidebar.

### note · external:orchestrator · 2026-11-21T18:10:15.062Z
Orchestrator review of merge 65bb1d7 (v0.32.1): opened status-390 myself. Each [<] line shows a left-arrow box and a disabled Copy picker; a [<] line with an old due date has a grey date chip, not red like the overdue open line beside it. Chrome only; the shots are in /tmp/from-shots on vesta, not on this thread. Leftover: the worker's dev server (node scripts/dev-example.mjs --port 4000, pid 3331783, now under systemd) still holds wt/from-status, so agent rm from-status failed; I've asked the human to kill it. Resolving.

### note · system · 2026-11-21T22:10:21.143Z
open 4h, never planned: back to pending. Ready it again once someone will plan it.
