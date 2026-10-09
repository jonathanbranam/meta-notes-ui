---
id: xhyt
title: "Today view Time Block: strike single-tilde cells, header row, times as in the file, work-style highlighting"
kind: bug
opened: 2026-10-09
filed_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [t7k8]
tasks: [mu-xhyt]
---

## The ask

From the human, via the notes advisor (message m-0414 to the aide), 2026-10-09 07:21 ET, verbatim:

"the time block when I view like today or whatever it's called, the time block doesn't have a header on it. And it uses military time. I want to see the time the same as it is in my file, like the AM PM is what I like. and also ... we should have basically the same sort of highlighting I have at work. But the main thing is that the single tilde should be converted to a strike through. It should render as a strike through. I don't know if we're using Markdown to render that or how we're doing it, but we may need to manually change the single tilde in the time block to double tilde so it renders properly in Markdown."

## The ask (in the Today view's Time Block)

1. **Main:** cells struck with single tildes (`~feed the dogs~`, `~no plan~`) render as strikethrough. The file convention is single tildes (meta-notes conventions: never double), so this is a rendering fix; never rewrite the notes.
2. The Time Block table has a header row (Time / Plan / Actual, as in the file).
3. Times show as written in the file (`7:15am`, `1:00pm`), not 24-hour.
4. Highlighting "the same sort of highlighting I have at work". What that setup is (current row, next row, done/struck rows?) is not known to the aide; ask the human or the notes advisor before designing this part.

Example: `plan/daily/26-Q4/2026-10-08 Thu.md` in the notes repo (`| 7:00am | ... |`). A leading `~` on a time means "approximately" (client/src/markdown.ts), which is a different use of the tilde; keep both working.

## Orchestrator note on 4 (2026-10-09)

Likely meaning, to confirm with the human: the Vim plugin's Time Block cell
highlights in meta-notes `after/syntax/markdown.vim` (lines 38-87). Inside the
`### Time Block` section of a daily note, each Plan/Actual cell gets a background
by what it contains:

| Cell contains | Vim group | Background |
|---|---|---|
| `mtg:` | metaNotesTimeBlockMtg | cyan `#7fd6e6` |
| `[...]` | metaNotesTimeBlockBracket | yellow `#e6d67f` |
| `~...~` | metaNotesTimeBlockTilde | gray `#b0b0b0` |
| `(...)` | metaNotesTimeBlockParen | magenta `#d69fe6` |
| `train:` | metaNotesTimeBlockTrain | red `#e69f9f` |
| `pers:` | metaNotesTimeBlockPers | green `#9fe6a0` |
| `work:` | metaNotesTimeBlockWork | blue `#9fb8e6` |

Text is black on these. Struck text (`~...~`) is also gray and struck through
(metaNotesOffPlan). If the human confirms, the UI copies these rules and colors.
Parts 1-3 don't depend on this and can be built first.
