# Lists

## Purpose

The Lists tab shows the human's lists (a shopping list for a store, say) Reminders-style: open items
by group, tap to check one off into a Got section at the bottom, tap there to bring it back. It
opens on the day's current list. Everything is read and written through `meta-notes list ...`
(`--json`, and `check` / `uncheck` with `--expect`); the UI never parses or edits a list note
itself. Out of scope for now: creating, editing or sorting lists in the UI (the agent does that).
(Ticket mu-xfm2, epic mu-5tju.)

## Requirements

### Requirement: The tab opens on the current list  {#r-7a67}

The Lists tab SHALL open the day's current list, else the list the app last showed (if it still
exists), else the all-lists page.

#### Scenario: Current list first  {#s-30bf}

*Verification*: **executable**

- **WHEN** the day's current list is "Walmart", the last list shown was "Lowes", and both exist
- **THEN** the tab opens "Walmart"

#### Scenario: Last list when none is current  {#s-f322}

*Verification*: **executable**

- **WHEN** no list is current, the last list shown was "Lowes", and it exists
- **THEN** the tab opens "Lowes"

#### Scenario: All lists when nothing applies  {#s-5083}

*Verification*: **executable**

- **WHEN** no list is current and the last list shown no longer exists
- **THEN** the tab opens the all-lists page

### Requirement: All lists, newest first  {#r-c76c}

The all-lists page SHALL show every list, newest first, and the page of a list SHALL have a button
at the top left back to it.

#### Scenario: Newest first  {#s-62e0}

*Verification*: **executable**

- **WHEN** lists dated 2026-11-05 "Lowes" and 2026-11-07 "Walmart" exist
- **THEN** the lists are "Walmart" then "Lowes"

### Requirement: A list shows open items by group, and a Got section  {#r-a767}

A list SHALL show its groups in file order with their open items in file order; an item with no group
comes first, without a heading. Checked items SHALL appear in a Got section at the bottom, not in
their group. Canceled items SHALL be shown apart from both. An item's text is shown as written,
including a trailing `?`.

#### Scenario: Groups, Got and canceled  {#s-241b}

*Verification*: **executable**

- **WHEN** a list has "buns" and "milk?" in Bread, "eggs" and "butter" in Dairy, "eggs" checked, and "milk?" canceled
- **THEN** the open items are Bread: "buns"; Dairy: "butter"
- **AND** the Got section is "eggs"
- **AND** the canceled items are "milk?"

### Requirement: Check and uncheck go through the CLI  {#r-7b46}

Tapping an open item SHALL run `meta-notes list check` with `--expect` set to the item's text as
shown; tapping a Got item SHALL run `list uncheck` the same way, and the item returns to its place.
When the CLI refuses (the item's text changed meanwhile), the page SHALL show the error and leave
the item as it was.

#### Scenario: Check then uncheck  {#s-8617}

*Verification*: **executable**

- **WHEN** the user checks "buns" and then unchecks it
- **THEN** after the check "buns" is in the Got section and not in Bread
- **AND** after the uncheck "buns" is first in Bread again

#### Scenario: A refused check  {#s-ff73}

*Verification*: **executable**

- **WHEN** the user checks "buns" after the item's text was changed to "rolls" in the file
- **THEN** the server answers 409 with an error
- **AND** the item is still open

### Requirement: An item with a source links to its note and line  {#r-b5f1}

An item that came from a task SHALL have a link button that opens the source note on Home, scrolled
to the task's line; when the line moved, the line is found again by the copied text.

#### Scenario: The line is where it was  {#s-2e55}

*Verification*: **executable**

- **WHEN** an item's source is "area/t" line 2, "- [ ] buy screws", and the note's line 2 is "- [ ] buy screws"
- **THEN** the link opens "area/t.md" at line 2

#### Scenario: The line moved  {#s-3a33}

*Verification*: **executable**

- **WHEN** an item's source is "area/t" line 2, "- [ ] buy screws", and the note now has that task on line 4
- **THEN** the link opens "area/t.md" at line 4

### Requirement: The message button attaches the list  {#r-3022}

On a list page the shared message sheet SHALL attach the open list's path as its context.

#### Scenario: Context is the list path  {#s-7c52}

*Verification*: **executable**

- **WHEN** the user sends "add milk" from the list page "!lists/resource/lists/26-Q4/2026-11-07 Walmart.md"
- **THEN** the message text starts "[from the UI, page: resource/lists/26-Q4/2026-11-07 Walmart.md]"
