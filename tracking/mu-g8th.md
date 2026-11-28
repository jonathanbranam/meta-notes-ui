+++
id = "mu-g8th"
title = "Commit (and push) notes changed through the UI"
kind = "feature"
state = "pending"
created_at = "2026-11-28T14:32:06.017Z"
updated_at = "2026-11-28T14:32:06.082721296Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
+++

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
