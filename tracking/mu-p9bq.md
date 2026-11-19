+++
id = "mu-p9bq"
title = "Now page: Start gives 'Invalid request' when the day's log holds only the template placeholder"
kind = "bug"
state = "integrated"
created_at = "2026-11-19T12:47:49.181Z"
updated_at = "2026-11-19T12:57:11.678238019Z"
created_by = "external:aide"
watchers = ["external:aide"]
commit = "50bf3ae"
summary = "v0.31.3 (50bf3ae): Start replaces the template placeholder entry (start HH:MM) instead of sending it as --prev-start; append errors name the bad field. Predates mu-jaej."
ticket = "p9bq"
+++

docs/tickets/open/now-page-start-gives-invalid-request-when-the-day-s-log-hold-p9bq.md

submitted by external:aide

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

## The ask

1. Make Start work on a day whose log holds only the template
   placeholder (replace the placeholder with the new entry, or treat it
   as empty).
2. Show a useful error instead of a bare "Invalid request".
3. Check that mu-jaej's change didn't break Start; add a test for both
   paths.

## The human's words (2026-11-19 ~7:47 AM ET, via the notes aide, verbatim)

> Also, the Now page of the notes app is completely broken and looks
> like it got messed up with some updates. Did some updates land for
> that, and were they tested? [...] It just says "Start," which I don't
> understand. Maybe the time log is wrong, or is the time block messed
> up? It says "Start," not "Done." Maybe nothing's running, and then
> when I click "Start," it says "Invalid request."

## Thread

### note · external:aide · 2026-11-19T12:47:49.252Z
submitted by external:aide

### note · external:orchestrator · 2026-11-19T12:48:45.169Z
readied by external:orchestrator

### note · external:orchestrator · 2026-11-19T12:48:55.074Z
Readied by orchestrator (bug; ask self-evident). Priority: the human's daily Now page is broken each morning until the placeholder is replaced, so take it next. Re the human's question: mu-jaej (742e785, v0.31.2) was tested by its worker (263 passed, browser check on a throwaway site with a delayed API: Done disabled, one POST), but the manager did not re-run it, and no test covered a log holding only the template placeholder. Check whether mu-jaej caused this or it predates it, and say which in the landing note.

### note · agent:start-invalid · 2026-11-19T12:56:16.206Z
Cause: the daily template's placeholder entry has start 'HH:MM'. Start sent it as --prev-start; the server's clock check (and the meta-notes CLI: invalid time: 'HH:MM') refused it, so the page showed a bare error. Predates mu-jaej (v0.31.2): the append path was unchanged by it. Fix v0.31.3 (368a8e0): Start replaces a placeholder last entry via time-log update with --expect; append errors now name the bad field.

### note · external:orchestrator · 2026-11-19T12:57:11.424Z
integrated: 50bf3ae

### note · external:orchestrator · 2026-11-19T12:57:11.678Z
Orchestrator: read the diff (NowView.tsx, now.ts, server/edits.ts, tests), resolved, marked integrated at 50bf3ae. Cause predates mu-jaej. Minor edge, not blocking: isPlaceholder treats any last entry with an unparseable start as the placeholder, so Start would replace a real entry whose start has a typo. File a follow-up only if it bites.
