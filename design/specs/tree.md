# Tree, notes and live updates

## Purpose

The human wants the whole notes repo served, a file tree to move around it,
and views that update immediately, like Vim, without taxing a work machine
that also runs Vim and agents (rule light-on-resources). Reads go straight
to the files; one watcher pushes changes over one SSE stream.

## Requirements

### Requirement: The tree lists the notes  {#r-97d0}

The server SHALL list the folders and `.md` files under the notes root as a
tree, with the PPARA folders (plan, project, area, resource, archive) first
in that order, then other folders, then files, each group sorted by name. It
SHALL skip hidden names (`.git`, `.venv`, `.meta-notes-cache`,
`node_modules`) at any depth, symlinks, non-markdown files and empty folders.

#### Scenario: Order  {#s-1c8a}

*Verification*: **executable**

- **WHEN** a client requests "/api/tree" with the right token
- **THEN** the top-level names are "plan, project, area, alpha, zeta, root.md"

#### Scenario: Nested notes carry their root-relative path  {#s-5fc1}

*Verification*: **executable**

- **WHEN** a client requests "/api/tree" with the right token
- **THEN** the tree holds the file "plan/daily/26-Q4/2026-10-04 Sun.md"

#### Scenario: Hidden names, other files and symlinks are skipped  {#s-6042}

*Verification*: **executable**

- **WHEN** a client requests "/api/tree" with the right token
- **THEN** the tree holds no path starting with ".git", ".meta-notes-cache" or "node_modules"
- **AND** the tree holds no "notes.txt" and no "link.md"

#### Scenario: Notes that are not markdown are listed  {#s-7c6d}

*Verification*: **non-executable**

- **WHEN** the notes root holds files that are not `.md` (images, text, PDFs)
- **THEN** the tree lists them and they open, as in Obsidian

### Requirement: A note is read when asked  {#r-e65b}

The server SHALL return a note's text and its mtime when a client asks for
it, reading the file at that moment, so what the client sees is what is on
disk.

#### Scenario: Text and mtime  {#s-5c50}

*Verification*: **executable**

- **WHEN** a client requests the note "area/health.md" with the right token
- **THEN** the note text is "# Health\n"
- **AND** the note mtime is positive

#### Scenario: A rendered note is cached by mtime  {#s-3ebb}

*Verification*: **non-executable**

- **WHEN** a note is asked for again and its mtime has not changed
- **THEN** the server does not read and render it a second time

### Requirement: Changes are watched by events  {#r-51e2}

The server SHALL watch the whole notes root with file-system events, not
timers, ignoring hidden names. On Linux, where a recursive watch would also
watch `.git` and `node_modules`, it SHALL watch each non-hidden directory
itself, including directories created later, and stop watching those removed.

#### Scenario: Added, then changed  {#s-a110}

*Verification*: **executable**

- **WHEN** a note "n.md" is created in a watched root
- **THEN** an "added" event for "n.md" arrives
- **WHEN** "n.md" is written again
- **THEN** a "changed" event for "n.md" arrives

#### Scenario: Removed  {#s-34c1}

*Verification*: **executable**

- **WHEN** a note "n.md" exists in a watched root and is deleted
- **THEN** a "removed" event for "n.md" arrives

#### Scenario: Hidden folders are never watched  {#s-511f}

*Verification*: **executable**

- **WHEN** a watched root holds a ".git" folder and a folder "a"
- **THEN** only the root and "a" are watched
- **WHEN** a file is written in ".git"
- **THEN** no event for it arrives

#### Scenario: New folders are watched, removed ones dropped  {#s-d28b}

*Verification*: **executable**

- **WHEN** a watched root holds a folder "a" and "a/b" is created
- **THEN** "a/b" is watched
- **WHEN** a note is written in "a/b"
- **THEN** an event for "a/b/n.md" arrives
- **WHEN** "a" is removed
- **THEN** only the root is watched

#### Scenario: A folder moved into the root is watched  {#s-ca02}

*Verification*: **non-executable**

- **WHEN** a folder with notes is moved or cloned into the root in one step
- **THEN** its notes are watched and report events, not only the folder

#### Scenario: Other platforms use one recursive watch  {#s-32c0}

*Verification*: **non-executable**

- **WHEN** the server runs on macOS or Windows
- **THEN** it uses one recursive watch on the root and still ignores hidden names

### Requirement: Bursts are debounced and carry only what changed  {#r-24fb}

The server SHALL collect the changes of a burst (a `git pull`, an agent
writing many notes) and send one batch after a quiet period, with each path
once.

#### Scenario: A burst is one batch  {#s-fd8c}

*Verification*: **executable**

- **WHEN** a note "a.md" is written three times and a note "b.md" once within the quiet period
- **THEN** one batch arrives holding "a.md" and "b.md" once each

### Requirement: Events reach every open view over one stream  {#r-24bc}

The server SHALL push every change over `/api/events` as server-sent events,
one `data:` line of JSON `{type, path}` per path, after a `ready` event, to
each connected client, and stop sending to a client that disconnects.

#### Scenario: A change is streamed  {#s-3c51}

*Verification*: **executable**

- **WHEN** a client opens "/api/events" with the right token
- **AND** the root note "root.md" changes
- **THEN** the stream is "text/event-stream"
- **AND** it carries the data "changed root.md"

#### Scenario: A disconnected client is dropped  {#s-d356}

*Verification*: **executable**

- **WHEN** a client opens "/api/events" with the right token and disconnects
- **THEN** the server holds no subscription for it

### Requirement: Open views update without a reload  {#r-e69e}

The client SHALL re-fetch the tree when a note is added or removed, and the
open note and its backlinks when they change, so the screen follows the
files like Vim does. An open editor SHALL show a conflict, not the new text
over the draft.

#### Scenario: The open note refreshes  {#s-105a}

*Verification*: **non-executable**

- **WHEN** the open note is changed on disk by Vim or an agent
- **THEN** the page shows the new text without a reload

#### Scenario: The tree refreshes  {#s-bb34}

*Verification*: **non-executable**

- **WHEN** a note is added or removed on disk
- **THEN** the tree shows the change without a reload

#### Scenario: The stream reconnects  {#s-caf8}

*Verification*: **non-executable**

- **WHEN** the phone sleeps or the connection drops, then comes back
- **THEN** the client reconnects and re-fetches what it shows, so it does not stay stale
