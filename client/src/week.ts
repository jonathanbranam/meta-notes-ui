import type { Slot } from "../../shared/week";
import { SLOT } from "../../shared/week";

/** The week page's hash path: `!week?start=<monday>&days=7|5|2` (design/specs/week-page.md). */
export const WEEK_PATH = "!week";

export type Range = 7 | 5 | 2;
export const RANGES: { days: Range; label: string }[] = [
  { days: 7, label: "7 days" },
  { days: 5, label: "5 weekdays" },
  { days: 2, label: "Weekend" },
];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (date: string, n: number) => {
  const d = parse(date);
  d.setDate(d.getDate() + n);
  return iso(d);
};

/** The Monday on or before `date`. */
export function mondayOf(date: string): string {
  const d = parse(date);
  return addDays(date, -((d.getDay() + 6) % 7));
}

export interface WeekPage {
  /** The Monday of the week shown. */
  monday: string;
  days: Range;
}

/** Reads `!week?start=&days=`; a missing or bad start is this week, a bad days is 5. */
export function parseWeekPath(path: string, today: string): WeekPage {
  const q = new URLSearchParams(path.includes("?") ? path.slice(path.indexOf("?") + 1) : "");
  const start = q.get("start");
  const days = Number(q.get("days"));
  return {
    monday: start && /^\d{4}-\d{2}-\d{2}$/.test(start) ? mondayOf(start) : mondayOf(today),
    days: days === 7 || days === 2 ? days : 5,
  };
}

export function weekPath(p: WeekPage): string {
  return `${WEEK_PATH}?start=${p.monday}&days=${p.days}`;
}

/** The first day the grid shows: the Monday, or the Saturday for the weekend. */
export function firstDay(p: WeekPage): string {
  return p.days === 2 ? addDays(p.monday, 5) : p.monday;
}

/** The page one week back (`-1`) or on (`1`), same range. */
export function stepWeek(p: WeekPage, n: -1 | 1): WeekPage {
  return { ...p, monday: addDays(p.monday, 7 * n) };
}

/** A run of consecutive equal slots drawn as one box. */
export interface Box {
  slot: Slot;
  /** First slot index and how many slots it spans. */
  from: number;
  span: number;
}

/** Merges consecutive slots with the same kind, text, badge and error; empty slots draw nothing. */
export function boxes(slots: Slot[]): Box[] {
  const out: Box[] = [];
  slots.forEach((s, i) => {
    if (s.kind === "empty") return;
    const last = out.at(-1);
    const same = last && last.from + last.span === i && last.slot.kind === s.kind && last.slot.text === s.text && last.slot.badge === s.badge && last.slot.error === s.error;
    if (same) last.span++;
    else out.push({ slot: s, from: i, span: 1 });
  });
  return out;
}

/** The CSS class of a box: its kind, and `fill` for a before-now fill-in (shared style). */
export function boxClass(s: Slot, past: boolean): string {
  if (s.kind === "error") return s.error === "in the future" ? "wk-box wk-future-error" : "wk-box wk-error";
  if (s.kind === "calendar") return past ? "wk-box wk-fill wk-cal" : "wk-box wk-cal";
  if (s.kind === "actual" || s.kind === "plan") return past ? "wk-box wk-fill" : "wk-box wk-plan";
  return "wk-box wk-log";
}

/** `H:MM AM` of a slot's start. */
export function clockLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  return `${h % 12 || 12}:${pad(minutes % 60)} ${h < 12 ? "AM" : "PM"}`;
}

export const slotIndex = (minutes: number) => minutes / SLOT;
