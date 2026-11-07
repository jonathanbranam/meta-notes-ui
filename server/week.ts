import { readFile } from "node:fs/promises";
import type { Hono } from "hono";
import { parseTimeBlock } from "../shared/today.js";
import type { TodayTask } from "../shared/types.js";
import { daySlots, rawLog, readLog, type CalEvent, type CliEntry, type DaySlots, type LogError } from "../shared/week.js";
import { runMetaNotes } from "./edits.js";
import { confine } from "./paths.js";

export interface WeekDay extends DaySlots {
  date: string;
  /** Root-relative daily note, or null when the day has none. */
  note: string | null;
  /** Time Log errors, all of them (the ones with a slot also sit in it). */
  logErrors: LogError[];
  /** All-day calendar events. */
  allDay: string[];
  /** Open tasks due this day. */
  tasks: TodayTask[];
}

export interface WeekResponse {
  start: string;
  days: WeekDay[];
  /** False when no calendar export is set up (the grid then has no Cal slots). */
  calendar: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");
/** `YYYY-MM-DD` of a local Date. */
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (date: string, n: number) => {
  const [y, m, d] = date.split("-").map(Number);
  return iso(new Date(y, m - 1, d + n));
};

/** The current local time as `YYYY-MM-DD` and minutes; `now` (a `YYYY-MM-DDTHH:MM` override, for tests) wins. */
function clock(now?: string): { date: string; min: number } {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(now ?? "");
  if (m) return { date: m[1], min: Number(m[2]) * 60 + Number(m[3]) };
  const d = new Date();
  return { date: iso(d), min: d.getHours() * 60 + d.getMinutes() };
}

/** A week (7 days), the 5 weekdays or the 2-day weekend from `start`, every source read through the meta-notes CLI. */
export async function buildWeek(root: string, start: string, count: number, now?: string): Promise<WeekResponse> {
  const dates = Array.from({ length: count }, (_, i) => addDays(start, i));
  const range = `${dates[0]}..${dates[count - 1]}`;
  const today = clock(now);
  const [tasks, calendar, ...perDay] = await Promise.all([
    runMetaNotes(root, ["tasks", "--due", "--date", range]),
    runMetaNotes(root, ["calendar", "--date", range]),
    ...dates.map(async (date) => {
      const [daily, time] = await Promise.all([runMetaNotes(root, ["note", "daily", "--render", date]), runMetaNotes(root, ["time", "--date", date])]);
      let text = "";
      let note: string | null = null;
      if (daily.ok && typeof daily.path === "string" && daily.exists === true) {
        try {
          text = await readFile(await confine(root, daily.path), "utf8");
          note = daily.path;
        } catch {
          // unreadable: the day shows what the CLI gave
        }
      }
      return { text, note, entries: time.ok ? ((time.entries as (CliEntry & { kind?: string })[] | undefined) ?? []).filter((e) => e.kind === "entry") : [] };
    }),
  ]);
  const calDays = calendar.ok ? ((calendar.days as { date: string; events?: CalEvent[] }[] | undefined) ?? []) : [];
  const due = (tasks.ok ? ((tasks.tasks as TodayTask[] | undefined) ?? []) : []).filter((t) => t.due);
  const days = dates.map((date, i): WeekDay => {
    const { text, note, entries } = perDay[i];
    const isToday = date === today.date;
    const log = readLog(entries, rawLog(text), isToday ? today.min : null);
    const events = calDays.find((d) => d.date === date)?.events ?? [];
    const grid = daySlots({
      nowMin: date < today.date ? Infinity : isToday ? today.min : -Infinity,
      entries: log.entries,
      errors: log.errors,
      block: parseTimeBlock(text),
      events,
    });
    return {
      date,
      note,
      ...grid,
      logErrors: log.errors,
      allDay: events.filter((e) => e.all_day).map((e) => e.title),
      tasks: due.filter((t) => t.due === date),
    };
  });
  return { start, days, calendar: calendar.ok };
}

/** `GET /api/week?start=YYYY-MM-DD&days=7|5|2`: each day's 15-minute slots, already resolved by the cascade. Read-only. */
export function weekRoutes(app: Hono, root: string): void {
  app.get("/api/week", async (c) => {
    const start = c.req.query("start") ?? "";
    const days = Number(c.req.query("days") ?? 7);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || ![7, 5, 2].includes(days)) return c.json({ error: "start=YYYY-MM-DD and days=7|5|2 are required" }, 400);
    return c.json(await buildWeek(root, start, days, c.req.query("now")));
  });
}
