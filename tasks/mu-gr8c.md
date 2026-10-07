+++
id = "mu-gr8c"
title = "Task statuses from the UI: reopen, rescheduled, canceled, partial"
kind = "feature"
state = "planned"
created_at = "2026-10-07T23:26:53.796Z"
updated_at = "2026-10-07T23:42:47.083250530Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
size = "S"
+++

original id: gr8c

Task statuses from the UI (gr8c part 1 of 4).

Goal: the human can reopen a done task (click its box) and set rescheduled, canceled or partial on a task, through `meta-notes task update --status <s> --expect <line>`. Scenarios r-67eb s-8048 (reopen) and s-4d43 (other statuses). A small control per task (e.g. a long-press or a small menu next to the checkbox) offers the statuses; pick something simple and say what you chose. Check `meta-notes conventions` for the status characters and which statuses the CLI accepts.

Model: Sonnet (small, but UI plus spec steps). Size: s.

Common to all gr8c tasks (ticket docs/tickets/open/edits-beyond-v1-task-statuses-add-task-time-block-and-log-mo-gr8c.md; approved, the human via aide 2026-10-07: "gr8c yes"):
- Every write is a `meta-notes ... --json` command with `--expect` (rule writes-through-the-cli), run through `runMetaNotes` in server/edits.ts; a stale write is a 409 with the current text, shown beside the kept draft (r-3e6d), CLI errors inline (r-3c48). Reuse the existing conflict and error handling; don't build a second one.
- Spec: design/specs/edits.md. Turn this task's non-executable scenario into executable ones (steps in specs/steps/edits.ts, against the real CLI on a temp copy of examples/notes) for the server side; UI-only scenarios stay non-executable.
- Files likely touched: server/edits.ts, shared/types.ts, client/src/App.tsx (and TodayView.tsx where the Today view shows the thing), client/src/style.css, design/specs/edits.md, specs/steps/edits.ts, examples/notes only if a fixture is missing. The gr8c tasks share these files, so they run one after another.
- Must work on a phone (touch targets, no hover-only controls).
- Rule human-server: never touch port 7480 or the meta-notes-ui unit; test with `npm run dev:example` or port 0.
- Verify: `npm run check` green once.
- Out of scope: move, rename, archive and whole-note edit (later, per the ticket).

## Thread

### note · agent:statuses · 2026-10-07T23:42:47.083Z
done in ca849af: control = a native select beside each task (Open/Done/Rescheduled/Canceled/Partial; works by touch); the box click still toggles. Server unchanged (POST /api/task already took any status char). Spec: s-8048 and s-4d43 now executable, new non-executable s-2b5e. npm run check green: 22 + 110 tests (specs 110), spec check ok, build ok. v0.8.0, README updated, main already merged.
