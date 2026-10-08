# Always-on meta-notes-ui on the NUC

One server, port **7480**, bound to 127.0.0.1, serving the notes root
`/srv/shared/work/notes-work/notes`, run by a systemd user unit from a build of `main`
that updates itself. The phone reaches it over HTTPS through `tailscale serve`. Agents
never touch it (`.bridle/rules/human-server.md`).

## Install

The server runs from `~/.local/share/meta-notes-ui/current`, a build of this
repo's `main` made out of tree by `deploy/update.sh`. A path unit watches the
checkout's `main` and rebuilds and restarts the server by itself whenever it
moves, so there is no update step. A failed build leaves the running server
alone. The checkout is `/srv/shared/work/meta-notes-ui-work/meta-notes-ui`.

Three units are installed: `meta-notes-ui.service` (the server),
`meta-notes-ui-update.service` (the build) and `meta-notes-ui-update.path`
(the trigger). Replace the placeholders in each, from the checkout:

- `CHECKOUT`: `/srv/shared/work/meta-notes-ui-work/meta-notes-ui`
- `NOTES`: `/srv/shared/work/notes-work/notes`
- `NODE`: `command -v node`; `NODE_BIN_DIR`: its directory (npm is there too)
- `META_NOTES_BIN_DIR`: the directory of `command -v meta-notes`

The unit's `PATH` is minimal, and the server runs `meta-notes` for edits, the
daily note, today and tag aliases; without it on `PATH` they fail with ENOENT.

```sh
cd /srv/shared/work/meta-notes-ui-work/meta-notes-ui
mkdir -p ~/.config/systemd/user
NODE=$(command -v node)
MN=$(command -v meta-notes)
for u in meta-notes-ui.service meta-notes-ui-update.service meta-notes-ui-update.path; do
  sed -e "s|META_NOTES_BIN_DIR|$(dirname "$MN")|g" \
      -e "s|NODE_BIN_DIR|$(dirname "$NODE")|g" \
      -e "s|CHECKOUT|$PWD|g" \
      -e "s|NOTES|/srv/shared/work/notes-work/notes|g" \
      -e "s|^ExecStart=NODE |ExecStart=$NODE |" \
      deploy/$u > ~/.config/systemd/user/$u
done
grep -n -E 'CHECKOUT|NOTES|NODE|META_NOTES' ~/.config/systemd/user/meta-notes-ui*   # only comments may match
grep -F "PATH=$(dirname "$MN")" ~/.config/systemd/user/meta-notes-ui.service          # must print the PATH line with the meta-notes dir
systemctl --user daemon-reload
```

## One-time steps (need sudo)

```sh
sudo loginctl enable-linger jbranam        # user unit runs without a login session
sudo tailscale set --operator=jbranam      # only if `tailscale serve` is refused
tailscale serve --bg --https=443 http://127.0.0.1:7480
```

The phone URL is then `https://nuc.<tailnet>.ts.net/`.

## Token and phone

In the notes root, `meta-notes ui url` prints `<server.json url>?token=<token>`.
The server records its own address, `http://127.0.0.1:7480`, so for the phone
replace that origin with the Tailscale one:
`https://nuc.<tailnet>.ts.net/?token=<token>`. Open it once; the server
trades the token for a cookie. The server creates the token file
(`<notes>/.meta-notes-cache/ui/token`, mode 0600) on its first start; run
`meta-notes ui url` only after that, since before it the command fails with
"The UI is not running".

HTTPS: `tailscale serve` terminates TLS and forwards plain HTTP. The server
sets no `Secure` flag on the cookie, which browsers still keep and send on an
HTTPS page, and uses only relative URLs, so the cookie, the service worker and
the PWA need nothing else from the server.

## Optional: the Message button

The unit's `--bridle-url`, `--bridle-token-file` and `--bridle-to` flags let the
Message button in the top bar send text to the notes advisor as the human: the
server posts to the notes daemon (`http://127.0.0.1:7404`) with the human's
token, read from `/srv/shared/work/notes-work/.bridle/tokens/human` on each send
(the browser never sees it). Give both `--bridle-url` and `--bridle-token-file`
or neither; without them there is no button and the server needs no bridle.
Send only: no replies yet. Design: `design/specs/message.md`.

## Optional: a login instead of the token

The human's step (agents never do it): run the CLI from the deployed build (the
always-on deploy builds out of tree, so the checkout has no `dist/`):
`~/.local/share/meta-notes-ui/current/bin/meta-notes-ui create-login <username> --root /srv/shared/work/notes-work/notes`
(prompts for the password; `--help` prints usage). The running server notices the new file by itself, no restart:
the token URL and cookie stop working, and every device logs in at `/` (redirects to
`/login`) with the password; the session lasts 30 days unused. Run the command again to change
the password and log every device out. To go back to the token, delete
`<notes>/.meta-notes-cache/ui/login` (and `sessions.json`). `tailscale serve` sends
`X-Forwarded-Proto: https`, so the session cookie is marked Secure.

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

## Start it, check it, open it on the phone

Do the install and the one-time steps above first, then top to bottom:

```sh
# 1. Start: enable the server and the path unit, then build main once.
systemctl --user enable --now meta-notes-ui-update.path
systemctl --user enable meta-notes-ui
systemctl --user start meta-notes-ui-update    # builds main, then starts the server

# 2. Check it is running.
journalctl --user -u meta-notes-ui-update -n 30   # "built <sha>" and no errors
systemctl --user status meta-notes-ui             # active (running)
curl -sI http://127.0.0.1:7480/                   # an HTTP response (401 without the token is fine)

# 3. Phone URL.
cd /srv/shared/work/notes-work/notes
meta-notes ui url
```

`start meta-notes-ui-update` takes a minute (`npm ci` and the build); the
server comes up when it ends. Step 3 prints
`http://127.0.0.1:7480/?token=<token>`: swap the origin for
`https://nuc.<tailnet>.ts.net` and open that once on the phone.

Update logs: `journalctl --user -u meta-notes-ui-update`. Server logs:
`journalctl --user -u meta-notes-ui`.
