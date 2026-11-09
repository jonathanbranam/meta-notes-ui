import { expect, test } from "vitest";
import { blocksOf, closedEntry, doneMessage, labelOf, logMinutes, nowState, stopwatch, timers } from "./now";
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

// Done starts the block on the clock (mu-btfa). Blocks: A 9:00-10:00, B 10:00-11:00, C 11:00-12:00.
const day = (entry: string, plans = ["A", "B", "C"]) => {
  const rows = plans.flatMap((p, i) => [0, 15, 30, 45].map((q) => `| ${9 + i}:${String(q).padStart(2, "0")}am | ${p} | |`));
  return `### Log\n\n${entry}\n\n### Time Block\n\n| T | P | A |\n| - | - | - |\n${rows.join("\n")}\n`;
};
const at = (h: number, m: number) => h * 60 + m;
const doneStarts = (entry: string, h: number, m: number, plans?: string[]) => nowState(day(entry, plans), at(h, m)).next?.plan ?? null;

test("case 1: an off-plan entry inside a block; Done starts the block on the clock, not the one after", () => {
  expect(doneStarts("- call:\n  * start: 10:20", 10, 40)).toBe("B");
});

test("case 2: an entry started in a gap or before the first block, run into a block", () => {
  expect(doneStarts("- call:\n  * start: 08:00", 9, 30)).toBe("A");
  const gap = "### Log\n\n- call:\n  * start: 09:50\n\n### Time Block\n\n| T | P | A |\n| - | - | - |\n| 9:00am | A | |\n| 10:15am | B | |\n| 10:30am | B | |\n";
  expect(nowState(gap, at(10, 20)).next?.plan).toBe("B");
});

test("case 3: an on-plan entry that overran a whole block starts the block on the clock", () => {
  expect(doneStarts("- A:\n  * start: 09:00", 11, 30)).toBe("C");
});

test("an entry named after its block, overrunning slightly into the next, starts that next block", () => {
  expect(doneStarts("- A:\n  * start: 09:00", 10, 10)).toBe("B");
});

test("on time in its own block starts the block after it", () => {
  expect(doneStarts("- B:\n  * start: 10:00", 10, 40)).toBe("C");
});

test("with nothing on the clock, Done starts the next block to come, or none", () => {
  expect(doneStarts("- A:\n  * start: 09:00", 12, 30)).toBeNull();
  expect(doneStarts("- A:\n  * start: 09:00", 9, 30, ["A", "B"])).toBe("B");
});

test("a repeated Plan name: the entry matches the first such block that ends after it started", () => {
  const plans = ["work", "meeting", "work"];
  expect(doneStarts("- work:\n  * start: 09:00", 10, 40, plans)).toBe("meeting");
  expect(doneStarts("- work:\n  * start: 11:05", 11, 40, plans)).toBeNull();
  expect(doneStarts("- work:\n  * start: 09:00", 11, 40, plans)).toBe("work");
});

test("the Done message and the Next line share the answer; an off-plan entry is not over", () => {
  const s = nowState(day("- call:\n  * start: 10:20"), at(10, 40));
  expect(s.next?.plan).toBe("B");
  expect(doneMessage(s, at(10, 40))).toBe("Done: call, 10:20-10:40. Now: B, until 11:00.");
  expect(timers(s, at(10, 40) * 60).over).toBe(0);
});
