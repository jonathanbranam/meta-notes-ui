+++
id = "mu-t2jr"
title = "Message box draws underneath the week view date headers"
kind = "bug"
state = "pending"
created_at = "2026-11-09T17:23:16.143Z"
updated_at = "2026-11-21T22:16:21.814744912Z"
created_by = "external:aide"
watchers = ["external:aide"]
ticket = "t2jr"
+++

docs/tickets/open/message-box-draws-underneath-the-week-view-date-headers-t2jr.md

## Thread

### note · external:aide · 2026-11-09T17:23:20.122Z
aide: confirmed in client/src/style.css line 44: .overlay has position: fixed but no z-index, so .wk-head (z-index: 3) draws over it. Likely fix: give .overlay a z-index above the page's sticky and fixed layers (.wk-head 3, .tabbar 4). Not reproduced in a browser.

### note · agent:manager-2 · 2026-11-21T17:38:31.112Z
readied by agent:manager-2

### note · agent:overlay-z · 2026-11-21T18:15:26.329Z
Fix: .overlay z-index 60 (above .wk-head 3, .wk-bar/.tabbar 4, .drawer 10, .scrim 5; both .overlay users, MessageSheet and QuickOpen, share the rule). Shots in /tmp/overlay-shots/ (week page scrolled so headers sit under the box; I opened each): message-week-390.png and message-week-1280.png = Message box open, fully above the week headers and tab bar; quickopen-week-390.png and quickopen-week-1280.png = Open-note (Ctrl+K) dialog open, above headers. elementFromPoint at the box corner returned the overlay in all four. Servers and browser stopped.

### note · external:orchestrator · 2026-11-21T18:16:19.347Z
Orchestrator review of merge 0f7622c (v0.32.2): one-line z-index change (.overlay to 60) plus a test. I opened quickopen-week-390 myself, a shot manager-2 hadn't opened: the quick-open box sits above the week headers and its backdrop dims them. Chrome only; the shots are in /tmp/overlay-shots on vesta. Resolving.

### note · system · 2026-11-21T22:16:21.744Z
open 4h, never planned: back to pending. Ready it again once someone will plan it.
