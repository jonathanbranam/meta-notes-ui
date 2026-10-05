# Edits through the CLI

## Purpose

The human wants nice tools on web and mobile to edit notes: check off a
task, edit text as raw markdown, make a note. The server changes notes only
by running `meta-notes ... --json`, as agents do, and every write carries
`--expect`, so a change made meanwhile by Vim or an agent is refused, not
overwritten (rule writes-through-the-cli). These scenarios run the real
`meta-notes` CLI against a temp copy of `examples/notes`.

## Requirements

### Requirement: A task is checked off through the CLI  {#r-67eb}

The server SHALL set a task line's status with `meta-notes task update`
given the line the client saw as `--expect`, and the CLI's rules apply: a
recurring task gets its next line.

#### Scenario: Checking off a task  {#s-8cd6}

*Verification*: **executable**

- **WHEN** the client checks off line 7 of "area/health.md" as it shows it
- **THEN** the edit succeeds
- **AND** the note "area/health.md" holds a line starting "- [x] Annual checkup"

#### Scenario: A recurring task spawns its next line  {#s-ceb0}

*Verification*: **executable**

- **WHEN** the client checks off line 7 of "area/health.md" as it shows it
- **THEN** the note "area/health.md" has 2 lines containing "Annual checkup"

#### Scenario: Reopening a done task  {#s-8048}

*Verification*: **non-executable**

- **WHEN** the human clicks the box of a done task
- **THEN** the task is open again

#### Scenario: Other statuses from the UI  {#s-4d43}

*Verification*: **non-executable**

- **WHEN** the human picks rescheduled, canceled or partial for a task
- **THEN** the task takes that status, as the CLI allows

### Requirement: A block is edited as raw markdown  {#r-f2df}

The server SHALL replace a range of lines with the client's text through
`meta-notes note write`, given the lines the client saw as `--expect`, and
SHALL keep dashes and non-ASCII text intact.

#### Scenario: Replacing lines  {#s-c2ba}

*Verification*: **executable**

- **WHEN** the client writes lines 5 to 6 of "area/Home Care.md" as it shows them with "---\n- [ ] Order tiles 📅 2026-09-29"
- **THEN** the edit succeeds
- **AND** lines 5 to 6 of the note "area/Home Care.md" are "---\n- [ ] Order tiles 📅 2026-09-29"

#### Scenario: Opening a block for editing  {#s-8520}

*Verification*: **non-executable**

- **WHEN** the human opens a paragraph, list item or table
- **THEN** its raw markdown lines show in a text box, and saving replaces just those lines

#### Scenario: Editing a whole note  {#s-d733}

*Verification*: **non-executable**

- **WHEN** the human chooses to edit a note
- **THEN** all of its text opens as raw markdown, not like Google Docs

### Requirement: A stale edit is a conflict, shown with the current text  {#r-3e6d}

The server SHALL refuse an edit whose `--expect` no longer matches the file,
change nothing, answer 409 and return the text as it is now. The client
SHALL show that text and keep the human's draft.

#### Scenario: A stale task line  {#s-15f5}

*Verification*: **executable**

- **WHEN** the client checks off line 9 of "area/health.md" believing it reads "- [ ] something else"
- **THEN** the edit is refused as a conflict showing "Call the dentist"
- **AND** the note "area/health.md" holds a line starting "- [ ] Call the dentist"

#### Scenario: A stale block  {#s-072e}

*Verification*: **executable**

- **WHEN** the client writes line 1 of "area/health.md" believing it reads "not what is there" with "# Mine"
- **THEN** the edit is refused as a conflict showing "---"
- **AND** the note "area/health.md" is unchanged

#### Scenario: The conflict is shown and the draft kept  {#s-8ff5}

*Verification*: **non-executable**

- **WHEN** a save is refused as a conflict
- **THEN** the screen shows the current text beside the draft, the draft stays in the text box, and saving again is an explicit "Save over it"

#### Scenario: An open editor learns of a change  {#s-71bb}

*Verification*: **non-executable**

- **WHEN** the note changes on disk while the human has an editor open on it
- **THEN** the editor shows the conflict at once instead of waiting for a save

### Requirement: A new note is made by the CLI  {#r-d5f4}

The server SHALL create a note with `meta-notes note new`, from the template
meta-notes picks for its folder, and SHALL refuse to overwrite an existing
note.

#### Scenario: Creating a note  {#s-d937}

*Verification*: **executable**

- **WHEN** the client creates the note "area/new-thing.md"
- **THEN** the edit succeeds
- **AND** the note "area/new-thing.md" holds "new-thing"

#### Scenario: An existing note is not overwritten  {#s-e872}

*Verification*: **executable**

- **WHEN** the client creates the note "area/health.md"
- **THEN** the edit is refused as a conflict showing "already exists"
- **AND** the note "area/health.md" holds a line starting "- [ ] Call the dentist"

### Requirement: Edits stay inside the notes root  {#r-7ccc}

The server SHALL refuse an edit whose path is outside the root, hidden
(`.git`, `.meta-notes-cache`), not a `.md` file or malformed, with a 400, and
SHALL require the token like every other request.

#### Scenario: Paths outside the notes  {#s-9c72}

*Verification*: **executable**

- **WHEN** the client creates the note "../x.md"
- **THEN** the edit is refused as a bad request
- **WHEN** the client creates the note ".git/x.md"
- **THEN** the edit is refused as a bad request
- **WHEN** the client creates the note "notes.txt"
- **THEN** the edit is refused as a bad request

#### Scenario: A malformed edit  {#s-1cc8}

*Verification*: **executable**

- **WHEN** the client writes line 3 to line 2 of "area/health.md" believing it reads "" with ""
- **THEN** the edit is refused as a bad request

#### Scenario: No token  {#s-7e93}

*Verification*: **executable**

- **WHEN** a client creates the note "area/x.md" with a wrong token
- **THEN** the edit is refused as unauthorized

### Requirement: CLI errors are shown inline  {#r-3c48}

The client SHALL show a refusal or failure from the CLI next to the thing
being edited, in the CLI's words, and SHALL NOT lose the draft.

#### Scenario: A failed save  {#s-af22}

*Verification*: **non-executable**

- **WHEN** a save, task toggle or new note fails
- **THEN** the error shows inline and the draft stays

### Requirement: The other writes the human named  {#r-e63e}

The UI SHALL offer the other meta-notes writes the human named: add a task,
edit the Time Block and Time Log, and move, rename and archive a note, each
through the CLI with `--expect`.

#### Scenario: Time Block and Time Log  {#s-6f86}

*Verification*: **non-executable**

- **WHEN** the human edits a Time Block or Time Log row
- **THEN** the UI runs the meta-notes time-block or time-log command

#### Scenario: Add a task  {#s-4f99}

*Verification*: **non-executable**

- **WHEN** the human adds a task to a note
- **THEN** the UI runs the meta-notes task add command

#### Scenario: Move, rename and archive  {#s-8abc}

*Verification*: **non-executable**

- **WHEN** the human moves, renames or archives a note
- **THEN** the UI runs the matching meta-notes command and links to it keep working
