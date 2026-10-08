---
id: dusy
title: Send a message to the notes advisor from the UI, as the human
kind: feature
opened: 2026-10-08
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: []
tasks: [mu-dusy]
closed: 2026-10-08T22:50:28Z
---

## The ask

From the human, via aide, 2026-10-08, verbatim:

"The future request is definitely going to be to be able to chat with the AI using this interface, so I could get out of remote control. I do want to add this: the first thing would be just to send a message. A button somewhere I can hit that just sends a message to advisor notes in the notes project. For now, we could configure that later, but that'd be great. I don't know how possible that is, exactly how you interface with the demon on that, but you can check on the bridle-ui project and see how it does it. I think it uses the human's token because that's coming from me, and it should come as me. No need to handle responses yet. We can work on that later, but if I can just send messages to the agent, that'd be amazing."

## The ask

- A button in the UI that opens a text box and sends the text as a message to the notes project's advisor (`advisor notes`), sent as the human (the human's bridle identity, not an agent's).
- Target hard-coded or simply configured for now; choosing targets later.
- Send only. Showing replies, and full chat, are later work.

## Notes from the aide (2026-10-08)

- bridle-ui talks to the bridle gateway (`/api/v1/...`) with a login session; the aide found no send-message call in it, only task actions (`/projects/<p>/tasks/<id>/<action>`). The daemon has `POST /v1/messages`. Whether to go through the gateway or the notes daemon with the human's token, and where the meta-notes-ui server keeps that credential, is the orchestrator's design. This crosses into bridle: the message must arrive as the human, and works-without-bridle must still hold (the button absent or disabled without it).

## Design (orchestrator, 2026-10-08)

The human left the design to the orchestrator ("the design is yours", via aide).

- **Route: the meta-notes-ui server calls the notes daemon directly**, `POST <daemon url>/v1/messages`
  with `{"to": "external:advisor", "body": "<text>"}` and `Authorization: Bearer <human token>`.
  The browser never sees the token; it posts the text to a new meta-notes-ui endpoint
  (`POST /api/message`), which sits behind the existing login like every other `/api` route.
- **Identity: the human's own token for the notes daemon**, read from its file
  (`<notes workspace>/.bridle/tokens/human`, 0600; on the NUC
  `/srv/shared/work/notes-work/.bridle/tokens/human`). The server runs as the human's user, so it
  can read it. Read it on each send (no caching), so a rotated token just works. The message
  arrives from `human`, as asked.
- **Configuration: three server flags**, all or none: `--bridle-url` (the notes daemon, on the
  NUC `http://127.0.0.1:7404`), `--bridle-token-file`, `--bridle-to` (default
  `external:advisor`). `deploy/meta-notes-ui.service` and `deploy/nuc.md` show them. Without
  them the server reports no messaging (`/api/version` gains `message: false`) and the client
  hides the button: works-without-bridle holds.
- **UI: a button in the top bar** opens a small sheet with a textarea and Send; on success it
  closes with a short "sent" note, on failure it keeps the text and shows the error. No replies.

Rejected:

- Through the bridle gateway with the UI's login: the gateway has no send-message endpoint, so
  it would need bridle changes first, and a second login.
- A new `external:<name>` token for the UI: the message would not come from the human, which
  the human asked for ("it should come as me").
- Reading `~/.bridle/credentials.toml`: it holds agent identities, not the human's.

Risk accepted: anyone past the UI's login can send messages as the human to one fixed agent.
The same login already lets them edit every note, so this adds little.

After it merges, the human adds the flags to the NUC's systemd unit (a to-do for them).
