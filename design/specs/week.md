# Week view data

## Purpose

The work week view (epic mu-adm2) shows a week, the 5 weekdays or the weekend as 15-minute slots per
day. One cascade decides what each slot shows, so the page only renders. The human: "the cascading
order should be written once, defined once, and used everywhere." This spec is the data and the
cascade; the grid page is a later ticket. Everything is read through the meta-notes CLI and the daily
notes it names; nothing is written.

## Requirements

### Requirement: One cascade decides each slot  {#r-7b92}

A 15-minute slot SHALL show, before now, the first of Time Log, Actual, Plan, Calendar that has
content, and after now the first of Plan, Calendar. Only the Time Log before now and the Plan after
now are the default source; every other source SHALL carry a badge: A (Actual), P (Plan), Cal (Calendar).

#### Scenario: Before now the Time Log wins  {#s-2dfb}

*Verification*: **executable**

- **WHEN** a slot has Time Log "Write report", Actual "Meeting ran long", Plan "Email" and Calendar "Standup", and it is before now
- **THEN** the slot shows the log "Write report" with no badge

#### Scenario: Before now Actual is the next fill-in  {#s-2b87}

*Verification*: **executable**

- **WHEN** a slot has Actual "Meeting ran long", Plan "Email" and Calendar "Standup", and it is before now
- **THEN** the slot shows the actual "Meeting ran long" with badge "A"

#### Scenario: Before now the Plan follows  {#s-6a22}

*Verification*: **executable**

- **WHEN** a slot has Plan "Email" and Calendar "Standup", and it is before now
- **THEN** the slot shows the plan "Email" with badge "P"

#### Scenario: Before now the Calendar follows  {#s-731d}

*Verification*: **executable**

- **WHEN** a slot has Calendar "Standup", and it is before now
- **THEN** the slot shows the calendar "Standup" with badge "Cal"

#### Scenario: Before now nothing at all  {#s-7720}

*Verification*: **executable**

- **WHEN** a slot has nothing, and it is before now
- **THEN** the slot is empty

#### Scenario: After now the Plan wins  {#s-c642}

*Verification*: **executable**

- **WHEN** a slot has Plan "Email" and Calendar "Standup", and it is after now
- **THEN** the slot shows the plan "Email" with no badge

#### Scenario: After now the Calendar follows  {#s-1cff}

*Verification*: **executable**

- **WHEN** a slot has Calendar "Standup", and it is after now
- **THEN** the slot shows the calendar "Standup" with badge "Cal"

#### Scenario: After now nothing at all  {#s-3333}

*Verification*: **executable**

- **WHEN** a slot has nothing, and it is after now
- **THEN** the slot is empty

### Requirement: A record in the future is an error  {#r-a5bf}

A Time Log entry or an Actual cell in a slot after now SHALL make that slot an error labelled
"in the future", whatever else the slot holds.

#### Scenario: A Time Log entry in the future  {#s-2c4f}

*Verification*: **executable**

- **WHEN** a slot has Time Log "Write report" and Plan "Email", and it is after now
- **THEN** the slot is an error "in the future" about "Write report"

#### Scenario: An Actual in the future  {#s-5de7}

*Verification*: **executable**

- **WHEN** a slot has Actual "Meeting ran long" and Plan "Email", and it is after now
- **THEN** the slot is an error "in the future" about "Meeting ran long"

### Requirement: A bad Time Log still shows every good entry  {#r-8a51}

The week SHALL show every good Time Log entry of a day whose Log has errors, and mark each error
spot as an error slot with a short label: "missing start", "missing end", "duplicate starts" or
"duplicate ends". An open entry that started before now on today is running, not an error.

#### Scenario: Each error label  {#s-c565}

*Verification*: **executable**

- **WHEN** a past day's Log has a good entry, an entry with two starts, an entry with two ends, an entry with no start and an entry with no end
- **THEN** the day shows the good entry normally
- **AND** the day has error slots "duplicate starts", "duplicate ends", "missing start" and "missing end"

#### Scenario: The running entry is not an error  {#s-bf07}

*Verification*: **executable**

- **WHEN** today's last Log entry started at 10:15 with no end and it is 10:50
- **THEN** that entry fills the slots from 10:15 to 10:45
- **AND** the day has no error slots

### Requirement: The week endpoint serves 7, 5 or 2 days  {#r-fab1}

The server SHALL answer `GET /api/week?start=YYYY-MM-DD&days=N`, with the token, with N of 7, 5 or 2
consecutive days from `start`, each with 96 slots, its Time Log errors, its all-day calendar events
and the open tasks due that day. Any other N SHALL be refused. It SHALL NOT create or change a note.

#### Scenario: Needs the token  {#s-2f6c}

*Verification*: **executable**

- **WHEN** the week is requested without a token
- **THEN** the week is refused

#### Scenario: Seven, five and two days  {#s-bd7c}

*Verification*: **executable**

- **WHEN** the week is requested from 2026-11-02 for 7, 5 and 2 days, and for 3 days
- **THEN** the replies hold 7, 5 and 2 days of 96 slots, and the 3-day request is refused

#### Scenario: A day with a note and a day without  {#s-0084}

*Verification*: **executable**

- **WHEN** the week is requested for a day with a daily note holding a Time Block plan "Review" at 9:00am, and a day with none
- **THEN** the day with the note shows the plan "Review" at 9:00
- **AND** the day without a note has no plan or log slots

#### Scenario: Tasks due each day  {#s-34c5}

*Verification*: **executable**

- **WHEN** the week is requested for days holding the tasks "Send invoice" due 2026-11-03 and "Renew badge" due 2026-11-05
- **THEN** 2026-11-03 lists "Send invoice" and no other day does
- **AND** 2026-11-05 lists "Renew badge"

#### Scenario: Calendar events fill in  {#s-43d3}

*Verification*: **executable**

Skipped, with the reason, when the root's `.venv` cannot be built (`meta-notes calendar` needs it).

- **WHEN** the week is requested for a root with a calendar export holding "Fixture standup" at 14:00 on 2026-11-03 and an all-day "Fixture holiday" on 2026-11-04
- **THEN** 2026-11-03 shows "Fixture standup" with badge "Cal" at 14:00
- **AND** 2026-11-04 lists the all-day event "Fixture holiday"
