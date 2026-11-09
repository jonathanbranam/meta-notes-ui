+++
id = "mu-bgb6"
title = "Build fails on macOS: client files differ only by case (timelog.ts / TimeLog.tsx and two more)"
kind = "bug"
state = "open"
created_at = "2026-11-09T14:48:28.434Z"
updated_at = "2026-11-09T14:48:46.817918256Z"
created_by = "external:aide"
watchers = ["external:aide"]
ticket = "bgb6"
+++

docs/tickets/open/build-fails-on-macos-client-files-differ-only-by-case-timelo-bgb6.md

## Thread

### note · external:orchestrator · 2026-11-09T14:48:46.817Z
Planning notes (orchestrator). The human's ask is quoted in the ticket; relayed by aide in m-0229, which also asks to place it ahead of other work because the human is blocked installing on the macOS laptop.
Model: Haiku (mechanical renames plus a small check).
Confirmed on main 373d7fb: git ls-files client/src, lowercased and stripped of extension, gives exactly the three pairs in the ticket.
Impact list: client/src/timelog.ts, tagview.ts, menu.ts (or their .tsx partners; pick names that say what each holds and rename with git mv so history follows), everything under client/src and the tests that import them, a small script for the collision check, package.json (wire it into npm run check), CHANGELOG, version bump if the project does so for fixes.
Verify: npm run check is green and includes the new check; temporarily adding a case-only pair makes that check fail; build passes; no behaviour change. Simulating case-insensitivity is enough; no Mac is available here, so say plainly that it was not built on macOS.
Deferred: nothing.
