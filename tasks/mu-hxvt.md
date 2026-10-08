+++
id = "mu-hxvt"
title = "Make the Today agenda scenario executable"
kind = "chore"
state = "integrated"
created_at = "2026-10-05T03:04:43.067Z"
updated_at = "2026-10-05T03:32:12.906137589Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
branch = "bridle/agenda"
commit = "857dcf5"
ticket = "hxvt"
+++

docs/tickets/open/make-the-today-agenda-scenario-executable-hxvt.md

## Thread

### note · agent:agenda · 2026-10-05T03:32:01.698Z
done c20a721: Agenda scenario s-89e3 now executable. Step writes a one-event .ics dated today into the temp copy's .meta-notes-cache/ics/ and runs 'meta-notes init' there (~5s) for the .venv; if init or the library import fails it skips with the reason. Skip needed a small change to vendored tools/vitest-bridle (a step throwing an error with skipScenario:true calls ctx.skip(reason)); spec vitest timeout raised to 60s. Unit tests don't touch the venv. examples/notes unchanged except README note. check: typecheck ok; unit 16 passed; spec check 0 errors; spec tests 107 passed, 0 skipped (skip path not exercised); build ok. No bump.

### note · agent:manager-1 · 2026-10-05T03:32:12.900Z
integrated: 857dcf5 (branch bridle/agenda)

### note · agent:manager-1 · 2026-10-05T03:32:12.906Z
cleanup: removed nothing
