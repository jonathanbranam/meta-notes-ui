# Today view, alerts and reminders, PWA

## Purpose

The human wants a view of today's plan, tasks and Time Block, nudges from due
times and the Time Block, and the app installed on the phone. Alerts are
browser notifications driven by client-side timers, so the server does
nothing while idle (rule light-on-resources). Words from the human: "alerts
and reminders and some interactive capabilities that vim doesn't".

## Requirements

### Requirement: The Today view shows today's daily note and tasks  {#r-8c13}

The server SHALL answer `GET /api/today`, with the token, with today's daily
note (path and text) and the tasks that are due today or overdue, all from
the meta-notes CLI.

#### Scenario: Needs the token  {#s-8b56}

*Verification*: **executable**

- **WHEN** the Today view is requested without a token
- **THEN** the Today view is refused

#### Scenario: Daily note and due tasks  {#s-514f}

*Verification*: **executable**

- **WHEN** the Today view is requested with the right token
- **THEN** the Today view holds the daily note with the text "Time Block"
- **AND** the Today view lists the task "Call the dentist" at "09:30"

#### Scenario: Agenda from the calendar  {#s-89e3}

*Verification*: **non-executable**

- **WHEN** `meta-notes calendar --json` succeeds (it needs a calendar export in the root's `.meta-notes-cache/ics/` and the root's `.venv`)
- **THEN** the Today view lists today's calendar events, and none when it fails

### Requirement: The Today view never writes  {#r-c42c}

The Today view SHALL NOT create or change any note; when today's daily note
does not exist it shows that, and the human creates it on purpose.

#### Scenario: No daily note yet  {#s-2dca}

*Verification*: **executable**

- **WHEN** the Today view is requested for a root with no daily note
- **THEN** no note is created and the Today view has no daily note

### Requirement: The Time Block is read from the daily note  {#r-0fbe}

The client SHALL read the rows of the Time Block table (time and Plan) from
the daily note's "Time Block" section only, and know which row holds the
current time.

#### Scenario: Rows under the heading only  {#s-6369}

*Verification*: **executable**

- **WHEN** the Time Block of the sample daily note is read
- **THEN** the rows are "480=, 510=start work, 540=no plan, 570=~old~, 735=lunch"

#### Scenario: Planned rows  {#s-b932}

*Verification*: **executable**

- **WHEN** the Time Block of the sample daily note is read
- **THEN** the planned rows are "510, 735"

#### Scenario: Current row  {#s-cd6d}

*Verification*: **executable**

- **WHEN** the Time Block of the sample daily note is read
- **THEN** at minute 515 the current row starts at minute 510
- **AND** at minute 420 there is no current row
- **AND** at minute 749 the current row starts at minute 735
- **AND** at minute 750 there is no current row

### Requirement: Alerts come from due times and the Time Block  {#r-8b04}

The client SHALL build an alert for each task due today with a time (⏰) and
for each planned Time Block row, in time order. It SHALL NOT alert for
overdue tasks, tasks without a time, rows that are empty, "no plan" or
struck out, or rows whose plan is the same as the row before (one alert
when a plan starts, not one per quarter hour).

#### Scenario: Alerts in time order  {#s-5789}

*Verification*: **executable**

- **WHEN** alerts are built for 2026-10-04 from the sample tasks and the sample daily note
- **THEN** the alerts are "08:30 start work, 09:30 Call the dentist, 12:15 lunch"

#### Scenario: A plan that continues alerts once  {#s-66c0}

*Verification*: **executable**

- **WHEN** alerts are built for 2026-10-04 from a daily note planning "focus" from 9:00am to 10:00am
- **THEN** the alerts are "09:00 focus"

#### Scenario: Each alert fires once a day, and can be snoozed  {#s-cf95}

*Verification*: **non-executable**

- **WHEN** an alert's time arrives while the page is open
- **THEN** a browser notification shows once that day, however often the data reloads
- **AND** the human can dismiss it or snooze it, and a snoozed alert fires again later

#### Scenario: Alerts need permission  {#s-8e79}

*Verification*: **non-executable**

- **WHEN** the browser has not granted notifications
- **THEN** the view offers to enable alerts, and says so when they are blocked or unsupported

#### Scenario: Alerts reach the phone when the app is closed  {#s-d7c1}

*Verification*: **non-executable**

- **WHEN** an alert's time arrives and the app is not open on the phone
- **THEN** the phone shows a push, alert or alarm

Gap: alerts fire only from timers in an open page; the human asked for a
bridge that sends pushes, alerts and alarms to the device.

### Requirement: The app installs as a PWA  {#r-4e99}

The server SHALL serve the manifest, the service worker and the icons, and
only with the token. The manifest SHALL make the app installable standalone.

#### Scenario: App files need the token  {#s-ce50}

*Verification*: **executable**

- **WHEN** the app files are requested without a token
- **THEN** none is served

#### Scenario: App files with the token  {#s-b7e2}

*Verification*: **executable**

- **WHEN** the app files are requested with the right token
- **THEN** all are served
- **AND** the manifest has the type "application/manifest+json" and the display "standalone"

#### Scenario: The service worker caches nothing  {#s-7f8b}

*Verification*: **non-executable**

- **WHEN** the app is installed
- **THEN** every request still goes to the server with the token, as the notes are live
