import { useEffect, useRef, useState } from "react";
import { closedEntry, doneMessage, hm, isPlaceholder, labelOf, newEntry, nowState, shortTime, singleFlight, stopwatch, timers } from "./now";
import { appendTimeLog, parseTimeLog } from "./time-log";
import type { useToday } from "./TodayView";
import type { SendFn } from "./MessageSheet";

/** Close the running entry with no next block: `time-log update` against the entry as shown. */
async function closeEntry(path: string, expect: string, text: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/timelog/update", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path, expect, text }) });
    return (await res.json()) as { ok: boolean; error?: string };
  } catch {
    return { ok: false, error: "Cannot reach the server" };
  }
}

/**
 * The Now page: the running Time Log entry with its timer and overage (red past the block's planned end),
 * the previous entry, the next block, a Done (or Start) button, and the rest of the day's blocks. The
 * data is Today's (re-fetched on file changes); only the clock ticks here, once a second while shown.
 */
export function NowView({ today, canMessage, send }: { today: ReturnType<typeof useToday>; canMessage: boolean; send: SendFn }) {
  const [tick, setTick] = useState(() => new Date());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const flight = useRef(singleFlight());
  // The clock stops while a request is pending, so the timer holds still until the server answers.
  useEffect(() => {
    if (busy) return;
    setTick(new Date());
    const t = setInterval(() => setTick(new Date()), 1000);
    return () => clearInterval(t);
  }, [busy]);
  const { data, error: loadError } = today;
  if (loadError) return <p className="error">{loadError}</p>;
  if (!data) return <p className="hint">Loading...</p>;
  if (!data.daily) return <p className="hint">No daily note for today yet.</p>;
  const path = data.daily.path;
  const nowMin = tick.getHours() * 60 + tick.getMinutes();
  const nowSec = nowMin * 60 + tick.getSeconds();
  const s = nowState(data.daily.text, nowMin);
  const { worked, over } = timers(s, nowSec);

  const act = async () => {
    const log = parseTimeLog(data.daily!.text);
    if (!log) return;
    // The ref guard blocks a second tap in the same render; `busy` greys the button and stops the clock.
    await flight.current.run(async () => {
      setBusy(true);
      try {
        await request(log);
      } finally {
        setBusy(false);
      }
    });
  };
  const request = async (log: NonNullable<ReturnType<typeof parseTimeLog>>) => {
    setError("");
    const t = new Date();
    const m = t.getHours() * 60 + t.getMinutes();
    const fresh = nowState(data.daily!.text, m);
    let r: { ok: boolean; error?: string };
    if (fresh.running) {
      r = fresh.next ? await appendTimeLog(path, fresh.next.plan, hm(m), log, true) : await closeEntry(path, fresh.running.entry.raw, closedEntry(fresh.running.entry, hm(m)));
      if (r.ok && canMessage) void send(doneMessage(fresh, m));
    } else if (!fresh.block) r = { ok: false, error: "Nothing planned to start" };
    else if (log.length && isPlaceholder(log[log.length - 1])) {
      // The template's placeholder entry (start HH:MM) can't be a --prev; replace it with the new entry.
      r = await closeEntry(path, log[log.length - 1].raw, newEntry(fresh.block.plan, hm(m)));
    } else r = await appendTimeLog(path, fresh.block.plan, hm(m), log);
    if (!r.ok) setError(r.error ?? "Changed meanwhile; look again");
  };

  return (
    <article className="note now">
      <section className={`now-current${over > 0 ? " over" : ""}`}>
        {s.running ? (
          <>
            <h2>{s.running.label}</h2>
            <p className="hint">Started {shortTime(s.running.start)}{s.block ? `, planned until ${shortTime(s.block.end)}` : ""}</p>
            <p className="now-worked" aria-label="Time worked">{stopwatch(worked)}</p>
            {over > 0 && <p className="now-over" aria-label="Overage">+{stopwatch(over)} over</p>}
          </>
        ) : s.block ? (
          <>
            <h2>{labelOf(s.block.plan)}</h2>
            <p className="hint">Planned {shortTime(s.block.start)} to {shortTime(s.block.end)}; nothing is running.</p>
          </>
        ) : (
          <h2>Nothing planned</h2>
        )}
        {(s.running || s.block) && s.hasLog && (
          <button className="primary now-action" disabled={busy} aria-busy={busy} onClick={() => void act()}>{busy ? "Saving..." : s.running ? "Done" : "Start"}</button>
        )}
        {(s.running || s.block) && !s.hasLog && <p className="hint">Today's note has no Time Log section.</p>}
        {error && <p className="error conflict">{error}</p>}
      </section>
      <p className="now-previous">Previous: {s.previous ? `${labelOf(s.previous.header)} (${s.previous.start.replace("~", "")}-${s.previous.end.replace("~", "")})` : "none yet"}</p>
      <p className="now-next">Next: {s.next ? `${labelOf(s.next.plan)} at ${shortTime(s.next.start)}` : "nothing more planned"}</p>
      <h3>The day</h3>
      <ul className="now-blocks">
        {s.blocks.map((b) => (
          <li key={b.start} className={[b === s.block ? "current" : "", b.end <= nowMin && b !== s.block ? "past" : ""].join(" ").trim()}>
            {shortTime(b.start)}-{shortTime(b.end)} {labelOf(b.plan)}
          </li>
        ))}
      </ul>
    </article>
  );
}
