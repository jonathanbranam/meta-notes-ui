---
id: mu-cm7j
title: "Today view: mark due and overdue tasks done or canceled"
kind: fix
created: 2026-11-08
created_by: external:orchestrator
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
---

## The ask

The human, 2026-11-08 (via aide, m-0200, verbatim): "in the meta-notes-ui, i can't mark anything done in the \"Today\" view, so, that's really annoying". Aide relayed: "Please file and schedule".

## Ask
In the Today view's "Due and overdue" list (client/src/TodayView.tsx, the `duetasks` list), each task can be marked done and canceled.

## Design
- Make one shared task-row component (a checkbox to check off, plus a way to cancel; reuse the status choices mu-gr8c built for note pages if they fit) that calls the existing `POST /api/task` with `{path, line, expect, status}` (server/edits.ts), as TagView already does for its checkbox (client/src/TagView.tsx).
- Use it in TodayView's due list, and switch TagView to it, so there is one row, not three copies. The Tasks page ticket (filed next, blocked by this one) reuses it.
- After a change, the list refreshes (the live-update path already re-fetches /api/today when the note file changes; confirm it does).
- A refused edit (stale `expect`) shows an error, as on note pages.

## Files likely
client/src/TodayView.tsx, client/src/TagView.tsx, a new client/src/TaskRow.tsx (or similar), the specs for the today view and statuses, CSS.

## Check
`just check` (or the repo's check) green; a spec or unit test for checking off and canceling from Today; browser check at phone width (390px) and desktop on a throwaway server with the example root.

## Model
Haiku is enough (the pattern exists in TagView).

## Not in this ticket
The new Tasks page (separate ticket). Committing the notes after UI writes (aide observed; no ask yet).
