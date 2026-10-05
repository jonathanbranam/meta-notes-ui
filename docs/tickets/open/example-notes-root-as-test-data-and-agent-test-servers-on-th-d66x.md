---
id: d66x
title: Example notes root as test data, and agent test servers on their own ports
kind: chore
opened: 2026-10-05
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [83ya, eqqv]
tasks: [mu-d66x]
---

## The ask

The human, 2026-10-05: "you can, during testing or when needed, create
your own server on a different port. Probably, for certain types of
testing, you'll need an example notes repo. Probably the easiest thing to
do is set one of those up as test data that you can keep adding
functionality to for verification."

- `examples/notes/`: a small but real meta-notes root, committed:
  `.meta-notes` (work mode), PPARA folders, `resource/template/` as
  `meta-notes init` installs them, today-relative daily notes are not
  possible in a static fixture, so include a few dated daily and weekly
  notes plus a script or test helper that copies the root to a temp dir
  and creates today's daily note there with `meta-notes note daily`.
  Content that exercises every convention the UI renders: wiki links
  (path, alias, folder note, missing), frontmatter, tags, tasks with
  📅 ⏳ 🛫 🔁 ✅ and times, subtasks and task notes, a Time Block with
  struck and `no plan` rows, a Time Log, tables.
- Tests and spec steps use a temp copy, never the committed files and
  never the human's notes. Writes in tests go through the real
  `meta-notes` CLI against the temp copy.
- `npm run dev:example`: builds, copies the example to a temp root and
  starts the server there on a port from `bridle port allocate` (or
  `--port`), printing the URL with token; stopping it releases the port.
  This is how agents run their own server for manual checks; it never
  touches the human's always-on server or its port.
- A short `examples/notes/README.md`: what's in it; add to it whenever a
  feature needs new content to verify (say so in the workers' role doc).
