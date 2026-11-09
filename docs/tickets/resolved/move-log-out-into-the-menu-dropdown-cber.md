---
id: mu-cber
title: Move Log out into the Menu dropdown
kind: bug
created: 2026-11-09
created_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: [mu-nehy, mu-q8f8]
resolved: 2026-11-09T02:21:17Z
---

## The ask

From the human (Sun 2026-11-08, to aide, verbatim): "Log out button needs to go inside the menu drop
down"

Context (aide): the login was turned on 2026-11-08 (mu-q8f8), which makes the Log out button appear
in the top bar. The Menu dropdown is from mu-nehy.

## Check

Log out is an item in the Menu dropdown and no longer a separate top-bar button; it still logs out
and lands on /login; with no login set (token mode) it does not show.
