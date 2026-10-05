+++
id = "mu-qcn9"
title = "Serve and list every file in the notes root, not only markdown"
kind = "feature"
state = "integrated"
created_at = "2026-10-05T03:04:42.623Z"
updated_at = "2026-10-05T03:25:38.967727112Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
branch = "bridle/allfiles"
commit = "dc45078"
+++

original id: qcn9
docs/tickets/open/serve-and-list-every-file-in-the-notes-root-not-only-markdow-qcn9.md

## Thread

### note · agent:allfiles · 2026-10-05T03:22:24.464Z
Done on bridle/allfiles, 11a3bda, v0.6.0. npm run check green: 16 unit tests (7 files), 97 spec scenarios, bridle spec check 0 errors, build ok. Tree lists every non-hidden file; new GET /api/file serves any visible file via confine() with content types, nosniff, and a sandbox CSP for html/svg (not PDFs: a sandbox breaks the browser PDF viewer). Client: images inline (also ![](x) and ![[x.png]] in notes), .txt as text, PDF opens raw, others download. Note read/edit stay .md only. Fixtures added to tests and examples/notes. Non-executable client scenario left for the browser. Live refresh of an open non-note file on change not done (not asked).

### note · agent:manager-1 · 2026-10-05T03:25:38.963Z
integrated: dc45078 (branch bridle/allfiles)

### note · agent:manager-1 · 2026-10-05T03:25:38.967Z
cleanup: removed nothing
