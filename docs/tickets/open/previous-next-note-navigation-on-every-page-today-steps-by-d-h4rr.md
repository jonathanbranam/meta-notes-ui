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
- Answered. The human, 2026-10-11 (to the aide, verbatim): "moving left and right in today jumps over missing notes. it's basically the previous sorted file in the folder, except at year / quarter boundaries."
  So on Today, previous and next skip days with no note: they go to the previous or next sorted note file in the folder. At the first or last note of a quarter folder, they continue into the neighbouring quarter folder, and across a year folder at a year boundary. They are disabled only when there is no note at all in that direction.

## Match the meta-notes vim command

The human, 2026-10-11 (to the aide, verbatim): "the command should work the same as it does in meta-notes you can check with that aide/repo on behavior of the vim command"

The aide read meta-notes at 2ed0bda: `autoload/meta_notes/notes.vim`, `meta_notes#notes#DailyPrev()` / `DailyNext()`, commands `:MetaNotesDailyPrev` / `:MetaNotesDailyNext`, mapped to `<localleader>np` / `<localleader>nn`.
- It only applies to a daily note, whose file name matches `YYYY-MM-DD Ddd.md` (`ExtractDateFromDailyNote`). Otherwise it errors.
- The list is every `.md` under `plan/daily/**` (any depth), sorted by full path (`GetDailyNoteFiles`), for example `plan/daily/26-Q1/2026-02-13 Fri.md`. The quarter folders (`YY-Qn`) sort chronologically, so quarter and year boundaries need no special code: it is one flat sorted list across all quarter folders.
- Previous and next are the neighbours in that list, so missing days are skipped.
- At the oldest or newest note, vim offers to create the day before or after. The UI must not create a note (the human's ask), so there the button is disabled instead.
- For non-daily pages (the human's "navigate alpha ... in the current folder"), vim has no equivalent; use the sorted note files of the current folder.
