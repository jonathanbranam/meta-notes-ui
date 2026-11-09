---
id: mu-2fmn
title: "Week page: its own layout, navigation stays in view, opens at start of day, dates on the buttons"
kind: feature
created: 2026-11-09
created_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
resolved: 2026-11-09T17:56:25Z
---

## The ask

From the human (2026-11-09, to aide, verbatim):

"more feedback on UI:

* problem: i have to scroll to see the start of the day
* scrolling hides the week navigation at the top; so i scroll down then back up to change weeks; ugh; week nav should not scroll out of view
* i want this UI to be it's own thing; remove the sidebar and the < > Week header to change notes, that doesn't make sense here
* add indications of the dates on < Week and Week > so I know where I'm headed"

## What it does (aide's reading)

On the desktop week page:

1. Opening the week shows the start of the day without scrolling. The grid runs from midnight (WeekView.tsx) and nothing positions it. Suggested default: open scrolled to just above the week's earliest box, or about 7 AM on an empty week. Don't re-scroll on a live update (`refreshKey`), which would move the page under the reader.
2. The week navigation (`.wk-bar`: previous, next, range picker) stays in view while the grid scrolls, with the date headers (`.wk-head`, already sticky at top 0) below it.
3. No file sidebar and no second header row (history back/forward and the "Week" title, App.tsx) on this page. The top row (Today, Now, Week, Menu) stays: the Menu holds Log out and, soon, the light/dark option (mu-9kcv).
4. The previous and next buttons show the dates they go to, for example "< Week of Nov 2" or the range. They follow the range picker (7 days, weekdays, weekend).

Other pages keep the sidebar and header.

## Notes

Touches client/src/style.css and WeekView.tsx, as do mu-y9xa and mu-9kcv: order the work to avoid conflicts. The message box layering bug mu-t2jr is near this too.

## Check

Desktop screenshots: opened at the start of the day, then scrolled down with the navigation and date headers still visible, no sidebar or second header row, dates on both buttons. A note page still has its sidebar and header. Checked in dark mode as well as light.
