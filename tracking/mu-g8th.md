+++
id = "mu-g8th"
title = "Commit (and push) notes changed through the UI"
kind = "feature"
state = "open"
created_at = "2026-11-28T14:32:06.017Z"
updated_at = "2026-11-28T14:36:14.837937635Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
ticket = "g8th"
+++

docs/tickets/open/ui-commits-g8th.md

submitted by external:orchestrator

## The ask

Edits made through meta-notes-ui (task check-offs, cancels, daily-note changes) are left
uncommitted in the notes repo (/srv/shared/work/notes-work/notes), sometimes for days. Aide found
7 modified files at 11/27 ~2:30 PM ET and more on 11/28 (vitamins/weather check-offs in
area/health/Home.md, area/home/Home.md), committed by accident in cd552182.

The human, via aide (m-0443): "Those should be committed anyway; doesn't the UI commit files?
That should happen somehow."

## What exists today (checked by orchestrator@vesta)

- meta-notes-ui writes only through `meta-notes ... --json` (rule writes-through-the-cli) and has no
  git commit code.
- meta-notes itself makes no commits: its design assumes the human commits about once a day
  (skills/daily-shutdown: `git add -A && git commit -m "Shutdown <date>"`).

## Recommendation (design open, bring to the human)

The UI server commits the files its own writes touched, after a short quiet period (batch writes
within ~1-2 minutes into one commit, message `meta-notes-ui: <summary>`), and pushes if the notes
repo has a remote. It commits only paths it wrote, so Vim edits in progress and agent changes are
not swept in. Alternative: put an opt-in `--commit` on meta-notes' write commands so agents can
use it too. That needs a meta-notes change first.

## Thread

### note · external:orchestrator · 2026-11-28T14:32:06.082Z
submitted by external:orchestrator

### note · external:aide · 2026-11-28T14:34:17.243Z
From the human, via aide (notes), 2026-11-28 9:33 AM ET, verbatim: "for committing UI edits; could they be debounced / batched up over a minute or something? I'm often slowly clicking through items there. IDK how hard that would be to manage". Context: they were shown option 1 (UI commits only its own writes, batched, and pushes). Not yet an explicit go.

### note · external:aide · 2026-11-28T14:35:32.927Z
From the human, via aide (notes), 9:35 AM ET, verbatim: "yes ready it" — go for option 1 with the 60 s debounce as the orchestrator described (m-0434).

### note · external:orchestrator · 2026-11-28T14:36:09.495Z
readied by external:orchestrator

### note · external:orchestrator · 2026-11-28T14:36:14.837Z
Readied by human via aide (notes), relayed in m-0445: "yes ready it" (9:35 AM ET), after asking for a ~1 minute debounce. Design and check in the ticket body. Sonnet.
