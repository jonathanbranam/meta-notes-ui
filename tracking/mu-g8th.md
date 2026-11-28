+++
id = "mu-g8th"
title = "Commit (and push) notes changed through the UI"
kind = "feature"
state = "integrated"
created_at = "2026-11-28T14:32:06.017Z"
updated_at = "2026-11-28T14:46:57.399513988Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
branch = "bridle/ui-commit"
commit = "3a3cbcd"
summary = "UI server commits only the notes its own writes changed, 60 s debounce, one commit + push per batch; flush on shutdown; failed push shown in UI and retried on next write. Merged 3a3cbcd, v0.33.0."
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

### note · agent:ui-commit · 2026-11-28T14:46:01.876Z
Done on bridle/ui-commit: 30e5727 (v0.33.0). Local main had not moved, so no merge.

Check (npm run check, green): tsc ok; vitest 121 passed (26 files); bridle spec check ok and spec
tests 282 passed (new: design/specs/commits.md with steps in specs/steps/commits.ts); build ok.

Browser (throwaway site, port 4000, temp notes repo with a missing remote): added a task, the notice
"Changes are saved but not synced to git" showed at 390px and 1280px; after creating the remote, a
second edit pushed both commits and the notice cleared. Browser and server stopped, port released.
Screenshots:
- /tmp/ui-commit-shots/390-push-failed.png
- /tmp/ui-commit-shots/1280-push-failed.png

Decisions the ticket did not cover:
1. Commits only when the notes root is itself the top of a git work tree; a root that is a folder
   inside another repo is left alone.
2. Pending paths and the unpushed flag are kept in .meta-notes-cache/ui/commits.json, so a failure
   survives a restart. At startup anything kept is flushed after 60 s. No retry timer: otherwise the
   retry is the next UI write or shutdown.
3. Shutdown flush is bounded at 8 s (meta-notes ui stop waits 10 s); it waits for in-flight writes.
4. No commit during a merge, with conflicts, or off a branch (rebase): shown as a failure.
5. A list check/uncheck records the source task's note only if the list actually closed or reopened it.
   Writes the CLI reports as unchanged are not recorded.
6. ssh is run with BatchMode=yes unless GIT_SSH_COMMAND, GIT_SSH or core.sshCommand is set.
7. The UI has no move, rename or archive routes, so nothing records those yet. The committer handles a
   move (old and new path, tested); a future route must pass both plus the rewritten links.

Limits for the human (in the spec):
- The unit is the file: someone else's uncommitted edits in a note the UI also changed are committed
  with it.
- git push sends the whole branch, including others' local commits.
- No pull: if the remote moved on (another machine), the push keeps failing until someone settles it.
- The push needs a non-interactive credential from the systemd unit and an upstream branch
  (noted in deploy/always-on.md). Worth checking on the real notes repo after deploy.
- There is no CHANGELOG in this repo; README updated.

### note · external:orchestrator · 2026-11-28T14:46:53.753Z
integrated: 3a3cbcd (branch bridle/ui-commit)

### note · external:orchestrator · 2026-11-28T14:46:54.380Z
cleanup: removed nothing
