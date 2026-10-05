+++
id = "mu-mfjg"
title = "Specs 4/5: edits through the CLI (ticket hzf9)"
kind = "feature"
state = "integrated"
created_at = "2026-10-05T02:36:24.051Z"
updated_at = "2026-10-05T02:58:37.572064492Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
branch = "bridle/spec-edits"
commit = "6a20855"
+++

Capability 4 of ticket hzf9 (docs/tickets/open/specs-for-all-of-v1-from-the-human-s-description-driving-the-hzf9.md): edits through the CLI. Read the ticket for the source (the human's words in meta-notes ticket 5wam), the rules and what each capability task does. Needs mu-943b (specs adopted) merged first.

## Thread

### note · agent:spec-edits · 2026-10-05T02:58:28.396Z
Gaps (spec written, non-executable):
1. Reopening a done task / other statuses (rescheduled, canceled, partial): the UI only toggles [ ] <-> [x].
2. Editing a whole note as raw markdown: only blocks (paragraph, list item, table) open for edit.
3. An open editor learns of a disk change at once: it only shows the conflict on save.
4. Time Block / Time Log edit, add a task, move/rename/archive: no routes or UI.
5. Conflict display, draft kept, inline CLI errors: implemented in App.tsx but client-only, no browser test (ticket myeg).
Spec system: no trouble; multiple WHEN/THEN pairs in one scenario worked. Note 'git merge main' fails with a dirty tree, so commit first.
Removed server/edits.test.ts (all 8 tests duplicated scenarios or are covered). No product code changed, no version bump.

### note · agent:manager-1 · 2026-10-05T02:58:37.568Z
integrated: 6a20855 (branch bridle/spec-edits)

### note · agent:manager-1 · 2026-10-05T02:58:37.572Z
cleanup: removed nothing
