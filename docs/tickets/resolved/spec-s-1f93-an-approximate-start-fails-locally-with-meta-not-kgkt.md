---
id: mu-kgkt
title: Spec s-1f93 (An approximate start) fails locally with meta-notes 2.33.4
kind: bug
created: 2026-11-01
created_by: external:orchestrator
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
resolved: 2026-11-01T16:55:21Z
---

## The ask

Spec s-1f93 ('An approximate start') fails in the local check: the time-log append with start ~09:15 returns 400 from the installed meta-notes 2.33.4 (seen by worker recur on mu-wsuq, 2026-11-01). GitHub CI is green on main a826175 (run 41310371091), and the spec passed two weeks ago with an older meta-notes, so the likely cause is meta-notes changing how it accepts ~HH:MM starts, not meta-notes-ui main. Unproven.

Find out which side is wrong: run `npx vitest run specs.test.ts -t 'An approximate start'` on a clean main checkout and note `meta-notes --version`. If it fails, decide whether the UI's time-log call or meta-notes' parsing should change, and fix it (or file the fix in meta-notes). Why it matters: every meta-notes-ui worker's local check is red until this is settled.

Model: Sonnet. Out of scope: mu-wsuq.

Reported by orchestrator, from manager-1 (m-0150) and recur's thread note on mu-wsuq.
