import type { TodayTask } from "../../shared/types";
import { parseClock } from "./markdown";

export interface BlockRow {
  /** Minutes since midnight. */
  minutes: number;
  /** The Plan cell, as written. */
  plan: string;
}

export interface Alert {
  id: string;
  /** Epoch ms. */
  at: number;
  title: string;
}

const cells = (line: string) => line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

/** The Time Block table's rows (time and Plan) from a daily note. */
export function parseTimeBlock(text: string): BlockRow[] {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => /^#+\s*time block\b/i.test(l));
  if (start < 0) return [];
  const rows: BlockRow[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^#/.test(line)) break;
    if (!line.trim().startsWith("|")) continue;
    const [time, plan = ""] = cells(line);
    const minutes = parseClock(time ?? "");
    if (minutes !== null) rows.push({ minutes, plan });
  }
  return rows;
}

/** A plan worth an alert: not empty, `no plan`, or struck out (`~x~`). */
export function isPlanned(plan: string): boolean {
  const live = plan.replace(/~~?[^~]*~~?/g, "").trim();
  return live !== "" && !/^no plan$/i.test(live);
}

/** Index of the row holding `nowMinutes` (rows are quarter hours), or -1. */
export function currentRow(rows: BlockRow[], nowMinutes: number): number {
  let cur = -1;
  rows.forEach((r, i) => {
    if (r.minutes <= nowMinutes) cur = i;
  });
  return cur >= 0 && nowMinutes >= rows[cur].minutes + 15 && cur === rows.length - 1 ? -1 : cur;
}

/** `HH:MM` as minutes, or null. */
export function parseHm(s: string | null): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s ?? "");
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

function at(day: Date, minutes: number): number {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minutes).getTime();
}

/** Today's alerts: timed tasks due today, and each planned Time Block row. */
export function buildAlerts(day: Date, todayIso: string, tasks: TodayTask[], rows: BlockRow[]): Alert[] {
  const out: Alert[] = [];
  for (const t of tasks) {
    const m = parseHm(t.time);
    if (m === null || t.due !== todayIso) continue;
    out.push({ id: `task:${t.file}:${t.line}:${t.time}`, at: at(day, m), title: `${t.time} ${t.text.replace(/^- \[.\]\s*/, "").replace(/\s*[⏰📅⏳🛫].*$/u, "")}` });
  }
  for (const r of rows) {
    if (!isPlanned(r.plan)) continue;
    const hm = `${String(Math.floor(r.minutes / 60)).padStart(2, "0")}:${String(r.minutes % 60).padStart(2, "0")}`;
    out.push({ id: `row:${hm}`, at: at(day, r.minutes), title: `${hm} ${r.plan}` });
  }
  return out.sort((a, b) => a.at - b.at);
}
