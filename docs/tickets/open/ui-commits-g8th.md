---
id: mu-g8th
title: Commit (and push) notes changed through the UI
kind: feature
created: 2026-11-28
created_by: external:orchestrator
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
---

## The ask


The meta-notes-ui server commits the notes it changes, in batches, and pushes them. Today UI
edits (task check-offs, cancels, daily-note changes) sit uncommitted in the notes repo for days:
neither the UI nor meta-notes commits anything, and meta-notes leaves commits to the human's
daily shutdown.

Approved design (the human, via aide, 2026-11-28 9:35 AM ET: "yes ready it"; earlier, 9:33 AM:
"could they be debounced / batched up over a minute or something? I'm often slowly clicking
through items there"):

- The server records each notes-root path its own `meta-notes` writes touched. It never sweeps in
  other changes (Vim edits, agent edits): `git add` only those paths, then commit.
- Debounce: a 60 s timer restarts on every UI write; when it fires, one commit
  (`meta-notes-ui: <N> notes updated`, listing the paths in the body) and a `git push` if the
  repo has a remote.
- On server shutdown or restart, flush pending paths first.
- A failed commit or push is not dropped: the paths stay pending, the next flush retries, and the
  UI shows the failure.
- Nothing to commit (a path already committed by someone else) is not an error.

## Check

Tests against a temp git repo with a bare remote: several writes within 60 s give one commit with
only those paths; an unrelated modified file stays uncommitted; the push reaches the remote; a
failing push is retried on the next flush. `just check` green.

Model: Sonnet. Requested by external:aide (notes) for the human, m-0443 / m-0445 on vesta-home.
