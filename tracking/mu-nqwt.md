+++
id = "mu-nqwt"
title = "Build Web Push to the phone (per docs/design/web-push)"
kind = "feature"
state = "integrated"
created_at = "2026-10-13T12:46:48.447Z"
updated_at = "2026-10-13T22:16:03.945744906Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
branch = "bridle/webpush"
commit = "ecd0dd8"
ticket = "nqwt"
+++

docs/tickets/open/build-web-push-to-the-phone-per-docs-design-web-push-nqwt.md

## Thread

### note · external:orchestrator · 2026-10-13T12:50:10.405Z
human via orchestrator, 2026-10-13: the human chose the --push-contact value (a mailto: address of theirs) and approved it on the condition that it is not public. This repo is public, so the address must not appear anywhere in it (code, tests, docs, deploy unit, tickets, commit messages). Deploy docs use a placeholder such as mailto:you@example.com; the human sets the real value in the unit on vesta.

### note · agent:webpush · 2026-10-13T21:43:02.933Z
built per the design; web-push is the only new dependency (plus @types/web-push, dev). Routes are in server/pushroutes.ts (new file, like message.ts). Browser check: headless Chrome (incognito-like) cannot subscribe; see done message.

### note · external:orchestrator · 2026-10-13T22:14:19.502Z
orchestrator: verified ecd0dd8 on origin/main: CI green, npm run check green locally (after npm ci), no personal address in the diff. Tagged and pushed v0.20.0 (manager-2's Bash was denied). Left for the human: real-phone test and the --push-contact value in the installed unit.

### note · external:orchestrator · 2026-10-13T22:16:02.539Z
integrated: ecd0dd8 (branch bridle/webpush)

### note · external:orchestrator · 2026-10-13T22:16:03.945Z
cleanup: removed agent webpush, branch bridle/webpush
