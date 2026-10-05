# Example notes root

A small, real meta-notes root (work mode, as `meta-notes init` lays it
out) used as test data for meta-notes-ui. Never the human's notes.

Tests and `npm run dev:example` copy it to a temp dir first
(`server/example.ts`) and create today's daily note there with
`meta-notes note daily`; nothing writes to these committed files.

## What's in it

- `project/make-bread/Home.md`: folder note, frontmatter, tags, tasks
  with dates 📅 🛫, a time ⏰ and ✅, #next #later, subtasks and task notes
  (before and after subtasks), a table with alignment, wiki links (path,
  alias, heading, folder note).
- `project/make-bread/starter.md`: a missing link target.
- `area/health.md`: frontmatter aliases, 🔁 recurrence (`every year`,
  `every weekday when done`), an overdue task, canceled and rescheduled
  statuses.
- `area/Home Care.md`: frontmatter with a nested map and a list of links, a heading link target, `#wait`.
- `plan/daily/26-Q3/`: dated daily notes with a Log and a Time Block with
  a struck plan (`~standup~`) and `no plan` rows.
- `plan/week/`, `plan/quarter/`: week and quarter notes linked from daily.
- `resource/template/`: the templates `meta-notes init` installs.

## Extending it

When a feature needs content to verify, add it here (and a line above),
and keep the notes valid for `meta-notes` (checkbox tasks need a 📅 or 🛫).
