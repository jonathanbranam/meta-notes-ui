---
id: human-server
severity: must
roles: [manager, worker]
---
The human's always-on meta-notes-ui runs on port 7480 as the systemd user
unit `meta-notes-ui` (deploy/nuc.md). Agents never bind, stop, restart or
kill anything on port 7480, the `meta-notes-ui` service, or its processes.

- **The update units** (`meta-notes-ui-update.path` and `.service`) rebuild
  and restart the server by themselves when `main` moves; agents still never
  run, start, stop or restart either unit.
- **Test servers** use `npm run dev:example` (its own port) or tests on
  port 0.
- **Never kill by name or pattern**; kill only a pid you started.
- If something seems wrong with the human's server, report it; don't fix it.

Why: the human, 2026-10-05, runs this server all day from their phone;
after stray agent processes held the human's ports in track-web (2026-08-21),
ports the human uses are off limits.
