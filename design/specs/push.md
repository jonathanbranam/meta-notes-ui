# Web Push

## Purpose

Alerts reach the phone when the app is closed or the phone is locked. The
server plans today's alerts from the notes, sets one timer for the earliest
unsent one, and sends a Web Push to each subscribed device at its time. Design
and rejected alternatives: `docs/design/web-push.md`. Push is off without
`--push-contact`, so the server needs nothing extra (rule works-without-bridle)
and nothing polls (rule light-on-resources).

## Requirements

### Requirement: Push is on only with a contact and serves its public key  {#r-d7a4}

The server SHALL take `--push-contact <mailto:...|https://...>`, SHALL refuse to
start with any other value, SHALL have no `/api/push` routes without it, and
with it SHALL keep a VAPID key pair in `.meta-notes-cache/ui/push/vapid.json`
(mode 0600) and serve only the public key at `GET /api/push/key`. Without it an
unmatched `/api/*` path SHALL answer a JSON 404 (`{"error":"not found"}`), never
the client's index.html, so the page reads push as off instead of failing to parse.

#### Scenario: Flag absent  {#s-8ce3}

*Verification*: **executable**

- **WHEN** a client asks for the push key of a server started without a push contact
- **THEN** the push key request is answered 404 with the JSON body {"error":"not found"}

#### Scenario: Bad contact  {#s-4107}

*Verification*: **executable**

- **WHEN** the server is started with the push contact "somebody"
- **THEN** it fails with a usage error

#### Scenario: Key created private  {#s-01cf}

*Verification*: **executable**

- **WHEN** a server is started with a push contact and a client asks for the push key
- **THEN** the key file is mode 0600 and the answer holds its public key but not its private key

### Requirement: Devices subscribe and unsubscribe behind the access check  {#r-fb05}

The server SHALL, on `POST /api/push/subscribe` with a browser subscription,
store it keyed by endpoint (a repeat replaces it), and on `DELETE` with an
endpoint remove it, both behind the same token or login as every route.

#### Scenario: Subscribe and unsubscribe  {#s-de29}

*Verification*: **executable**

- **WHEN** a client posts a subscription without the token and then with it, posts the same one again, and deletes it
- **THEN** the first post is refused, the second stored one subscription, the repeat still one, and the delete none

### Requirement: Each alert is sent once, at its time  {#r-5e5f}

The scheduler SHALL send every alert of the day (as `buildAlerts` plans it from
the tasks and the daily note) to every subscribed device at the alert's time,
with the alert id as the tag, and SHALL send it only once, across re-plans and
restarts.

#### Scenario: The timer sends the alert once  {#s-9e9e}

*Verification*: **executable**

- **WHEN** a device is subscribed, the notes hold a task at 09:30 and the clock runs from 08:00 to 10:30
- **THEN** one push is sent at 09:30 with the tag "task:a.md:3:09:30" and the title "09:30 Call the dentist"

#### Scenario: Two devices share one tag  {#s-427a}

*Verification*: **executable**

- **WHEN** two devices are subscribed, the notes hold a task at 09:30 and the clock runs from 08:00 to 10:30
- **THEN** each device is sent the same tag "task:a.md:3:09:30"

#### Scenario: A restart does not resend  {#s-0f3c}

*Verification*: **executable**

- **WHEN** the alert at 09:30 was sent, the server restarts at 09:40 and the clock runs on to 10:30
- **THEN** one push was sent in all

### Requirement: An edit re-plans  {#r-6c7a}

The scheduler SHALL, when a `.md` file changes, re-read the notes after a short
debounce and re-arm its timer, so an alert follows the edited time.

#### Scenario: A task moves  {#s-f29b}

*Verification*: **executable**

- **WHEN** the task at 09:30 is edited to 10:00 at 08:30, a change is reported, and the clock runs to 10:30
- **THEN** one push is sent, with the title "10:00 Call the dentist"

### Requirement: Late alerts are sent only if recent  {#r-cbca}

When the server finds an unsent alert whose time has passed, it SHALL send it if
it is at most 10 minutes late and otherwise skip it and mark it sent.

#### Scenario: Nine minutes late and thirty minutes late  {#s-edd3}

*Verification*: **executable**

- **WHEN** the server starts at 09:39 with tasks at 09:30 and 09:09
- **THEN** one push is sent now, with the title "09:30 Call the dentist", and the 09:09 one is skipped

### Requirement: A gone subscription is removed  {#r-2d6c}

When the push service answers 404 or 410 to a send, the server SHALL delete that
subscription.

#### Scenario: Gone  {#s-4fa0}

*Verification*: **executable**

- **WHEN** a push is sent to a subscription the push service answers 410 to
- **THEN** one subscription is removed and none remain
