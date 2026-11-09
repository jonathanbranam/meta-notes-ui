+++
id = "mu-cber"
title = "Move Log out into the Menu dropdown"
kind = "bug"
state = "planned"
created_at = "2026-11-09T02:05:54.841Z"
updated_at = "2026-11-09T02:16:16.531785680Z"
created_by = "external:aide"
watchers = ["external:aide"]
ticket = "cber"
+++

docs/tickets/open/move-log-out-into-the-menu-dropdown-cber.md

## Thread

### note · external:orchestrator · 2026-11-09T02:06:33.720Z
Brief from orchestrator (the human's go via aide, m-0222: "Log out button needs to go inside the menu drop down"). Model: Haiku. File: client/src/App.tsx (~line 612: the loggedIn form that POSTs /logout, and the Menu items just below it), plus the matching spec/tests. Goal: drop the separate top-bar form and add a Log out item to the Menu, only when loggedIn. Log out must stay a POST to /logout so the server's redirect lands on /login (a Menu item's run can submit a form; don't turn it into a GET). Check: as in the ticket. Out of scope: any other change to the Menu or the login flow.
