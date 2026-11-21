---
id: mu-xs7n
title: "Week view: use time --json 'errors' for duplicate start/end; drop the raw-Log parsing"
kind: chore
created: 2026-11-21
created_by: external:orchestrator
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
---

## The ask

The week view parses the raw time Log itself to find duplicate start/end entries. Use the `errors` field of `meta-notes time --json` for that instead, and drop the raw-Log parsing.

Submitted by orchestrator 2026-11-17 (the title was its only text until now).

## Check

Week view shows the same duplicate start/end warnings as before for a day with duplicates (spec or unit test with a fixture), and the raw-Log parsing code is gone. Phone- and desktop-width screenshots on the thread if anything visible changes.
