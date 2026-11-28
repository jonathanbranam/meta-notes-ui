# Commits

## Purpose

Neither the UI nor meta-notes committed anything, so UI edits sat uncommitted
in the notes repo for days. The server commits the notes its own writes
touched, in batches, and pushes them. It never sweeps in other changes (Vim,
agents). One timer, restarted by each write, no polling (rule
light-on-resources). Git is run directly: committing is not a note edit (rule
writes-through-the-cli).

Limits: the unit is the file, so uncommitted edits by someone else in a note
the UI also changed go in the same commit; the push sends the whole branch;
there is no pull, so a remote that has moved on is a push failure for the
human to settle. The UI has no move, rename or archive route; one added later
records both paths and every note whose links the CLI rewrote.

Rejected: a commit per write (the human clicks through items slowly); a retry
timer (the next write or shutdown retries); `git add -A` (sweeps in others'
work); committing when the notes root is only a folder inside some repository.

## Requirements

### Requirement: The UI's writes are committed in one batch  {#r-587c}

The server SHALL record each note its `meta-notes` writes changed, restart a
60 s timer on each, and when it fires make one commit titled
`meta-notes-ui: <N> notes updated`, listing the paths in the body, of only
those paths, and push it if the repository has a remote.

#### Scenario: Several writes, one commit  {#s-cd5a}

*Verification*: **executable**

- **WHEN** the client makes two edits to "area/health.md" and one to "project/make-bread/Home.md" within the delay, while "area/Home Care.md" has someone else's change and "resource/files/hello.txt" is staged
- **THEN** one new commit "meta-notes-ui: 2 notes updated" lists "area/health.md" and "project/make-bread/Home.md" and holds only them
- **AND** "area/Home Care.md" is still modified and "resource/files/hello.txt" still staged
- **AND** the remote has the new commit

#### Scenario: Every write route is recorded  {#s-0112}

*Verification*: **executable**

- **WHEN** the client adds a task, writes lines, sets a Time Block cell, replaces rows, appends and edits a Time Log entry, makes a new note and checks off a list item with a source task, then the server flushes
- **THEN** the commit holds every note those writes changed, the list item's source note among them
- **AND** nothing is left uncommitted

#### Scenario: A list item that leaves its source task alone  {#s-65b4}

*Verification*: **executable**

- **WHEN** the client cancels an open list item whose source note has someone else's change, then the server flushes
- **THEN** the commit holds only the list

#### Scenario: A move records both paths  {#s-b791}

*Verification*: **executable**

- **WHEN** a write moves "area/health.md" to "archive/area/health.md" and the server flushes
- **THEN** the commit removes "area/health.md" and adds "archive/area/health.md"

#### Scenario: Already committed by someone else  {#s-a550}

*Verification*: **executable**

- **WHEN** the client edits "area/health.md", someone else commits it, and the server flushes
- **THEN** no commit is added and no failure shows

#### Scenario: The cache is never committed  {#s-9339}

*Verification*: **executable**

- **WHEN** a write names ".meta-notes-cache/ui/x.md" and the server flushes
- **THEN** no commit is added and no failure shows

### Requirement: Only a notes root that is itself a repository is committed  {#r-2bfe}

The server SHALL do nothing, without an error, when the notes root is not the
top of a git work tree.

#### Scenario: Not a repository  {#s-be7d}

*Verification*: **executable**

- **WHEN** the client edits "area/health.md" in a root that is not a git repository and the server flushes
- **THEN** the edit succeeds and no failure shows

#### Scenario: Inside another repository  {#s-eeb8}

*Verification*: **executable**

- **WHEN** the client edits "area/health.md" in a root that is a folder of another repository and the server flushes
- **THEN** the outer repository has no new commit and nothing staged
- **AND** no failure shows

### Requirement: A failed commit or push is kept and shown  {#r-ce8f}

The server SHALL keep what it could not commit or push, retry it on the next
flush, and send the failure to the browser as the `commit` event of
`/api/events`. It SHALL NOT prompt for credentials, and SHALL NOT commit
while the repository is mid-merge or off a branch.

#### Scenario: A failing push is retried  {#s-1a56}

*Verification*: **executable**

- **WHEN** the client edits "area/health.md" while the remote is unreachable and the server flushes
- **THEN** the events stream reports a "push failed" failure
- **AND** after the remote is back, the next flush pushes the commit and the failure clears

#### Scenario: A failing commit is retried  {#s-0c19}

*Verification*: **executable**

- **WHEN** the client edits "area/health.md" while a commit hook refuses and the server flushes
- **THEN** a "commit failed" failure shows and no commit is added
- **AND** after the hook is removed, the next flush commits and pushes it

#### Scenario: Mid-merge  {#s-c924}

*Verification*: **executable**

- **WHEN** the client edits "area/health.md" while a merge is unfinished and the server flushes
- **THEN** a "commit failed" failure shows, no commit is added and the merge is still unfinished

#### Scenario: Kept across a restart  {#s-b195}

*Verification*: **executable**

- **WHEN** a push fails, the server is restarted, the remote is back and the server flushes
- **THEN** the remote has the new commit

#### Scenario: The failure notice  {#s-5ba6}

*Verification*: **non-executable**

- **WHEN** the browser receives a commit failure, on a phone or a desktop
- **THEN** a notice at the top of the page says the changes are not synced to git, with the reason, until a later flush succeeds

### Requirement: Shutdown flushes first  {#r-c1e2}

On shutdown or restart (SIGINT, SIGTERM) the server SHALL flush what is
pending before exiting, and SHALL give up after 8 s, keeping the rest for the
next start.

#### Scenario: Flushed on stop  {#s-d74f}

*Verification*: **executable**

- **WHEN** the client edits "area/health.md" and the server is stopped before the delay passes
- **THEN** the remote has the new commit

#### Scenario: A hung push does not hang shutdown  {#s-f460}

*Verification*: **executable**

- **WHEN** the server is closed while the remote never answers a push
- **THEN** closing returns within its bound
- **AND** the commit is still to be pushed at the next start
