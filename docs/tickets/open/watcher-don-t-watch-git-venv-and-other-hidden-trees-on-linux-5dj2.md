---
id: 5dj2
title: "Watcher: don't watch .git, .venv and other hidden trees on Linux"
kind: bug
opened: 2026-10-05
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [83ya]
tasks: [mu-5dj2]
---

## The ask

Found reviewing mu-83ya (v0.1.0). `server/watcher.ts` uses
`fs.watch(root, {recursive: true})` and drops hidden paths in the
callback. On Linux, Node implements recursive watch by walking the tree
and adding an inotify watch per directory, so `.git` (objects/ has ~256
dirs), `.venv` and `node_modules` are all watched and their events
delivered, then discarded: startup walk, memory, inotify watch limits,
and wakeups on every `git` command. Rule light-on-resources. On macOS
(FSEvents) recursive watch is one cheap stream and is fine.

Fix: on Linux (not darwin/win32), watch directories individually,
skipping hidden names (`HIDDEN` in `server/paths.ts`): walk at start,
add a watch when a directory is created, drop it when removed. Keep
`fs.watch` recursive on darwin and win32. Same `watchRoot` interface and
debounce. Test the Linux path with a temp dir: a file in `.git/` causes
no watcher and no event; a new subfolder is watched. Patch version.
