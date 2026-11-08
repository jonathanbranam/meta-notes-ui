import { useCallback, useEffect, useState } from "react";
import type { TagTasksResponse } from "../../shared/types";
import { TaskRow } from "./TaskRow";
import type { RenderContext } from "./markdown";

/** Every open task with a tag, across all notes; each row is the shared task row (done or canceled through `/api/task`, as on a note page). */
export function TagView({ tag, refreshKey, open, ctxFor }: { tag: string; refreshKey: number; open: (p: string) => void; ctxFor: (path: string) => RenderContext }) {
  const [data, setData] = useState<TagTasksResponse | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetch(`/api/tasks?tag=${encodeURIComponent(tag)}`)
      .then((r) => (r.ok ? (r.json() as Promise<TagTasksResponse>) : Promise.reject(new Error(`${r.status}`))))
      .then((d) => {
        setData(d);
        setError("");
      })
      .catch(() => setError(`Cannot load tasks for #${tag}`));
  }, [tag]);

  useEffect(() => setData(null), [tag]);
  useEffect(() => {
    // Debounced: each fetch runs the CLI, and edits come in bursts.
    const t = setTimeout(load, refreshKey === 0 ? 0 : 1000);
    return () => clearTimeout(t);
  }, [load, refreshKey]);

  return (
    <article className="note tagview">
      <h2>#{tag}</h2>
      {error && <p className="error">{error}</p>}
      {!data ? (
        !error && <p className="hint">Loading...</p>
      ) : data.tasks.length === 0 ? (
        <p className="hint">No open tasks tagged #{tag}.</p>
      ) : (
        <ul className="tagtasks">
          {data.tasks.map((t) => (
            <TaskRow key={`${t.file}:${t.line}`} task={t} overdue={Boolean(t.due && t.due < ctxFor(t.file).today)} ctx={ctxFor(t.file)} open={open} onChanged={load} />
          ))}
        </ul>
      )}
    </article>
  );
}
