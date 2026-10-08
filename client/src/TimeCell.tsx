import { useState } from "react";

/** A refusal or failure from an edit route: `current` is what the CLI says is there now. */
interface Reply {
  ok: boolean;
  error?: string;
  current?: unknown;
}

async function post(url: string, body: unknown): Promise<Reply> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return (await res.json()) as Reply;
  } catch {
    return { ok: false, error: "Cannot reach the server" };
  }
}

/** The CLI's `current` (cells that differ) as readable lines. */
function currentText(c: unknown): string {
  return Array.isArray(c) ? c.map((x: { time: string; column: string; text: string }) => `${x.time} ${x.column}: ${x.text}`).join("\n") : String(c);
}

/** The cells of a table row line, trimmed, without the outer pipes. */
export const rowCells = (line: string) => line.trim().replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map((c) => c.trim());

/**
 * Edit one Time Block cell in place: a text field, Save and Cancel. `expect` is the cell as shown;
 * a refused save shows what is there now beside the kept draft, and "Save over it" retries against that.
 */
export function CellEditor({ path, time, column, text, onClose }: { path: string; time: string; column: "plan" | "actual"; text: string; onClose: () => void }) {
  const [draft, setDraft] = useState(text);
  const [expect, setExpect] = useState(text);
  const [current, setCurrent] = useState<string | undefined>();
  const [error, setError] = useState("");
  const save = async () => {
    const r = await post("/api/timeblock", { path, time, column, expect, text: draft });
    if (r.ok) return onClose();
    if (r.current !== undefined) {
      const now = Array.isArray(r.current) ? ((r.current as { text: string }[])[0]?.text ?? "") : String(r.current);
      setCurrent(currentText(r.current));
      setExpect(now);
      setError("");
    } else setError(r.error ?? "Save failed");
  };
  return (
    <span className="cell-editor" onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
      <input autoFocus value={draft} aria-label={`${column} at ${time}`} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => (e.key === "Enter" ? void save() : e.key === "Escape" ? onClose() : undefined)} />
      <button onClick={() => void save()}>{current !== undefined ? "Save over it" : "Save"}</button>
      <button onClick={onClose}>Cancel</button>
      {error && <span className="error">{error}</span>}
      {current !== undefined && <span className="conflict">This changed while you were editing. It is now: {current}</span>}
    </span>
  );
}

/** A Plan or Actual cell that opens a CellEditor when tapped. */
export function EditableCell({ path, time, column, text, children }: { path: string; time: string; column: "plan" | "actual"; text: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <td className="editable" onClick={(e) => (e.target instanceof Element && e.target.closest("a") ? undefined : setOpen(true))} onDoubleClick={(e) => e.stopPropagation()}>
      {open ? <CellEditor path={path} time={time} column={column} text={text} onClose={() => setOpen(false)} /> : (children ?? "") || <span className="empty">&nbsp;</span>}
    </td>
  );
}

/** All Time Block rows as `| time | plan | actual |` lines in one text box, saved with `time-block replace`. */
export function RowsEditor({ path, rows, onClose }: { path: string; rows: string[]; onClose: () => void }) {
  const [draft, setDraft] = useState(rows.join("\n"));
  const [expect, setExpect] = useState(rows.join("\n"));
  const [current, setCurrent] = useState<string | undefined>();
  const [error, setError] = useState("");
  const times = (r: string[]) => [rowCells(r[0])[0], rowCells(r[r.length - 1])[0]];
  const save = async () => {
    const [time, through] = times(expect.split("\n"));
    const r = await post("/api/timeblock/replace", { path, time, through, expect, text: draft });
    if (r.ok) return onClose();
    if (r.current !== undefined) {
      setCurrent(currentText(r.current));
      setError("Reload to see the rows as they are now, then edit again.");
    } else setError(r.error ?? "Save failed");
  };
  return (
    <div className="editor">
      <textarea autoFocus value={draft} rows={Math.min(24, rows.length + 1)} onChange={(e) => setDraft(e.target.value)} />
      {error && <p className="error">{error}</p>}
      {current !== undefined && (
        <div className="conflict">
          <p>These rows changed while you were editing. They differ at:</p>
          <pre>{current}</pre>
        </div>
      )}
      <button onClick={() => void save()}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
