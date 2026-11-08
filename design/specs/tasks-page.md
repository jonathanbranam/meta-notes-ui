# Tasks page

## Purpose

The human sees every dated open task in one place: overdue, due today and
upcoming, across all notes, and marks each done or canceled without an agent.
(Ticket mu-tr69: "there's no other view for seeing due and pending tasks in the UI; i definitely need that somewhere".)

## Requirements

### Requirement: The server lists dated open tasks  {#r-823c}

The server SHALL answer `GET /api/tasks/due`, with the token, with the open
tasks that are overdue, due today or dated for later, from `meta-notes tasks
--overdue --due --future`.

#### Scenario: Overdue and upcoming tasks  {#s-ed29}

*Verification*: **executable**

- **WHEN** the dated open tasks are requested
- **THEN** the Tasks page lists "Order tiles" in "area/Home Care.md"
- **AND** it lists "Annual checkup" in "area/health.md"

### Requirement: Tasks are grouped by due date  {#r-4150}

The Tasks page SHALL group the tasks as Overdue (due before today), Due today
and Upcoming (due after today), each in date order, and SHALL leave out
undated tasks.

#### Scenario: Three groups  {#s-fb3f}

*Verification*: **executable**

- **WHEN** today is "2026-11-08"
- **AND** the page gets tasks due "2026-11-01", "2026-11-08", "2026-11-20" and one with no date
- **THEN** Overdue holds the task due "2026-11-01"
- **AND** Due today holds the task due "2026-11-08"
- **AND** Upcoming holds the task due "2026-11-20"
- **AND** the page shows 3 tasks

### Requirement: A task is checked off or canceled from the Tasks page  {#r-060b}

Each row SHALL be the shared task row: its box marks the task done and its
Cancel button marks it canceled, both through `POST /api/task` with the task's
note, line and text as listed (rule writes-through-the-cli), and the task SHALL
then leave the list. A row links to its note. The page reloads when notes change.

#### Scenario: Mark one done  {#s-dc21}

*Verification*: **executable**

- **WHEN** the dated open tasks are requested
- **AND** the listed task "Order tiles" is marked done
- **THEN** the note "area/Home Care.md" holds a line starting "- [x] Order tiles"
- **AND** the dated open tasks then no longer list "Order tiles"

### Requirement: The Tasks page is reachable on a phone and on a desktop  {#r-bfb7}

The Tasks page SHALL live at the address `#!tasks`. On a phone it SHALL be the
last tab of the tab bar (spec tabs); on every width the top bar's Menu SHALL
have a Tasks item that opens it.

#### Scenario: The address is the Tasks tab  {#s-8ab2}

*Verification*: **executable**

- **WHEN** the address "!tasks" is opened
- **THEN** the page belongs to the Tasks tab
