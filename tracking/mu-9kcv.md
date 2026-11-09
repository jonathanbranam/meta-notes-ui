+++
id = "mu-9kcv"
title = "Menu option to override light/dark: system, light, dark"
kind = "feature"
state = "integrated"
created_at = "2026-11-09T17:22:20.984Z"
updated_at = "2026-11-09T18:02:08.020939703Z"
created_by = "external:aide"
watchers = ["external:aide"]
branch = "bridle/theme"
commit = "2bdf7a4"
summary = "v0.31.0 (2bdf7a4). Menu Theme item cycles System, Light, Dark; stored per browser in localStorage (mn-theme). client/src/theme.ts resolves the setting and sets data-theme on the root; index.html does the same before first paint. Dark CSS blocks in style.css now key on :root[data-theme=dark] instead of the media query, so explicit Light wins on a dark system and System follows later OS changes. Worker check: 259 specs passed + 1 skipped (s-4d43), build ok. Check screenshots: /tmp/theme/shots/{week,note}-sys{dark,light}-{System,Light,Dark}.png, recorded on the thread; week data was mocked. Orchestrator read week-sysdark-Light, week-syslight-Dark and note-sysdark-System and confirmed the System images match the explicit ones byte for byte for the week page. Not tested on a real phone. Seen, not changed: tag links are dim purple on dark."
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

### note · external:orchestrator · 2026-11-09T17:43:01.607Z
Orchestrator: required before merge, per aide's note (m-0262): the Check's screenshots show the rendered week grid (not 'Loading...'), with their paths recorded on this thread. mu-2fmn, which runs first, fixes the wait in scripts/shots.mjs.

### note · agent:theme · 2026-11-09T17:59:49.353Z
Screenshots (mu-9kcv, commit 948eedf): /tmp/theme/shots/{page,week}-sys{dark,light}-{System,Light,Dark}.png, 1400px wide. Week grid rendered with mock data (boxes shown). Looked at: week sysdark Light/System/Dark, page sysdark Dark. Reload kept the choice in all six cases (data-theme and body colour read after reload); explicit Light on dark system gave a light page. NOT checked: the 'page' images show 'Loading...' under the open Menu (taken before the note loaded; a retake was blocked by the sandbox), so a normal note page is unseen in all settings; I did not view every image; no real phone.

### note · agent:theme · 2026-11-09T18:00:58.570Z
Loaded README note screenshots (heading and body visible, all six viewed by eye): /tmp/theme/shots/note-sys{dark,light}-{System,Light,Dark}.png. Each taken after setting Theme via the Menu and reloading; data-theme after reload: dark System=dark, dark Light=light, dark Dark=dark, light System=light, light Light=light, light Dark=dark. Looks right in each. Seen, not changed: tag links (#next, #later) are a dim purple on dark (not part of this ticket). The earlier page-* images are superseded.

### note · external:orchestrator · 2026-11-09T18:02:06.943Z
integrated: 2bdf7a4 (branch bridle/theme)

### note · external:orchestrator · 2026-11-09T18:02:07.591Z
cleanup: removed agent theme, branch bridle/theme
