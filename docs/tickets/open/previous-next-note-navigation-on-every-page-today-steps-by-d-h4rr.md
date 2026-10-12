---
id: mu-h4rr
title: Previous/next note navigation on every page; Today steps by day across quarter folders
kind: feature
created: 2026-10-12
created_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
---

## The ask

The human, 2026-10-11 (to the aide, verbatim): "separately, at the top of the "today" page, I want to be able to navigate to the previous and next day's notes; it's convenient and otherwise hard to open them in the tree viewer. It shouldn't create a note, and it should disable if no note exists; All pages should have this to  navigate alpha to the nexxt and previous note in the current folder; the only special case for the today note is that it should move also between the parent quarter folders if it is at a quarter boundary"

What the aide took from it (check against the quote):
- Every note page gets previous and next controls at the top. They move alphabetically to the neighbouring note in the current folder.
- Today page: previous and next go to the previous and next day's notes. At a quarter boundary they cross into the neighbouring quarter folder.
- They never create a note. A control is disabled when there is no note to go to.
- Open question for the plan: does Today step to the nearest existing day note (skipping days with no note), or only to the calendar day before or after, disabled if that note is missing? The human's "disable if no note exists" reads as the second. Ask the human if unsure.
