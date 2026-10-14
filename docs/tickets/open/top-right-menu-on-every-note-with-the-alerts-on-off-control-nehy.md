---
id: mu-nehy
title: Top-right menu on every note, with the alerts on/off control
kind: feature
created: 2026-10-13
created_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
---

From the human, in the aide session, 2026-10-13 ET, verbatim (after enabling alerts on the phone, where the control is only on Today):

"Okay, yeah, I did that too. That's annoying. We need a menu dropdown in the upper right that has the alerts-on/alerts-off thing. I want to see that on every note, at the top of every note."

## The ask

- A dropdown menu in the upper right of the top bar, on every page (every note, not only Today).
- It holds the alerts on/off control (today the "Enable alerts" / "Alerts off" control from mu-nqwt).
- With push off on the server, the menu shows no alerts item (see mu-9faf).

Open (not asked, for the design): whether other top-bar controls move into the menu too. Ask the human before moving anything else.

## Brief (orchestrator)

Approved: the human, via aide, 2026-10-13 ~10:20 PM ET: "daily in the menu for now; I asked for a link to Daily trom Today and vice-versa", with aide's "go ahead: build mu-nehy as written" (m-0015).

Build:
1. A dropdown menu at the right end of the top bar (`client/src/App.tsx`, the bar around the Today/Daily/New/Open buttons), on every page. Items: Alerts on/off (the control now in `client/src/TodayView.tsx`, moved here; no item when push is off on the server, per mu-9faf), Open..., New, Reload, Daily. It closes on a pick, on Escape and on a click outside, and works by touch on the phone.
2. Today stays in the top bar as a plain link/button. Back/forward, the files button, Message, Log out and the previous/next titlebar stay where they are (the human was undecided; don't move them).
3. Today view: a button at the top that opens that day's daily note (the exact note, as Daily does now). The daily note for today shows a button back to Today.
4. Remove the alerts control from the Today view once it lives in the menu.

Files: `client/src/App.tsx`, `client/src/TodayView.tsx`, `client/src/push.ts` if the control's state moves, the CSS, their tests, and the specs `design/specs/today.md` and `design/specs/push.md` (plus a new spec for the menu if the project keeps one per feature). Minor version bump (0.21.0).

Runs after mu-9faf (same files: TodayView.tsx, push.ts); branch from main once it has merged.

Verify: unit tests for the menu (opens, closes on Escape and outside click, no Alerts item with push off); spec scenarios for the Today <-> daily buttons; `npm run check` green once; a browser click-through at phone width (rule verify-ui-in-a-browser).

Model: Sonnet (UI design and interaction).

Not yet: moving the other top-bar controls into the menu (the human hasn't decided; ask before moving anything else).
