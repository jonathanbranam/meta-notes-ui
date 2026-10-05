---
id: wfbc
title: "v1.2 meta-notes rendering: wiki links, frontmatter, tags, tasks, Time Block"
kind: feature
opened: 2026-10-05
repos: [meta-notes-ui]
changes: []
specs: []
needs: [83ya]
see: []
tasks: [mu-wfbc]
---

## The ask

Render meta-notes conventions (see `meta-notes conventions` and the
plugin's link resolution in meta-notes `autoload/meta_notes/notes.vim` /
`scripts/notes.py`):

- `[[wiki links]]` and `[[path|alias]]`, resolved like the plugin
  (relative and root paths, folder notes); missing targets styled.
- Frontmatter as a property panel.
- Tags (`#tag`), task lines with status, 📅 ⏳ 🛫 🔁 ✅ and times shown as
  chips; overdue in red.
- The daily note's Time Block and Time Log tables, struck-out plans
  (single tildes), `no plan` rows, the current time's row highlighted.
- Backlinks for the open note.

Unit tests on the markdown plugins with real-shaped fixture notes.
