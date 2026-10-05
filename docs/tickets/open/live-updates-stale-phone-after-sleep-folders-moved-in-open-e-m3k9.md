---
id: m3k9
title: "Live updates: stale phone after sleep, folders moved in, open editors"
kind: bug
opened: 2026-10-05
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [hzf9, 9dv8, mfjg]
tasks: [mu-m3k9]
---

## The ask

Gaps from the tree and edits specs (mu-9dv8, mu-mfjg); the human: 'update immediately like vim'.
- After a phone sleeps, EventSource reconnects but nothing re-fetches, so the view stays stale. Re-fetch the open note and tree on reconnect.
- Linux watcher: a folder moved or cloned into the root in one step is watched, but its existing notes emit no events; emit added for its files.
- An open editor learns of a disk change only when saving; show the change (or conflict) as soon as it arrives.
- Every event triggers a full backlinks re-fetch; fetch only when the change can affect them.
Make the scenarios executable where vitest-bridle allows (browser ones can't yet: myeg, br-ekfw). Patch bump.
