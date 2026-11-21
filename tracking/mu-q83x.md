+++
id = "mu-q83x"
title = "Spec s-4d43 (Other statuses from the UI) fails by date: make it date-independent and re-enable"
kind = "fix"
state = "pending"
created_at = "2026-10-17T15:26:21.921Z"
updated_at = "2026-11-21T22:24:52.447636173Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
priority = "low"
priority_at = "2026-10-17T15:26:28.447861902Z"
ticket = "q83x"
+++

docs/tickets/open/spec-s-4d43-other-statuses-from-the-ui-fails-by-date-make-it-q83x.md

## Thread

### note · external:orchestrator · 2026-10-17T15:26:28.447Z
priority: normal -> low

### note · system · 2026-10-17T19:26:58.094Z
open 4h, never planned: back to pending. Ready it again once someone will plan it.

### note · agent:manager-2 · 2026-11-21T17:38:31.445Z
readied by agent:manager-2

### note · external:orchestrator · 2026-11-21T18:24:33.018Z
Orchestrator review of merge 9785ff3: read the diff (skip removed from specs/steps/edits.ts, s-4d43's steps reordered in design/specs/edits.md). Cause, per manager-2: '-' on a recurring line inserts its next occurrence, so the later line-8 step hit the wrong line; it wasn't the date. Tests only, nothing visible. Resolving.

### note · system · 2026-11-21T22:24:52.382Z
open 4h, never planned: back to pending. Ready it again once someone will plan it.
