import { useCallback, useEffect, useState } from "react";
import type { TagTasksResponse, TodayTask } from "../../shared/types";
import { TaskRow } from "./TaskRow";
import type { RenderContext } from "./markdown";
import { groupTasks } from "./tasks-page";

/** Dated open tasks across all notes: Overdue, Due today, Upcoming. Each row is the shared task row (done or canceled through `/api/task`). */
export function TasksView({ today, refreshKey, open, ctxFor }: { today: string; refreshKey: number; open: (p: string) => void; ctxFor: (path: string) => RenderContext }) {
  const [tasks, setTasks] = useState<TodayTask[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetch("/api/tasks/due")
      .then((r) => (r.ok ? (r.json() as Promise<Pick<TagTasksResponse, "tasks">>) : Promise.reject(new Error(`${r.status}`))))
      .then((d) => {
        setTasks(d.tasks);
        setError("");
      })
      .catch(() => setError("Cannot load tasks"));
  }, []);

  useEffect(() => {
    // Debounced: each fetch runs the CLI, and edits come in bursts.
    const t = setTimeout(load, refreshKey === 0 ? 0 : 1000);
    return () => clearTimeout(t);
  }, [load, refreshKey]);

  const groups = tasks ? groupTasks(tasks, today) : null;
  const section = (title: string, list: TodayTask[], overdue: boolean) =>
    list.length > 0 && (
      <section>
        <h3>{title}</h3>
        <ul className="duetasks">
          {list.map((t) => (
            <TaskRow key={`${t.file}:${t.line}`} task={t} overdue={overdue} ctx={ctxFor(t.file)} open={open} onChanged={load} />
          ))}
        </ul>
      </section>
    );

  return (
    <article className="note taskspage">
      <h2>Tasks</h2>
      {error && <p className="error">{error}</p>}
      {!groups ? (
        !error && <p className="hint">Loading...</p>
      ) : groups.overdue.length + groups.today.length + groups.upcoming.length === 0 ? (
        <p className="hint">No dated open tasks.</p>
      ) : (
        <>
          {section("Overdue", groups.overdue, true)}
          {section("Due today", groups.today, false)}
          {section("Upcoming", groups.upcoming, false)}
        </>
      )}
    </article>
  );
}
