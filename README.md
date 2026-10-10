# meta-notes-ui

A web and mobile UI for a [meta-notes](https://github.com/jonathanbranam/meta-notes)
notes root: the whole repo as rendered markdown, updated live as files
change, with editing and tools tailored to meta-notes' conventions (wiki
links, tasks, the Time Block and Time Log, frontmatter), alerts and
reminders. Roughly Obsidian, with plugins for one person's system.

Status: v0.18.0, v1 in development.

## How it fits

- `meta-notes ui start|stop|status|open` runs this server on a notes root.
- The server reads notes from disk and changes them only through the
  `meta-notes` CLI, the way agents do, so edits are race-safe against Vim
  and agents.
- It watches the notes root and pushes changes to the browser; open views, including an open editor (as a conflict), update at once, and a reconnecting phone re-fetches what it shows.

## Install

```bash
git clone https://github.com/jonathanbranam/meta-notes-ui.git
cd meta-notes-ui && npm ci && npm run build
```

Needs Node and `meta-notes` on PATH.

## Start contract

`meta-notes ui` starts the server with exactly this:

```bash
node <clone>/dist/server/index.js --root <notes root> [--port N] [--host H] --token-file <path> [--bridle-url U --bridle-token-file F [--bridle-to T]]
```

- `--host` defaults to `127.0.0.1` (bind a LAN or Tailscale address for the
  phone); `--port` defaults to `0` (a free port).
- `--bridle-url`, `--bridle-token-file` (and `--bridle-to`, default `external:advisor`), all
  or none, turn on a Message button: `POST /api/message {body}` sends the text to a bridle
  daemon as the human (`design/specs/message.md`). `/api/version` reports `message: true|false`.
- `--token-file` holds the secret (created, mode 0600, if missing). Every
  request needs it: open `<url>/?token=<token>` once and the server sets an
  httpOnly cookie and redirects; API clients may send `Authorization: Bearer`.
- **Login (optional).** `bin/meta-notes-ui create-login <username> [<password>] [--root <notes root>]`
  (after `npm run build`; from a deployed build, `~/.local/share/meta-notes-ui/current/bin/meta-notes-ui`, see `deploy/nuc.md`) hashes the password with scrypt (random salt) and writes
  `<root>/.meta-notes-cache/ui/login` (mode 0600; with no password argument it prompts twice
  without echo; the root is `--root` or the nearest directory upward with `.meta-notes`).
  Running it again replaces the login and revokes every session. While that file exists the
  token (cookie, bearer, `?token=`) stops working and the server needs a session from
  `/login` (HttpOnly, SameSite=Lax, Secure over HTTPS; ids stored hashed in `sessions.json`;
  30 days, sliding on use; **Log out** in the header revokes this device). A failed login
  waits one second. One user only. With no login file the token works as above.
- On listen it writes `<root>/.meta-notes-cache/ui/server.json`
  (`pid`, `host`, `port`, `url`, `version`) and removes it on exit.
- It lists and serves every file under the root: notes are read and edited
  as `.md` only, any other file is served raw at `GET /api/file?path=` with a
  content type from its extension and `nosniff` (HTML and SVG also get a
  sandbox CSP, so they cannot run script in the UI's origin). The client shows
  images inline (also in notes, as `![](x.png)` or `![[x.png]]`), `.txt` as
  text, a PDF as a link that opens it raw, other files as a download link.
  `.git`, `.venv`,
  `.meta-notes-cache` and `node_modules` are hidden, and nothing outside the
  root (symlinks included) is read.

API: `GET /api/version`, `/api/tree`, `/api/note?path=`, `/api/file?path=`, `/api/backlinks?path=`
(notes linking to one, link targets cached by mtime), `/api/daily`
(today's daily note path, via `meta-notes note daily`), `/api/events` (SSE of
`{type: changed|added|removed, path}`, debounced 200 ms, from one recursive
watch of the root; on Linux one watch per non-hidden directory, so `.git` and `.venv` cost nothing).

## Rendering

Read-only, in the client (`client/src/markdown.ts`, a remark plugin):

- `[[path]]` and `[[path|alias]]` resolve like the plugin: from the notes
  root (`.md` added), else relative to the note; `[[x]]` also finds the
  folder note `x/Home.md` (`shared/links.ts`). Missing targets are red.
  `[[path#heading]]` opens the note and scrolls to the heading.
- Frontmatter shows as a property panel: lists as lists, nested maps as
  nested properties, `[[links]]` in values as links. `#tags` are highlighted, with
  aliases folded: `data-tag` is the canonical tag, from `tag_aliases` in
  `meta-notes conventions --json` (`/api/tag-aliases`; unfolded if the CLI
  lacks it).
- Checkbox lines (`- [c]`) with a `📅` or `🛫` date are tasks; without one
  they are checklist items (class `checklist`) and show the same status.
  Both show their status and chips for `📅 ⏳ 🛫 ✅ ⏰ 🔁`
  and times; an open task due before today is red.
- The Time Block table: single-tilde plans struck out, `no plan` rows
  dimmed, and on today's note the row holding the current time highlighted.
- The Time Log (`### Log`): each entry shows `start – end · duration`
  (or `start – open`; `~` times count as exact) after its header line.
- Backlinks list under the note.

## Editing

Every write is a `meta-notes ... --json` command run with an argument array
(no shell), carrying `--expect` (what the UI showed); the server never writes
a file itself. Routes (token required, `.md` paths inside the root only):

- `POST /api/task` `{path, line, expect, status}`: `task update`. Click a
  task's box to check it off or reopen it (a recurring task spawns its next line).
  The select beside each task sets open, done, rescheduled (`>`), canceled (`-`) or partial (`o`).
- `POST /api/task/add` `{path, text, due?}`: `task add` (appended at the end of the note;
  the CLI takes `--expect` only with `--under`, which the UI doesn't use). A text field and
  date under each note, and under the Today view for today's daily note.
- `POST /api/write` `{path, from, to, expect, text}`: `note write --lines`.
  Double-click a paragraph, list item or table to edit its raw lines. If the
  lines changed meanwhile the save is refused (409 with `current`); the
  editor keeps your draft, shows the current text and offers "Save over it".
- `POST /api/timeblock` `{path, time, column, expect, text}`: `time-block update`
  for one Plan or Actual cell (`expect` is the cell as shown, `""` if empty). Tap a cell in a
  note's Time Block or in the Today view to edit it; a stale cell is a 409 with the current text.
- `POST /api/timeblock/replace` `{path, time, through, expect, text}`: `time-block replace`
  for a range of rows (`| time | plan | actual |` lines). "Edit rows" under the Today view's
  Time Block opens all rows in a text box.
- `POST /api/timelog/append` `{path, text, start?, prev?, prevStart?, prevOpen?, closePrev?, first?}`:
  `time-log append`. The Time Log panel (Today view and any note with a `### Log`) sends the last entry
  as `--prev`, so a changed log is a 409; "Start now" fills the current time and closes an open entry.
- `POST /api/timelog/update` `{path, expect, text}`: `time-log update` for whole entries; each
  entry has an Edit button.
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
  the day's calendar agenda when `meta-notes calendar` is set up (a calendar export in `.meta-notes-cache/ics/` and the root's `.venv`) (otherwise
  the section is absent). `GET /api/today` gathers it: `meta-notes tasks
  --overdue --due`, `calendar` and `note daily --render` (never creates the note; all `execFile`, argument
  arrays) plus a read of the daily note. The view refetches (debounced 1 s)
  when the watcher reports a change.
- **Reopen last page**: the page you were on is kept in the browser's localStorage (never the server);
  a fresh start with no `#` in the URL opens it, else Today. A stored page that is gone opens Today.
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
