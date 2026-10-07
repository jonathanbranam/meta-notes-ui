+++
id = "mu-rkrz"
title = "Edit the Time Block from the UI"
kind = "feature"
state = "planned"
created_at = "2026-10-07T23:27:22.889Z"
updated_at = "2026-10-07T23:38:46.061892092Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
size = "M"
+++

original id: gr8c

Edit the Time Block from the UI (gr8c part 3 of 4).

Goal: in the Today view and the daily note, the human can edit a Time Block row's Plan or Actual cell through `meta-notes time-block update <path> --time <t> --plan|--actual <text>` (with `--create` where the CLI needs it) and replace a range of rows through `time-block replace ... --expect`. Scenario s-6f86, Time Block half. Tapping a cell opens it for editing; saving runs the command. Read `meta-notes time-block --help` and the shipped daily template for the table shape.

Model: Sonnet. Size: m.

Common to all gr8c tasks (ticket docs/tickets/open/edits-beyond-v1-task-statuses-add-task-time-block-and-log-mo-gr8c.md; approved, the human via aide 2026-10-07: "gr8c yes"):
- Every write is a `meta-notes ... --json` command with `--expect` (rule writes-through-the-cli), run through `runMetaNotes` in server/edits.ts; a stale write is a 409 with the current text, shown beside the kept draft (r-3e6d), CLI errors inline (r-3c48). Reuse the existing conflict and error handling; don't build a second one.
- Spec: design/specs/edits.md. Turn this task's non-executable scenario into executable ones (steps in specs/steps/edits.ts, against the real CLI on a temp copy of examples/notes) for the server side; UI-only scenarios stay non-executable.
- Files likely touched: server/edits.ts, shared/types.ts, client/src/App.tsx (and TodayView.tsx where the Today view shows the thing), client/src/style.css, design/specs/edits.md, specs/steps/edits.ts, examples/notes only if a fixture is missing. The gr8c tasks share these files, so they run one after another.
- Must work on a phone (touch targets, no hover-only controls).
- Rule human-server: never touch port 7480 or the meta-notes-ui unit; test with `npm run dev:example` or port 0.
- Verify: `npm run check` green once.
- Out of scope: move, rename, archive and whole-note edit (later, per the ticket).
