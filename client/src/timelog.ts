/** One Time Log entry: its header line, the raw lines (header and indented), and its times. */
export interface LogEntry {
  header: string;
  /** The entry as written, header and indented lines, joined with newlines. */
  raw: string;
  start: string;
  /** Empty when the entry is open. */
  end: string;
}

/** The entries under the note's `### Log` heading; null when it has no such heading. */
export function parseTimeLog(text: string): LogEntry[] | null {
  const lines = text.split("\n");
  const at = lines.findIndex((l) => /^###\s+log\s*$/i.test(l));
  if (at < 0) return null;
  const entries: LogEntry[] = [];
  let cur: string[] | null = null;
  const done = () => {
    if (!cur) return;
    while (cur.length > 1 && !cur[cur.length - 1].trim()) cur.pop();
    const time = (k: string) => cur!.map((l) => new RegExp(`^\\s+\\*\\s+${k}:[ \\t]*(.*)$`).exec(l)?.[1].trim()).find((v) => v !== undefined) ?? "";
    entries.push({ header: cur[0], raw: cur.join("\n"), start: time("start"), end: time("end") });
    cur = null;
  };
  for (const l of lines.slice(at + 1)) {
    if (/^#/.test(l)) break;
    if (/^- /.test(l)) (done(), (cur = [l]));
    else if (cur && (/^\s+\S/.test(l) || !l.trim())) cur.push(l);
  }
  done();
  return entries;
}

/** The local time as `HH:MM`. */
export const clock = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

/** What `POST /api/timelog/append` says came back. */
export interface AppendReply {
  ok: boolean;
  error?: string;
  current?: unknown;
}

/**
 * Append an entry `- what` to the note's Time Log, starting at `start` (`HH:MM` or `~HH:MM`; empty: the CLI's now).
 * `log` is the entries as the client shows them: the last one is sent as `--prev`, so a log that changed meanwhile
 * is refused; with `closePrev` an open last entry is ended at `start`. Reused by the trip timer.
 */
export async function appendTimeLog(path: string, what: string, start: string, log: LogEntry[], closePrev = true): Promise<AppendReply> {
  const text = what.trim().startsWith("- ") ? what.trim() : `- ${what.trim()}`;
  const last = log[log.length - 1];
  const prev = last ? { prev: last.header, prevStart: last.start, prevOpen: last.end === "", closePrev: closePrev && last.end === "" } : { first: true };
  try {
    const res = await fetch("/api/timelog/append", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path, text, start, ...prev }) });
    return (await res.json()) as AppendReply;
  } catch {
    return { ok: false, error: "Cannot reach the server" };
  }
}

/** An edited open entry must not keep an empty `* end:` line: the CLI wants no end line, or a time. */
export const dropEmptyEnd = (text: string) => text.replace(/^[ \t]+\*[ \t]+end:[ \t]*(?:\n|$)/gim, "").replace(/\n+$/, "");
