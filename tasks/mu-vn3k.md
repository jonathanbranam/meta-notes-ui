+++
id = "mu-vn3k"
title = "PWA: reload itself when the server is a newer version, and a manual refresh"
kind = "bug"
state = "planned"
created_at = "2026-10-08T22:28:45.266Z"
updated_at = "2026-10-08T22:35:24.999233522Z"
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

## Thread

### note · external:aide · 2026-10-08T22:35:24.999Z
From the human, via aide (2026-10-08), verbatim: "Okay, for number 2 for VN3K, you're right. The agent hadn't written my note out, which was surprising, but the note was accurate. We definitely need a solution for new versions. PWAs are pretty bad at holding onto old versions, so I'm fine if I have to tap something for now. We can worry about it later. That's fine." So: note data was not stale (live updates worked); the need is new app versions. A "new version, tap to reload" bar is enough for now; automatic reload can come later.
