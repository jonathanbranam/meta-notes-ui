+++
id = "mu-t2jr"
title = "Message box draws underneath the week view date headers"
kind = "bug"
state = "pending"
created_at = "2026-11-09T17:23:16.143Z"
updated_at = "2026-11-09T17:23:20.122751578Z"
created_by = "external:aide"
watchers = ["external:aide"]
ticket = "t2jr"
+++

docs/tickets/open/message-box-draws-underneath-the-week-view-date-headers-t2jr.md

## Thread

### note · external:aide · 2026-11-09T17:23:20.122Z
aide: confirmed in client/src/style.css line 44: .overlay has position: fixed but no z-index, so .wk-head (z-index: 3) draws over it. Likely fix: give .overlay a z-index above the page's sticky and fixed layers (.wk-head 3, .tabbar 4). Not reproduced in a browser.
