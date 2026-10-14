# Top-bar menu

## Purpose

The human wants the alerts on/off control on every page, not only Today, so it
lives in a dropdown at the right end of the top bar. Open, New, Reload and
Daily move into it too; Today stays in the bar. Today and today's daily note
link to each other. (Ticket mu-nehy.)

## Requirements

### Requirement: The menu holds the alerts control  {#r-0965}

The top bar SHALL show a Menu button at its right end on every page. Its
dropdown SHALL hold an alerts item, then Open, New, Reload and Daily. The
alerts item SHALL read "Enable alerts" when this device is not subscribed and
"Alerts off" when it is. It SHALL be absent when the server has push off.

#### Scenario: Not subscribed  {#s-4fef}

*Verification*: **executable**

- **WHEN** the server has push on, notifications are allowed, and this device is not subscribed
- **THEN** the menu's alerts item is "Enable alerts"

#### Scenario: Subscribed  {#s-e8fd}

*Verification*: **executable**

- **WHEN** the server has push on and this device is subscribed
- **THEN** the menu's alerts item is "Alerts off"

#### Scenario: Push off on the server  {#s-3a0b}

*Verification*: **executable**

- **WHEN** the server has push off
- **THEN** the menu has no alerts item

### Requirement: The menu closes  {#r-c535}

The menu SHALL close on a pick, on Escape and on a press outside it, and SHALL
work by touch.

#### Scenario: Escape and outside  {#s-abe1}

*Verification*: **executable**

- **WHEN** Escape is pressed, or a press lands outside the menu
- **THEN** the menu closes

#### Scenario: A press inside  {#s-b5fa}

*Verification*: **executable**

- **WHEN** a press lands inside the menu
- **THEN** the menu stays open

### Requirement: Today and the daily note link to each other  {#r-eb74}

The Today view SHALL show a button to today's daily note when it exists, and
that note SHALL show a button back to Today. No other note shows either.

#### Scenario: Today to the daily note  {#s-04db}

*Verification*: **executable**

- **WHEN** the user is on Today and today's daily note is "plan/daily/26-Q4/2026-10-13 Tue.md"
- **THEN** the link is "Daily note" to "plan/daily/26-Q4/2026-10-13 Tue.md"

#### Scenario: The daily note back to Today  {#s-1cdc}

*Verification*: **executable**

- **WHEN** the user is on "plan/daily/26-Q4/2026-10-13 Tue.md" and today's daily note is that note
- **THEN** the link is "Today" to Today

#### Scenario: Any other note  {#s-cf75}

*Verification*: **executable**

- **WHEN** the user is on "a.md" and today's daily note is "plan/daily/26-Q4/2026-10-13 Tue.md"
- **THEN** there is no link
