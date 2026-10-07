+++
id = "mu-abe5"
title = "Add a task to a note from the UI"
kind = "feature"
state = "open"
created_at = "2026-10-07T23:27:22.765Z"
updated_at = "2026-10-07T23:27:29.309395652Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
size = "S"
+++

original id: gr8c

Add a task to a note from the UI (gr8c part 2 of 4).

Goal: the human can add a task to the open note (and from the Today view, to today's daily note) through `meta-notes task add <path> '<text>' [--due ...]`, scenario s-4f99. A text field plus an optional due date is enough; no recurrence or --under UI yet. Read `meta-notes task add --help` for where it puts the line and what it needs.

Model: Sonnet. Size: s.

Common to all gr8c tasks (ticket docs/tickets/open/edits-beyond-v1-task-statuses-add-task-time-block-and-log-mo-gr8c.md; approved, the human via aide 2026-10-07: "gr8c yes"):
- Every write is a `meta-notes ... --json` command with `--expect` (rule writes-through-the-cli), run through `runMetaNotes` in server/edits.ts; a stale write is a 409 with the current text, shown beside the kept draft (r-3e6d), CLI errors inline (r-3c48). Reuse the existing conflict and error handling; don't build a second one.
- Spec: design/specs/edits.md. Turn this task's non-executable scenario into executable ones (steps in specs/steps/edits.ts, against the real CLI on a temp copy of examples/notes) for the server side; UI-only scenarios stay non-executable.
- Files likely touched: server/edits.ts, shared/types.ts, client/src/App.tsx (and TodayView.tsx where the Today view shows the thing), client/src/style.css, design/specs/edits.md, specs/steps/edits.ts, examples/notes only if a fixture is missing. The gr8c tasks share these files, so they run one after another.
- Must work on a phone (touch targets, no hover-only controls).
- Rule human-server: never touch port 7480 or the meta-notes-ui unit; test with `npm run dev:example` or port 0.
- Verify: `npm run check` green once.
- Out of scope: move, rename, archive and whole-note edit (later, per the ticket).
