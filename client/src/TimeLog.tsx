import { useState } from "react";
import { appendTimeLog, clock, dropEmptyEnd, parseTimeLog, type LogEntry } from "./timelog";

/** What an edit route says went wrong, as one line. */
function why(r: { error?: string; current?: unknown }): string {
  const cur = Array.isArray(r.current) ? (r.current as { text: string }[]).map((x) => x.text).join("\n") : "";
  return cur ? `${r.error ?? "Changed meanwhile"}\nIt is now:\n${cur}` : (r.error ?? "Save failed");
}

/** One entry's lines in a text box, saved with `time-log update` against the lines as shown. */
function EntryEditor({ path, entry, onClose }: { path: string; entry: LogEntry; onClose: () => void }) {
  const [draft, setDraft] = useState(entry.raw);
  const [error, setError] = useState("");
  const save = async () => {
    try {
      const res = await fetch("/api/timelog/update", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path, expect: entry.raw, text: draft.trim() ? dropEmptyEnd(draft) : "" }) });
      const r = (await res.json()) as { ok: boolean; error?: string; current?: unknown };
      if (r.ok) return onClose();
      setError(why(r));
    } catch {
      setError("Cannot reach the server");
    }
  };
  return (
    <div className="editor">
      <textarea autoFocus value={draft} rows={Math.max(3, draft.split("\n").length + 1)} onChange={(e) => setDraft(e.target.value)} aria-label="Log entry" />
      {error && <p className="error conflict">{error}</p>}
      <button onClick={() => void save()}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}

/**
 * Under a note's Time Log (`### Log`): "Start now" adds an entry at the current time and closes the open one;
 * each entry has an Edit button. Renders nothing for a note without a Log section.
 */
export function TimeLogPanel({ path, text }: { path: string; text: string }) {
  const log = parseTimeLog(text);
  const [what, setWhat] = useState("");
  const [start, setStart] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  if (!log) return null;
  const add = async (at: string) => {
    if (!what.trim()) return;
    const r = await appendTimeLog(path, what, at, log);
    if (!r.ok) return setError(why(r));
    setError("");
    setWhat("");
    setStart("");
  };
  return (
    <section className="timelog-edit">
      <h4>Time Log</h4>
      <ul>
        {log.map((e) => (
          <li key={e.raw}>
            {editing === e.raw ? (
              <EntryEditor path={path} entry={e} onClose={() => setEditing(null)} />
            ) : (
              <>
                {e.header.replace(/^- /, "")} <span className="hint">{e.start || "?"} - {e.end || "open"}</span> <button onClick={() => setEditing(e.raw)}>Edit</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <form className="add-task" onSubmit={(e) => (e.preventDefault(), void add(start.trim() || clock(new Date())))}>
        <input value={what} onChange={(e) => setWhat(e.target.value)} placeholder="What are you starting?" aria-label="New log entry" />
        <input value={start} onChange={(e) => setStart(e.target.value)} placeholder="HH:MM or ~HH:MM" aria-label="Start time" size={10} />
        <button type="submit" className="primary" disabled={!what.trim()}>{start.trim() ? "Start at" : "Start now"}</button>
        {error && <p className="error conflict">{error}</p>}
      </form>
    </section>
  );
}
