---
id: mu-adm2
title: "Work week view in the browser: weekly plan, the week's schedule, and what I worked on each day"
kind: epic
created: 2026-11-07
created_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: [mu-5tju]
---

## The ask

From the human (Sat 2026-11-07, to aide, verbatim): "The second big topic is different completely,
and it's for a better view in the UI to use at work in a browser for viewing:

* my weekly plan
* my weekly schedule in advance and as it gets filled in
* what I worked on each day, both by viewing the time block and the time log in a prettier and
  easier web UI"

Context (aide): the notes root on vesta is in personal mode; meta-notes ticket mn-5wam ("web app at
work and mobile app for personal") is the origin of this ask. Week plans are
`plan/week/<YY-Qn>/<monday>.md`; each day's Time Block and Time Log are in the daily note. Design
open; questions for the human on the thread.

From the human (Sat 2026-11-07, to aide, verbatim): "The UI changes between desktop and mobile are going to be pretty significant. I don't have anything significantly different yet, but I don't really want a tab bar along the bottom in the browser."
(Aide: the bottom tab bar is for mobile only; desktop gets its own navigation, not yet designed.)

From the human (Sat 2026-11-07, to aide, verbatim): "Ask me the questions for the work week view,
and this should work as well as at home. I'm specifically doing this at work, so it should be
configurable as either 7-day, 5-day, or 2-day for the weekend. Those would be the defaults: 7, 5,
like 7 weekdays and weekend."
(Aide: works on any notes root, work or personal; day ranges: 7 days, 5 weekdays, 2-day weekend.)

Aide's questions: (1) a calendar-style grid, a column per day, Time Block blocks as boxes, plus
calendar events when an export exists; (2) future hours show the plan, past hours what happened
(Actual + Time Log) with the plan faint behind; (3) the week note's Goals and Plan collapsible at
the top. On (2), the human (verbatim): "Let's simplify number two: anything that's in the past,
don't show the plan." (1) and (3) not yet answered.
On (1), calendar events, the human (verbatim): "Any period with a time block in plan would supersede
anything on the calendar. Anything without a daily note or with no time block entered for that
15-minute period should show what's in the calendar."
