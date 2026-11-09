---
id: mu-y9xa
title: Week view is unreadable on a dark background
kind: bug
created: 2026-11-09
created_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
resolved: 2026-11-09T17:39:14Z
---

## The ask

From the human (2026-11-09, to aide, verbatim): "the theme and colors for the week view does not work with the black background; did you view this in chrome or playwright? also, it's quite slow, shocckingly slow at work; I can't read anything in the boxes at all."

## Cause (aide, from reading the CSS; not yet rendered dark)

The `.wk-*` rules in client/src/style.css have no dark variant, unlike the rest of the file. `.wk-log`, `.wk-plan` and `.wk-cal` set a pale background but no text color, so in dark mode the page's light text lands on a pale box. `.wk-head` is a fixed white, and the grid lines and fill-in stripes are light-only.

It was missed because the only visual check (mu-rwk3, /tmp/week-mixed-7days.png) was Chrome driven by Playwright in its default light scheme. scripts/shots.mjs never sets colorScheme, so no agent screenshot shows dark mode.

## Fix

Dark variants for every week style: boxes, header, today, grid lines, fill-in, errors, range buttons. Text must be set with its background. Make scripts/shots.mjs able to capture a dark-scheme shot, so UI checks can see dark mode.

## Check

A dark-scheme screenshot of a mixed week on the ticket, every box kind readable, and light mode unchanged.
