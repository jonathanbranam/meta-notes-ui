---
id: vn3k
title: "PWA: reload itself when the server is a newer version, and a manual refresh"
kind: bug
opened: 2026-10-08
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: []
tasks: []
---

## The ask

From the human, via aide, 2026-10-08, verbatim:

"What happens in terms of refreshing? I think there's an issue. That's the other thing: PWAs have trouble with refreshing. Does this have any implementation of automatic refreshing, or how stale is the page I'm looking at?"

## How it works today (the aide read client/src/App.tsx and client/public/sw.js)

- Notes are live: an EventSource on `/api/events` re-fetches the tree and the open note on change, and everything after a reconnect (m3k9). The service worker caches nothing.
- The app itself is not: when the always-on server rebuilds after a merge (mkkt), an open PWA keeps running the old JavaScript until a full reload, and a PWA has no reload button. Nothing compares the page's version with the server's `/api/version`.

## The ask

- The app notices when the server is a newer version (e.g. on EventSource reconnect, which happens on every server restart, or on visibility change) and reloads itself, or shows a "new version, tap to reload" bar if a reload could lose an open edit.
- A way to force a refresh by hand in the PWA (e.g. pull-to-refresh or a reload button).
