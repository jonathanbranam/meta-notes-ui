+++
id = "mu-2fmn"
title = "Week page: its own layout, navigation stays in view, opens at start of day, dates on the buttons"
kind = "feature"
state = "open"
created_at = "2026-11-09T17:32:09.594Z"
updated_at = "2026-11-09T17:34:19.774570292Z"
created_by = "external:aide"
watchers = ["external:aide"]
ticket = "2fmn"
+++

docs/tickets/open/week-page-its-own-layout-navigation-stays-in-view-opens-at-s-2fmn.md

## Thread

### note · external:aide · 2026-11-09T17:32:26.453Z
From the human (2026-11-09, to aide, verbatim), right after the four asks in this ticket: "Much of this applies to "now" as well; drop the sidebar, don't show "< > Now""
So this ticket also covers the desktop Now page: no file sidebar and no second header row (history back/forward and the "Now" title). The top row (Today, Now, Week, Menu) stays, as on the week page. Lists was not mentioned and is unchanged. Check: add a desktop screenshot of the Now page.

### note · external:orchestrator · 2026-11-09T17:32:30.534Z
Planning notes (orchestrator). The human's asks are quoted in the ticket; relayed by aide in m-0253. Brief is the ticket body.
Model: Sonnet (scroll positioning, sticky layering and a per-page layout).
Order: mu-y9xa, then this, then mu-9kcv, one at a time, because all three touch client/src/style.css and this and mu-y9xa touch the week page. Tiers set that order; only mu-9kcv has a hard edge.
Impact list: client/src/WeekView.tsx, client/src/week.ts and client/src/week.test.ts (the button date text), client/src/App.tsx (no sidebar or second header row on this page), client/src/style.css (.wk-bar, .wk-head offsets), design/specs (rendering or a week spec), CHANGELOG, version bump.
Verify: the project's normal check is green, plus the ticket's Check screenshots, in dark and light. Button dates follow each range picker setting. A live update (refreshKey) does not move the page.
Deferred: mu-t2jr (message box layering) and mu-tfyq (slowness) stay pending, not yet approved. Phone layout unchanged: the asks are about the desktop page.

### note · external:aide · 2026-11-09T17:32:36.980Z
From the human (2026-11-09, to aide, verbatim), on the Week and Now pages: "these are dedicated views, not the general notes viewer page"
So the design is a "dedicated view" layout, distinct from the notes viewer's shell (sidebar, back/forward, note title). Suggest building it as one layout that a page opts into, not separate conditions for Week and Now. Only Week and Now are confirmed as dedicated views so far.

### note · external:orchestrator · 2026-11-09T17:32:44.532Z
Orchestrator: plan addition after the human's word relayed by aide in m-0254 (quoted above on this thread): the desktop Now page also loses the sidebar and the second header row. Impact list adds the Now page's component if App.tsx alone does not cover it. Add a Now page screenshot to the Check. Lists unchanged.

### note · external:orchestrator · 2026-11-09T17:32:53.694Z
Orchestrator: plan addition after the human's word relayed by aide in m-0255: 'these are dedicated views, not the general notes viewer page'. Build one dedicated-view layout that a page opts into (no file sidebar, no second header row; the top row stays), and opt Week and Now into it. One flag or wrapper in App.tsx is enough; only Week and Now are confirmed, so no other page changes. Week-specific behaviour (start-of-day scroll, sticky navigation, button dates) stays in the week view, not in the shared layout.

### note · external:aide · 2026-11-09T17:33:28.349Z
From the human (2026-11-09, to aide, verbatim), asked "Do Lists and Today count as dedicated views too": "Yes"
So Week, Now, Lists and Today all use the dedicated-view layout: no file sidebar and no second header row on desktop. Open point for the plan: with all four dedicated, the sidebar shows only on note pages, so desktop needs a clear way to reach the notes viewer. Aide is asking the human.

### note · external:orchestrator · 2026-11-09T17:33:41.515Z
Orchestrator: plan addition after the human's 'Yes' relayed by aide in m-0257: Week, Now, Lists and Today all opt into the dedicated-view layout; this replaces 'only Week and Now' in my earlier note. Screenshots in the Check cover all four. Open: how desktop reaches the notes viewer once all four are dedicated; aide is asking the human. Not to be planned until that answer is on this thread.

### note · external:aide · 2026-11-09T17:34:07.255Z
From the human (2026-11-09, to aide, verbatim), told that notes stay reachable by note links, Menu > Open... and Cmd-K, and asked whether that is enough or a Notes button is wanted: "wow i didn't know about Cmd-K that's brilliant"
Aide's reading, not an explicit answer: no Notes button for now, per aide's recommendation. Keep Menu > Open... and Cmd-K working on all four dedicated views.

### note · external:orchestrator · 2026-11-09T17:34:19.774Z
Orchestrator: open point closed, per aide in m-0258 (the human's reply and aide's reading are there): no Notes button for now. Menu > Open... and Cmd-K must keep working on all four dedicated views; add that to the Check. The hold in my last note is lifted.
