---
id: 83ya
title: "v1.1 skeleton: server, token, file tree, rendered notes, live updates"
kind: feature
opened: 2026-10-05
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: []
tasks: []
---

## The ask

First slice of v1 (meta-notes ticket 5wam has the human's words and the
whole shape). After this, the human can open any note of a notes root,
rendered, on a computer or phone, and see it change as Vim and agents
edit it.

- **Layout**: one npm package; `server/` (Hono on Node, as track-web),
  `client/` (Vite + React + TS), shared types. `npm run build` builds
  both; `npm run check` = tsc + vitest + build. GitHub Actions CI runs
  `npm ci && npm run check`.
- **Start contract** (meta-notes' `ui` command will use it):
  `node <clone>/dist/server/index.js --root <notes root> [--port N]
  [--host H] --token-file <path>`. On listen it writes
  `<root>/.meta-notes-cache/ui/server.json` (`pid`, `host`, `port`,
  `url`, `version`) and removes it on exit. Default host 127.0.0.1,
  default port 0 (free port).
- **Access** (rule access): token on every request; `GET /?token=...`
  sets an httpOnly cookie and redirects. Paths confined to the root;
  `.git`, `.venv`, `.meta-notes-cache`, `node_modules` hidden.
- **API**: `GET /api/version`, `GET /api/tree` (folders and `.md` files),
  `GET /api/note?path=` (raw text + mtime), `GET /api/events` (SSE:
  `{type: changed|added|removed, path}`, debounced ~200 ms).
- **Watcher**: one recursive watch of the root (rule light-on-resources).
- **Client**: file tree (collapsible, the PPARA folders first), note
  view rendered with GFM (tables, task checkboxes shown read-only),
  frontmatter hidden for now, quick-open by name, today's daily note
  link (`meta-notes note daily` path via the CLI). Re-fetches the open
  note and the tree on SSE events. Responsive: usable on a phone
  (tree as a drawer).
- **Tests**: vitest for path confinement, token check, tree listing,
  watcher debounce, with a fixture notes root.

Version 0.1.0.
