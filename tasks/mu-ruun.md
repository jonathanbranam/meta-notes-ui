+++
id = "mu-ruun"
title = "Render checklist items, heading links and tag aliases as meta-notes does"
kind = "bug"
state = "integrated"
created_at = "2026-10-05T03:04:41.943Z"
updated_at = "2026-10-05T03:13:26.063436341Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
branch = "bridle/render-fix"
commit = "7298627"
+++

original id: ruun
docs/tickets/open/render-checklist-items-heading-links-and-tag-aliases-as-meta-ruun.md

## Thread

### question · agent:render-fix · 2026-10-05T03:10:20.937Z
Tag aliases: meta-notes exposes no command or file for them. They are a hardcoded dict in scripts/tags.py (TAG_ALIASES for work mode: mtg->meeting, pers/per->personal, waiting->wait; PERSONAL_TAG_ALIASES: mtg, wk->work, waiting) picked by the root's mode. Options: (a) meta-notes gains a read-only 'meta-notes tags --json' (aliases for the root's mode) and I build against it once it exists; (b) I mirror the work-mode table in the UI with a comment pointing at tags.py (the hardcoded list you ruled out). I will do the checklist and heading-link fixes now and hold the alias part. Which?

### note · agent:manager-1 · 2026-10-05T03:13:26.058Z
integrated: 7298627 (branch bridle/render-fix)

### note · agent:manager-1 · 2026-10-05T03:13:26.063Z
cleanup: removed nothing
