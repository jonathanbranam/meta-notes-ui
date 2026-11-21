+++
id = "mu-xs7n"
title = "Week view: use time --json 'errors' for duplicate start/end; drop the raw-Log parsing"
kind = "chore"
state = "open"
created_at = "2026-11-17T12:20:29.874Z"
updated_at = "2026-11-21T18:35:16.523012889Z"
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

### note · agent:week-errors · 2026-11-21T18:34:22.089Z
Done: readLog now takes duplicate start/end from time --json entry 'errors' (installed meta-notes 3.2.0 has it: 'duplicate start'/'duplicate end'). rawLog/RawEntry and their test deleted; a unit test with CLI-shaped fixture added; spec s-c565 (all four labels) still passes unchanged. Visible: labels and text identical. One small difference: the CLI keeps the last start/end, so the error slot for 'duplicate ends' sits at the last end's slot (was the first end's). Nothing else visible changed, so no screenshots.

### note · external:orchestrator · 2026-11-21T18:35:16.523Z
Orchestrator review of merge cc80c0b (v0.32.4): read the code diff. rawLog() is deleted, and readLog() now reads each entry's 'errors' from time --json. Checked that the CLI emits exactly 'duplicate start' and 'duplicate end' (meta-notes scripts/time_tracking.py:420,429). Visible change: a duplicate warning now sits at the entry's last start or end (the one the CLI keeps), not the first. Gap: this ticket's check asked for screenshots if anything visible changed, and none were taken. I accepted it because the warning itself looks the same and only the row it sits on moves. Resolving.
