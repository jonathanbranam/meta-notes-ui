import type { TodayTask } from "../../shared/types";

/** The body `POST /api/task` takes for a task as listed: its note, line and text as shown, and the status (`x` done, `-` canceled). */
export const taskStatusBody = (t: Pick<TodayTask, "file" | "line" | "text">, status: "x" | "-") => ({ path: t.file, line: t.line, expect: t.text, status });
