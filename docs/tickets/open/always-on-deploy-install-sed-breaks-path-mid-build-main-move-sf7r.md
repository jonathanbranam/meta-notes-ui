---
id: sf7r
title: "Always-on deploy: install sed breaks PATH, mid-build main moves are dropped"
kind: bug
opened: 2026-10-07
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [mkkt]
tasks: []
---

## The ask

## The bug

Two faults in the always-on deploy merged with mu-mkkt (a6b29a3):

1. **deploy/nuc.md's install loop breaks the server's PATH.** The `sed` loop
   replaces `NOTES` before `META_NOTES_BIN_DIR`, so `meta-notes-ui.service` gets
   `Environment=PATH=META_/srv/shared/work/notes-work/notes_BIN_DIR:...` and
   every edit fails with ENOENT. The guide's `grep` check doesn't catch it (no
   placeholder is left). Found by the aide before the human ran it
   (2026-10-07, m-0266) and confirmed by the orchestrator; the human installed
   with the order fixed by hand (on mu-jhvf).
2. **A move of `main` during a build is dropped.** When the path unit fires
   while `meta-notes-ui-update.service` is still running, systemd merges the
   start into the running job, so the newer commit isn't built until the next
   move. Merges often come in bursts (a merge, then ticket commits).
   Found by the orchestrator reading update.sh.

## The fix

- nuc.md: substitute `META_NOTES_BIN_DIR` and `NODE_BIN_DIR` first, then
  `CHECKOUT`, `NOTES`, `NODE`. Add a check line that the server unit's `PATH=`
  holds the meta-notes directory (e.g. `grep "PATH=$(dirname "$MN")" ...`).
  Better still, rename the placeholders so none is a substring of another; your call.
- update.sh: after a successful build and restart, re-read `main`; if it moved,
  build again (loop until it's stable).
- A test for each: the nuc.md loop run over the three templates leaves the
  expected `PATH`/`ExecStart`; update.sh builds twice when main moves during
  the first build (stub BUILD_CMD that commits).
