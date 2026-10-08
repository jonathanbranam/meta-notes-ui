# Message

## Purpose

The human can send a message from the UI to one bridle agent (the notes
advisor), as themselves, without leaving the UI. Send only: no replies, no
chat, no choice of recipient. The server calls the notes daemon with the
human's token, which it reads from a file; the browser never sees it. Without
the flags the server needs no bridle (rule works-without-bridle) and the UI
shows no button.

Rejected: going through the bridle gateway (it has no send-message call and
would need a second login); a separate token for the UI (the message would
not come from the human); `~/.bridle/credentials.toml` (agent identities).
Risk accepted: anyone past the UI's login can send as the human to the one
configured agent; the same login already edits every note.

## Requirements

### Requirement: Messaging is configured by three flags, all or none  {#r-77cc}

The server SHALL take `--bridle-url`, `--bridle-token-file` and `--bridle-to`
(default `external:advisor`), SHALL refuse to start with only some of them, and
SHALL report `message: false` at `/api/version` and have no `/api/message`
route when they are absent.

#### Scenario: Flags absent  {#s-0c8e}

*Verification*: **executable**

- **WHEN** a client asks for the version and posts a message to a server started without the bridle flags
- **THEN** the version reports message false
- **AND** the post is answered 404

#### Scenario: Partial flags  {#s-b4d4}

*Verification*: **executable**

- **WHEN** the server is started with --bridle-url but no --bridle-token-file
- **THEN** it fails with a usage error

### Requirement: A message is sent to the daemon as the human  {#r-456a}

The server SHALL, on `POST /api/message {body}` behind the existing login,
read the token file and post `{to, body}` to `<bridle-url>/v1/messages` with
`Authorization: Bearer <token>`, and SHALL answer the daemon's error text on
failure, never the token.

#### Scenario: Sent  {#s-470a}

*Verification*: **executable**

- **WHEN** a client posts the message "Please review the plan" with a fake daemon that accepts it
- **THEN** the response status is 200
- **AND** the daemon received "Please review the plan" for "external:advisor" with the human's token

#### Scenario: Token read on each send  {#s-cb3f}

*Verification*: **executable**

- **WHEN** the token file changes to "rotated" and a client posts the message "again"
- **THEN** the daemon received "again" for "external:advisor" with the token "rotated"

#### Scenario: Daemon refuses  {#s-bc64}

*Verification*: **executable**

- **WHEN** a client posts the message "hello" with a fake daemon that answers 403 "no such agent"
- **THEN** the response status is 502
- **AND** the response error is "no such agent" and does not contain the token

#### Scenario: Empty message  {#s-5757}

*Verification*: **executable**

- **WHEN** a client posts the message "   " with a fake daemon that accepts it
- **THEN** the response status is 400
- **AND** the daemon received nothing

#### Scenario: Login required  {#s-0ec4}

*Verification*: **executable**

- **WHEN** a client posts the message "hello" without a token to a server with a fake daemon
- **THEN** the response status is 401
- **AND** the daemon received nothing

### Requirement: The UI sends from a top-bar button  {#r-3de7}

The client SHALL show a top-bar button only when `/api/version` says
`message: true`; it opens a sheet with a text box and Send, which closes with a
short "sent" note on success and keeps the text and shows the error on failure.

#### Scenario: Send from the sheet  {#s-43ef}

*Verification*: **non-executable**

- **WHEN** the human taps the message button, types text and taps Send
- **THEN** on success the sheet closes and "Message sent" shows briefly; on failure the text stays and the error shows in the sheet

### Requirement: A stale client offers a reload  {#r-b140}

The client SHALL know the version it was built with and, when the event stream
reconnects or the app becomes visible, compare it with `/api/version`; when they
differ it SHALL show a "New version - tap to reload" bar that reloads on tap. The top
bar SHALL have a Reload button. The server SHALL serve `index.html` with
`cache-control: no-cache`.

#### Scenario: New version bar  {#s-fbce}

*Verification*: **non-executable**

- **WHEN** the server restarts with a newer version while the app is open, or the app returns to the foreground
- **THEN** a bar "New version - tap to reload" shows, and tapping it reloads the page
