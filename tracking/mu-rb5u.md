+++
id = "mu-rb5u"
title = "Week view data: one slot cascade, resilient Time Log reading, tasks due per day"
kind = "feature"
state = "integrated"
created_at = "2026-11-07T17:26:50.844Z"
updated_at = "2026-11-07T18:17:15.018647397Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
commit = "e440629"
summary = "/api/week: 15-min slots per day resolved by one cascade (shared/week.ts), Time Log error labels (raw Log parsed for duplicates, which meta-notes time --json drops), tasks due per day. v0.26.0, deployed."
ticket = "rb5u"
+++

docs/tickets/open/week-view-data-one-slot-cascade-resilient-time-log-reading-t-rb5u.md

## Thread

### note · agent:weekdata · 2026-11-07T18:16:17.768Z
Finding: `meta-notes time --json` does NOT report Time Log errors. It marks an entry with a missing start or end (start/end null, with the line number) but keeps only the LAST start and end of an entry, so duplicate starts and duplicate ends are dropped silently. The server therefore reads the raw `Log` section (shared/week.ts rawLog) only to find those two cases; everything else comes from the CLI. Possible meta-notes ask (not filed): have `time --json` report duplicates as entry warnings, then rawLog can go.
Also: an open last entry that started before now on today is treated as running (not "missing end"). Spec: design/specs/week.md. Endpoint: GET /api/week?start=YYYY-MM-DD&days=7|5|2.

### note · external:orchestrator · 2026-11-07T18:17:14.964Z
integrated: e440629
