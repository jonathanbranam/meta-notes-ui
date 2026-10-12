+++
id = "mu-n9ny"
title = "Hostname rename nuc -> vesta in the deploy docs (bridle machine name stays nuc)"
kind = "docs"
state = "planned"
created_at = "2026-10-12T03:23:22.195Z"
updated_at = "2026-10-12T03:24:02.337861345Z"
created_by = "external:aide"
watchers = ["external:aide"]
ticket = "n9ny"
+++

Ticket: docs/tickets/open/hostname-rename-nuc-vesta-in-the-deploy-docs-bridle-machine-n9ny.md (the ask, the human's words).

Goal: the repo's deploy docs and design doc name the server host `vesta` (Tailscale `vesta.<tailnet>.ts.net`), not `nuc`. Bridle's own machine name stays `nuc` for now.

Do:
1. `git mv deploy/nuc.md deploy/always-on.md`; title "Always-on meta-notes-ui on vesta" (or host-neutral). Phone URLs `https://nuc.<tailnet>.ts.net` -> `https://vesta.<tailnet>.ts.net`; "the NUC" -> "vesta" in prose.
2. Update every reference to deploy/nuc.md: README.md, deploy/meta-notes-ui.service, deploy/meta-notes-ui-update.service, deploy/meta-notes-ui-update.path, deploy/update.sh, .bridle/rules/human-server.md, docs/design/web-push.md, server/deploy-update.test.ts (the `nuc` const and the describe name).
3. docs/design/web-push.md: "the NUC" -> "vesta" (or "the server host"); keep it otherwise untouched (it's under the human's review as mu-6u38).
4. Add a short "Renaming the host" section to the deploy doc: re-apply `tailscale serve` (its config is tied to the old name), then reinstall the Home Screen app on the phone; the origin changes, so the PWA's localStorage, token and any push subscription start over.

Leave alone: bridle's machine name `nuc` anywhere in .bridle/ (config.toml comments, etc.) and every ticket under docs/tickets/.

Verify: `git grep -n -i '\bnuc\b' -- ':!docs/tickets' ':!.bridle/config.toml'` prints nothing (or only lines about bridle's machine name); `git grep deploy/nuc.md` is empty; `just check` (or `npm test`) green, including server/deploy-update.test.ts.
Model: haiku (mechanical docs rename). No version bump needed beyond what the project's versioning rule asks for docs-only changes.
Out of scope: the host steps (tailscale serve, phone reinstall, systemd reinstall): the human does them.
