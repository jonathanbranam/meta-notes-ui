---
id: mu-bgb6
title: "Build fails on macOS: client files differ only by case (timelog.ts / TimeLog.tsx and two more)"
kind: bug
created: 2026-11-09
created_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
resolved: 2026-11-09T15:14:07Z
---

## The ask

From the human (2026-11-09, by email to aide, verbatim): "Please investigate and fix:" with this
output from a fresh clone, `npm ci && npm run build`, on macOS with Node 22.23.2:

    client/src/TodayView.tsx (2:9): "TimeLogPanel" is not exported by "client/src/timelog.ts",
    imported by "client/src/TodayView.tsx".

## Cause (aide)

Not the Node version. macOS file systems ignore case by default, and `client/src/` has three pairs
of files whose names differ only by case, with different extensions:

- `timelog.ts` and `TimeLog.tsx`
- `tagview.ts` and `TagView.tsx`
- `menu.ts` and `Menu.tsx`

`import "./TimeLog"` tries `.ts` before `.tsx`, and on a case-insensitive disk `TimeLog.ts` matches
`timelog.ts`. vesta (Linux, case-sensitive) never sees it.

## Fix

Rename so no two paths under `client/src` differ only by case, for all three pairs, updating imports
and tests; keep behavior unchanged. Add something to `npm run check` that fails on case-only
collisions among tracked source paths (ignoring extension), so this can't return.

## Check

No two tracked source paths match when lowercased and stripped of their extension; `npm run check`
is green; the build passes on a case-insensitive file system, or a test simulates it.
