---
id: t7k8
title: "Today view: wiki links and URLs in tasks and Time Block plans are clickable"
kind: feature
opened: 2026-10-08
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [35z9]
tasks: [mu-t7k8]
closed: 2026-10-08T03:35:55Z
---

## The ask

From the human, via aide, 2026-10-07, verbatim, after first using the always-on server on the phone:

"Looking pretty good. The links within the alerts should actually be links. That would be awesome."

## The ask

- Wiki links (`[[...]]`) and URLs inside the Today view's items show as clickable links that open the note, not as raw text. Seen today: due-task text like "... (see [[resource/hardware/Home]]) ⏰ 21:00" shows the brackets as plain text (TodayView renders `t.text` raw); Time Block plans render the same way.
- Notifications (client/src/today.ts `buildAlerts`, shown via showNotification) can't hold links; at most a tap opens the note the alert came from. Whether that is wanted too is the human's call.

Which "alerts" the human meant (the Today lists or the system notifications) is the aide's reading; confirm with the human if the shape depends on it.
