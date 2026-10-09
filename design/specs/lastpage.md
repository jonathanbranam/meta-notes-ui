# Reopen the last page

## Purpose

The human closes the app and opens it again, and wants to land where they
were. The page they were on is kept in the browser's localStorage, never on
the server, and a fresh start opens it. With nothing stored, the app opens
Today. A page named in the URL always wins. (Ticket u4b9.)

## Requirements

### Requirement: A fresh start reopens the last page  {#r-4e08}

The client SHALL keep the page the user is on in the browser's localStorage,
and on a fresh start with no page named in the URL SHALL open that page; with
nothing stored it SHALL open Today. A page named in the URL SHALL win over the
stored page.

#### Scenario: Stored page reopened  {#s-69d2}

*Verification*: **executable**

- **WHEN** the app starts with no page in the URL and the page "Projects/Plan" is stored
- **THEN** the app opens "Projects/Plan"

#### Scenario: Nothing stored opens Today  {#s-4826}

*Verification*: **executable**

- **WHEN** the app starts with no page in the URL and nothing is stored
- **THEN** the app opens Today

#### Scenario: A named page beats the stored page  {#s-6704}

*Verification*: **executable**

- **WHEN** the app starts with the URL naming "Daily/2026-10-04" and the page "Projects/Plan" is stored
- **THEN** the app opens "Daily/2026-10-04"

#### Scenario: A stored page that is gone opens Today  {#s-321a}

*Verification*: **non-executable**

- **WHEN** the app starts with no page in the URL and the stored page is no longer in the notes root
- **THEN** once the file tree has loaded the app opens Today, replacing the history entry, and shows no "Cannot open" error

#### Scenario: Only the page is stored  {#s-e66d}

*Verification*: **non-executable**

- **WHEN** the user opens a page or Today
- **THEN** the browser's localStorage holds that page's path under one key, and nothing is sent to the server
