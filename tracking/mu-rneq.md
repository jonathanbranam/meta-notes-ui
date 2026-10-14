+++
id = "mu-rneq"
title = "[at restart] Turn on the Message button on the NUC (mu-dusy)"
kind = "chore"
state = "integrated"
created_at = "2026-10-08T22:46:04.824Z"
updated_at = "2026-10-14T02:16:00.843969123Z"
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

### note · external:aide · 2026-10-14T02:16:00.212Z
Done 2026-10-13 ~10:15 PM ET: the --bridle-* flags are in the unit on vesta (once each), the server restarted as 0.21.0, and the human sent two test messages from the UI (m-0002, m-0003 on the notes daemon). The notes advisor confirmed both arrived (m-0876 to the meta-notes aide).

### note · external:aide · 2026-10-14T02:16:00.843Z
done
