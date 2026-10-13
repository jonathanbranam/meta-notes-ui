---
id: mu-9faf
title: Enable alerts shows and fails with a JSON error when the server has push off
kind: bug
created: 2026-10-13
created_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
---

From the human, in the aide session, 2026-10-13 ET, verbatim:

"the alerts button fails on desktop and mobile.

desktop chrome:

> Cannot enable alerts: Unexpected token '<', "<!doctype "... is not valid JSON"

## Cause (aide, checked)

The installed unit on vesta has no `--push-contact`, so push is off and `/api/push/*` is not registered (server/app.ts:226). `GET /api/push/key` falls through to the SPA fallback and returns index.html with 200. The client's availability check (client/src/push.ts:33) only tests `res.ok`, so it shows "Enable alerts"; the click then parses HTML as JSON (client/src/push.ts:40).

## The ask

With push off, no "Enable alerts" button (or a plain "alerts are off on the server" note), never a JSON parse error. Likely fix: unknown `/api/*` paths answer 404 JSON instead of index.html, and/or the check tests the content type. The human turning push on (`--push-contact`) is separate.
