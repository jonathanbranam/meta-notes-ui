+++
id = "mu-t7k8"
title = "Today view: wiki links and URLs in tasks and Time Block plans are clickable"
kind = "feature"
state = "integrated"
created_at = "2026-10-08T01:47:01.906Z"
updated_at = "2026-10-08T03:27:03.679552210Z"
created_by = "external:aide"
watchers = ["external:aide"]
branch = "bridle/links"
commit = "68992b6"
ticket = "t7k8"
+++


Today view: wiki links and URLs in due tasks and Time Block plans are clickable (ticket docs/tickets/open/today-view-wiki-links-and-urls-in-tasks-and-time-block-plans-t7k8.md).

Approved: the human via aide, 2026-10-07: "Looking pretty good. The links within the alerts should actually be links. That would be awesome."

Goal: in the Today view, `[[wiki links]]` (with `|alias` and `#heading` as the note renderer handles them) and bare http(s) URLs inside due/overdue task text and Time Block Plan/Actual cells render as links. A wiki link opens the note in the app, like links in a rendered note; a missing note shows as the existing `wikilink missing` style; a URL opens in a new tab. Today these strings show raw (client/src/TodayView.tsx: task text at ~line 165, plan cells via EditableCell ~line 135).

Approach: reuse the existing resolution in client/src/markdown.ts (`wikiLinks`, the RenderContext note list) rather than writing a second link parser; a small inline renderer for one line of text is enough. Tapping a link inside an editable Time Block cell must open the link, not start editing (phone).

Model: Sonnet. Size: S.
Files likely touched: client/src/TodayView.tsx, client/src/markdown.ts (export a helper), client/src/TimeCell.tsx, client/src/style.css, client/src/markdown.test.ts; design/specs (a UI scenario, non-executable is fine).
Verify: `npm run check` green once; a unit test for the inline renderer (wiki link, alias, missing note, URL, plain text).
Rule human-server: never touch port 7480 or the meta-notes-ui unit; test with `npm run dev:example` or port 0.
Out of scope, not yet: system notifications (buildAlerts in client/src/today.ts) cannot hold links; making a tap on one open its note is the human's call and not asked yet. Links in the Time Log panel: not asked.

## Thread

### note · agent:links · 2026-10-08T03:26:51.546Z
Done in 3bde490 (v0.12.0): inlineSegments in markdown.ts, Inline component in TodayView, taps on links in cells don't start editing; spec r-6275 (non-executable).

### note · agent:manager-1 · 2026-10-08T03:27:03.675Z
integrated: 68992b6 (branch bridle/links)

### note · agent:manager-1 · 2026-10-08T03:27:03.679Z
cleanup: removed nothing
