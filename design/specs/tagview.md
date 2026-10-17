# Tag task view

## Purpose

The human works a grouped set of tasks without an agent: every open task
carrying one tag, across all notes, checked off one by one. (Ticket mu-x6nb:
"I'm working on this set of tasks now that are grouped together".)

## Requirements

### Requirement: A tag lists its open tasks  {#r-c098}

The server SHALL answer `GET /api/tasks?tag=<tag>`, with the token, with the
open tasks that carry the tag in any note, from `meta-notes tasks --tag`
(so tag aliases fold as meta-notes folds them). A tag is letters, digits, `_`
and `-`; anything else is refused.

#### Scenario: Open tasks for a tag  {#s-1906}

*Verification*: **executable**

- **WHEN** the tasks tagged "make-bread" are requested
- **THEN** the tag view lists a task in "project/make-bread/Home.md" reading "Buy a banneton"
- **AND** it lists a task in "plan/week/26-Q3/2026-09-28.md" reading "Bake a loaf"

#### Scenario: A bad tag  {#s-1a96}

*Verification*: **executable**

- **WHEN** the tasks tagged "a/b" are requested
- **THEN** the tag view request is refused

### Requirement: A task is checked off from the tag view  {#r-e8f3}

Checking a task in the tag view SHALL go through `POST /api/task` with the
task's note, line and text as listed (rule writes-through-the-cli), and the
task SHALL then leave the list.

#### Scenario: Check one off  {#s-18c5}

*Verification*: **executable**

- **WHEN** the tasks tagged "make-bread" are requested
- **AND** the listed task in "project/make-bread/Home.md" is checked off
- **THEN** the note "project/make-bread/Home.md" holds a line starting "- [x] Buy a banneton"
- **AND** the tasks tagged "make-bread" then no longer list it

### Requirement: A tag in a note opens its view  {#r-e7b9}

A marked `#tag` in a note SHALL link to the address `#tag/<tag>`, which shows
the tag view and can be bookmarked or opened directly.

#### Scenario: Tag address  {#s-890f}

*Verification*: **executable**

- **WHEN** the address "tag/make-bread" is opened
- **THEN** it shows the tag view for "make-bread"
- **AND** the address "tag/make-bread.md" does not
