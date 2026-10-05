---
id: uuum
title: "Always-on meta-notes-ui on the NUC: fixed port, systemd user unit, HTTPS for the phone via Tailscale"
kind: feature
opened: 2026-10-05
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [d66x]
tasks: [mu-js23]
---

## The ask

The human wants one always-running meta-notes-ui on the NUC, on a fixed port,
serving their notes root (/srv/shared/work/notes-work/notes), reachable from
their phone; agents keep using their own ports for tests (the human,
2026-10-04, via the orchestrator; goal approved).

## How track-web does it (aide-track-web, 2026-10-05)

Fixed ports in a checked-in JSON file, a bridle rule listing ports agents
must never bind, stop or restart (after stray agent processes held the
human's ports on 2026-08-21), pidfile-based scripts for agent instances that
kill only their own pid (never by name or port). Production runs under PM2
behind Caddy with Let's Encrypt; locally nothing supervises. Plain HTTP on a
LAN IP isn't a secure context on the phone; the aide suggests `tailscale
serve` for HTTPS.

## Proposed shape

- **Port 7480**, bound to 127.0.0.1 (free on the NUC; bridle daemons use
  7402-7405). Recorded in the repo (e.g. `deploy/nuc.md` or a ports file)
  and in a new rule `.bridle/rules/human-server.md`: agents never bind,
  stop or restart port 7480 or the `meta-notes-ui` service; test servers use
  `bridle port` or their own `--port` (d66x).
- **Runs from its own checkout**, not the agents' clone: e.g.
  `~/apps/meta-notes-ui` at the latest release tag; update = fetch, checkout
  tag, `npm ci`, `npm run build`, restart.
- **Supervised by a systemd user unit** shipped as a template in the repo
  (`deploy/meta-notes-ui.service`): `node dist/server/index.js --root
  <notes> --port 7480 --host 127.0.0.1 --token-file
  <notes>/.meta-notes-cache/ui/token`, `Restart=on-failure`. The server
  writes `server.json` itself, so `meta-notes ui status|url|open` keep
  working; check `meta-notes ui start` refuses to start a second one.
- **Phone over HTTPS via Tailscale**: `tailscale serve --bg --https=443
  http://127.0.0.1:7480` gives https://nuc.<tailnet>.ts.net. Check the auth
  cookie and PWA work behind it (Secure cookie, service worker needs a
  secure context).
- **Docs**: `deploy/nuc.md` with install, update and the human's one-time
  steps.

## The human's one-time steps (need sudo or their account)

- `sudo loginctl enable-linger jbranam` (Linger=no now), so the user unit
  runs without a login session.
- `tailscale serve` may need `sudo tailscale set --operator=jbranam` first.
- Enabling and starting the unit, after reviewing it.

## Out of scope

Work computer install (the clone + `meta-notes ui start` already covers it),
PM2, Caddy, Let's Encrypt.
