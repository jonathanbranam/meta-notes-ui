import { readFile } from "node:fs/promises";
import type { Hono } from "hono";
import type { AgendaEvent, TodayResponse, TodayTask } from "../shared/types.js";
import { runMetaNotes } from "./edits.js";
import { confine } from "./paths.js";

/** `GET /api/today`: what the Today view shows, all from the meta-notes CLI (and the daily note it names). */
export function todayRoutes(app: Hono, root: string): void {
  app.get("/api/today", async (c) => {
    const [daily, tasks, calendar] = await Promise.all([
      runMetaNotes(root, ["note", "daily"]),
      runMetaNotes(root, ["tasks", "--overdue", "--due"]),
      runMetaNotes(root, ["calendar"]),
    ]);
    if (!tasks.ok) return c.json({ error: tasks.error ?? "meta-notes failed" }, 502);

    let note: TodayResponse["daily"] = null;
    if (daily.ok && typeof daily.path === "string") {
      try {
        note = { path: daily.path, text: await readFile(await confine(root, daily.path), "utf8") };
      } catch {
        // no readable daily note: the view shows the rest
      }
    }
    const days = calendar.ok ? (calendar.days as { events?: AgendaEvent[] }[] | undefined) : undefined;
    const body: TodayResponse = {
      daily: note,
      tasks: (tasks.tasks as TodayTask[] | undefined) ?? [],
      agenda: days ? days.flatMap((d) => d.events ?? []) : null,
    };
    return c.json(body);
  });
}
