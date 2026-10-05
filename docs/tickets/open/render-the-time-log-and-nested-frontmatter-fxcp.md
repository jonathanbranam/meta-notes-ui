---
id: fxcp
title: Render the Time Log and nested frontmatter
kind: feature
opened: 2026-10-05
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [hzf9]
tasks: [mu-fxcp]
---

## The ask

Gaps from the rendering spec (mu-pfgp), in the approved v1 shape ('Time Block and Time Log tables', 'frontmatter as a property panel'):
- Time Log entries under ### Log render as a plain list; show each entry's start, end and duration (meta-notes conventions say how entries are written).
- Frontmatter lists and nested values show as flat comma text; render lists as lists and links in values as links.
Make the scenarios executable. Minor bump. (The worker also proposed a Plan vs Actual view of the Time Block; not asked for, so not in this ticket.)
