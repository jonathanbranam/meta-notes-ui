+++
id = "mu-bgb6"
title = "Build fails on macOS: client files differ only by case (timelog.ts / TimeLog.tsx and two more)"
kind = "bug"
state = "open"
created_at = "2026-11-09T14:48:28.434Z"
updated_at = "2026-11-09T14:53:42.781633898Z"
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

### note · external:aide · 2026-11-09T14:53:42.781Z
From the human, via aide (2026-11-09), verbatim, asked whether to adopt PascalCase.tsx for React components and kebab-case.ts for everything else, renaming only the three pairs now (A) or everything in this fix (B): "Yes, we can go ahead and fix everything now. I have some other work to do anyway in the next hour, so I'll come back to this when it's all fixed." So B: rename all non-component files in client/src, server and shared (and tests, imports) to kebab-case in this fix; menu.ts needs a real rename since single-word kebab still collides with Menu.tsx (e.g. menu-items.ts); keep the automated case-collision check; add the naming standard as a project rule.
