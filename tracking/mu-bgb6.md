+++
id = "mu-bgb6"
title = "Build fails on macOS: client files differ only by case (timelog.ts / TimeLog.tsx and two more)"
kind = "bug"
state = "open"
created_at = "2026-11-09T14:48:28.434Z"
updated_at = "2026-11-09T14:54:12.002474420Z"
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

### note · external:orchestrator · 2026-11-09T14:54:12.002Z
Revised plan (orchestrator), replaces the impact list in my earlier note, after the human's scope change quoted above (aide m-0230). No behaviour change.
Model: Haiku (mechanical; about ten source files plus tests).
Standard: PascalCase.tsx for React components, kebab-case.ts for everything else.
Renames, with git mv so history follows, and their .test.ts partners where they exist: duetasks -> due-tasks, lastpage -> last-page, pushroutes -> push-routes, tagtasks -> tag-tasks, tagview -> tag-view, taskspage -> tasks-page, taskstatus -> task-status, timelog -> time-log, treepane -> tree-pane, menu -> menu-items (single-word kebab would still collide with Menu.tsx). This list is from git ls-files on 373d7fb across client/src, server and shared; if you spot another run-together name, rename it too. Real single words stay (backlinks, neighbours, scheduler, watcher, fixture). client/src/main.tsx stays: it is the entry point, not a component; the rule should say so.
Impact list: those files and everything importing them in client/src, server, shared and tests; any path mentions in docs, specs and scripts (grep the old names); a small script for the collision check; package.json (wire it into npm run check); a new rule file in .bridle/rules for the naming standard (with the human's quote as its Why); CHANGELOG; version bump per the versioning rule.
Verify: npm run check is green and includes the new check; temporarily adding a case-only pair makes that check fail (then remove it); no two tracked source paths match when lowercased and stripped of extension; build passes; no .ts file under those three directories has a run-together or capitalised name. Simulating case-insensitivity is enough; no Mac is available here, so say plainly that it was not built on macOS.
Deferred: nothing. Not renaming the .tsx components: they already follow the standard.
