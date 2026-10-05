---
id: 49zd
title: Split startServer() out of server/index.ts so start scenarios execute
kind: chore
opened: 2026-10-05
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [hzf9]
tasks: [mu-49zd]
---

## The ask

From the access spec (mu-hzf9): the start contract, server.json write/remove, usage exit 2, default host 127.0.0.1 and --host binding live in the top-level server/index.ts, so they're non-executable. Move them into an exported startServer() that index.ts calls, and bind the scenarios. Also cover the built client files being behind the token and confined to the client dir (createApp tests omit clientDir). No behavior change, no bump.
