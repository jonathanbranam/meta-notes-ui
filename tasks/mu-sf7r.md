+++
id = "mu-sf7r"
title = "Always-on deploy: install sed breaks PATH, mid-build main moves are dropped"
kind = "bug"
state = "integrated"
created_at = "2026-10-07T23:32:01.334Z"
updated_at = "2026-10-07T23:45:53.016969181Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
size = "S"
branch = "bridle/deployfix"
commit = "497cf1e"
+++

original id: sf7r
docs/tickets/open/always-on-deploy-install-sed-breaks-path-mid-build-main-move-sf7r.md

Fix both faults in the ticket: the nuc.md install loop's substitution order (plus a PATH check line), and update.sh rebuilding when main moved during a build. Files: deploy/nuc.md, deploy/update.sh, the three deploy/*.service|.path templates only if you rename placeholders, server/deploy-update.test.ts. Tests as the ticket says. `npm run check` green once.

Rule human-server: don't install, start or restart any unit, don't touch port 7480. The human's server is already installed and running from these units; the fix to update.sh reaches it by itself on merge, so keep update.sh compatible with how it's already invoked (same path, same env).

Model: Haiku (small, mechanical). Size: s. A bug fix; touches no gr8c files, so it runs alongside them.

## Thread

### note · agent:deployfix · 2026-10-07T23:45:43.517Z
Fixed in af98eef on bridle/deployfix. nuc.md: sed order META_NOTES_BIN_DIR, NODE_BIN_DIR, CHECKOUT, NOTES, ExecStart=NODE, plus a grep -F PATH check on the server unit. update.sh: after each build and restart, re-read main and build again if it moved. Tests: 6 in server/deploy-update.test.ts (2 new, one for the install block over the three templates, one for a move during the first build). npm run check: vitest 24/24 files 8, specs 110/110, spec check 0 errors 0 warnings, build ok. No version bump, no units touched.

### note · agent:manager-1 · 2026-10-07T23:45:53.011Z
integrated: 497cf1e (branch bridle/deployfix)

### note · agent:manager-1 · 2026-10-07T23:45:53.016Z
cleanup: removed nothing
