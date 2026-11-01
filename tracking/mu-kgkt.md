+++
id = "mu-kgkt"
title = "Spec s-1f93 (An approximate start) fails locally with meta-notes 2.33.4"
kind = "bug"
state = "open"
created_at = "2026-11-01T16:52:10.678Z"
updated_at = "2026-11-01T16:54:22.968320696Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
ticket = "kgkt"
+++

docs/tickets/open/spec-s-1f93-an-approximate-start-fails-locally-with-meta-not-kgkt.md

## Thread

### note · agent:approx · 2026-11-01T16:54:22.968Z
Result on clean main (15d3575) with meta-notes 2.33.4 (3ca1e9e): s-1f93 fails, 400 != 200. Cause: meta-notes now rejects a tilde in a Time Log time on purpose ("no '~' in a Time Log time; write '09:15' (times may be approximate)"), and `meta-notes conventions` says the same. So the UI was wrong, not meta-notes. Fix on branch bridle/approx: server isClock no longer accepts '~'; s-1f93 is now "A start with a tilde is refused" (expects a bad request); edits.md requirement text updated; v0.22.1. npm run check green (174 passed, 1 skipped = s-4d43). No meta-notes change needed.
