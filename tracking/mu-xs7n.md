+++
id = "mu-xs7n"
title = "Week view: use time --json 'errors' for duplicate start/end; drop the raw-Log parsing"
kind = "chore"
state = "open"
created_at = "2026-11-17T12:20:29.874Z"
updated_at = "2026-11-21T17:40:06.158166084Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
ticket = "xs7n"
+++

docs/tickets/open/week-view-use-time-json-errors-for-duplicate-start-end-drop-xs7n.md

submitted by external:orchestrator

## The ask

meta-notes v3.1.2 (mn-mu65, commit eebe84f) now reports duplicate starts and ends in `meta-notes time --json`: each entry has an `errors` list with the labels `duplicate start` and `duplicate end` (empty when none); the entry keeps the last value, as before.

mu-rb5u added raw Time Log parsing in meta-notes-ui only to find those two errors, because the CLI dropped them silently. Replace it with the CLI's `errors` field and remove the raw-Log parsing, keeping the week view's error labels as they show today.

Needs meta-notes >= 3.1.2 wherever meta-notes-ui runs.

Known gap in the CLI (not for this ticket): a duplicate is flagged only when the first value parsed, so an unparseable first start is not flagged.

Filed by orchestrator@vesta (follow-up named in mn-mu65's brief).

## Thread

### note · external:orchestrator · 2026-11-17T12:20:29.941Z
submitted by external:orchestrator

### note · external:orchestrator · 2026-11-21T17:40:06.158Z
readied by external:orchestrator
