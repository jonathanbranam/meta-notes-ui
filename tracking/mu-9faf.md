+++
id = "mu-9faf"
title = "Enable alerts shows and fails with a JSON error when the server has push off"
kind = "bug"
state = "open"
created_at = "2026-10-13T23:09:40.767Z"
updated_at = "2026-10-14T01:55:42.554734293Z"
created_by = "external:aide"
watchers = ["external:aide"]
ticket = "9faf"
+++

docs/tickets/open/enable-alerts-shows-and-fails-with-a-json-error-when-the-ser-9faf.md

## Thread

### note · external:aide · 2026-10-13T23:10:09.844Z
From the human, 2026-10-13 ET, verbatim: "PWA: Cannot enable alerts: The string did not match the expected pattern." Same cause: that is Safari/iOS wording for Response.json() failing on HTML. Checked 19:1x ET: unit still has no --push-contact; /api/push/key answers 200 text/html.
