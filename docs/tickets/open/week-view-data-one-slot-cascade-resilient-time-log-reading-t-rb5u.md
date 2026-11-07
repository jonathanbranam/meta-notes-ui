---
id: mu-rb5u
title: "Week view data: one slot cascade, resilient Time Log reading, tasks due per day"
kind: feature
created: 2026-11-07
created_by: external:orchestrator
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: [mu-adm2]
parent: mu-adm2
---

## The ask

From the human, via aide (m-0189), 2026-11-07, verbatim: "I approve the rest of it. Let's go ahead and start building this, and as I work on it and see how it works, I'll have further feedback." Design and every quote: epic mu-adm2 ("Agreed so far" and "Go-ahead"). This is the first of two children: the data and the one cascade; the grid page is the second.

## Goal

A server endpoint that returns a week (or 5 weekdays, or the 2-day weekend) as 15-minute slots per day, each slot already resolved by ONE cascade module, so the page only renders. The human: "the cascading order should be written once, defined once, and used everywhere."

## What to build

1. **The cascade, in one module** (pure function, unit-tested), per 15-minute slot:
   - Before now: Time Log (default, no badge) > Actual > Plan > Calendar > empty. Anything not from the Time Log is a fill-in and carries its source (A, P, Cal).
   - After now: Time Block Plan (default) > Calendar (marked as calendar) > empty.
   - A Time Log entry or Actual cell after now is an error of its own kind ("in the future").
2. **Resilient Time Log reading**: a day with two starts, a start without an end, or two ends still yields every good entry; the bad spots come back as error slots with a short label (missing start, missing end, duplicate starts, duplicate ends).
3. **Tasks due per day** in the range (for the collapsible list at the top of each column).
4. **Sources through the meta-notes CLI the server already uses**: `meta-notes time --json` (Time Log entries), the Time Block's Plan/Actual (however the Today view reads it now), `meta-notes calendar --json` (newest ICS export; none is fine), `meta-notes tasks`. If the CLI drops the bad Time Log lines instead of reporting them, say so on the ticket; parse the raw Log in the server only for the error spots, and file nothing else without asking.
5. Works on personal and work roots (the root's mode changes nothing here). Live: the week re-reads when a daily note in range changes (existing watcher).

## Acceptance

- Unit tests for the cascade covering every branch above, including future Time Log/Actual errors and each Time Log error label, with fixture daily notes.
- Endpoint test for a 7-day, a 5-day and a 2-day range.
- Repo check green once.

## Model

Sonnet.

## Out of scope (not yet)

The grid page (the second child). The week note's Goals/Plan (the human: "Let's say no for now."). Editing from the week view. Mobile layout.
