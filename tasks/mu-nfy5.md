+++
id = "mu-nfy5"
title = "File tree: collapse and expand it at any window size (<< button), and drag to resize it"
kind = "feature"
state = "planned"
created_at = "2026-10-10T14:28:55.947Z"
updated_at = "2026-10-10T15:33:16.133748724Z"
created_by = "external:aide"
watchers = ["external:aide"]
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
