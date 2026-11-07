---
id: mu-5eme
title: Mobile bottom tab bar (Now, Home, Lists) and one shared message sheet
kind: feature
created: 2026-11-07
created_by: external:orchestrator
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: [mu-q6e7]
related: [mu-5tju]
---

## The ask

From the human, via aide (m-0184), 2026-11-07, verbatim: "Yeah, start the work on the shopping list between all of meta-notes, the UI, and everything." Design and every quote: epic mu-5tju (read the "tabs now", "messages from the list" and desktop/mobile parts).

## Goal

The navigation shell for Lists, so the Lists content (separate ticket, needs the meta-notes list commands) has somewhere to live, and the one message convention both pages share.

## What to build

1. **Bottom tab bar, mobile only**: tab order Now, Home, Lists (the human, 2026-11-07, via aide m-0187: "this Now tab should be the first one on the left"). Home is today's app, unchanged; Lists is new; Now comes with mu-97fh (blocked by this ticket), so leave its slot first and the bar easy to extend. No tab bar in a desktop browser (the human: "I don't really want a tab bar along the bottom in the browser"); desktop keeps today's navigation for now. The tab is in the URL so reload and back work.
2. **Lists page shell**: top-left button back to "all lists"; an empty state until the Lists content ticket lands. The app remembers the last page and list it showed.
3. **One message convention**: the existing message button's sheet becomes one shared component used by Home and Lists (the button may differ per page; the sheet does not). Fire-and-forget to the notes aide (the server's `--bridle-to`; external:aide), page context attached (on Lists: the list's path once known), text area that takes Wispr Flow dictation, Enter submits, a big easy-to-hit Send button, no reply shown.

## Acceptance

- Tests: tab bar renders on a mobile viewport and not on desktop; switching tabs keeps state; the shared sheet sends with context and submits on Enter.
- Repo check green once. Screenshot of mobile Home and Lists on the ticket.

## Model

Sonnet (layout and a shared-component refactor).

## Out of scope (not yet)

List content, check-off and the link button (the Lists content ticket). Desktop navigation (not designed yet). Replies in the message sheet (the human: "fire-and-forget").
