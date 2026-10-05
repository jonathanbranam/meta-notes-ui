---
id: access
severity: must
roles: [manager, worker]
---
The server is reachable from the human's phone from v1, so it is never
open without a secret. It requires a token on every request (set at
start, kept in the notes root's `.meta-notes-cache/ui/`, given to the
browser once through a URL that the CLI prints or opens, then kept as a
cookie). It binds 127.0.0.1 unless started with a host to bind for the
phone (a LAN or Tailscale address). It serves only files under the notes
root, never `.git` or `.meta-notes-cache`, and never follows a path out of
the root.

Why: the human, 2026-10-04, chose phone access from day one; the notes
hold their whole work and personal life.
