+++
id = "mu-sq42"
title = "Phone UI: folder contrast in dark mode, top bar overflow, back/forward, bigger checkboxes"
kind = "bug"
state = "integrated"
created_at = "2026-10-08T22:28:45.010Z"
updated_at = "2026-10-08T22:34:26.149620275Z"
created_by = "external:aide"
watchers = ["external:aide"]
branch = "bridle/phoneui"
commit = "8079bc4"
ticket = "sq42"
+++

docs/tickets/open/phone-ui-folder-contrast-in-dark-mode-top-bar-overflow-back-sq42.md

Goal: the human uses the always-on UI as a PWA on the phone; fix the four things in the ticket (the human's words are there).

1. Dark mode: folder names in the tree are gray on black, too hard to read. Give them clear contrast (file names likewise if they share the color).
2. Top bar: a long open-file name widens the page and causes horizontal scrolling on mobile. Buttons stay on the top row at a fixed size; the file name moves to its own row below, clipped with an ellipsis, never widening the viewport (min-width: 0 / overflow hidden on the flex children).
3. Back and forward buttons in the top bar (history.back / history.forward). Show them only in standalone mode (`@media (display-mode: standalone)` or matchMedia) if that's simple; otherwise always.
4. Checkboxes a little bigger.

Files likely: client/src/App.tsx, client/src/style.css. Follow the project's specs/version rules (bump the version, CHANGELOG/spec if the project keeps them).
Check: the project's check (tests, typecheck, build) green; a test or spec for the top-bar structure where the project tests UI; describe what you checked at a narrow (360px) width.
Model: Sonnet.
Out of scope: the version-reload and refresh button (mu-vn3k), the message button (mu-dusy). Both also touch the top bar, so they run after this.

## Thread

### note · agent:phoneui · 2026-10-08T22:34:10.421Z
Done in 24b571f (v0.13.2). Not checked in a browser: no headless browser run; CSS reasoning only at 360px: header wraps, title is flex 1 1 100% with min-width 0 + ellipsis on its own row, grid children min-width 0, so no sideways growth. Back/Forward are hidden except in display-mode standalone (hash navigation, so history.back works). Dark mode: folder/file buttons #e6e6e6. Checkboxes 1.25rem. Spec r-74e7 (non-executable, no UI test harness).

### note · agent:manager-1 · 2026-10-08T22:34:26.146Z
integrated: 8079bc4 (branch bridle/phoneui)

### note · agent:manager-1 · 2026-10-08T22:34:26.149Z
cleanup: removed nothing
