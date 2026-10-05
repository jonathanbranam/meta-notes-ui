import { describe, expect, it } from "vitest";
import { buildAlerts, currentRow, isPlanned, parseTimeBlock } from "./today";

const note = `# Daily

### Time Block

| Time    | Plan        | Actual |
| ------- | ----------- | ------ |
|  8:00am |             |        |
|  8:30am | start work  |        |
|  9:00am | no plan     |        |
|  9:30am | ~old~       |        |
| 12:15pm | lunch       |        |

## Other
| 1:00pm | nope |
`;

describe("time block", () => {
  const rows = parseTimeBlock(note);
  it("parses the rows under the Time Block heading only", () => {
    expect(rows.map((r) => [r.minutes, r.plan])).toEqual([[480, ""], [510, "start work"], [540, "no plan"], [570, "~old~"], [735, "lunch"]]);
  });
  it("tells planned rows apart", () => {
    expect(rows.map((r) => isPlanned(r.plan))).toEqual([false, true, false, false, true]);
  });
  it("finds the current row, none after the last quarter hour", () => {
    expect(currentRow(rows, 515)).toBe(1);
    expect(currentRow(rows, 7 * 60)).toBe(-1);
    expect(currentRow(rows, 735 + 14)).toBe(4);
    expect(currentRow(rows, 735 + 15)).toBe(-1);
  });
});

describe("buildAlerts", () => {
  const day = new Date(2026, 9, 4, 6, 0);
  const tasks = [
    { file: "a.md", line: 3, text: "- [ ] Call the dentist ⏰ 09:30 📅 2026-10-04", due: "2026-10-04", time: "09:30" },
    { file: "a.md", line: 4, text: "- [ ] old ⏰ 09:30 📅 2026-10-01", due: "2026-10-01", time: "09:30" },
    { file: "a.md", line: 5, text: "- [ ] untimed 📅 2026-10-04", due: "2026-10-04", time: null },
  ];
  it("alerts timed tasks due today and planned rows, in time order", () => {
    const alerts = buildAlerts(day, "2026-10-04", tasks, parseTimeBlock(note));
    expect(alerts.map((a) => a.title)).toEqual(["08:30 start work", "09:30 Call the dentist", "12:15 lunch"]);
    expect(new Date(alerts[0].at).getHours()).toBe(8);
  });
});
