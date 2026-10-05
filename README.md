# meta-notes-ui

A web and mobile UI for a [meta-notes](https://github.com/jonathanbranam/meta-notes)
notes root: the whole repo as rendered markdown, updated live as files
change, with editing and tools tailored to meta-notes' conventions (wiki
links, tasks, the Time Block and Time Log, frontmatter), alerts and
reminders. Roughly Obsidian, with plugins for one person's system.

Status: v0.2.0, v1 in development.

## How it fits

- `meta-notes ui start|stop|status|open` runs this server on a notes root.
- The server reads notes from disk and changes them only through the
  `meta-notes` CLI, the way agents do, so edits are race-safe against Vim
  and agents.
- It watches the notes root and pushes changes to the browser.

## Install

```bash
git clone https://github.com/jonathanbranam/meta-notes-ui.git
cd meta-notes-ui && npm ci && npm run build
```

Needs Node and `meta-notes` on PATH.

## Start contract

`meta-notes ui` starts the server with exactly this:

```bash
node <clone>/dist/server/index.js --root <notes root> [--port N] [--host H] --token-file <path>
```

- `--host` defaults to `127.0.0.1` (bind a LAN or Tailscale address for the
  phone); `--port` defaults to `0` (a free port).
- `--token-file` holds the secret (created, mode 0600, if missing). Every
  request needs it: open `<url>/?token=<token>` once and the server sets an
  httpOnly cookie and redirects; API clients may send `Authorization: Bearer`.
- On listen it writes `<root>/.meta-notes-cache/ui/server.json`
  (`pid`, `host`, `port`, `url`, `version`) and removes it on exit.
- It serves only `.md` notes under the root; `.git`, `.venv`,
  `.meta-notes-cache` and `node_modules` are hidden, and nothing outside the
  root (symlinks included) is read.

API: `GET /api/version`, `/api/tree`, `/api/note?path=`, `/api/backlinks?path=`
(notes linking to one, link targets cached by mtime), `/api/daily`
(today's daily note path, via `meta-notes note daily`), `/api/events` (SSE of
`{type: changed|added|removed, path}`, debounced 200 ms, from one recursive
watch of the root; on Linux one watch per non-hidden directory, so `.git` and `.venv` cost nothing).

## Rendering

Read-only, in the client (`client/src/markdown.ts`, a remark plugin):

- `[[path]]` and `[[path|alias]]` resolve like the plugin: from the notes
  root (`.md` added), else relative to the note; `[[x]]` also finds the
  folder note `x/Home.md` (`shared/links.ts`). Missing targets are red.
- Frontmatter shows as a property panel; `#tags` are highlighted.
- Task lines (`- [c]`) show their status and chips for `📅 ⏳ 🛫 ✅ ⏰ 🔁`
  and times; an open task due before today is red.
- The Time Block table: single-tilde plans struck out, `no plan` rows
  dimmed, and on today's note the row holding the current time highlighted.
- Backlinks list under the note.

## Develop

`npm run check` runs tsc, vitest and the build (what CI runs). The code is
`server/` (Hono on Node), `client/` (Vite + React) and `shared/` (types).
For client work, start the server by hand and run `npm run build:client -- --watch`,
or `npx vite` with `MN_UI_SERVER=<server url>` (the token cookie is per origin,
so open the server URL once with `?token=`).
