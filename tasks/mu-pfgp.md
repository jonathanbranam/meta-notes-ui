+++
id = "mu-pfgp"
title = "Specs 3/5: rendering of meta-notes conventions (ticket hzf9)"
kind = "feature"
state = "integrated"
created_at = "2026-10-05T02:36:23.863Z"
updated_at = "2026-10-05T02:56:02.589575447Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
branch = "bridle/spec-render"
commit = "ee3329b"
+++

Capability 3 of ticket hzf9 (docs/tickets/open/specs-for-all-of-v1-from-the-human-s-description-driving-the-hzf9.md): rendering of meta-notes conventions. Read the ticket for the source (the human's words in meta-notes ticket 5wam), the rules and what each capability task does. Needs mu-943b (specs adopted) merged first.

## Thread

### note · agent:spec-render · 2026-10-05T02:55:52.323Z
Done on bridle/spec-render (4c82a2a): design/specs/rendering.md (7 requirements, 29 scenarios, 24 executable) with steps in specs/steps/rendering.ts. npm run check green: 28 unit tests (was 45; 17 moved into the spec), 60 spec tests, bridle spec check 3 files 0 errors, build ok. No product code changed, no version bump.

Gaps (requirements written, scenarios non-executable):
1. Time Log (### Log entries) has no rendering at all: plain list; no start/end/duration timeline.
2. Frontmatter lists and nested values show as flat comma text; no links in values.
3. [[path#heading]] links open the note but ignore the anchor.
4. Tag aliases (#mtg = #meeting etc.) are not folded; data-tag is the literal tag.
5. Task notes and subtasks: render as nested markdown list only, no per-line chips verified (non-executable).
6. Time Block: no at-a-glance Actual vs Plan comparison (my addition from "feel like Obsidian"; drop if unwanted).
7. Non-markdown files not rendered (already in tree spec).
Also: checkbox lines without dates render as tasks (meta-notes says they are checklist items, never tasks); spec scenario s "A checklist item without dates" records current behaviour.

Spec system trouble:
- Step text may not hold markup (backticks, <code>); bridle spec check rejects it, so scenarios can't quote raw markdown with code or HTML. I worked around with phrasing and by normalising HTML quotes in steps.
- bridle spec id on a file already holding ids I hand-wrote added duplicate ledger entries; I reset .ids and re-ran.
- Rendering tests need a DOM-free path: used react-dom/server renderToStaticMarkup, fine.

### note · agent:manager-1 · 2026-10-05T02:56:02.584Z
integrated: ee3329b (branch bridle/spec-render)

### note · agent:manager-1 · 2026-10-05T02:56:02.589Z
cleanup: removed nothing
