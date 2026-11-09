# Week page

## Purpose

The desktop week grid (epic mu-adm2, ticket mu-rwk3): a column per day, 15-minute rows, drawn from
`/api/week`. The page only renders; which source a slot shows is decided once by the cascade
(`design/specs/week.md`). The week note's Goals and Plan, editing and a phone layout are not here.

## Requirements

### Requirement: Each slot source has its own style and badge  {#r-7c3c}

The grid SHALL draw a slot from the `/api/week` data as it stands: a Time Log slot in the normal
style with no badge; any other source before now in one shared fill-in style with its badge (A, P or
Cal); the Plan after now in the normal plan style with no badge; a Calendar slot after now in its own
style with the badge Cal; a Time Log error in an error style with its short label; and a "in the
future" error in its own error style.

#### Scenario: A Time Log slot  {#s-5727}

*Verification*: **executable**

- **WHEN** the grid draws a past slot from the Time Log "Write report"
- **THEN** the slot has the style "wk-log" and no badge

#### Scenario: A fill-in before now  {#s-456b}

*Verification*: **executable**

- **WHEN** the grid draws past slots from Actual "Ran long" (badge A), Plan "Email" (badge P) and Calendar "Standup" (badge Cal)
- **THEN** each slot has the shared style "wk-fill" and its badge

#### Scenario: The plan after now  {#s-6489}

*Verification*: **executable**

- **WHEN** the grid draws a future slot from the Plan "Email"
- **THEN** the slot has the style "wk-plan" and no badge

#### Scenario: A calendar event after now  {#s-0ffe}

*Verification*: **executable**

- **WHEN** the grid draws a future slot from the Calendar "Standup"
- **THEN** the slot has the style "wk-cal" and the badge "Cal"

#### Scenario: A Time Log error  {#s-9b41}

*Verification*: **executable**

- **WHEN** the grid draws a past slot that is the error "missing end"
- **THEN** the slot has the style "wk-error" and the label "missing end"

#### Scenario: A record in the future  {#s-1e10}

*Verification*: **executable**

- **WHEN** the grid draws a future slot that is the error "in the future"
- **THEN** the slot has the style "wk-future-error" and the label "in the future"

### Requirement: The range and week are in the URL  {#r-a3c2}

The page SHALL show 7 days, the 5 weekdays or the 2-day weekend as the URL says
(`!week?start=<monday>&days=7|5|2`), 5 weekdays when it says nothing, and SHALL step a week back or
on by changing `start` by 7 days, keeping the range.

#### Scenario: The range comes from the URL  {#s-451f}

*Verification*: **executable**

- **WHEN** the page path is "!week?start=2026-11-04&days=7"
- **THEN** the week is the Monday 2026-11-02 and 7 days are shown

#### Scenario: No range in the URL  {#s-b7c9}

*Verification*: **executable**

- **WHEN** the page path is "!week" on 2026-11-07
- **THEN** the week is the Monday 2026-11-02 and 5 days are shown

#### Scenario: The weekend starts on Saturday  {#s-d629}

*Verification*: **executable**

- **WHEN** the page path is "!week?start=2026-11-02&days=2"
- **THEN** the grid starts on 2026-11-07

#### Scenario: Next week  {#s-e581}

*Verification*: **executable**

- **WHEN** the user steps to the next week from "!week?start=2026-11-02&days=7"
- **THEN** the page path is "!week?start=2026-11-09&days=7"

### Requirement: Tasks due are collapsible and the now line is on today  {#r-74ef}

The grid SHALL show each day's open tasks due in a list that is collapsed until opened, with its
count, and SHALL draw a now line in today's column only.

#### Scenario: The task list is collapsed  {#s-185c}

*Verification*: **executable**

- **WHEN** the grid draws a day with 2 tasks due
- **THEN** the day shows a collapsed list "2 due" holding both tasks

#### Scenario: The now line  {#s-46a3}

*Verification*: **executable**

- **WHEN** the grid draws 2026-11-06 and 2026-11-07 and today is 2026-11-07
- **THEN** only the column of 2026-11-07 has a now line

### Requirement: The step buttons show their dates and the grid opens at the start of the day  {#r-de21}

The previous and next buttons SHALL show the dates of the page they go to, following the range:
the Monday to Sunday, the Monday to Friday, or the Saturday and Sunday. The grid SHALL open scrolled
to two slots above the earliest box of the week, or to 7 AM on a week with none, once per page
shown and not again on a live update. The range bar stays in view with the day headers below it
while the grid scrolls. (Ticket mu-2fmn.)

#### Scenario: Buttons for 7 days  {#s-f6b8}

*Verification*: **executable**

- **WHEN** the page is "!week?start=2026-11-02&days=7"
- **THEN** the previous button reads "Oct 26 - Nov 1" and the next button reads "Nov 9 - 15"

#### Scenario: Buttons for weekdays  {#s-ea28}

*Verification*: **executable**

- **WHEN** the page is "!week?start=2026-11-02&days=5"
- **THEN** the previous button reads "Oct 26 - 30" and the next button reads "Nov 9 - 13"

#### Scenario: Buttons for the weekend  {#s-e5ef}

*Verification*: **executable**

- **WHEN** the page is "!week?start=2026-11-02&days=2"
- **THEN** the previous button reads "Oct 31 - Nov 1" and the next button reads "Nov 14 - 15"

#### Scenario: Opens above the earliest box  {#s-b14a}

*Verification*: **executable**

- **WHEN** the earliest box of the week starts at 9:00 AM
- **THEN** the grid opens at 8:30 AM

#### Scenario: Opens at 7 AM on an empty week  {#s-939a}

*Verification*: **executable**

- **WHEN** the week has no boxes
- **THEN** the grid opens at 7:00 AM
