# Access

## Purpose

The server is reachable from a phone, so it is never open without a secret,
and it serves only files under the notes root.

## Requirements

### Requirement: Every request needs the token  {#r-8077}

The server SHALL refuse every request that does not carry the token, and
SHALL accept it as a bearer header or a cookie set by one `?token=` visit.

#### Scenario: No token  {#s-8327}

*Verification*: **executable**

- **WHEN** a client requests "/api/tree" without a token
- **THEN** the response status is 401

#### Scenario: Wrong token  {#s-a025}

*Verification*: **executable**

- **WHEN** a client requests "/api/tree" with the token "nope"
- **THEN** the response status is 401

#### Scenario: Right token  {#s-1aae}

*Verification*: **executable**

- **WHEN** a client requests "/api/tree" with the right token
- **THEN** the response status is 200

### Requirement: Paths are confined to the notes root  {#r-abbc}

The server SHALL serve only visible files under the notes root, never
`.git` or `.meta-notes-cache`, and never follow a path out of the root.

#### Scenario: Refused paths  {#s-ca59}

*Verification*: **executable**

- **WHEN** a client requests the note "\<path\>" with the right token
- **THEN** the note is not served

*Examples*:

| path                          |
| ----------------------------- |
| ../secret.md                  |
| .git/config.md                |
| .meta-notes-cache/ui/x.md     |
| link.md                       |

#### Scenario: A note in the root  {#s-9612}

*Verification*: **executable**

- **WHEN** a client requests the note "root.md" with the right token
- **THEN** the note is served
