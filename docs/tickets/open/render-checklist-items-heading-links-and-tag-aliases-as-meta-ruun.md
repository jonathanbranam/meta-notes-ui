---
id: ruun
title: Render checklist items, heading links and tag aliases as meta-notes does
kind: bug
opened: 2026-10-05
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [hzf9, pfgp]
tasks: [mu-ruun]
---

## The ask

Gaps from the rendering spec (design/specs/rendering.md, mu-pfgp), all in the human's 'understand all of my links and conventions':
- A checkbox line with no dates is a checklist item, not a task (meta-notes conventions). It renders as a task now, and scenario 'A checklist item without dates' records that; change the scenario to the intended behavior and make it pass.
- [[path#heading]] opens the note but ignores the heading; scroll to it.
- Tag aliases (#mtg = #meeting, from meta-notes' tags) aren't folded; data-tag should be the canonical tag.
Make those scenarios executable. Patch or minor bump as fits.
