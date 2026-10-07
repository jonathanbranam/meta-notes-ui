---
id: mkkt
title: "Always-on server follows main by itself: no manual updates"
kind: feature
opened: 2026-10-07
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [uuum]
tasks: [mu-mkkt]
---

## The ask

From the human, via aide, 2026-10-07, verbatim:

"I don't want to manually update it - I just want it to serve the latest from here"

Context: the aide had walked the human through `deploy/nuc.md` (a separate checkout at a release tag, updated by hand with `git checkout v<new> && npm ci && npm run build && systemctl --user restart meta-notes-ui`). The human asked why it needs its own copy and whether it would stay up to date, then said the above. They have not installed anything yet.

## The ask

- The always-on server (uuum) serves the latest of this repo's `main` without the human updating it by hand.
- No manual update step in `deploy/nuc.md`.

Then, from the human, verbatim: "workers work in worktrees"

So "from here" means this checkout (`/srv/shared/work/meta-notes-ui-work/meta-notes-ui`): it sits on `main`, moves only on merges, and has no `node_modules` or `dist` (the aide checked, 2026-10-07). No separate `~/apps` checkout.

## Shape (the aide's suggestion; the orchestrator decides)

- The unit runs from this checkout: `WorkingDirectory` and `ExecStart` point here, not at `~/apps/meta-notes-ui`.
- When `main` moves, the server is rebuilt (`npm ci && npm run build`) and restarted by itself, e.g. a systemd user `.path` unit on the main ref, or a step the manager runs after merging that only rebuilds and leaves the restart to systemd. The human-server rule bars agents from restarting the unit, so the restart must not need an agent; amend the rule if the manager's step is chosen.
- A failed build leaves the running server as it was (build into a temp dir and swap, or restart only on success).
- `deploy/nuc.md` and the unit template: drop the separate checkout and the Update section.
- The human's one-time steps (linger, tailscale serve, token) stay.

## Decision (orchestrator, 2026-10-07)

The aide's shape, with one change: build out of tree, never in this checkout.
Building here would let `vite build` empty `dist/` under the live server, so a
failed build would break it, and bridle merges land in this checkout mid-build.

- **Trigger**: a systemd user `meta-notes-ui-update.path` with `PathChanged=`
  on this checkout's `.git/logs/refs/heads/main` (the reflog is appended on
  every move of `main` and survives `git pack-refs`, unlike the loose ref).
  It starts `meta-notes-ui-update.service` (oneshot).
- **Update script** (`deploy/update.sh`, run by that oneshot): if `main`'s sha
  equals the one `current` was built from, exit. Otherwise `git -C <checkout>
  archive <sha>` into `~/.local/share/meta-notes-ui/builds/<sha>`, `npm ci &&
  npm run build` there, then swap the `current` symlink atomically and
  `systemctl --user restart meta-notes-ui`. On any failure: leave `current` and
  the server alone, log to the journal, exit non-zero. Keep the last 3 builds.
- **Server unit**: `WorkingDirectory=%h/.local/share/meta-notes-ui/current`.
  The checkout itself stays a clean bridle checkout: no `node_modules`, no `dist`.
- **Rule**: the restart is done by systemd, not by an agent. `human-server.md`
  gains one line saying so; agents still never run, stop or restart either unit.
- **deploy/nuc.md**: install is "copy three units, fill placeholders, enable
  the server and the path unit, run the update once". No clone, no Update section.

Rejected: a manager step after merge (needs an agent near the human's server,
against `human-server`); building in this checkout (above); a timer polling git
(the path unit is immediate and free when idle).

## Also fix in deploy/nuc.md

The human hit this on 2026-10-07: `meta-notes ui url` before the first start fails with "The UI is not running: run `meta-notes ui start`". It does not create the token file, and it doesn't need to: the server's `loadToken` (server/token.ts) creates the file (mode 0600) on first start. Drop "The token file must exist before the first start" and the step that goes with it; the token is read from the file after the first start.
