+++
id = "mu-mr5x"
title = "File tree pane renders behind the main pane and squeezes it (v0.18.0)"
kind = "bug"
state = "integrated"
created_at = "2026-10-11T04:05:12.944Z"
updated_at = "2026-10-11T13:01:49.710040353Z"
created_by = "external:aide"
watchers = ["external:aide"]
branch = "bridle/treefix"
commit = "1a7478e"
ticket = "mr5x"
+++

Bug fix (regression from mu-nfy5, v0.18.0). Ticket: docs/tickets/open/file-tree-pane-renders-behind-the-main-pane-and-squeezes-it-mr5x.md (read it, and the human's two screenshots in docs/tickets/assets/mr5x-*.png).

Symptom (Chrome, desktop width; mobile widths are fine): the file tree's column lays out on the RIGHT, under the main content, squeezing the main pane to the left. Collapsing with << makes the tree column wider and squeezes the main view to ~20-40 px; >> shows at top left. Likely the grid/flex columns are swapped, or the collapsed/dragged width is applied to the wrong column (or a grid-template/area mismatch above the mobile breakpoint).

Goal: above the mobile breakpoint the tree sits on the LEFT beside the main pane; the main pane takes the remaining width; << hides the tree and the main pane takes the full width; >> brings it back; drag-resize changes only the tree's width. Mobile behaviour unchanged.

Files likely: the app layout component and its CSS (the code mu-nfy5 / commit 14e8773 touched), and its tests.

Verify (required; the first build had no visual check): build, start the server against a test notes root, and take headless screenshots with `google-chrome --headless --screenshot=<file> --window-size=1400,900 <url>` (installed at /usr/bin/google-chrome) for: expanded, collapsed, and a narrow mobile width (e.g. 400x800). Look at each image yourself and attach or commit them on the task thread (comment with paths). Then `npm run check` green once. Patch version bump and CHANGELOG entry per the repo's rules.

Model: sonnet (layout debugging). Out of scope: any redesign of the tree pane or new features; collapse-state persistence beyond what exists.

## Thread

### note · external:aide · 2026-10-11T04:20:19.882Z
From the human, via aide: "I'm using Chrome. The window was wide I can post a few screenshots" (screenshots to follow on the ticket).

### note · external:aide · 2026-10-11T04:23:18.172Z
From the human, via aide (verbatim, also on ticket mr5x): "Small windows like mobile work fine. as soon as it expands past the mobile size the left sidebar starts being visible on the RIGHT side, underneath the main content, pushing the main content to the left. when I hide the left sidebar, it actually gets bigger and squishes the entire main view to about 20 pixels. And it still seems to be anchored to the right."

### note · external:aide · 2026-10-11T04:26:11.808Z
The human's two screenshots are on ticket mr5x: docs/tickets/assets/mr5x-expanded.png and mr5x-collapsed.png (commit d470e8d).

### note · agent:treefix · 2026-10-11T13:01:35.248Z
Fixed in 7d29909 (v0.18.1). Cause: .tree-resize is explicitly placed at col 1 row 2, so the auto-placed nav.drawer moved to col 2. Now .drawer and main have explicit grid-column/row (mobile main: col 1). Screenshots (looked at each): docs/tickets/assets/mr5x-fixed-expanded.png, mr5x-fixed-collapsed.png (1400x900), mr5x-fixed-mobile.png (400x800). Collapsed was set via localStorage in headless Chrome over CDP. Side finding, not fixed: scripts/dev-example.mjs calls 'bridle port allocate' but the subcommand is 'bridle port alloc'; without --port it falls back to a random port. check green (45 + 149 tests).

### note · agent:manager-1 · 2026-10-11T13:01:49.310Z
integrated: 1a7478e (branch bridle/treefix)

### note · agent:manager-1 · 2026-10-11T13:01:49.710Z
cleanup: removed agent treefix, branch bridle/treefix
