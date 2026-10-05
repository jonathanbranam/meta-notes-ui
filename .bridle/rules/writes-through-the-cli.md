---
id: writes-through-the-cli
severity: must
roles: [manager, worker]
---
The server changes notes only by running `meta-notes ... --json`, the
same commands agents use (task update/add/notes, time-block, time-log,
note new, move/rename/archive, and meta-notes' raw note write). It never
writes a file in the notes root itself. Every write carries `--expect`
(what the UI showed) so a change made meanwhile by Vim or an agent is
refused, not overwritten; the UI then shows the conflict and the current
text. Reads may go straight to the files.

When the UI needs a write meta-notes doesn't have, say so in your report:
the command is added to meta-notes first.

Why: the human, 2026-10-04: "The server should use CLI commands just like
agents do to alter and update notes." One writer keeps the conventions in
one place and makes the UI as race-safe as the agents.
