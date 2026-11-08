import type { Hono } from "hono";
import type { TagTasksResponse, TodayTask } from "../shared/types.js";
import { runMetaNotes } from "./edits.js";

/** `GET /api/tasks/due`: open tasks overdue, due today or dated for later, from `meta-notes tasks --overdue --due --future`. */
export function dueTaskRoutes(app: Hono, root: string): void {
  app.get("/api/tasks/due", async (c) => {
    const r = await runMetaNotes(root, ["tasks", "--overdue", "--due", "--future"]);
    if (!r.ok) return c.json({ error: r.error ?? "meta-notes failed" }, 502);
    const body: Pick<TagTasksResponse, "tasks"> = { tasks: (r.tasks as TodayTask[] | undefined) ?? [] };
    return c.json(body);
  });
}
