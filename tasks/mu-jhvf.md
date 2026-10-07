+++
id = "mu-jhvf"
title = "Set up the always-on meta-notes-ui on the NUC (phone over HTTPS)"
kind = "chore"
state = "claimed"
created_at = "2026-10-07T23:20:25.650Z"
updated_at = "2026-10-07T23:20:25.983424123Z"
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
