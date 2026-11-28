import type { Hono } from "hono";
import type { Committer } from "./committer.js";
import { runMetaNotes, type CliResult } from "./edits.js";
import { confine } from "./paths.js";

/** A list's root-relative path, if it is a note that exists inside the root. */
async function listPath(root: string, rel: unknown): Promise<string | null> {
  if (typeof rel !== "string" || !rel.endsWith(".md")) return null;
  try {
    await confine(root, rel);
    return rel;
  } catch {
    return null;
  }
}

type ListItem = { number?: number; source?: { file?: unknown } | null; closed_task?: unknown };

/** Item `n` of a `list show` (or list write) result. */
function item(r: CliResult, n: number): ListItem | undefined {
  return (r.groups as { items?: ListItem[] }[] | undefined)?.flatMap((g) => g.items ?? []).find((i) => i.number === n);
}

/** Lists routes: reads and the check/uncheck/cancel writes are all `meta-notes list ...` (rule writes-through-the-cli). */
export function listRoutes(app: Hono, root: string, commits: Committer): void {
  // Every list, newest first, and the day's current list (null when none).
  app.get("/api/lists", async (c) => {
    const [ls, cur] = await Promise.all([runMetaNotes(root, ["list", "ls"]), runMetaNotes(root, ["list", "current"])]);
    if (!ls.ok) return c.json({ ok: false, error: ls.error ?? "meta-notes failed" }, 502);
    const lists = [...((ls.lists as { date?: string }[] | undefined) ?? [])].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
    return c.json({ ok: true, lists, current: cur.ok && typeof cur.list === "string" ? cur.list : null });
  });

  // One list's groups and items.
  app.get("/api/list", async (c) => {
    const rel = await listPath(root, c.req.query("path"));
    if (!rel) return c.json({ ok: false, error: "no such list" }, 404);
    const r = await runMetaNotes(root, ["list", "show", rel]);
    return c.json(r, r.ok ? 200 : 400);
  });

  // Check, uncheck or cancel an item. body: {list, n, expect, action: "check"|"uncheck"|"cancel"}; expect is the item's text as shown.
  app.post("/api/list/check", async (c) => {
    const b = await c.req.json().catch(() => ({}));
    const rel = await listPath(root, b.list);
    if (!rel || !Number.isInteger(b.n) || b.n < 1 || typeof b.expect !== "string" || !["check", "uncheck", "cancel"].includes(b.action))
      return c.json({ ok: false, error: "bad request" }, 400);
    // The list also closes or reopens the item's source task: that note was written when `closed_task` flips.
    const before = await runMetaNotes(root, ["list", "show", rel]);
    const r = await commits.write(
      () => runMetaNotes(root, ["list", b.action, rel, String(b.n), `--expect=${b.expect}`]),
      (done) => {
        if (!done.ok) return [];
        const now = item(done, b.n);
        const flipped = !item(before, b.n)?.closed_task !== !now?.closed_task;
        return flipped && typeof now?.source?.file === "string" ? [rel, `${now.source.file}.md`] : [rel];
      },
    );
    return c.json(r, r.ok ? 200 : 409);
  });
}
