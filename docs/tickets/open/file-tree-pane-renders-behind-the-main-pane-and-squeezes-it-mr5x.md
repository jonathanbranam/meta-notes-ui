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

## More from the human (2026-10-11 00:25 ET, verbatim)

"Small windows like mobile work fine.

as soon as it expands past the mobile size the left sidebar starts being visible on the RIGHT side, underneath the main content, pushing the main content to the left. when I hide the left sidebar, it actually gets bigger and squishes the entire main view to about 20 pixels. And it still seems to be anchored to the right."

So, above the mobile breakpoint in Chrome: the tree lays out on the right, under the main content; collapsing it (`<<`) makes the tree wider instead of hiding it and squeezes the main view to about 20 px. Looks like the grid/flex columns are swapped or the collapsed width is applied to the wrong column. Screenshots are on the human's Mac; to be attached.

## Screenshots (the human's, Chrome on macOS, 2026-10-11 00:22 ET)

- [Expanded](../assets/mr5x-expanded.png): the main content (Today, Time Block) sits at the left in a narrow column; the tree's column is on the right, with only a sliver of a bar and a button edge at its top right. The tree's own content isn't visible.
- [Collapsed with `<<`](../assets/mr5x-collapsed.png): the `>>` button shows at top left, but the main content is squeezed to about 40 px ("To / 20 / 10 / 11", the table cut off); the rest of the window is empty.
