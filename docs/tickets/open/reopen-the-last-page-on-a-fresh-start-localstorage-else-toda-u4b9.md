---
id: u4b9
title: Reopen the last page on a fresh start (localStorage), else Today; maybe stale-reset and stored history
kind: feature
opened: 2026-10-09
filed_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: []
tasks: []
---

## The ask

From the human, in the aide session, 2026-10-09 07:57 ET, verbatim:

"when I open the notes from like a fresh session, if I shut it down and restart it, it should, I think, well, there's a couple options here. I feel like we should store the page the user was last on in, in like local, local session. Just not on the server or anything, just a local session. And then also, if that's like, well, if there's nothing there, then open the Today tab. I'm tempted to say, like, always open the Today tab, or, you know, if the app hasn't been open in a few hours or a few days, then ignore what's in. Local sesh, local storage, I mean. Sorry, I meant to say local storage earlier. But that might be kind of weird. But I feel like if you haven't opened the app in a few days, it should just go back to today as a default. But that could also be kind of annoying. And then I think the other question I have is, could, I don't know, could we like store the history in, in local storage as well? We would we would expire it like we would, we would ex like uh, only store like 20 or 50 entries or something, but that'd be kind of cool if you could, you know I feel like that would be a cool thing if you haven't opened the app in a few days it goes back to the today note but if that's not what you want you could still get hit the back button and see what you were looking at previously I don't know. Sounds kind of cool. Maybe it's annoying. But at a minimum, if there's nothing there, at a minimum, we should store the current page in local storage, reload that. And if there's nothing there, open the today note, the today page, whatever that is. Thanks."

## The ask, in parts

1. **Minimum (asked for):** keep the page the user is on in the browser's localStorage, never on the server. On a fresh start of the app, open that page; if nothing is stored, open Today.
2. **Unsure ("maybe it's annoying"):** if the app hasn't been opened for a while (the human said "a few hours or a few days"), open Today instead of the stored page.
3. **Unsure ("sounds kind of cool"):** keep the recent navigation history in localStorage, capped at "20 or 50 entries", so Back still reaches what was open before, even after (2) opened Today.

Parts 2 and 3 are the human's open ideas, not approved; part 1 is the request.
