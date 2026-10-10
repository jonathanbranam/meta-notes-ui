---
id: 6u38
title: Web Push to the phone for timed tasks and the Time Block, design first
kind: feature
opened: 2026-10-10
filed_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [35z9]
tasks: [mu-6u38]
---

## The ask

From the human, in the aide session, 2026-10-10 ET, verbatim.

The question: "I had some more questions about the notifications and the PWA. The app's working pretty well, I thought. Can we do push notifications now? What's required to do push notifications with the PWA? Do we need signing? Do we need an app certificate or something? Do I need to sign up for Apple Developer? I'm happy to do that if I need to. Just tell me what is required."

The aide's answer, in short: no Apple Developer account, signing or certificate; standard Web Push (iOS 16.4+, Home Screen app, HTTPS, all in place). To build: the server's own VAPID keys, storing the phone's subscription, a scheduler on the NUC that sends at the right time, outbound internet to Apple's push service. Proposed scope: push for the alerts the app already shows (timed tasks, the next Time Block row).

The human's answer: "That's perfect. Let's file it and start working, and then let's do all the work for that. I want to understand the design before anyone starts working on it. I want to understand what the server, persistent server, and scheduling are going to look like. We're running on Node, right? Is that going to be part of this? How is that going to wake up at the right time? I want an overview of how that's going to work, at least.

Add a design to the task and then review it with me. That's the main thing."

## Gate

Design first, reviewed with the human, before any build. The design answers the human's questions: what runs on the server (the Node server, the always-on one), how it schedules and wakes at the right time, where subscriptions and keys live, and how it ties to the in-app alerts (no double alerts). No code until the human approves the design.

Background: ticket 35z9 planned this as later ("Push to a closed phone is later, with the phone bridge."). Agent-sent pushes are a separate ticket.

## Design

The design for review is [[docs/design/web-push]]. No build until the human approves it.
