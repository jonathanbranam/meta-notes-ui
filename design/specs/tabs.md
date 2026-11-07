# Tabs and Lists

## Purpose

On a phone the app has a bottom tab bar: Home (today's app), Lists, and later Now first on the
left. A desktop browser has no tab bar. The Lists page here is the shell; its content comes with
the Lists content ticket. (Ticket mu-5eme, epic mu-5tju.)

## Requirements

### Requirement: The tab bar is mobile only  {#r-540f}

The client SHALL show a bottom tab bar with Home and Lists, in that order, on a viewport 720
pixels wide or less, and SHALL NOT show it on a wider one.

#### Scenario: Phone width  {#s-8cd4}

*Verification*: **executable**

- **WHEN** the viewport is 390 pixels wide
- **THEN** the tab bar shows

#### Scenario: Desktop width  {#s-8ec2}

*Verification*: **executable**

- **WHEN** the viewport is 1280 pixels wide
- **THEN** the tab bar does not show

### Requirement: The tab is in the URL and each tab keeps its page  {#r-1680}

The client SHALL show Lists for the address hash `!lists` (and `!lists/<list path>` for one list)
and Home for every other page, and a tap on a tab SHALL open the page that tab last showed. The
last page, Lists included, reopens on a fresh start (spec lastpage).

#### Scenario: Switching tabs keeps state  {#s-a2e8}

*Verification*: **executable**

- **WHEN** the user opens "Projects/Plan.md" on Home, then Lists, then taps Home
- **THEN** the page is "Projects/Plan.md"

### Requirement: The Lists page shell  {#r-259b}

The Lists page SHALL have a top-left button back to all lists (hidden on the all-lists page) and
an empty state until lists exist.

#### Scenario: Empty Lists  {#s-3ed3}

*Verification*: **non-executable**

- **WHEN** the user taps Lists
- **THEN** the page says there are no lists yet

### Requirement: One message sheet for every page  {#r-e44d}

Home and Lists SHALL open the same message sheet (one component; the opening button may differ per
page). It sends fire-and-forget to the notes aide with the page's path attached to the text, takes
dictated text, submits on Enter (Shift+Enter is a new line), has a large Send button, and shows no
reply.

#### Scenario: Send with context  {#s-1363}

*Verification*: **executable**

- **WHEN** the user sends "buy milk" from the page "!lists/a.md"
- **THEN** the message text is "[from the UI, page: !lists/a.md]" followed by a blank line and "buy milk"

#### Scenario: Enter submits  {#s-b3a9}

*Verification*: **executable**

- **WHEN** the user presses Enter without Shift in the sheet
- **THEN** the message is submitted
