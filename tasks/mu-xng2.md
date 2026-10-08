+++
id = "mu-xng2"
title = "Append to and edit the Time Log from the UI"
kind = "feature"
state = "planned"
created_at = "2026-10-07T23:27:23.013Z"
updated_at = "2026-10-08T01:51:44.162358662Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
size = "M"
+++

original id: gr8c

Append to and edit the Time Log from the UI (gr8c part 4 of 4).

Goal: in the Today view and the daily note, the human can add a Time Log entry (`meta-notes time-log append <path> --text '- <what>' --start <HH:MM> [--prev ... --close-prev]`) and edit an entry (`time-log update --expect ... --text ...`). Scenario s-6f86, Time Log half. "Start now" should be one tap with the current time filled in, closing the previous open entry; tilde times (~HH:MM) are accepted by the CLI. Read `meta-notes time-log append --help`. Known CLI snag (meta-notes orchestrator, unconfirmed): a fresh daily note's placeholder Log entry (`- start work:` / `HH:MM`) may make `append` refuse both with and without `--first`; if you hit it, report it on this task with the exact command and error, don't work around it in the UI.

This is what the trip timer (ticket ma6v) will build on, so keep the append call a small reusable client function.

Model: Sonnet. Size: m.

Common to all gr8c tasks (ticket docs/tickets/open/edits-beyond-v1-task-statuses-add-task-time-block-and-log-mo-gr8c.md; approved, the human via aide 2026-10-07: "gr8c yes"):
- Every write is a `meta-notes ... --json` command with `--expect` (rule writes-through-the-cli), run through `runMetaNotes` in server/edits.ts; a stale write is a 409 with the current text, shown beside the kept draft (r-3e6d), CLI errors inline (r-3c48). Reuse the existing conflict and error handling; don't build a second one.
- Spec: design/specs/edits.md. Turn this task's non-executable scenario into executable ones (steps in specs/steps/edits.ts, against the real CLI on a temp copy of examples/notes) for the server side; UI-only scenarios stay non-executable.
- Files likely touched: server/edits.ts, shared/types.ts, client/src/App.tsx (and TodayView.tsx where the Today view shows the thing), client/src/style.css, design/specs/edits.md, specs/steps/edits.ts, examples/notes only if a fixture is missing. The gr8c tasks share these files, so they run one after another.
- Must work on a phone (touch targets, no hover-only controls).
- Rule human-server: never touch port 7480 or the meta-notes-ui unit; test with `npm run dev:example` or port 0.
- Verify: `npm run check` green once.
- Out of scope: move, rename, archive and whole-note edit (later, per the ticket).

## Thread

### note · agent:timelog · 2026-10-08T01:51:44.162Z
Done e1f49d3 (v0.11.0). Routes POST /api/timelog/append and /update; TimeLogPanel (Start now, per-entry Edit) in Today view and any note with ### Log; appendTimeLog() in client/src/timelog.ts is the reusable call. CLI notes: (1) no placeholder snag seen on the fixture note; append with --prev/--close-prev and --first-on-nonempty (409 with current) work. (2) time-log update rejects an empty '* end:' line in --text ('invalid end'), though --expect must include it; the UI drops an empty end line from the replacement (dropEmptyEnd). Suggest meta-notes accept an empty end in update. Check: typecheck, 27 unit tests, 126 spec tests, build green.
