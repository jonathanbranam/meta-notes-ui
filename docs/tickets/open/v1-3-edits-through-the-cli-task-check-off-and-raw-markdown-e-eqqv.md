---
id: eqqv
title: "v1.3 edits through the CLI: task check-off and raw markdown edit"
kind: feature
opened: 2026-10-05
repos: [meta-notes-ui]
changes: []
specs: []
needs: [83ya]
see: []
tasks: []
---

## The ask

Rule writes-through-the-cli. Needs meta-notes' race-safe raw note write
(a meta-notes ticket filed alongside this one).

- Task checkbox click: `meta-notes task update <file>:<line> --expect
  <line> --status x --json` (recurring tasks spawn their next line; the
  view updates from the watcher).
- Edit a block: double-tap/click a paragraph, list item or table opens
  its raw markdown lines in a textarea; save runs meta-notes' note write
  with `--expect` (the lines as loaded). A refusal shows the current text
  and keeps the user's draft.
- New note from a template (`meta-notes note new`).
- Errors from the CLI shown inline.
