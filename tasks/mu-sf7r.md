+++
id = "mu-sf7r"
title = "Always-on deploy: install sed breaks PATH, mid-build main moves are dropped"
kind = "bug"
state = "planned"
created_at = "2026-10-07T23:32:01.334Z"
updated_at = "2026-10-07T23:42:35.597741260Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
size = "S"
+++

original id: sf7r
docs/tickets/open/always-on-deploy-install-sed-breaks-path-mid-build-main-move-sf7r.md

Fix both faults in the ticket: the nuc.md install loop's substitution order (plus a PATH check line), and update.sh rebuilding when main moved during a build. Files: deploy/nuc.md, deploy/update.sh, the three deploy/*.service|.path templates only if you rename placeholders, server/deploy-update.test.ts. Tests as the ticket says. `npm run check` green once.

Rule human-server: don't install, start or restart any unit, don't touch port 7480. The human's server is already installed and running from these units; the fix to update.sh reaches it by itself on merge, so keep update.sh compatible with how it's already invoked (same path, same env).

Model: Haiku (small, mechanical). Size: s. A bug fix; touches no gr8c files, so it runs alongside them.
