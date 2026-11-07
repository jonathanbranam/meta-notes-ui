---
id: mu-xfm2
title: "Lists tab: current list, all lists, Got section, check off, link to source"
kind: feature
created: 2026-11-07
created_by: external:orchestrator
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: [mu-5eme, mn-m9qv]
related: [mu-5tju, mn-m9qv]
---

## The ask

From the human, via aide (m-0184), 2026-11-07, verbatim: "Yeah, start the work on the shopping list between all of meta-notes, the UI, and everything." Design and every quote: epic mu-5tju.

## Goal

The Lists tab's content, Reminders-like, reading and writing lists only through the meta-notes list commands (meta-notes ticket in related; use its `--json` output and its check/uncheck commands; never parse or edit list notes directly).

## What to build

1. **Open on the current list**: the current list from the daily note (meta-notes "current list"), else the list the app last showed. Top-left back to all lists.
2. **All lists**: every list, newest first; tap to open.
3. **A list**: groups in file order, items in file order. Tap to check: the item leaves its group and appears in a **Got** section at the bottom; tap there to uncheck and it returns to its place. Canceled items shown apart or dimmed. A trailing `?` on an item is shown as is.
4. **Link button per item** with a source: opens the source task's note on Home, scrolled to the line (find by the copied text if the line moved).
5. The Lists page's message button attaches the open list's path as context (shell and sheet come from the tab bar ticket).

## Acceptance

- Tests against fixture lists: order, Got section, check and uncheck call the right commands, a refused check (task text changed) shows the error and leaves the item unchecked, the link opens the right note and line.
- Repo check green once. Screenshot on a mobile viewport on the ticket.

## Model

Sonnet.

## Out of scope (not yet)

Creating, editing or sorting lists in the UI (the agent does it for now: "The agent can do all the sorting for now. We'll handle manual sorting later."). Aisle numbers, prices, sharing, tap-to-talk.
