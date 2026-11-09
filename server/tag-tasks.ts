import type { Hono } from "hono";
import type { TagTasksResponse, TodayTask } from "../shared/types.js";
import { runMetaNotes } from "./edits.js";

/** `GET /api/tasks?tag=x`: the open tasks carrying a tag, from `meta-notes tasks --tag` (which folds aliases). */
export function tagTaskRoutes(app: Hono, root: string): void {
  app.get("/api/tasks", async (c) => {
    const tag = (c.req.query("tag") ?? "").toLowerCase();
    if (!/^[\p{L}\p{N}_-]+$/u.test(tag)) return c.json({ error: "bad request" }, 400);
    const r = await runMetaNotes(root, ["tasks", "--tag", tag]);
    if (!r.ok) return c.json({ error: r.error ?? "meta-notes failed" }, 502);
    const body: TagTasksResponse = { tag, tasks: (r.tasks as TodayTask[] | undefined) ?? [] };
    return c.json(body);
  });
}
