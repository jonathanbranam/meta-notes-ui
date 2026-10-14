+++
id = "mu-9faf"
title = "Enable alerts shows and fails with a JSON error when the server has push off"
kind = "bug"
state = "planned"
created_at = "2026-10-13T23:09:40.767Z"
updated_at = "2026-10-14T01:56:11.207545704Z"
created_by = "external:aide"
watchers = ["external:aide"]
ticket = "9faf"
+++


From the human, in the aide session, 2026-10-13 ET, verbatim:

"the alerts button fails on desktop and mobile.

desktop chrome:

> Cannot enable alerts: Unexpected token '<', "<!doctype "... is not valid JSON"

## Cause (aide, checked)

The installed unit on vesta has no `--push-contact`, so push is off and `/api/push/*` is not registered (server/app.ts:226). `GET /api/push/key` falls through to the SPA fallback and returns index.html with 200. The client's availability check (client/src/push.ts:33) only tests `res.ok`, so it shows "Enable alerts"; the click then parses HTML as JSON (client/src/push.ts:40).

## The ask

With push off, no "Enable alerts" button (or a plain "alerts are off on the server" note), never a JSON parse error. Likely fix: unknown `/api/*` paths answer 404 JSON instead of index.html, and/or the check tests the content type. The human turning push on (`--push-contact`) is separate.

## Brief (orchestrator)

Goal: with push off on the server (no `--push-contact`), the UI never shows "Enable alerts" and never fails with a JSON parse error.

Fix, both parts:
1. Server: any unmatched `/api/*` path answers `404` with JSON (`{"error":"not found"}`), never the SPA's `index.html`. Register it after all API routes and before the SPA fallback in `server/app.ts`.
2. Client: `pushAvailable()` in `client/src/push.ts` returns true only for a 2xx JSON response with a `key`. `enablePush()` reads the key through the same check and returns a plain message ("Alerts are off on the server") instead of throwing on HTML.

Files: `server/app.ts`, `client/src/push.ts`, their tests, and the spec for push if it states the push-off behaviour (docs/design/web-push). Patch version bump per the project's versioning rule.

Verify: a server test that `GET /api/push/key` and `GET /api/nonexistent` return 404 JSON with push off; a client test that `pushAvailable()` is false on a 404 or an HTML 200. `npm run check` green once.

Model: Haiku (small, mechanical).

Out of scope: the top-right menu (mu-nehy, not approved yet); turning push on (the human's `--push-contact`).

## Thread

### note · external:aide · 2026-10-13T23:10:09.844Z
From the human, 2026-10-13 ET, verbatim: "PWA: Cannot enable alerts: The string did not match the expected pattern." Same cause: that is Safari/iOS wording for Response.json() failing on HTML. Checked 19:1x ET: unit still has no --push-contact; /api/push/key answers 200 text/html.
