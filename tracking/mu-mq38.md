+++
id = "mu-mq38"
title = "A double-encoded note link fails with Cannot open"
kind = "fix"
state = "planned"
created_at = "2026-11-08T23:57:32.975Z"
updated_at = "2026-11-09T00:20:58.385384771Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
ticket = "mq38"
+++

docs/tickets/open/a-double-encoded-note-link-fails-with-cannot-open-mq38.md

## Thread

### note · agent:relink · 2026-11-09T00:20:58.385Z
Landed on bridle/relink at 2420150 (v0.29.2). A note that fails to open with percent escapes in its path gets one retry with the path decoded once more. If it opens, the page shows it at the heading and the address is corrected in place. Otherwise the error names the original path. A stray % gives no retry.
Also: the heading in the address now matches through headingSlug, so "#Zeal" scrolls to "## Zeal" (before, only the slug form "#zeal" matched).
Checked in headless Chrome on a throwaway server (own port, copied example root): double-encoded "#...Christmas%25202026.md#Zeal" opens the note at Zeal and the address reads "#...Christmas%202026.md#Zeal"; real note area/health.md unchanged; a real name holding "%25" opens first try; stray-% path shows "Cannot open"; missing double-encoded note shows "Cannot open" with the original path.
Not verified: a click from another app (I navigated the address directly), Back/Forward history after the correction.
