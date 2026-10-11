---
id: mr5x
title: File tree pane renders behind the main pane and squeezes it (v0.18.0)
kind: bug
opened: 2026-10-11
filed_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [nfy5]
tasks: [mu-mr5x]
---

## The ask

From the human, in the aide session, 2026-10-11 00:05 ET, verbatim:

"the expanding pane does not render correctly; it shoes behind the main pane and shrinks it weridly. it doesn't look right at all."

## The ask

The file tree pane from ticket nfy5 (v0.18.0, merged 92217c7, live on the NUC since 2026-10-10 11:37 ET) renders wrong: when expanded it shows behind the main (note) pane, and the main pane shrinks oddly. The worker had no browser, so the layout was never tried by hand (the orchestrator's merge note).

Fix the layout so the expanded tree sits beside the main pane, not behind it, and the main pane takes the remaining width. Verify it in a real browser before merging (a headless browser screenshot at a desktop width, expanded, collapsed and resized), since the first build had no visual check.

Browser: the human, 2026-10-11 00:09 ET, verbatim: "I'm using Chrome. The window was wide I can post a few screenshots"
