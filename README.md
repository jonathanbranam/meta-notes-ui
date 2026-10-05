# meta-notes-ui

A web and mobile UI for a [meta-notes](https://github.com/jonathanbranam/meta-notes)
notes root: the whole repo as rendered markdown, updated live as files
change, with editing and tools tailored to meta-notes' conventions (wiki
links, tasks, the Time Block and Time Log, frontmatter), alerts and
reminders. Roughly Obsidian, with plugins for one person's system.

Status: v0.4.0, v1 in development.

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

## Editing

Every write is a `meta-notes ... --json` command run with an argument array
(no shell), carrying `--expect` (what the UI showed); the server never writes
a file itself. Routes (token required, `.md` paths inside the root only):

- `POST /api/task` `{path, line, expect, status}`: `task update`. Click a
  task's box to check it off or reopen it (a recurring task spawns its next line).
- `POST /api/write` `{path, from, to, expect, text}`: `note write --lines`.
  Double-click a paragraph, list item or table to edit its raw lines. If the
  lines changed meanwhile the save is refused (409 with `current`); the
  editor keeps your draft, shows the current text and offers "Save over it".
- `POST /api/new` `{path}`: `note new`, from the template meta-notes picks
  (the **New** button asks for a path; an existing note is refused).

CLI errors are shown inline.

## Develop

`npm run check` runs tsc, vitest, the bridle specs (`design/specs/`, executable
under vitest via `tools/vitest-bridle`; skipped without the `bridle` binary, as in
CI) and the build. The code is
`server/` (Hono on Node), `client/` (Vite + React) and `shared/` (types).
For client work, start the server by hand and run `npm run build:client -- --watch`,
or `npx vite` with `MN_UI_SERVER=<server url>` (the token cookie is per origin,
so open the server URL once with `?token=`).

## Example notes root

`examples/notes/` is a small real meta-notes root used as test data (see its
README). Tests copy it to a temp dir with `makeExampleRoot()`
(`server/example.ts`) and never touch the committed files. `npm run
dev:example [-- --port N]` builds, copies it to a temp root and runs the
server there (port `0` unless given; `bridle port allocate` is used if the
binary exists), printing the URL with token. **Whenever a feature needs
content to verify, extend the example** and its README.

## Today, alerts and the phone app

- **Today** (header button; `#!today`): today's Time Block with the current
  row and the next planned row marked, open tasks due today or overdue, and
  the day's calendar agenda when `meta-notes calendar` is set up (otherwise
  the section is absent). `GET /api/today` gathers it: `meta-notes tasks
  --overdue --due`, `calendar` and `note daily` (all `execFile`, argument
  arrays) plus a read of the daily note. The view refetches (debounced 1 s)
  when the watcher reports a change.
- **Alerts**: browser notifications at the time of a timed task due today
  (`⏰ HH:MM`) and at each planned Time Block row (not empty, `no plan` or
  struck out), while a tab is open. "Enable alerts" on the Today view asks for
  permission. A fired alert shows at the top of the page with **Snooze 10
  min** and **Dismiss**. All timers are `setTimeout`s in the browser; the
  server never polls. Push to a closed phone is later (the phone bridge).
- **PWA**: `manifest.webmanifest`, icons (`client/public/`, made by
  `scripts/make-icons.mjs`) and a minimal service worker (installability and
  notification clicks; it caches nothing). The token still guards them: the
  manifest link is `crossorigin="use-credentials"` so the cookie is sent. Add
  to the home screen from the phone's browser over the `--host` address; note
  that browsers only install and notify over HTTPS or `localhost`, so a plain
  `http://` LAN address may allow viewing but not install or alerts
  (Tailscale HTTPS works).
