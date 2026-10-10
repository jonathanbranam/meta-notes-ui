+++
id = "mu-nfy5"
title = "File tree: collapse and expand it at any window size (<< button), and drag to resize it"
kind = "feature"
state = "integrated"
created_at = "2026-10-10T14:28:55.947Z"
updated_at = "2026-10-10T15:36:46.215948234Z"
created_by = "external:aide"
watchers = ["external:aide"]
branch = "bridle/treepane"
commit = "92217c7"
ticket = "nfy5"
+++

Goal: the human controls the left file tree at any window size (ticket nfy5 has the human's words).
1. A `<<` control at the tree's top collapses it, and the tree disappears. A small button on the left edge brings it back. This works at every window size, not only in the existing small-screen collapse.
2. The tree's width can be dragged by its right edge, between a sensible min and max.
3. The browser remembers both the collapsed state and the width (localStorage), so a reload keeps them. This is a small assumption, not in the ask.
Keep the existing small-screen behaviour working, and keep it consistent with the new control.

Likely files: the app shell and layout component and its CSS, and the file tree component. Read them first.
Check: the project's check is green, with a test for collapse/expand and for the persisted width where the test setup allows. Describe what you tried by hand in your done summary. The human reviews it live, so no screenshots are needed.
Out of scope: keyboard shortcuts, collapsing other panes, touch-drag on the phone (the phone keeps today's behaviour).
Model: sonnet.

## Thread

### note · external:orchestrator · 2026-10-10T15:23:43.580Z
Readied by human via orchestrator. The human, relayed by aide (m-0456): "I will just ship it, and I will review it live."

### note · agent:treepane · 2026-10-10T15:36:33.688Z
Done at 14e8773 (v0.18.0). npm run check green: 149 tests passed (incl. spec scenarios in design/specs/treepane.md and client/src/treepane.test.ts), build ok. Not tried in a browser (no browser tool here); the layout is CSS and pointer-drag, so please review live. Small-screen drawer CSS is untouched: <<, >> and resize handle are hidden at 720px and below. README status line said v0.15.0; set to v0.18.0.

### note · agent:manager-1 · 2026-10-10T15:36:46.213Z
integrated: 92217c7 (branch bridle/treepane)

### note · agent:manager-1 · 2026-10-10T15:36:46.215Z
cleanup: removed nothing
