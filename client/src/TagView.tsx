import { useCallback, useEffect, useState } from "react";
import type { TagTasksResponse } from "../../shared/types";
import { Inline } from "./TodayView";
import { taskLabel } from "./tagview";
import type { RenderContext } from "./markdown";

/** Every open task with a tag, across all notes; the box checks it off through the same `/api/task` as a note page. */
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

  const check = async (file: string, line: number, text: string) => {
    const res = await fetch("/api/task", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path: file, line, expect: text, status: "x" }) });
    const r = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!r.ok) setError(r.error ?? "Cannot update the task");
    load();
  };

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
            <li key={`${t.file}:${t.line}`} className={t.due && t.due < ctxFor(t.file).today ? "overdue" : ""}>
              <input type="checkbox" aria-label="Check off" checked={false} onChange={() => void check(t.file, t.line, t.text)} />
              <span>
                <Inline text={taskLabel(t.text)} ctx={ctxFor(t.file)} open={open} />{" "}
                <a href={`#${encodeURIComponent(t.file).replace(/%2F/g, "/")}`} onClick={() => open(t.file)}>{t.file.replace(/\.md$/, "")}</a>
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
