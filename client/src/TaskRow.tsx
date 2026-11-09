import { useState } from "react";
import type { TodayTask } from "../../shared/types";
import { Inline } from "./Inline";
import type { RenderContext } from "./markdown";
import { taskLabel } from "./tag-view";
import { taskStatusBody } from "./task-status";

/** One open task: a box that marks it done, a Cancel button, and its note. The Today view, the tag view and the Tasks page share it. */
export function TaskRow({ task, overdue, ctx, open, onChanged }: { task: TodayTask; overdue: boolean; ctx: RenderContext; open: (p: string) => void; onChanged: () => void }) {
  const [error, setError] = useState("");

  const set = async (status: "x" | "-") => {
    try {
      const res = await fetch("/api/task", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(taskStatusBody(task, status)) });
      const r = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!r.ok) return setError(r.error ?? "Cannot update the task");
      setError("");
      onChanged();
    } catch {
      setError("Cannot reach the server");
    }
  };

  return (
    <li className={`task-row${overdue ? " overdue" : ""}`}>
      <input type="checkbox" aria-label="Mark done" checked={false} onChange={() => void set("x")} />
      <span className="task-text">
        <Inline text={taskLabel(task.text)} ctx={ctx} open={open} />{" "}
        <a href={`#${encodeURIComponent(task.file).replace(/%2F/g, "/")}`} onClick={() => open(task.file)}>{task.file.replace(/\.md$/, "")}</a>
        {error && <span className="error task-error"> {error}</span>}
      </span>
      <button type="button" className="cancel-task" title="Mark canceled" onClick={() => void set("-")}>Cancel</button>
    </li>
  );
}
