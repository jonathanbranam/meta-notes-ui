---
id: light-on-resources
severity: must
roles: [manager, worker]
---
The server runs all day on the human's work computer beside Vim and
agents, so it must not tax the machine.

- Events, not polling: one recursive file watcher for the notes root
  (ignoring `.git`, `.venv`, `node_modules`, `.meta-notes-cache`), changes
  pushed to the browser over one SSE stream. No timers that scan files.
- Debounce bursts (a `git pull`, an agent writing many notes) and send
  only what changed.
- Read and render a note when a client asks for it; cache by mtime.
- Small dependency tree; no database. The notes root is the data.

Why: the human, 2026-10-04 (meta-notes rule light-on-resources): "find
careful solutions that don't tax a computer excessively."
