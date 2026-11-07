import { parseHm, type BlockRow, isPlanned } from "./today.js";

/** Minutes in a slot. */
export const SLOT = 15;
export const SLOTS_PER_DAY = 96;

/** Where a slot's content came from; `error` is a Time Log parse error or a record in the future. */
export type SlotKind = "log" | "actual" | "plan" | "calendar" | "error" | "empty";

export interface Slot {
  /** Minutes since midnight at the start of the slot. */
  at: number;
  kind: SlotKind;
  text: string;
  /** Fill-in source badge: absent for the default source (Time Log before now, Time Block Plan after). */
  badge?: "A" | "P" | "Cal";
  /** Short error label for `error` slots. */
  error?: string;
}

/** What each source holds for one slot (empty string or undefined: nothing). */
export interface SlotInputs {
  /** Time Log entry text covering the slot. */
  log?: string;
  /** A Time Log parse error at the slot (the short label), with the entry's name. */
  logError?: { label: string; text: string };
  actual?: string;
  plan?: string;
  calendar?: string;
}

/**
 * The cascade, written once (epic mu-adm2): what one 15-minute slot shows.
 *  - Before now: Time Log (no badge) > Actual (A) > Plan (P) > Calendar (Cal) > empty.
 *  - After now: Plan (no badge) > Calendar (Cal) > empty.
 *  - A Time Log entry, Time Log error or Actual after now is an error: "in the future".
 * A Time Log parse error before now shows as an error slot with its label.
 */
export function cascade(at: number, future: boolean, i: SlotInputs): Slot {
  const has = (s: string | undefined): s is string => !!s && s.trim() !== "";
  if (future) {
    if (i.logError || has(i.log)) return { at, kind: "error", text: i.logError?.text ?? i.log ?? "", error: "in the future" };
    if (has(i.actual)) return { at, kind: "error", text: i.actual, error: "in the future" };
    if (has(i.plan)) return { at, kind: "plan", text: i.plan };
    if (has(i.calendar)) return { at, kind: "calendar", text: i.calendar, badge: "Cal" };
    return { at, kind: "empty", text: "" };
  }
  if (i.logError) return { at, kind: "error", text: i.logError.text, error: i.logError.label };
  if (has(i.log)) return { at, kind: "log", text: i.log };
  if (has(i.actual)) return { at, kind: "actual", text: i.actual, badge: "A" };
  if (has(i.plan)) return { at, kind: "plan", text: i.plan, badge: "P" };
  if (has(i.calendar)) return { at, kind: "calendar", text: i.calendar, badge: "Cal" };
  return { at, kind: "empty", text: "" };
}

export type LogErrorLabel = "missing start" | "missing end" | "duplicate starts" | "duplicate ends";

/** What `meta-notes time --json` reports for one Time Log entry (gaps are not passed in). */
export interface CliEntry {
  line: number;
  text: string;
  start: string | null;
  end: string | null;
}

export interface LogEntry {
  text: string;
  /** Minutes since midnight. */
  start: number;
  end: number;
}

export interface LogError {
  label: LogErrorLabel;
  text: string;
  /** The slot start (minutes) the error sits at; null when the entry has no time at all. */
  at: number | null;
}

/** A raw Time Log entry's `start:` and `end:` lines, by the entry's header line number (1-based). */
export interface RawEntry {
  line: number;
  starts: string[];
  ends: string[];
}

/**
 * The entries under the note's `Log` heading, read raw. `meta-notes time --json` keeps only the last
 * start and end of an entry, so this is what finds duplicates.
 */
export function rawLog(text: string): RawEntry[] {
  const lines = text.split("\n");
  const from = lines.findIndex((l) => /^#+\s*log\s*$/i.test(l));
  if (from < 0) return [];
  const out: RawEntry[] = [];
  for (let n = from + 1; n < lines.length; n++) {
    const l = lines[n];
    if (/^#/.test(l)) break;
    if (/^- /.test(l)) out.push({ line: n + 1, starts: [], ends: [] });
    const m = /^\s+[*-]\s+(start|end):\s*(.*?)\s*$/i.exec(l);
    if (m && out.length) (m[1].toLowerCase() === "start" ? out.at(-1)!.starts : out.at(-1)!.ends).push(m[2]);
  }
  return out;
}

const slotOf = (min: number) => Math.floor(min / SLOT) * SLOT;

/**
 * The day's good Time Log entries and its error spots. `running` is the current time in minutes when
 * the day is today: an entry with a start and no end that began before then is running, not an error,
 * and runs to now.
 */
export function readLog(cli: CliEntry[], raw: RawEntry[], running: number | null): { entries: LogEntry[]; errors: LogError[] } {
  const entries: LogEntry[] = [];
  const errors: LogError[] = [];
  const name = (t: string) => t.replace(/:\s*$/, "");
  const last = cli.reduce((m, e) => Math.max(m, e.line), -1);
  for (const e of cli) {
    const text = name(e.text);
    const start = parseHm(e.start);
    const end = parseHm(e.end);
    if (start !== null && end !== null) entries.push({ text, start, end: Math.max(end, start) });
    else if (start === null && end !== null) errors.push({ label: "missing start", text, at: slotOf(Math.max(end - 1, 0)) });
    else if (start !== null) {
      if (running !== null && e.line === last && start <= running) entries.push({ text, start, end: running });
      else errors.push({ label: "missing end", text, at: slotOf(start) });
    } else errors.push({ label: "missing start", text, at: null });
  }
  const names = new Map(cli.map((e) => [e.line, name(e.text)]));
  for (const r of raw) {
    const text = names.get(r.line) ?? "";
    if (r.starts.length > 1) errors.push({ label: "duplicate starts", text, at: slotOf(parseHm(r.starts[0]) ?? 0) });
    if (r.ends.length > 1) errors.push({ label: "duplicate ends", text, at: slotOf(parseHm(r.ends[0]) ?? 0) });
  }
  return { entries, errors };
}

/** The Time Block rows as the cascade's per-slot Plan and Actual (a row holds the quarter hour it starts). */
function blockAt(rows: BlockRow[]): Map<number, BlockRow> {
  return new Map(rows.map((r) => [slotOf(r.minutes), r]));
}

export interface CalEvent {
  start: string;
  end: string;
  all_day: boolean;
  title: string;
}

/** Minutes of `HH:MM` in an ISO timestamp as written (the CLI writes local time), or null. */
export function isoMinutes(s: string): number | null {
  const m = /T(\d{2}):(\d{2})/.exec(s);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

export interface DaySlots {
  slots: Slot[];
  /** Time Log errors with no place on the grid (an entry with neither a start nor an end). */
  unplaced: LogError[];
}

/**
 * One day's 96 slots. `nowMin` is the current minute of the day when the day is today, `Infinity`
 * for a past day, `-Infinity` for a future one; a slot is in the future when it starts at or after it.
 */
export function daySlots(opts: { nowMin: number; entries: LogEntry[]; errors: LogError[]; block: BlockRow[]; events: CalEvent[] }): DaySlots {
  const plan = blockAt(opts.block);
  const timed = opts.events.filter((e) => !e.all_day).map((e) => ({ ...e, s: isoMinutes(e.start), e2: isoMinutes(e.end) }));
  const slots: Slot[] = [];
  for (let at = 0; at < SLOTS_PER_DAY * SLOT; at += SLOT) {
    const row = plan.get(at);
    // later entries win an overlap
    const log = opts.entries.filter((e) => e.start < at + SLOT && e.end > at && e.end > e.start).at(-1);
    const err = opts.errors.find((e) => e.at === at);
    const cal = timed.find((e) => e.s !== null && e.s < at + SLOT && (e.e2 ?? e.s) > at);
    slots.push(
      cascade(at, at >= opts.nowMin, {
        log: log?.text,
        logError: err ? { label: err.label, text: err.text } : undefined,
        actual: row?.actual,
        plan: row && isPlanned(row.plan) ? row.plan : undefined,
        calendar: cal?.title,
      }),
    );
  }
  return { slots, unplaced: opts.errors.filter((e) => e.at === null) };
}
