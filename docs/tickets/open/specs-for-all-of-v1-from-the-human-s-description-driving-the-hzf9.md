---
id: hzf9
title: Specs for all of v1, from the human's description, driving the tests
kind: feature
opened: 2026-10-05
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [83ya, wfbc, eqqv, 35z9]
tasks: [mu-hzf9]
---

## The ask

The human, 2026-10-05: file tasks "to come back and look at the ticket
that was originally filed when I describe the functionality that I want,
and to build specs for everything. Those specs should be really what
drives the majority of the testing."

The source is the human's own words in meta-notes ticket 5wam
(`/srv/shared/work/meta-notes-work/meta-notes/docs/tickets/open/live-view-of-the-notes-web-app-at-work-and-mobile-app-for-pe-5wam.md`,
"The ask" and "v1 direction"), then this repo's v1 tickets (83ya, wfbc,
eqqv, 35z9, 5dj2) and the rules in `.bridle/rules/`. Spec what was asked,
not just what was built: where the code falls short of the description,
write the requirement anyway, mark its scenarios non-executable, and list
the gap in the report (the orchestrator files tickets for them).

Capabilities (one task each, in this order; each writes its spec file,
binds its scenarios as executable through vitest-bridle, and moves
existing unit tests that duplicate a scenario into the spec, keeping
unit tests only for internals):

1. access and server lifecycle (token, cookie, host binding, path
   confinement, start contract and server.json);
2. tree, notes and live updates (file tree, note read, watcher, SSE,
   debounce, hidden trees);
3. rendering of meta-notes conventions (links, frontmatter, tags, tasks,
   Time Block and Time Log, backlinks);
4. edits through the CLI (task check-off, raw block edit, conflicts, new
   note);
5. today view, alerts and reminders, PWA.
