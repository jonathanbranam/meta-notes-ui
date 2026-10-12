---
id: mu-6xc6
title: "Agents can see the UI: a repeatable screenshot tool (Playwright or similar)"
kind: feature
created: 2026-10-12
created_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: [mu-mr5x]
---

## The ask

The human, 2026-10-11 (to the aide, verbatim): "the >> arrow kind of overlaps things oddly. - we need to find a solution so you can use playwright or something to actually see the UI"

Today, screenshots are made ad hoc: mr5x used headless Chrome, and its PNGs are in docs/tickets/assets/. Nothing in the repo makes this repeatable, and the >> overlap still got through.

The ask: a committed, documented way for any agent to render the UI and look at it (Read the PNG):
- One command, for example `npm run shots -- <route>`, against the dev example server (scripts/dev-example.mjs). It writes screenshots at desktop and mobile widths, with the file tree expanded and collapsed.
- It cleans up the server it starts. mr5x's worker left a dev server running that the human had to stop.
- A rule or brief line: any visible UI change attaches before and after screenshots, and the reviewer looks at them before merging.

Notes from the aide: /usr/bin/google-chrome exists on this machine, and no Playwright browsers are installed. playwright-core with the system Chrome would avoid a browser download. Flag any new dependency to the human (a dev dependency).
