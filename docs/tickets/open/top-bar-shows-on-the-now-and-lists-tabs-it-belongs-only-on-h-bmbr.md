---
id: mu-bmbr
title: Top bar shows on the Now and Lists tabs; it belongs only on Home
kind: bug
created: 2026-11-07
created_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: [mu-5eme, mu-97fh, mu-xfm2]
---

## The ask

From the human (Sat 2026-11-07, to aide, verbatim): "The top nav should not show in the lists or in
now"

Aide: the top bar (Menu with alerts, Open, New, Reload, Daily; mu-nehy) shows on the Now and Lists
tabs (v0.24.0, v0.25.0). It should show only on Home. Lists keeps its own top-left back-to-all-lists
button; the Now and Lists pages keep their own content and the message button. This matches the
human's earlier "For now, we could leave all that just as it is in Home" (mu-5tju).

## Check

On the phone layout, Now and Lists show no top bar; Home still shows it; Lists' back button and the
message button still work. Desktop browser (no tab bar): open question to the human, since there the
top bar is the only way back to Home.
