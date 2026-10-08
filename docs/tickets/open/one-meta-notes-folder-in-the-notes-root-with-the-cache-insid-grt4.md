---
id: grt4
title: One .meta-notes/ folder in the notes root, with the cache inside it
kind: chore
opened: 2026-10-08
repos: [meta-notes, meta-notes-ui]
changes: []
specs: []
needs: []
see: []
tasks: []
---

## The ask

From the human, via aide, 2026-10-07, verbatim:

"Also, just a totally separate thing: long term, I wish we had not named that folder `.meta-notes cache`. We should just name it `.meta-notes`, and then put cache inside of there if we wanted to. Anyway, something we have to file a ticket for."

## The ask (long term; no task until the human asks)

- One folder `.meta-notes/` in the notes root, with the cache inside it (e.g. `.meta-notes/cache/`), instead of a separate `.meta-notes-cache/`.

## What it touches (the aide's look, 2026-10-07)

- Today `.meta-notes` is a committed TOML file (the root marker: "Created by `meta-notes init`; keep and commit it", `mode = ...`). It would become a directory holding that config (committed) and the cache (ignored), so root discovery ("the nearest directory containing .meta-notes"), init and `.gitignore` change: mostly a **meta-notes** change (scripts/meta_notes/init.py, cli.py, calendar.py, ui.py).
- meta-notes-ui: server/paths.ts, start.ts, fixture.ts, deploy-update.test.ts, deploy/meta-notes-ui.service (`--token-file`) and deploy/nuc.md; the human's installed unit would need its token path changed, and existing roots a migration.
