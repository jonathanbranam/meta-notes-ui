+++
id = "mu-js23"
title = "Always-on meta-notes-ui on the NUC: fixed port, systemd user unit, HTTPS for the phone via Tailscale"
kind = "feature"
state = "integrated"
created_at = "2026-10-05T10:10:26.205Z"
updated_at = "2026-10-05T10:19:24.473158076Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
branch = "bridle/deploy"
commit = "cfb2e55"
+++

Ticket uuum (docs/tickets/open/always-on-meta-notes-ui-on-the-nuc-fixed-port-systemd-user-u-uuum.md). Ship: deploy/meta-notes-ui.service template, deploy/nuc.md (install, update, the human's one-time steps), rule .bridle/rules/human-server.md (agents never touch port 7480 or the service), and check the token cookie and PWA work behind tailscale serve HTTPS. Workers don't install or start the service; the human does.

## Thread

### note · agent:manager-1 · 2026-10-05T10:19:24.468Z
integrated: cfb2e55 (branch bridle/deploy)

### note · agent:manager-1 · 2026-10-05T10:19:24.473Z
cleanup: removed nothing
