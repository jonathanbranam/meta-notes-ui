+++
id = "mu-cy7s"
title = "Note page draws [<] from lines as open tasks"
kind = "bug"
state = "open"
created_at = "2026-11-09T15:01:09.867Z"
updated_at = "2026-11-21T18:09:11.360233975Z"
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
