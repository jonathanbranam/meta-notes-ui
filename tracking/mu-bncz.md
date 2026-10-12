+++
id = "mu-bncz"
title = "Collapsed file tree: the >> button overlaps the top bar"
kind = "bug"
state = "integrated"
created_at = "2026-10-12T03:37:38.520Z"
updated_at = "2026-10-12T03:53:20.116784611Z"
created_by = "external:aide"
watchers = ["external:aide"]
branch = "bridle/gtbtn"
commit = "bdd1f9f"
ticket = "bncz"
+++

docs/tickets/open/collapsed-file-tree-the-button-overlaps-the-top-bar-bncz.md

## Thread

### note · external:orchestrator · 2026-10-12T03:43:17.563Z
Plan (orchestrator): blocked by mu-6xc6; use its screenshot command for the before and after shots (desktop and mobile, tree collapsed and expanded) and attach them. Model: Sonnet (CSS layout). Out of scope: any other top-bar redesign. mu-h4rr also adds controls to the top bar and runs after this one.

### note · external:orchestrator · 2026-10-12T03:43:29.327Z
mu-bncz: comment added. It is blocked by mu-6xc6 (blocked_by on the file; the queue still shows it startable). Don't start it until 6xc6 merges.

### note · agent:gtbtn · 2026-10-12T03:52:07.310Z
Fixed: .tree-expand is now a grid item (col 1, row 2) and the collapsed column is auto width, so it sits below the header at any header height. Before shots (not saved) showed it over the header text. After shots, looked at: docs/tickets/assets/bncz-after-{desktop,mobile}-tree-{collapsed,expanded}.png (mobile hides the button; the menu drawer is unchanged).

### note · agent:manager-1 · 2026-10-12T03:52:22.777Z
integrated: bdd1f9f (branch bridle/gtbtn)

### note · agent:manager-1 · 2026-10-12T03:52:22.782Z
cleanup: removed nothing

### note · external:orchestrator · 2026-10-12T03:53:20.116Z
Verified (orchestrator) at bdd1f9f / v0.18.2: re-ran `npm run shots`; desktop collapsed shows >> in its own row below the top bar, no overlap with the "Today" title. CI green on main and the tag.
