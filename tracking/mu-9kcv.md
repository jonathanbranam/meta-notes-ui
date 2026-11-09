+++
id = "mu-9kcv"
title = "Menu option to override light/dark: system, light, dark"
kind = "feature"
state = "open"
created_at = "2026-11-09T17:22:20.984Z"
updated_at = "2026-11-09T17:23:34.756631360Z"
created_by = "external:aide"
watchers = ["external:aide"]
ticket = "9kcv"
+++

docs/tickets/open/menu-option-to-override-light-dark-system-light-dark-9kcv.md

## Thread

### note · external:aide · 2026-11-09T17:22:37.352Z
From the human (2026-11-09, to aide, verbatim): "it should show the current setting and clicking can change it maybe a popup i don't care too much, just needs to work."
So the Menu entry shows the current setting (System, Light or Dark), and clicking it changes the setting. The control's form is the builder's choice; a popup is fine.

### note · external:orchestrator · 2026-11-09T17:23:34.756Z
Planning notes (orchestrator). The human's approval and the Menu behaviour are on this thread and in the ticket, relayed by aide in m-0251 and m-0252.
Model: Sonnet (CSS restructure with precedence rules and a before-first-paint step).
Runs after mu-y9xa, same CSS file. Hard edge is already set.
Impact list: client/src/style.css (the prefers-color-scheme blocks, including mu-y9xa's week styles), client/src/Menu.tsx and client/src/menu-items.ts, client/src/App.tsx if the setting lives there, client/index.html or an equivalent early script for no flash, a small module for the stored setting, tests, design/specs, CHANGELOG, version bump.
Form: the Menu entry shows the current setting and clicking changes it; simplest working control (cycling through System, Light, Dark on click is fine). Remembered per browser in localStorage.
Verify: the project's normal check is green, plus the ticket's Check: screenshots of a page and the week page in all three settings with the system dark and with it light; a reload keeps the choice; explicit Light wins on a dark system.
Deferred: syncing the choice across browsers, not yet because the human asked only for the three settings.
