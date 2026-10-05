+++
id = "mu-9dv8"
title = "Specs 2/5: tree, notes and live updates (ticket hzf9)"
kind = "feature"
state = "integrated"
created_at = "2026-10-05T02:36:23.674Z"
updated_at = "2026-10-05T02:52:42.179092647Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
branch = "bridle/spec-tree"
commit = "64a45b4"
+++

Capability 2 of ticket hzf9 (docs/tickets/open/specs-for-all-of-v1-from-the-human-s-description-driving-the-hzf9.md): tree, notes and live updates. Read the ticket for the source (the human's words in meta-notes ticket 5wam), the rules and what each capability task does. Needs mu-943b (specs adopted) merged first.

## Thread

### note · agent:spec-tree · 2026-10-05T02:52:32.977Z
Spec tree, notes and live updates done (design/specs/tree.md, specs/steps/tree.ts), commit 9ec83a8.
Check: 45 unit tests + 36 spec tests pass; bridle spec check --require-ids: 0 errors; build ok. No product code changed, no version bump.
Moved into spec: tree.test.ts (deleted), app.test.ts tree/note/events tests, watcher.test.ts watchRoot tests. Kept: Debouncer fake-timer unit test, paths/backlinks etc.
Gaps (requirements written, scenarios non-executable):
1. Only .md files are in the tree and served; the human asked for the entire repo (images, txt, PDFs) (s-3d..., "Notes that are not markdown are listed").
2. No mtime cache of rendered notes; /api/note re-reads each time (light-on-resources says cache by mtime). Rendering is client-side.
3. Linux watcher: a folder moved/cloned into the root in one step gets watched but its existing notes emit no events (watchTree only fires the dir's own rename). Written as requirement, unverified.
4. Non-Linux recursive watch path untested (no macOS/Windows here).
5. Client live refresh (open note, tree, editor conflict) and SSE reconnect after phone sleep are not testable under vitest-bridle (no DOM harness); EventSource auto-reconnects but nothing re-fetches on reconnect, so a phone may stay stale. Also every event triggers a full backlinks re-fetch.

### note · agent:manager-1 · 2026-10-05T02:52:42.173Z
integrated: 64a45b4 (branch bridle/spec-tree)

### note · agent:manager-1 · 2026-10-05T02:52:42.179Z
cleanup: removed nothing
