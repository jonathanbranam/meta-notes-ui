# Now

## Purpose

The Now page shows what the human is doing: the running Time Log entry with a timer and overage, the
previous entry, the next planned block, and a Done button that logs the end and starts the next block.
It is the first tab on a phone and a page ("Now" in the top bar) on a desktop browser. Reads come from
today's daily note (Time Block and Time Log); writes go only through `meta-notes time-log` with the
expect checks the Time Log edits already use. (Ticket mu-97fh, epic mu-adm2.)

Out of scope for now, by the human's decision: changing what is running, writing the Time Block Actual
column, anything special for driving (Start and Done on a "Drive to work" block is the trip timer).

## Requirements

### Requirement: Blocks are runs of rows with the same Plan  {#r-e1b5}

The client SHALL group consecutive Time Block rows with the same Plan into one block, from the first
row's time to a quarter hour after the last row's. Rows with no plan (empty, `no plan`, struck out)
SHALL belong to no block.

#### Scenario: Consecutive rows with one Plan  {#s-4f0d}

*Verification*: **executable**

- **WHEN** a daily note plans "Drive to work" at 7:45am and 8:00am, "work" from 8:15am to 9:30am, and "no plan" at 9:45am
- **THEN** the blocks are "Drive to work" 7:45-8:15 and "work" 8:15-9:45

### Requirement: The running entry shows a timer and overage  {#r-0a7c}

The Now page SHALL treat the last Time Log entry as running when it has a start and no end, show the
time worked on it (always increasing) and when it started, and show overage separately: the time
past the planned end of its block on the clock, in red, only while over.

#### Scenario: Running within the plan  {#s-92e1}

*Verification*: **executable**

- **WHEN** the log's last entry "Drive to work" started at 07:50 with no end, in a block planned until 8:15, and it is 8:05
- **THEN** the time worked is 15 minutes
- **AND** the overage is 0

#### Scenario: Running past the planned end  {#s-5c36}

*Verification*: **executable**

- **WHEN** the log's last entry "Drive to work" started at 07:50 with no end, in a block planned until 8:15, and it is 8:19
- **THEN** the time worked is 29 minutes
- **AND** the overage is 4 minutes

### Requirement: Start when nothing runs  {#r-3b94}

With no running entry the Now page SHALL show the block planned for now (else the next one) with a
Start button, and Start SHALL append one Time Log entry for that block starting now.

#### Scenario: Nothing running  {#s-b0f2}

*Verification*: **executable**

- **WHEN** the log's last entry is finished and it is 8:20 with "work" planned from 8:15 to 9:45
- **THEN** the page shows "work" with nothing running
- **AND** Start appends exactly one entry "- work" starting 08:20 and leaves the finished entry as it was

### Requirement: Done ends the entry and starts the next block  {#r-d27a}

Done SHALL, in one Time Log append, end the running entry at the current time and add an entry for
the block it starts then, and SHALL send the aide a message when messaging is configured. The block
it starts is the one planned on the clock now, unless that is the block the entry matched by name
(same plan, ending after the entry started), then the block after it; with no block on the clock, the
next one to come. The "Next:" line, the message and the write SHALL name the same block. When there
is none, Done SHALL only end the entry. The Time Block Actual column is not written.

#### Scenario: Done chains to the next block  {#s-a6d8}

*Verification*: **executable**

- **WHEN** "Drive to work" runs from 07:50, "work" is planned next, and the user presses Done at 8:04
- **THEN** exactly one entry "- work" is appended starting 08:04
- **AND** "Drive to work" now ends at 08:04
- **AND** the Time Block is unchanged

#### Scenario: Done with no next block  {#s-71c9}

*Verification*: **executable**

- **WHEN** "work" runs from 08:15 with no block after it, and the user presses Done at 9:50
- **THEN** no entry is appended
- **AND** "work" now ends at 09:50

#### Scenario: The Done message  {#s-c15e}

*Verification*: **executable**

- **WHEN** "Drive to work" ran 7:50 to 8:19 in a block planned until 8:15, followed by "work" until 10:00
- **THEN** the message reads "Done: Drive to work, 7:50-8:19 (4 min over). Now: work, until 10:00."

#### Scenario: An off-plan entry starts the block on the clock  {#s-b661}

*Verification*: **executable**

- **WHEN** blocks A 9-10, B 10-11, C 11-12 are planned, "call" (not in the plan) started 10:20, and the user presses Done at 10:40
- **THEN** the block started is "B"

#### Scenario: An overrun of a whole block starts the block on the clock  {#s-d37f}

*Verification*: **executable**

- **WHEN** blocks A 9-10, B 10-11, C 11-12 are planned, "A" started 9:00, and the user presses Done at 11:30
- **THEN** the block started is "C"

#### Scenario: A slight overrun starts the block after the entry's own  {#s-871d}

*Verification*: **executable**

- **WHEN** blocks A 9-10, B 10-11, C 11-12 are planned, "A" started 9:00, and the user presses Done at 10:10
- **THEN** the block started is "B"

### Requirement: The page follows the files  {#r-6e4b}

The Now page SHALL use the same live data as Today: a change to the daily note's Time Block or Time
Log re-fetches it, so the page updates with no reload.

#### Scenario: A file change refreshes the page  {#s-2d83}

*Verification*: **executable**

- **WHEN** the daily note's Time Log gains a finished entry after the page was shown
- **THEN** a new read of the note shows that entry as the previous one

### Requirement: Previous and the day's blocks  {#r-8c52}

The page SHALL show the last finished log entry as one line, the next block, and below the timer the
rest of the day's blocks.

#### Scenario: Previous and next  {#s-f47a}

*Verification*: **non-executable**

- **WHEN** the user opens Now while "Drive to work" runs
- **THEN** one line names the previous finished entry, one line names the next block, and the day's blocks list below
