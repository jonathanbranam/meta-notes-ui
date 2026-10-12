+++
id = "mu-h4rr"
title = "Previous/next note navigation on every page; Today steps by day across quarter folders"
kind = "feature"
state = "integrated"
created_at = "2026-10-12T03:37:38.792Z"
updated_at = "2026-10-12T03:56:15.003168802Z"
created_by = "external:aide"
watchers = ["external:aide"]
branch = "bridle/prevnext"
commit = "6a636ad"
ticket = "h4rr"
+++

docs/tickets/open/previous-next-note-navigation-on-every-page-today-steps-by-d-h4rr.md

## Thread

### note · external:orchestrator · 2026-10-12T03:43:17.908Z
Plan (orchestrator): runs after mu-bncz (both touch the top bar). Model: Sonnet. Verify: unit tests for the neighbour lookup (daily: one flat sorted list of plan/daily/**/*.md, crossing quarter and year folders; other pages: sorted .md files of the current folder; disabled at either end; never creates a note); attach screenshots from the mu-6xc6 tool of Today and one non-daily page, desktop and mobile. Out of scope: keyboard shortcuts (not asked for).

### note · external:orchestrator · 2026-10-12T03:48:34.903Z
mu-h4rr: it is queued (tier 2, after mu-bncz), planned with a brief comment. Take it from the queue after bncz.

### note · agent:prevnext · 2026-10-12T03:55:08.682Z
Done in 4ed085e (v0.19.0), npm run check green (152 tests + specs). Lookup: client/src/neighbours.ts (+test); spec design/specs/neighbours.md. Today steps from today's daily note, or its would-be path if not yet created. Screenshots (looked at; no overflow at 400px, both disabled for a lone note, prev enabled/next disabled on Today since 10-11 is the newest example note): docs/tickets/assets/h4rr-today-desktop.png, h4rr-today-mobile.png, h4rr-daily-mobile.png, h4rr-quarter-desktop.png, h4rr-quarter-mobile.png. Buttons use the unicode single angle quotes as labels (UI only, not editable text).

### note · agent:manager-1 · 2026-10-12T03:55:21.750Z
integrated: 6a636ad (branch bridle/prevnext)

### note · agent:manager-1 · 2026-10-12T03:55:21.753Z
cleanup: removed nothing

### note · external:orchestrator · 2026-10-12T03:56:15.003Z
Verified (orchestrator) at 6a636ad / v0.19.0: client/src/neighbours.ts matches the vim DailyPrev/DailyNext model (one sorted list of plan/daily/**/YYYY-MM-DD Ddd.md, so missing days are skipped and quarter/year folders are crossed); other pages use the same folder's .md files; buttons are disabled at the ends and never create a note. Tests cover quarter and year crossing, the ends, a not-yet-existing Today note, and folder pages. Today mobile shot: prev enabled, next disabled. CI green on main and the tag.
