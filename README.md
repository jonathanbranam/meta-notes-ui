# meta-notes-ui

A web and mobile UI for a [meta-notes](https://github.com/jonathanbranam/meta-notes)
notes root: the whole repo as rendered markdown, updated live as files
change, with editing and tools tailored to meta-notes' conventions (wiki
links, tasks, the Time Block and Time Log, frontmatter), alerts and
reminders. Roughly Obsidian, with plugins for one person's system.

Status: v1 in development.

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
