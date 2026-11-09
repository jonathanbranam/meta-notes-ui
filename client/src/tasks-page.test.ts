import { expect, it } from "vitest";
import { groupTasks } from "./tasks-page";

const t = (due: string | null, time: string | null = null) => ({ file: "a.md", line: 1, text: "x", due, time });

it("sorts each group by date then time", () => {
  const g = groupTasks([t("2026-11-05"), t("2026-11-01"), t("2026-11-08", "15:00"), t("2026-11-08", "09:00")], "2026-11-08");
  expect(g.overdue.map((x) => x.due)).toEqual(["2026-11-01", "2026-11-05"]);
  expect(g.today.map((x) => x.time)).toEqual(["09:00", "15:00"]);
});
