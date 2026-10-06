---
id: scpr
title: "Route tracking: record the drive's path and compare routes to work and school"
kind: feature
opened: 2026-10-06
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [ma6v]
tasks: []
---

## The ask

From the human, via advisor (notes project, message m-0097, 2026-10-06), verbatim:

"2. I think it would be really awesome to use location services to actually track my path, figure out the best route to get to work and keep, and school, like the kids' school too, especially. It would keep a record of which ways I went and which ways were actually faster."

## The ask

- While a trip is running (the Left / Arrived trip timer ticket), record the path with location services.
- Keep a history per destination (work, the kids' school) of which route was taken and how long it took, and show which routes are faster.

## Open questions

- A web app (PWA) gets location only while it's open in the foreground; recording a whole drive in the background likely needs a native app or another tracker. Needs research before design.
- Where the path data lives (the notes root or the app's own store).

Pending: idea only, no task until the human approves it.
