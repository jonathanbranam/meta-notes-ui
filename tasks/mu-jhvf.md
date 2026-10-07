+++
id = "mu-jhvf"
title = "Set up the always-on meta-notes-ui on the NUC (phone over HTTPS)"
kind = "chore"
state = "claimed"
created_at = "2026-10-07T23:20:25.650Z"
updated_at = "2026-10-07T23:30:01.746418340Z"
created_by = "external:aide"
watchers = [
    "external:aide",
    "human",
]
priority_at = "2026-10-07T23:20:25.926577535Z"
+++

Set up the always-on meta-notes-ui on the NUC so the phone can use it over HTTPS. Asked for by the human, 2026-10-07.

## Now (one-time, any time)

1. `sudo loginctl enable-linger jbranam` (so the server runs without a login session)
2. `tailscale serve --bg --https=443 http://127.0.0.1:7480`
   If refused: `sudo tailscale set --operator=jbranam`, then run it again.

## After mu-mkkt merges (the aide comments here when it has)

3. Follow the new `deploy/nuc.md` in /srv/shared/work/meta-notes-ui-work/meta-notes-ui: copy the three systemd user units, enable them, run the update once. That builds and starts the server; from then on it rebuilds and restarts itself after each merge to main.
4. Check it is running (the guide's check step), e.g. `systemctl --user status meta-notes-ui`.
5. Phone: `cat /srv/shared/work/notes-work/notes/.meta-notes-cache/ui/token`, open `https://nuc.tailbc91f5.ts.net/?token=<token>` once, then Add to Home Screen.

Skip from the old guide: the `~/apps` clone and `meta-notes ui url` before the first start (it fails; the server makes the token file itself).

## Thread

### note · external:aide · 2026-10-07T23:20:25.926Z
created for the human, priority normal

### note · external:aide · 2026-10-07T23:20:25.983Z
To-do for you (normal priority): Set up the always-on meta-notes-ui on the NUC (phone over HTTPS). Finish it with `bridle task done mu-jhvf`.

### note · external:aide · 2026-10-07T23:21:13.168Z
Steps 1 and 2 done (the human, 2026-10-07; the aide checked: Linger=yes, tailscale serve proxies https://nuc.tailbc91f5.ts.net to 127.0.0.1:7480). Waiting on mu-mkkt for steps 3-5.

### note · external:aide · 2026-10-07T23:30:01.746Z
mu-mkkt merged (a6b29a3). Steps 3-5, from the new deploy/nuc.md, with one fix: the guide's sed replaces NOTES before META_NOTES_BIN_DIR, which leaves PATH=META_/srv/.../notes_BIN_DIR and breaks every edit (ENOENT on meta-notes). The order below is fixed; the aide tested it into a temp dir.

3. Install the three units:

    cd /srv/shared/work/meta-notes-ui-work/meta-notes-ui
    mkdir -p ~/.config/systemd/user
    NODE=$(command -v node); MN=$(command -v meta-notes)
    for u in meta-notes-ui.service meta-notes-ui-update.service meta-notes-ui-update.path; do
      sed -e "s|META_NOTES_BIN_DIR|$(dirname "$MN")|g" \
          -e "s|NODE_BIN_DIR|$(dirname "$NODE")|g" \
          -e "s|CHECKOUT|$PWD|g" \
          -e "s|NOTES|/srv/shared/work/notes-work/notes|g" \
          -e "s|^ExecStart=NODE |ExecStart=$NODE |" \
          deploy/$u > ~/.config/systemd/user/$u
    done
    grep PATH= ~/.config/systemd/user/meta-notes-ui.service   # must show /home/jbranam/.local/bin
    systemctl --user daemon-reload

4. Start and check:

    systemctl --user enable --now meta-notes-ui-update.path
    systemctl --user enable meta-notes-ui
    systemctl --user start meta-notes-ui-update     # about a minute: npm ci, build, then starts the server
    systemctl --user status meta-notes-ui           # active (running)

5. Phone:

    cd /srv/shared/work/notes-work/notes && meta-notes ui url

   Take the ?token=... part and open https://nuc.tailbc91f5.ts.net/?token=<token> once on the phone, then Add to Home Screen.
