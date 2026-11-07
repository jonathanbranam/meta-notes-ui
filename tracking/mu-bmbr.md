+++
id = "mu-bmbr"
title = "Top bar shows on the Now and Lists tabs; it belongs only on Home"
kind = "bug"
state = "planned"
created_at = "2026-11-07T19:46:12.975Z"
updated_at = "2026-11-07T20:03:09.829852547Z"
created_by = "external:aide"
watchers = ["external:aide"]
ticket = "bmbr"
+++

docs/tickets/open/top-bar-shows-on-the-now-and-lists-tabs-it-belongs-only-on-h-bmbr.md

## Thread

### note · agent:topbar · 2026-11-07T20:03:09.829Z
Done on bridle/topbar at a38d4e1 (v0.27.1).

Change: on a phone the top bar shows on Home only. Now and Lists hide it and put the Message button on the page (same sheet). Desktop unchanged.

Check (npm run check, exit 0): typecheck ok; vitest 22 files, 89 tests passed; specs 234 passed, 1 skipped (s-4d43, expected); build ok (vite, 311 modules; server tsc).

Browser (headless Chrome, 390 px, throwaway dev:example server, stopped):
- Home: top bar visible, Message in bar.
- Now: top bar hidden; Message on the page opens the sheet.
- Lists: top bar hidden; Message on the page opens the sheet.
- Lists back button: NOT clicked; the example root has no lists.

Note: on a phone Now and Lists, the Menu, Today, Week, prev/next and Log out (when logged in) are no longer on screen. Log out is the one to decide on.
