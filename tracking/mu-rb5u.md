+++
id = "mu-rb5u"
title = "Week view data: one slot cascade, resilient Time Log reading, tasks due per day"
kind = "feature"
state = "planned"
created_at = "2026-11-07T17:26:50.844Z"
updated_at = "2026-11-07T18:16:17.768557804Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
ticket = "rb5u"
+++

docs/tickets/open/week-view-data-one-slot-cascade-resilient-time-log-reading-t-rb5u.md

## Thread

### note · agent:weekdata · 2026-11-07T18:16:17.768Z
Finding: `meta-notes time --json` does NOT report Time Log errors. It marks an entry with a missing start or end (start/end null, with the line number) but keeps only the LAST start and end of an entry, so duplicate starts and duplicate ends are dropped silently. The server therefore reads the raw `Log` section (shared/week.ts rawLog) only to find those two cases; everything else comes from the CLI. Possible meta-notes ask (not filed): have `time --json` report duplicates as entry warnings, then rawLog can go.
Also: an open last entry that started before now on today is treated as running (not "missing end"). Spec: design/specs/week.md. Endpoint: GET /api/week?start=YYYY-MM-DD&days=7|5|2.
