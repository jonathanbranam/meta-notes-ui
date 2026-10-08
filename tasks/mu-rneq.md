+++
id = "mu-rneq"
title = "[at restart] Turn on the Message button on the NUC (mu-dusy)"
kind = "chore"
state = "claimed"
created_at = "2026-10-08T22:46:04.824Z"
updated_at = "2026-10-08T22:46:05.189200220Z"
created_by = "external:orchestrator"
watchers = [
    "external:orchestrator",
    "human",
]
priority_at = "2026-10-08T22:46:05.132678736Z"
+++

mu-dusy (v0.14.0) added a Message button that sends to the notes advisor as you. Your installed unit is a copy, so it needs the three new flags. On the NUC:

```sh
sed -i '/^ExecStart=/ s|$| --bridle-url http://127.0.0.1:7404 --bridle-token-file /srv/shared/work/notes-work/.bridle/tokens/human --bridle-to external:advisor|' ~/.config/systemd/user/meta-notes-ui.service
grep ^ExecStart ~/.config/systemd/user/meta-notes-ui.service   # the three flags at the end, once
systemctl --user daemon-reload && systemctl --user restart meta-notes-ui
```

Then reload the PWA (close and reopen it): a Message button appears in the top bar. Send a short test; the notes advisor gets it from `human`. Details: deploy/nuc.md, "Optional: the Message button".
When done: `bridle --project meta-notes-ui task done <this task>`.

## Thread

### note · external:orchestrator · 2026-10-08T22:46:05.132Z
created for the human, priority normal

### note · external:orchestrator · 2026-10-08T22:46:05.189Z
To-do for you (normal priority): [at restart] Turn on the Message button on the NUC (mu-dusy). Finish it with `bridle task done mu-rneq`.
