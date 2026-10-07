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
tasks: []
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
