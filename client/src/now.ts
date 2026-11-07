import { isPlanned, parseClock, parseHm, parseTimeBlock, type BlockRow } from "../../shared/today";
import { dropEmptyEnd, parseTimeLog, type LogEntry } from "./timelog";

/** Consecutive Time Block rows with the same Plan: what the human does from `start` to `end` (minutes since midnight). */
export interface Block {
  plan: string;
  start: number;
  end: number;
}

/** The rows grouped into blocks; rows with no plan (empty, `no plan`, struck out) belong to no block. */
export function blocksOf(rows: BlockRow[]): Block[] {
  const out: Block[] = [];
  let prev: BlockRow | null = null;
  for (const r of rows) {
    if (!isPlanned(r.plan)) {
      prev = null;
      continue;
    }
    const last = out[out.length - 1];
    if (prev && last && prev.plan.trim() === r.plan.trim()) last.end = r.minutes + 15;
    else out.push({ plan: r.plan.trim(), start: r.minutes, end: r.minutes + 15 });
    prev = r;
  }
  return out;
}

/** A Time Log time (`HH:MM`, `~HH:MM`, `9:30am`) as minutes since midnight, or null. */
export function logMinutes(s: string): number | null {
  const t = s.replace(/^\s*~\s*/, "");
  return parseHm(t.trim()) ?? parseClock(t);
}

/** An entry's header as a name: no `- `, no trailing colon. */
export const labelOf = (header: string) => header.replace(/^- /, "").replace(/:\s*$/, "").trim();

const norm = (s: string) => labelOf(s).replace(/#\S+/g, "").replace(/\[\[|\]\]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

export interface NowState {
  /** The last log entry when it has no end. */
  running: { entry: LogEntry; label: string; start: number } | null;
  /** The block the running entry belongs to, or (nothing running) the one now, else the next to come. */
  block: Block | null;
  /** The block after `block`. */
  next: Block | null;
  /** The last finished log entry. */
  previous: LogEntry | null;
  blocks: Block[];
  /** The note has a `### Log` section, so entries can be written. */
  hasLog: boolean;
}

/** What the Now view shows for a daily note's text at `nowMin` minutes since midnight. */
export function nowState(text: string, nowMin: number): NowState {
  const blocks = blocksOf(parseTimeBlock(text));
  const log = parseTimeLog(text);
  const last = log?.[log.length - 1];
  const startMin = last && last.end === "" ? logMinutes(last.start) : null;
  const running = last && startMin !== null ? { entry: last, label: labelOf(last.header), start: startMin } : null;
  const previous = [...(log ?? [])].reverse().find((e) => e.end !== "") ?? null;

  let at = -1;
  if (running) {
    // The block with the same plan as the entry that ends after it started, else the block it started in.
    at = blocks.findIndex((b) => norm(b.plan) === norm(running.entry.header) && b.end > running.start);
    if (at < 0) at = blocks.findIndex((b) => b.start <= running.start && running.start < b.end);
  } else {
    at = blocks.findIndex((b) => b.start <= nowMin && nowMin < b.end);
    if (at < 0) at = blocks.findIndex((b) => b.start > nowMin);
  }
  const block = at >= 0 ? blocks[at] : null;
  const next = at >= 0 ? (blocks[at + 1] ?? null) : (running ? (blocks.find((b) => b.start > nowMin) ?? null) : null);
  return { running, block, next, previous, blocks, hasLog: log !== null };
}

/** Seconds worked on the running entry, and seconds past the block's planned end (0 when not over). */
export function timers(s: NowState, nowSec: number): { worked: number; over: number } {
  if (!s.running) return { worked: 0, over: 0 };
  return { worked: Math.max(0, nowSec - s.running.start * 60), over: s.block ? Math.max(0, nowSec - s.block.end * 60) : 0 };
}

/** `h:mm` on a 12-hour clock, no am/pm (as the message text shows it). */
export const shortTime = (min: number) => `${Math.floor(min / 60) % 12 || 12}:${String(min % 60).padStart(2, "0")}`;

/** `HH:MM` for the Time Log. */
export const hm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

/** The message Done sends to the aide: what ended, how late, and what runs now. */
export function doneMessage(s: NowState, nowMin: number): string {
  const r = s.running!;
  const over = s.block ? nowMin - s.block.end : 0;
  const head = `Done: ${r.label}, ${shortTime(r.start)}-${shortTime(nowMin)}${over > 0 ? ` (${over} min over)` : ""}.`;
  return s.next ? `${head} Now: ${labelOf(s.next.plan)}, until ${shortTime(s.next.end)}.` : `${head} Nothing planned next.`;
}

/** The running entry with its end written (an empty `* end:` line is replaced), for `time-log update`. */
export function closedEntry(entry: LogEntry, endHm: string): string {
  return `${dropEmptyEnd(entry.raw)}\n  * end: ${endHm}`;
}

/** `m:ss` or `h:mm:ss`. */
export function stopwatch(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
