# Top-bar menu

## Purpose

The human wants the alerts on/off control on every page, not only Today, so it
lives in a dropdown at the right end of the top bar. Open, New, Reload and
Daily move into it too; Today stays in the bar. Today and today's daily note
link to each other. (Ticket mu-nehy.)

## Requirements

### Requirement: The menu holds the alerts control  {#r-0965}

The top bar SHALL show a Menu button at its right end on every page the bar shows on (every page but Now and Lists on a phone; spec tabs). Its
dropdown SHALL hold an alerts item, then Open, New, Reload, Daily and Tasks. The
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

### Requirement: The menu holds Log out when there is a login  {#r-9354}

When the server has a login, the menu SHALL hold a Log out item after Tasks. It SHALL be a POST to
`/logout` (never a GET), so the server revokes this device's session and redirects to `/login`. With
no login (token mode) the menu SHALL have no Log out item, and the top bar SHALL have no Log out button.

#### Scenario: Logged in  {#s-822d}

*Verification*: **executable**

- **WHEN** the server has a login
- **THEN** the menu's last item is "Log out", a POST to "/logout"

#### Scenario: No login  {#s-6cd7}

*Verification*: **executable**

- **WHEN** the server has no login
- **THEN** the menu has no Log out item

#### Scenario: Clicking Log out in a browser  {#s-8e9c}

*Verification*: **non-executable**

- **WHEN** a signed-in user picks Log out from the Menu
- **THEN** the session ends and the browser lands on /login, and the top bar has no Log out button

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

### Requirement: The menu holds a theme setting  {#r-21c3}

The menu SHALL hold a Theme item showing the current setting (System, Light or Dark); each click SHALL
change it to the next, in that order, wrapping. The page SHALL show the dark styles for Dark, and for
System when the system is dark; an explicit Light SHALL win on a dark system. The choice SHALL apply at
once, on every page, before first paint, and survive a reload (kept per browser).

#### Scenario: The item cycles  {#s-fd83}

*Verification*: **executable**

- **WHEN** the theme is "system" and the Theme item is clicked three times
- **THEN** the settings shown are "Theme: Light", "Theme: Dark", "Theme: System"

#### Scenario: Light wins on a dark system  {#s-4bab}

*Verification*: **executable**

- **WHEN** the setting is "light" and the system is dark
- **THEN** the page theme is "light"

#### Scenario: System follows the system  {#s-1e39}

*Verification*: **executable**

- **WHEN** the setting is "system" and the system is dark
- **THEN** the page theme is "dark"

#### Scenario: Dark on a light system  {#s-6c97}

*Verification*: **executable**

- **WHEN** the setting is "dark" and the system is light
- **THEN** the page theme is "dark"

#### Scenario: Choosing in a browser  {#s-2524}

*Verification*: **non-executable**

- **WHEN** the user clicks Theme until it reads Light, then reloads, on a dark system
- **THEN** the page is light before and after the reload, with no flash of dark
