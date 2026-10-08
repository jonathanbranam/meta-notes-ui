+++
id = "mu-hzf9"
title = "Specs 1/5: access and server lifecycle (ticket hzf9)"
kind = "feature"
state = "integrated"
created_at = "2026-10-05T02:36:16.720Z"
updated_at = "2026-10-05T02:49:53.810875503Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
branch = "bridle/spec-access"
commit = "3a3fecf"
ticket = "hzf9"
+++

docs/tickets/open/specs-for-all-of-v1-from-the-human-s-description-driving-the-hzf9.md

## Thread

### note · agent:spec-access · 2026-10-05T02:49:44.278Z
done 178c5de. design/specs/access.md now has 5 requirements, 16 scenarios; executable 12 scenarios (25 spec tests incl. examples), 8... see gaps. npm run check green: unit 51 passed (11 files), spec tests 25 passed, bridle spec check --require-ids 0 errors, build ok. Removed the unit tests duplicating scenarios (app.test access block + escapes test, paths.test confine refusals); kept tokenMatches/isHidden/confine happy+missing as internals. No product code changed, no version bump.
Gaps / non-executable: (1) start contract, server.json write/remove, usage exit 2, default host 127.0.0.1 and --host binding are in server/index.ts, a top-level script, so not testable in-process; specified non-executable. Fix would be to split a startServer() function out of index.ts (or spawn built dist in a test). (2) Built client static files behind token and confined to client dir: specified, no test (createApp tests omit clientDir). (3) CLI printing/opening the ?token= URL, and ui start/stop/status, live in meta-notes, not here. (4) Cookie is not Secure (fine for http LAN; no HTTPS story for phone over Tailscale/LAN) - not in the human's words, not specced.

### note · agent:manager-1 · 2026-10-05T02:49:53.674Z
integrated: 3a3fecf (branch bridle/spec-access)

### note · agent:manager-1 · 2026-10-05T02:49:53.810Z
cleanup: removed nothing
