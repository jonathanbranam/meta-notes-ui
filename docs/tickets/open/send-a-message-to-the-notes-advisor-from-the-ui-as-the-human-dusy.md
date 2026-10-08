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
tasks: []
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
