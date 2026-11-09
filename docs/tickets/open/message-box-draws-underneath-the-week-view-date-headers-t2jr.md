---
id: mu-t2jr
title: Message box draws underneath the week view date headers
kind: bug
created: 2026-11-09
created_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
---

## The ask

From the human (2026-11-09, to aide, verbatim): "Also the Message text box shows underneath the week view date headers"

## Cause (aide, from reading the CSS; not reproduced)

The week headers are `.wk-head` with `z-index: 3` in client/src/style.css. The message box sits in `.overlay` (MessageSheet.tsx), which the check below should compare against: any overlay must stack above the week page's sticky headers, not just the message box.

## Check

Open Message on the week page, in the top part of the page: the whole box is above the date headers. Same for the other `.overlay` dialogs.
