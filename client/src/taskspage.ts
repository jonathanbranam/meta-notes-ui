import type { TodayTask } from "../../shared/types";

/** The address hash of the Tasks page (never a note: it starts with `!`). */
export const TASKS_PATH = "!tasks";

export interface TaskGroups {
  overdue: TodayTask[];
  today: TodayTask[];
  upcoming: TodayTask[];
}

/** Splits dated open tasks by their due date against `today` (YYYY-MM-DD); each group is in date order, then time. Undated tasks are dropped. */
export function groupTasks(tasks: TodayTask[], today: string): TaskGroups {
  const g: TaskGroups = { overdue: [], today: [], upcoming: [] };
  for (const t of tasks) {
    if (!t.due) continue;
    (t.due < today ? g.overdue : t.due === today ? g.today : g.upcoming).push(t);
  }
  const key = (t: TodayTask) => `${t.due} ${t.time ?? ""}`;
  for (const list of [g.overdue, g.today, g.upcoming]) list.sort((a, b) => key(a).localeCompare(key(b)));
  return g;
}
