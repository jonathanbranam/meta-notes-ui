# Rendering of meta-notes conventions

## Purpose

The human wants the whole notes repo "as rendered markdown", feeling "roughly
like Obsidian with plugins tailored to me": tables and frontmatter rendered,
and "all of my links and conventions" understood. The rules for those
conventions are meta-notes' (`meta-notes conventions`); this spec says what
the UI shows for each. Rendering is client-side from the note text; the
scenarios run the same markdown plugin the browser uses, on fixed text,
today's date and the time of day.

## Requirements

### Requirement: Wiki links open notes  {#r-776a}

The UI SHALL render `[[path]]` and `[[path|alias]]` as a link to the note,
resolving the path like meta-notes does: from the notes root (`.md` added),
else relative to the linking note, and a folder note `x/Home.md` for `x`. A
link to a note that does not exist SHALL show as a missing link, not a dead
anchor. Links inside code stay text.

#### Scenario: A link and its alias  {#s-c8e7}

*Verification*: **executable**

- **WHEN** a note holds "See [[area/health|my health]]."
- **THEN** the page shows a link to "area/health.md" labelled "my health"

#### Scenario: A folder note  {#s-cbb4}

*Verification*: **executable**

- **WHEN** a note holds "See [[project/kitchen]]."
- **THEN** the page shows a link to "project/kitchen/Home.md" labelled "project/kitchen"

#### Scenario: A link relative to the note  {#s-caaf}

*Verification*: **executable**

- **WHEN** a note holds "See [[../../week/26-Q4/2026-09-28]]."
- **THEN** the page shows a link to "plan/week/26-Q4/2026-09-28.md" labelled "../../week/26-Q4/2026-09-28"

#### Scenario: A missing note  {#s-80de}

*Verification*: **executable**

- **WHEN** a note holds "Try [[project/nope]]"
- **THEN** the page shows "project/nope" as a missing link

#### Scenario: A link out of the root  {#s-e0be}

*Verification*: **executable**

- **WHEN** a note holds "Try [[../../../../../etc/passwd]]"
- **THEN** the page shows "../../../../../etc/passwd" as a missing link

#### Scenario: Code stays text  {#s-c821}

*Verification*: **executable**

- **WHEN** a note holds the code span "[[area/health]]"
- **THEN** the page shows the code "[[area/health]]" and no link

#### Scenario: A link to a heading  {#s-7d77}

*Verification*: **non-executable**

- **WHEN** a note holds `[[area/health#goals]]`
- **THEN** the link opens the note and scrolls to its "goals" heading

### Requirement: Frontmatter is shown as properties  {#r-ff52}

The UI SHALL show a note's leading `---` frontmatter block as a list of
properties above the note and SHALL NOT render the block as note text.
Values given as `[a, b]` or as a `- item` list are shown as one
comma-separated value.

#### Scenario: Properties  {#s-31d0}

*Verification*: **executable**

- **WHEN** a note holds "---\ntitle: Hi\ntags: [a, b]\naliases:\n  - x\n  - y\n---\n# Hi"
- **THEN** its properties are "title=Hi; tags=a, b; aliases=x, y"
- **AND** its body is "# Hi"

#### Scenario: No frontmatter  {#s-d89e}

*Verification*: **executable**

- **WHEN** a note holds "# none"
- **THEN** it has no properties
- **AND** its body is "# none"

#### Scenario: A horizontal rule is not frontmatter  {#s-7b1b}

*Verification*: **executable**

- **WHEN** a note holds "text\n\n---\n\nmore"
- **THEN** it has no properties

#### Scenario: Nested and list values keep their shape  {#s-89e0}

*Verification*: **non-executable**

- **WHEN** a note's frontmatter holds a nested map or a list of links
- **THEN** the properties show them as structure and links, as Obsidian does, not as flat text

### Requirement: Tags are marked  {#r-d686}

The UI SHALL mark `#tag` (letters, digits, `_`, `-`) in paragraphs, headings,
table cells and emphasis, matching ignoring case, and SHALL NOT mark a `#`
that is part of a word, a path or a URL fragment.

#### Scenario: Tags  {#s-ba69}

*Verification*: **executable**

- **WHEN** a note holds "buy #next and #Home-1"
- **THEN** the page marks the tags "next, home-1"

#### Scenario: Not a tag  {#s-32fa}

*Verification*: **executable**

- **WHEN** a note holds "# Title\n\na#b and [x](http://e.com/#frag)"
- **THEN** the page marks no tags

#### Scenario: Tag aliases  {#s-38b3}

*Verification*: **non-executable**

- **WHEN** a note holds "#mtg", an alias of "#meeting" in meta-notes
- **THEN** the page marks it as the tag "meeting"

### Requirement: Tasks show status and chips  {#r-b58a}

The UI SHALL render a checkbox line (`- [c] text`) as a task showing its
status: open, done (`x`, `X`), rescheduled (`>`), canceled (`-`) or partial
(`.`, `o`, `O`); any other character reads as open. The status character
SHALL NOT appear in the text. Dates and marks SHALL show as chips: due `📅`,
scheduled `⏳`, start `🛫`, done `✅`, time `⏰ HH:MM`, a time after the due
date, and recurrence `🔁 rule`. An open task due before today SHALL show as
overdue, on the task and on its due chip; a done, rescheduled or canceled
task never does. Notes and subtasks under a task render as a nested list.

#### Scenario: Open, overdue and done  {#s-0a59}

*Verification*: **executable**

- **WHEN** a note holds "- [ ] Order tiles #next 📅 2026-09-28\n- [x] Call plumber 📅 2026-09-20 ✅ 2026-09-22\n"
- **THEN** the task "Order tiles" is open and overdue
- **AND** the task "Call plumber" is done and not overdue
- **AND** the page shows the chips "due overdue: 📅 2026-09-28, due: 📅 2026-09-20, done: ✅ 2026-09-22"

#### Scenario: Not yet due  {#s-e948}

*Verification*: **executable**

- **WHEN** a note holds "- [ ] Later 📅 2026-10-04\n- [ ] Next week 📅 2026-10-11\n"
- **THEN** the task "Later" is open and not overdue
- **AND** the task "Next week" is open and not overdue

#### Scenario: Other statuses  {#s-dd39}

*Verification*: **executable**

- **WHEN** a note holds "- [>] Carried 📅 2026-09-10\n- [-] Dropped 🛫 2026-10-01\n- [.] Half ⏳ 2026-10-05\n- [?] Odd 📅 2026-10-10\n"
- **THEN** the task "Carried" is rescheduled and not overdue
- **AND** the task "Dropped" is canceled
- **AND** the task "Half" is partial
- **AND** the task "Odd" is open
- **AND** the page does not contain "[&gt;]"
- **AND** the page shows the chips "due: 📅 2026-09-10, start: 🛫 2026-10-01, scheduled: ⏳ 2026-10-05, due: 📅 2026-10-10"

#### Scenario: Time and recurrence  {#s-39a2}

*Verification*: **executable**

- **WHEN** a note holds "- [ ] Call ⏰ 15:00 🔁 every 2 weeks 📅 2026-10-12\n- [ ] Meet 📅 2026-10-05 15:00\n"
- **THEN** the page shows the chips "time: ⏰ 15:00, recur: 🔁 every 2 weeks, due: 📅 2026-10-12, due: 📅 2026-10-05 15:00"

#### Scenario: A checklist item without dates  {#s-3842}

*Verification*: **executable**

- **WHEN** a note holds "- [ ] plain item\n"
- **THEN** the task "plain item" is open and not overdue

#### Scenario: Notes and subtasks  {#s-6459}

*Verification*: **non-executable**

- **WHEN** a task has indented note lines and indented checkbox subtasks
- **THEN** the notes show as text under the task and each subtask as a task of its own, with its own status and chips

### Requirement: The Time Block is a plan for the day  {#r-3cf3}

The UI SHALL render a table whose first two headings are "Time" and "Plan"
as a Time Block: a row planned `no plan` is dimmed, a plan struck through
with `~text~` shows struck, and on today's daily note the row holding the
current time is highlighted. Nothing is highlighted on another day's note,
before the first row, or more than 15 minutes past the last row. Other
tables render as plain tables.

#### Scenario: Plan, no plan and the current row  {#s-43fd}

*Verification*: **executable**

- **WHEN** the note "plan/daily/26-Q4/2026-10-04 Sun.md" holds a Time Block
- **AND** the time is "9:20"
- **THEN** the page shows a Time Block
- **AND** the plan "feed the dogs" is struck through
- **AND** the row "9:00am" is dimmed
- **AND** the highlighted row is "9:15am"

#### Scenario: Another day  {#s-6432}

*Verification*: **executable**

- **WHEN** the note "plan/daily/26-Q4/2026-10-03 Sat.md" holds a Time Block
- **AND** the time is "9:20"
- **THEN** no row is highlighted

#### Scenario: After the last row  {#s-eca1}

*Verification*: **executable**

- **WHEN** the note "plan/daily/26-Q4/2026-10-04 Sun.md" holds a Time Block
- **AND** the time is "11:00"
- **THEN** no row is highlighted

#### Scenario: Other tables  {#s-c0e7}

*Verification*: **executable**

- **WHEN** a note holds "| a | b |\n|---|---|\n| 1 | 2 |\n"
- **THEN** the page shows a table that is not a Time Block

#### Scenario: Actual column against the plan  {#s-9a21}

*Verification*: **non-executable**

- **WHEN** a row's Actual differs from its Plan
- **THEN** the row shows how it went against the plan at a glance

### Requirement: The Time Log is a list of timed entries  {#r-d3ac}

The UI SHALL render the entries under a daily note's `### Log` heading (a
`- ` header line with indented `* start:` and `* end:` lines and notes) as a
timeline: each entry with its start, end (or still open) and duration, and
its tags marked.

#### Scenario: A closed and an open entry  {#s-a581}

*Verification*: **non-executable**

- **WHEN** a daily note's Log holds "- Work", started 09:45 and ended 11:00, and "- Packed #trip", started 13:00 with no end
- **THEN** the first shows 09:45 to 11:00 and 1h 15m, and the second shows 13:00 and open, with "trip" marked as a tag

### Requirement: Backlinks list the notes linking here  {#r-6cdd}

The server SHALL list the notes whose `[[links]]` resolve to a given note,
sorted by path, a folder note included, resolving links as for display, and
the UI SHALL show them under the note and refresh them when a note changes.
A note does not list itself.

#### Scenario: Backlinks  {#s-71ec}

*Verification*: **executable**

- **WHEN** a client requests "/api/backlinks?path=area/health.md" with the right token
- **THEN** the backlinks are "root.md"

#### Scenario: A folder note  {#s-8e9d}

*Verification*: **executable**

- **WHEN** a client requests "/api/backlinks?path=project/make-bread/Home.md" with the right token
- **THEN** the backlinks are "root.md"

#### Scenario: None  {#s-aa72}

*Verification*: **executable**

- **WHEN** a client requests "/api/backlinks?path=zeta/z.md" with the right token
- **THEN** there are no backlinks

#### Scenario: A link in a changed note  {#s-baca}

*Verification*: **executable**

- **WHEN** the note "alpha/a.md" is changed to link to "[[zeta/z]]"
- **AND** a client requests "/api/backlinks?path=zeta/z.md" with the right token
- **THEN** the backlinks are "alpha/a.md"
