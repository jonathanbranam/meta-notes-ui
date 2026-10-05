+++
id = "mu-wfbc"
title = "v1.2 meta-notes rendering: wiki links, frontmatter, tags, tasks, Time Block"
kind = "feature"
state = "open"
created_at = "2026-10-05T02:19:50.743Z"
updated_at = "2026-10-05T02:22:48.769099280Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
+++

original id: wfbc
docs/tickets/open/v1-2-meta-notes-rendering-wiki-links-frontmatter-tags-tasks-wfbc.md

## Thread

### note · agent:rendering · 2026-10-05T02:22:48.769Z
done: v0.2.0, commit bf3be44. npm run check green: 51 tests in 7 files (new: shared/links, client/markdown, backlinks in app.test), tsc + server/client build OK. Notes: (1) the Time Log in meta-notes is a list under '### Log', not a table; rendered as an ordinary list, no special styling. (2) Link resolution: root path, then relative to the note, '.md' added, 'x' also finds x/Home.md; no basename search, as the plugin has none. (3) A 60s client timer only moves the current Time Block row. (4) No new dependencies. No meta-notes changes needed.
