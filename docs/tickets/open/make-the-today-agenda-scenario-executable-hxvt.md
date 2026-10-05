---
id: hxvt
title: Make the Today agenda scenario executable
kind: chore
opened: 2026-10-05
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [hzf9, h848]
tasks: []
---

## The ask

From the today spec (mu-h848): the agenda scenario is non-executable because the test root has no Google Calendar export in .meta-notes-cache/ics/, and meta-notes calendar needs the root's .venv (meta-notes init builds it). Add a small fixture export to the test root and bind the scenario; skip it with a clear reason when the venv can't be built. No bump.
