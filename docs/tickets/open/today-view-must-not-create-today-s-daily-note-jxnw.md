---
id: jxnw
title: Today view must not create today's daily note
kind: bug
opened: 2026-10-05
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [35z9]
tasks: [mu-jxnw]
---

## The ask

GET /api/today runs `meta-notes note daily`, which writes today's daily note when it doesn't exist. A read (opening the Today view on the phone at 6 AM) then creates the note in the human's notes root, before Vim or the daily-plan skill would, and without the template's {{% vim %}} blocks run.

Fix: run `meta-notes note daily --render --json` instead; it returns `path` and `exists` and writes nothing. Read the note only when `exists` is true; otherwise the view shows no Time Block (and may say there's no daily note yet). Add a test that /api/today on a root with no daily note leaves the root unchanged. Patch version bump.

Also in v0.4.0, consider: an alert for every planned 15-minute Time Block row may repeat when one plan spans several rows; alert only when the plan changes from the row before.
