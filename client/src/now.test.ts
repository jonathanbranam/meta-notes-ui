import { expect, test } from "vitest";
import { blocksOf, closedEntry, labelOf, logMinutes, nowState, stopwatch } from "./now";
import { parseTimeBlock } from "../../shared/today";
import { parseTimeLog } from "./time-log";

test("log times: plain, tilde, am/pm", () => {
  expect([logMinutes("07:50"), logMinutes("~07:50"), logMinutes("1:05pm"), logMinutes("x")]).toEqual([470, 470, 785, null]);
});

test("a struck-out or empty plan is no block", () => {
  const t = "### Time Block\n\n| T | P | A |\n| - | - | - |\n| 8:00am | a | |\n| 8:15am | ~a~ | |\n| 8:30am | a | |\n";
  expect(blocksOf(parseTimeBlock(t)).map((b) => [b.start, b.end])).toEqual([[480, 495], [510, 525]]);
});

test("a running entry matches its block by name, ignoring tags and the trailing colon", () => {
  const t = "### Log\n\n- work #proj:\n  * start: 08:20\n\n### Time Block\n\n| T | P | A |\n| - | - | - |\n| 8:15am | work | |\n| 8:30am | work | |\n| 8:45am | lunch | |\n";
  const s = nowState(t, 500);
  expect(s.running?.label).toBe("work #proj");
  expect(s.block).toEqual({ plan: "work", start: 495, end: 525 });
  expect(s.next?.plan).toBe("lunch");
});

test("closing an entry replaces an empty end line", () => {
  const e = parseTimeLog("### Log\n\n- a:\n  * start: 08:00\n  * end:\n")![0];
  expect(closedEntry(e, "09:00")).toBe("- a:\n  * start: 08:00\n  * end: 09:00");
});

test("labels and the stopwatch", () => {
  expect(labelOf("- Drive to work:")).toBe("Drive to work");
  expect(stopwatch(65)).toBe("1:05");
  expect(stopwatch(3725)).toBe("1:02:05");
});
