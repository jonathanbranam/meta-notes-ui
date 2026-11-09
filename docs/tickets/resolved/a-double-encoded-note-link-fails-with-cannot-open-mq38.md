---
id: mu-mq38
title: A double-encoded note link fails with Cannot open
kind: fix
created: 2026-11-08
created_by: external:orchestrator
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
resolved: 2026-11-09T00:24:02Z
---

## The ask

The human, 2026-11-08 6:56 PM (via aide, m-0217, verbatim): "The link opens authorized but doesn't resolve: Cannot open area/family/gifts/Christmas%202026.md". Aide relayed: "Please file it."

## Problem
The link clicked was `https://vesta.tailbc91f5.ts.net/#area/family/gifts/Christmas%202026.md#Zeal`. The UI said `Cannot open area/family/gifts/Christmas%202026.md`.

client/src/App.tsx decodes the hash once with decodeURIComponent (lines 287 and 425), then parseHash splits off the heading at the first `#`, so the heading is not the cause. A literal `%20` left after one decode means the hash arrived double-encoded (`%2520`): something re-encoded the URL on the way in. Not reproduced in a browser, and the app the click came from is not known. Links in other apps cannot be fixed from here, so the UI has to tolerate them.

## Ask
When a note fails to load and its path still contains percent escapes, decode the path once more and try that. If that note loads, show it (with the heading) and put the corrected address in the hash. If it does not, show the error for the original path.

## Design
- Fall back only after a failed load (the `Cannot open` path, client/src/App.tsx around line 382).
- Rejected: decoding until stable on every link. A note whose real name contains something like `%20` would then open the wrong note or fail. The first decode stays authoritative.
- A path that fails to decode (a stray `%`) is treated as not found, as today, and must not throw.

## Files likely
client/src/App.tsx, a small pure helper with a unit test, a design/specs scenario.

## Check
The repo's check (`npm run check`) green. Unit tests: `Christmas%202026.md` gives `Christmas 2026.md`; a path with a stray `%` gives no retry. Browser check on a throwaway server with the example root: a `%2520` link with a `#heading` opens the note at the heading and the address is corrected; a real note opens as before.

## Model
Haiku (small client change with clear tests).

## Not in this ticket
Finding which app re-encoded the URL.
