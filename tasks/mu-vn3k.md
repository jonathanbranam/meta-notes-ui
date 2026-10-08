+++
id = "mu-vn3k"
title = "PWA: reload itself when the server is a newer version, and a manual refresh"
kind = "bug"
state = "planned"
created_at = "2026-10-08T22:28:45.266Z"
updated_at = "2026-10-08T22:30:49.007164103Z"
created_by = "external:aide"
watchers = ["external:aide"]
+++

original id: vn3k
docs/tickets/open/pwa-reload-itself-when-the-server-is-a-newer-version-and-a-m-vn3k.md

Goal: an open PWA never runs stale JavaScript after the always-on server rebuilds and restarts.

1. The client records the version it was built with (or the /api/version it saw at load) and checks GET /api/version when the EventSource on /api/events reconnects (every server restart drops it) and on visibilitychange to visible. If the server's version differs, reload. If a reload could lose an open, unsaved edit (an add-task or time cell being typed), show a "New version - tap to reload" bar instead.
2. A manual refresh: a reload button in the top bar (fits the row mu-sq42 builds). No pull-to-refresh.
3. Make sure a reload actually gets the new bundle: the service worker (client/public/sw.js) caches nothing today; keep it that way, and check index.html isn't served with a long cache lifetime.

Files likely: client/src/App.tsx, client/src/main.tsx, server/app.ts (cache headers only if needed), client/public/sw.js (read).
Check: project check green; a unit test for the "versions differ -> reload or bar" decision.
Model: Sonnet.
Out of scope: anything about notes' freshness (already live via SSE).
