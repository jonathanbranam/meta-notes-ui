---
id: mu-p9bq
title: "Now page: Start gives 'Invalid request' when the day's log holds only the template placeholder"
kind: bug
created: 2026-11-19
created_by: external:orchestrator
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
---

## The ask

1. Make Start work on a day whose log holds only the template
   placeholder (replace the placeholder with the new entry, or treat it
   as empty).
2. Show a useful error instead of a bare "Invalid request".
3. Check that mu-jaej's change didn't break Start; add a test for both
   paths.

## The problem

On Thu 2026-11-19 the Now page showed only **Start** (not Done), and
tapping Start returned **"Invalid request"**. The day's `### Log` held
only the daily template's placeholder entry:

```
- start day:
  * start: HH:MM
  * end:   HH:MM
```

On Wed the aide had replaced the placeholder before the human's first
check-in, so the page worked. Likely cause: the page (or its API) can't
handle the template placeholder: no open entry, so Start; Start then
fails validating/appending after an entry with `HH:MM` times. The
human also asked whether the mu-jaej change (v0.31.2, Done/Start
disables and shows Saving...) was tested, since the page "looks like it
got messed up with some updates".

## The human's words (2026-11-19 ~7:47 AM ET, via the notes aide, verbatim)

> Also, the Now page of the notes app is completely broken and looks
> like it got messed up with some updates. Did some updates land for
> that, and were they tested? [...] It just says "Start," which I don't
> understand. Maybe the time log is wrong, or is the time block messed
> up? It says "Start," not "Done." Maybe nothing's running, and then
> when I click "Start," it says "Invalid request."
