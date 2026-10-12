# Previous and next note

## Purpose

The human steps from a note to the one before or after it from the top bar,
without opening the tree. On Today it steps through the daily notes, as the
meta-notes vim command does. (Ticket h4rr.)

## Requirements

### Requirement: Every note page steps to its neighbours  {#r-de86}

The top bar SHALL show previous and next buttons on every page. On a note they
SHALL open the neighbouring .md file in the same folder, in sorted order. A
button SHALL be disabled when there is no note in that direction. They SHALL
never create a note.

#### Scenario: Neighbours in the folder  {#s-74e2}

*Verification*: **executable**

- **WHEN** the user is on "Proj/b.md" and the folder holds "Proj/a.md", "Proj/b.md" and "Proj/d.md"
- **THEN** previous is "Proj/a.md" and next is "Proj/d.md"

#### Scenario: Disabled at the ends  {#s-4a0c}

*Verification*: **executable**

- **WHEN** the user is on "Proj/a.md" and the folder holds "Proj/a.md" and "Proj/b.md"
- **THEN** previous is disabled and next is "Proj/b.md"

### Requirement: Daily notes step across quarter folders  {#r-033b}

On a daily note and on Today (relative to today's daily note, which need not
exist), previous and next SHALL be the neighbours in one sorted list of every
note under plan/daily, so days without a note are skipped and quarter and year
folders are crossed.

#### Scenario: Across a quarter boundary  {#s-d483}

*Verification*: **executable**

- **WHEN** the user is on "plan/daily/26-Q1/2026-03-31 Tue.md" and "plan/daily/26-Q2/2026-04-01 Wed.md" exists
- **THEN** next is "plan/daily/26-Q2/2026-04-01 Wed.md"

#### Scenario: Buttons in the top bar  {#s-7b35}

*Verification*: **non-executable**

- **WHEN** the window is 400 px wide
- **THEN** the previous and next buttons are in the top bar and it does not overflow
