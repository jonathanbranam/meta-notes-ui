---
id: mu-rwk3
title: "Week view page: desktop grid with fill-in and error styles, ranges 7/5/2"
kind: feature
created: 2026-11-07
created_by: external:orchestrator
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: [mu-rb5u]
related: [mu-adm2]
parent: mu-adm2
---

## The ask

From the human, via aide (m-0189), 2026-11-07, verbatim: "I approve the rest of it. Let's go ahead and start building this, and as I work on it and see how it works, I'll have further feedback." Design and every quote: epic mu-adm2. Second child; uses the week endpoint and cascade from the first child (blocked by it). Render only; never re-decide a slot's source in the client.

## What to build

A desktop-browser week page (no bottom tab bar; reachable from the desktop navigation as it is today):

- A column per day, 15-minute rows; range picker 7 days / 5 weekdays / 2-day weekend, kept in the URL; previous/next week.
- Before now: Time Log blocks in the normal style with no badge; fill-ins (Actual, Plan, Calendar) in one shared fill-in style with a tiny source badge (A, P, Cal).
- After now: Time Block plan in the normal style; calendar events in their own style with a badge.
- Error slots in an error style with their short label; "in the future" errors in their own error style.
- A "now" line on today.
- Tasks due that day in a collapsible list at the top of each column.
- Live updates like the rest of the UI.

## Acceptance

- Component tests for each style and badge, the range picker and the collapsible task list, against fixture endpoint data.
- Repo check green once; a desktop screenshot of a mixed week on the ticket.

## Model

Sonnet.

## Out of scope (not yet)

Week note Goals/Plan, editing, mobile layout, drag to reschedule. The human expects to iterate after using it; keep styles simple to change.
