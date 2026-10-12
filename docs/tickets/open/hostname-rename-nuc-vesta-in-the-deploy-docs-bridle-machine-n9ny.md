---
id: mu-n9ny
title: Hostname rename nuc -> vesta in the deploy docs (bridle machine name stays nuc)
kind: docs
created: 2026-10-12
created_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: [mu-uuum, mu-6u38]
---

## The ask

The human, 2026-10-11 (to the aide, verbatim): "i need help updating meta-notes-ui for a hostname rename from nuc to vesta; but in bridle we are still using "nuc" for the machine name for now"

The machine's hostname and Tailscale name are now `vesta` (`vesta.tailbc91f5.ts.net`). Bridle still calls the machine `nuc` (for example `external:orchestrator@nuc`), and that stays as it is for now.

Scope (repo only; the human handles the host steps, which the aide gave them):
- `deploy/nuc.md`: the phone URL `https://nuc.<tailnet>.ts.net` becomes `https://vesta.<tailnet>.ts.net`, and "the NUC" in the prose becomes "vesta". Aide's recommendation: rename the file to a host-neutral name (for example `deploy/always-on.md`) and update every reference: `deploy/*.service`, `deploy/*.path`, `deploy/update.sh`, `README.md`, `.bridle/rules/human-server.md`, `docs/design/web-push.md`, `server/deploy-update.test.ts`.
- `docs/design/web-push.md`: "the NUC" becomes "vesta" (or "the server host").
- Add a short note to the deploy doc on a hostname rename: re-apply `tailscale serve` (its config is tied to the old name), then reinstall the Home Screen app on the phone. The origin changes, so the PWA's localStorage, its token and any push subscription start over.
- Leave alone: `.bridle/` names for the bridle machine (`nuc`, for example `.bridle/config.toml`'s "NUC's bridle checkout"), and the historical tickets.
