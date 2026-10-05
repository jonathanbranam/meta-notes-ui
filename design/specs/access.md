# Access

## Purpose

The server is reachable from a phone, so it is never open without a secret,
it serves only files under the notes root, and it binds only the loopback
address unless told otherwise. This spec also covers the server's start
contract, which the CLI (`meta-notes ui start|stop|status|open`) relies on.

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

#### Scenario: Every endpoint refuses without a token  {#s-6a0d}

*Verification*: **executable**

- **WHEN** a client requests "\<url\>" without a token
- **THEN** the response status is 401

*Examples*:

| url                          |
| ---------------------------- |
| /                            |
| /api/version                 |
| /api/tree                    |
| /api/note?path=root.md       |
| /api/backlinks?path=root.md  |
| /api/daily                   |
| /api/events                  |

#### Scenario: A token in the query is not enough  {#s-b4e1}

*Verification*: **executable**

- **WHEN** a client requests "/api/version?token=s3cret-token" without a token
- **THEN** the response status is 401

#### Scenario: The visit URL trades the token for a cookie  {#s-f27c}

*Verification*: **executable**

- **WHEN** a client visits "/?token=s3cret-token"
- **THEN** the response redirects to "/"
- **AND** it sets an httpOnly cookie
- **AND** a request carrying only that cookie gets status 200

#### Scenario: A wrong token in the visit URL  {#s-3d90}

*Verification*: **executable**

- **WHEN** a client visits "/?token=nope"
- **THEN** the response status is 401
- **AND** it sets no cookie

#### Scenario: The built client is behind the token too  {#s-c815}

*Verification*: **non-executable**

- **WHEN** a client requests a static client file such as "/index.html" without a token
- **THEN** the response status is 401, and with the token the file is served only from inside the client build directory

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
| area/../../secret.md          |
| %2e%2e/secret.md              |
| /etc/passwd.md                |
| node_modules/pkg/readme.md    |
| .venv/lib/x.md                |

#### Scenario: Only notes are read  {#s-5e72}

*Verification*: **executable**

- **WHEN** a client requests the note "notes.txt" with the right token
- **THEN** the response status is 400

#### Scenario: A note in the root  {#s-9612}

*Verification*: **executable**

- **WHEN** a client requests the note "root.md" with the right token
- **THEN** the note is served

### Requirement: The token lives in a file kept by the CLI  {#r-2b9e}

The server SHALL read its token from the file named by `--token-file`, and
SHALL create that file, readable only by its owner, with a random token when
it is absent or empty. The token is set at start and given to the browser
once, through a URL the CLI prints or opens.

#### Scenario: First start creates the token file  {#s-91c4}

*Verification*: **executable**

- **WHEN** the server loads a token from a missing token file
- **THEN** the file holds a random token, mode 0600
- **AND** loading again returns the same token

#### Scenario: The CLI prints or opens the visit URL  {#s-7d03}

*Verification*: **non-executable**

- **WHEN** the human runs `meta-notes ui open`
- **THEN** the URL printed or opened is the server's URL with `?token=` and the token from the token file (the CLI's behaviour, specified here, built in meta-notes)

### Requirement: The server binds loopback unless told otherwise  {#r-e6a8}

The server SHALL bind 127.0.0.1 unless started with `--host`, and SHALL
bind the given host (a LAN or Tailscale address, or an IPv6 address) when
it is. The token is required either way.

#### Scenario: Default host  {#s-0c5f}

*Verification*: **non-executable**

- **WHEN** the server is started without `--host`
- **THEN** it listens on 127.0.0.1 only, and its `server.json` host is "127.0.0.1"

#### Scenario: A host for the phone  {#s-a8d6}

*Verification*: **non-executable**

- **WHEN** the server is started with `--host 100.64.0.7`
- **THEN** it listens on that address, and its `server.json` url is `http://100.64.0.7:<port>`

### Requirement: The start contract and server.json  {#r-4f13}

The server SHALL start as `node dist/server/index.js --root <notes root>
--token-file <path> [--port N] [--host H]`, with port 0 (a free port) by
default, and exit with status 2 and a usage line when `--root` or
`--token-file` is missing. When listening it SHALL write
`<root>/.meta-notes-cache/ui/server.json` with `pid`, `host`, `port`, `url`
and `version`, and SHALL remove it on exit, including SIGINT and SIGTERM.

#### Scenario: Missing arguments  {#s-d2e9}

*Verification*: **non-executable**

- **WHEN** the server is started without `--token-file`
- **THEN** it prints a usage line and exits with status 2

#### Scenario: Listening writes server.json  {#s-58b7}

*Verification*: **non-executable**

- **WHEN** the server is started on a notes root with port 0
- **THEN** `.meta-notes-cache/ui/server.json` holds the pid, host, the chosen port, the url and the version

#### Scenario: Stopping removes server.json  {#s-e013}

*Verification*: **non-executable**

- **WHEN** the running server receives SIGTERM
- **THEN** it exits and `server.json` is gone
