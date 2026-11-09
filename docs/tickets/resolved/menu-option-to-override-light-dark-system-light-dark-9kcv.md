---
id: mu-9kcv
title: "Menu option to override light/dark: system, light, dark"
kind: feature
created: 2026-11-09
created_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: [mu-y9xa]
related: []
resolved: 2026-11-09T18:02:08Z
---

## The ask

From the human (2026-11-09, to aide, verbatim): "let's add an option in the Menu to override light/dark. there are three settings: system, light and dark"

Context, same conversation: the app follows the system setting only, through `@media (prefers-color-scheme: dark)` blocks in client/src/style.css, with no override.

## What it does

A choice in the Menu dropdown with three settings: System (the default, today's behavior), Light, Dark. The choice applies at once on every page and survives a reload.

## Notes

- Depends on mu-y9xa: without dark week styles, Dark is unreadable on the week page.
- The dark styles must apply both for an explicit Dark and for System on a dark system, and an explicit Light must win on a dark system, so the media-query blocks need restructuring.
- Remembered per browser (localStorage) unless the plan finds a reason otherwise. Apply it before first paint, so a page does not flash the wrong theme.

## Check

Screenshots of a page and the week page in all three settings with the system set to dark, and again with it set to light. A reload keeps the choice.
