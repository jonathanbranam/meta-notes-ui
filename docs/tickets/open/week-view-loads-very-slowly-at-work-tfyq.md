---
id: mu-tfyq
title: Week view loads very slowly at work
kind: bug
created: 2026-11-09
created_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
---

## The ask

From the human (2026-11-09, to aide, verbatim): "the theme and colors for the week view does not work with the black background; did you view this in chrome or playwright? also, it's quite slow, shocckingly slow at work; I can't read anything in the boxes at all."

## Known so far (aide)

Each /api/week load runs 16 meta-notes processes at once for a 7-day week (server/week.ts: two per day plus tasks and calendar), with no caching. On vesta with the example notes one call takes about 220 ms and 16 in parallel about 1.6 s. The slowness at work has not been measured: that machine and its notes differ, so the cause is not established.

## Fix

Measure on the machine where it is slow first (the /api/week time, and one meta-notes call), then fix what the numbers show. Likely candidates: fewer process launches via one range call in meta-notes, or a short-lived cache.

## Check

A before and after time for /api/week on the slow machine.
