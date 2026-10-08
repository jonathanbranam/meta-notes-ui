---
id: gka5
title: "Multi-place pushes: a GitHub webhook to the NUC so it pulls what was pushed elsewhere"
kind: feature
opened: 2026-10-08
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [mkkt]
tasks: []
---

## The ask

From the human, via aide, 2026-10-07, verbatim (after asking whether edits made in the UI commit and push; they don't, they only land on disk):

"Something else to consider here is that I think we should have a plan for what happens when there are pushes coming from different apps. If we don't have everything running on the same file system, we should have a plan for wiring up a GitHub hook so that, if I push to this repo from somewhere else, we would be able to get a callback here somehow.

I think that means, if I'm understanding correctly, Tailscale Funnel for Tailscale, but I have that set up on track-web on my EC2, and it works well. Just an idea: file an appropriate ticket for future work, but we don't need to worry about it right now."

## The ask (future; no task until the human asks for it)

- A plan for repos changed from more than one place: when the human (or another app or machine) pushes to GitHub, the NUC hears about it and pulls, instead of only noticing changes made on its own disk.
- A GitHub webhook to the NUC. The NUC is tailnet-only today (`tailscale serve`); a webhook from GitHub needs a public endpoint, e.g. Tailscale Funnel, which the human already runs for track-web on EC2. track-web also has a `/api/deploy` webhook with a `DEPLOY_SECRET` as a model.

## Open questions

- Which repos: the notes repo (edits from the phone UI, Vim, agents, other machines) and/or this one (the always-on server follows the local `main`; a push from elsewhere does not move it until something pulls).
- Pull vs. conflicts with uncommitted local edits (UI edits are written but never committed).
- Whether the UI should commit and push its own edits at all (the aide's question to the human, unanswered).
- Funnel on the NUC vs. relaying through the EC2 host that already has it.
