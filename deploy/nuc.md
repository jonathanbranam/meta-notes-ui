# Always-on meta-notes-ui on the NUC

One server, port **7480**, bound to 127.0.0.1, serving the notes root
`/srv/shared/work/notes-work/notes`, run by a systemd user unit from its own
checkout. The phone reaches it over HTTPS through `tailscale serve`. Agents
never touch it (`.bridle/rules/human-server.md`).

## Install

```sh
git clone <repo url> ~/apps/meta-notes-ui
cd ~/apps/meta-notes-ui
git checkout v<latest release tag>
npm ci && npm run build
```

The token file must exist before the first start. `meta-notes ui url` (run
in the notes root) creates it, mode 0600, if missing, or create it yourself.

Review `deploy/meta-notes-ui.service`, replace `CHECKOUT`, `NODE` and
`NOTES`, and copy it:

```sh
mkdir -p ~/.config/systemd/user
cp deploy/meta-notes-ui.service ~/.config/systemd/user/
# edit the placeholders, then:
systemctl --user daemon-reload
systemctl --user enable --now meta-notes-ui
systemctl --user status meta-notes-ui
```

## One-time steps (need sudo)

```sh
sudo loginctl enable-linger jbranam        # user unit runs without a login session
sudo tailscale set --operator=jbranam      # only if `tailscale serve` is refused
tailscale serve --bg --https=443 http://127.0.0.1:7480
```

The phone URL is then `https://nuc.<tailnet>.ts.net/`.

## Update

```sh
cd ~/apps/meta-notes-ui
git fetch --tags
git checkout v<new tag>
npm ci && npm run build
systemctl --user restart meta-notes-ui
```

## Token and phone

In the notes root, `meta-notes ui url` prints `<server.json url>?token=<token>`.
The server records its own address, `http://127.0.0.1:7480`, so for the phone
replace that origin with the Tailscale one:
`https://nuc.<tailnet>.ts.net/?token=<token>`. Open it once; the server
trades the token for a cookie. The token is kept in
`<notes>/.meta-notes-cache/ui/token`.

HTTPS: `tailscale serve` terminates TLS and forwards plain HTTP. The server
sets no `Secure` flag on the cookie, which browsers still keep and send on an
HTTPS page, and uses only relative URLs, so the cookie, the service worker and
the PWA need nothing else from the server.

## Relation to `meta-notes ui`

The server writes `.meta-notes-cache/ui/server.json` itself, so `meta-notes ui
status`, `url` and `open` work against the unit's server.

- `meta-notes ui start` refuses to start a second server for the same root
  when `server.json` names a live pid ("The UI is already running at ...").
  It does not look at the port or the unit, so with the unit stopped it would
  start its own, detached, outside systemd.
- `meta-notes ui stop` SIGTERMs the unit's process. The server exits 0, so
  `Restart=on-failure` leaves it stopped. Use `systemctl --user stop|restart
  meta-notes-ui` instead.
- Logs: `journalctl --user -u meta-notes-ui`.
