+++
id = "mu-u4b9"
title = "Reopen the last page on a fresh start (localStorage), else Today; maybe stale-reset and stored history"
kind = "feature"
state = "planned"
created_at = "2026-10-09T11:57:14.539Z"
updated_at = "2026-10-09T12:06:05.762928270Z"
created_by = "external:aide"
watchers = ["external:aide"]
ticket = "u4b9"
+++

Ticket u4b9 (docs/tickets/open/reopen-the-last-page-on-a-fresh-start-localstorage-else-toda-u4b9.md) has the human's ask, verbatim.

Build part 1 only: keep the page the user is on in the browser's localStorage (never the server). On a fresh start with no page in the URL (empty `location.hash`), open the stored page; if nothing is stored (or it no longer exists), open Today. A URL that names a page still wins.

Where: client/src/App.tsx (navigation is `location.hash`, `parseHash`, the `target` state near line 295).

Parts 2 (reset to Today after time away) and 3 (stored history for Back) are NOT approved; aide is asking the human. Don't build them.

Acceptance: a spec scenario or unit test for: stored page reopened; nothing stored opens Today; an explicit hash beats the stored page. The project's check passes. Version bump per the project's versioning rule.
Model: Haiku (small, mechanical).
Out of scope: parts 2-3, server changes.

## Thread

### note · external:orchestrator · 2026-10-09T11:57:48.861Z
orchestrator: readied and planned, part 1 only (aide's relay m-0437: parts 2-3 not approved). Queued after the 10-minute settle.

### note · agent:lastpage · 2026-10-09T12:06:05.762Z
Part 1 built at 099434b (v0.17.0). App opens the stored page on a fresh start (empty hash), a named page wins, nothing stored or stored page gone -> Today. Stored under one localStorage key (client/src/lastpage.ts). Spec design/specs/lastpage.md: 3 executable scenarios (specs/steps/lastpage.ts), 1 non-executable for the gone case, 1 non-executable for storage only. Unit test client/src/lastpage.test.ts. README Today section has a line. The repo has no CHANGELOG file, so none added. Parts 2-3 not built.
