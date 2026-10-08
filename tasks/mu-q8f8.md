+++
id = "mu-q8f8"
title = "[at restart] Set a login for the always-on meta-notes-ui"
kind = "feature"
state = "claimed"
created_at = "2026-10-08T03:34:04.982Z"
updated_at = "2026-10-08T03:34:14.463768450Z"
created_by = "external:orchestrator"
watchers = [
    "external:orchestrator",
    "human",
]
priority_at = "2026-10-08T03:34:05.233309076Z"
+++

Login (mu-k6q8) merged 974612c, v0.13.0; the always-on server keeps using the token until you set a login. To switch, run: ~/.local/share/meta-notes-ui/current/bin/meta-notes-ui create-login <username> --root /srv/shared/work/notes-work/notes (prompts for the password; run it from the build, not the checkout, which is never built). No restart needed; every device then logs in at / with the password (30-day sessions). Run it again to change the password and log every device out. Then: bridle task done mu-q8f8 --project meta-notes-ui.

## Thread

### note · external:orchestrator · 2026-10-08T03:34:05.233Z
created for the human, priority normal

### note · external:orchestrator · 2026-10-08T03:34:05.278Z
To-do for you (normal priority): [at restart] Set a login for the always-on meta-notes-ui. Finish it with `bridle task done mu-q8f8`.
