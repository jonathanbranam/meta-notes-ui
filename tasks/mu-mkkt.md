+++
id = "mu-mkkt"
title = "Always-on server follows main by itself: no manual updates"
kind = "feature"
state = "integrated"
created_at = "2026-10-07T23:13:53.401Z"
updated_at = "2026-10-07T23:29:31.237456642Z"
created_by = "external:aide"
watchers = ["external:aide"]
branch = "bridle/autoupdate"
commit = "a6b29a3"
+++

original id: mkkt
docs/tickets/open/always-on-server-follows-main-by-itself-no-manual-updates-mkkt.md

Goal: the human's always-on server serves the latest `main` with no manual update step. The ticket's "Decision" section is the design; follow it.

Files:
- deploy/update.sh (new): the update script. Paths via env with defaults (CHECKOUT=/srv/shared/work/meta-notes-ui-work/meta-notes-ui, STATE=$HOME/.local/share/meta-notes-ui), so it can be tested on temp dirs. The restart command is overridable too (e.g. RESTART_CMD) so tests never touch the real unit. Records the built sha (a file in the build dir). Atomic symlink swap (`ln -sfn` to a temp name, then `mv -T`). Keeps the last 3 builds. Fails closed: any error leaves `current` and the server alone.
- deploy/meta-notes-ui-update.path and deploy/meta-notes-ui-update.service (new): the path unit (PathChanged on CHECKOUT/.git/logs/refs/heads/main) and the oneshot that runs update.sh with the same PATH as the server unit.
- deploy/meta-notes-ui.service: WorkingDirectory=%h/.local/share/meta-notes-ui/current; drop the CHECKOUT placeholder.
- deploy/nuc.md: install = copy the three units, fill placeholders, enable the server and the path unit, run the update once (`systemctl --user start meta-notes-ui-update`). Remove the clone and the Update section. Keep the one-time sudo steps, token and phone, and the `meta-notes ui` notes. Say how to see update logs (journalctl -u meta-notes-ui-update).
- .bridle/rules/human-server.md: one line: the update units rebuild and restart the server by themselves; agents still never run, start, stop or restart either unit.

Verify: a small test (vitest or a shell test run by `npm test`/`npm run check`, whichever fits the repo) that runs update.sh against a temp git repo and temp STATE with a stub RESTART_CMD: first run builds and points `current` at it; a second run with no new commit does nothing; a commit that breaks the build leaves `current` unchanged and exits non-zero. A stub build (e.g. a temp package.json whose build script succeeds or fails) is fine; don't run a real npm ci in tests. `npm run check` green once.

Out of scope: installing or starting any unit on this machine (rule human-server: never touch the `meta-notes-ui` unit, its port 7480 or its processes); rollback commands; notifications on failure beyond the journal.

Model: Sonnet (systemd units and a failure path).

Added (the human, via aide, 2026-10-07: "how do i start the actual server? I don't see that in the setup", then "I'll wait for mkkt if that will fix it."): deploy/nuc.md must end with an explicit, copy-pasteable sequence: start it (enable --now the server and the path unit, run the update once), check it is running (`systemctl --user status meta-notes-ui`, a `curl -sI http://127.0.0.1:7480/` expecting a response, where the update logs are), then get the phone URL with the token (`meta-notes ui url` in the notes root, with the Tailscale origin swapped in). Written for the human to follow top to bottom without guessing.

## Thread

### note · external:orchestrator · 2026-10-07T23:20:10.377Z
Brief amended (human via aide, m-0240): nuc.md ends with an explicit start / check-running / phone-URL sequence. Quote is in the brief.

### note · external:aide · 2026-10-07T23:21:13.004Z
From the human, via aide (2026-10-07): "I am \"ok\" but not excited about running it in another folder if that's easier for some reason, but I want that other copy to git pull and stay on latest." The decided shape meets this: the build folder is filled from main automatically on every move, with nothing pulled by hand. Keep it that way; no manual update step.

### note · agent:autoupdate · 2026-10-07T23:29:16.158Z
Done on bridle/autoupdate, 08a3259 (main merged in). npm run check: typecheck ok; vitest 22 passed (8 files, 4 new in server/deploy-update.test.ts: build+symlink+restart, no-op when main unmoved, failed build leaves current/server alone and exits non-zero, keeps 3 builds); spec check 0 errors; specs 108 passed; build ok. No version bump. Changed: deploy/update.sh, the two update units, meta-notes-ui.service (WorkingDirectory, header says four placeholders), nuc.md (install via sed loop, no clone/Update, token fix, ending start/check/phone sequence), human-server.md. systemd-analyze verify only complains about unfilled placeholders (expected). Human must verify by hand: the sed install loop output (grep step), that the first 'systemctl --user start meta-notes-ui-update' builds and the server comes up, that curl -sI on 7480 answers, and that a merge to main triggers the path unit. Untested: real npm ci; update.sh runs as the oneshot with PATH=NODE_BIN_DIR:/usr/bin (needs git, tar, bash there).

### note · agent:manager-1 · 2026-10-07T23:29:31.232Z
integrated: a6b29a3 (branch bridle/autoupdate)

### note · agent:manager-1 · 2026-10-07T23:29:31.237Z
cleanup: removed nothing
