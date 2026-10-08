import { describe, expect, it } from "vitest";
import { dropEmptyEnd, parseTimeLog } from "./timelog";

const note = "# D\n\n### Log\n\n- a #x:\n  * start: 08:30\n  * end: 09:00\n- b:\n  * start: ~09:00\n  * end:\n\n### Time Block\n";

describe("parseTimeLog", () => {
  it("reads entries with their times", () => {
    const log = parseTimeLog(note)!;
    expect(log.map((e) => [e.header, e.start, e.end])).toEqual([["- a #x:", "08:30", "09:00"], ["- b:", "~09:00", ""]]);
    expect(log[1].raw).toBe("- b:\n  * start: ~09:00\n  * end:");
  });
  it("is null without a Log section", () => expect(parseTimeLog("# x\n")).toBeNull());
});

describe("dropEmptyEnd", () => {
  it("removes an empty end line only", () => {
    expect(dropEmptyEnd("- b:\n  * start: 09:00\n  * end:")).toBe("- b:\n  * start: 09:00");
    expect(dropEmptyEnd("- b:\n  * start: 09:00\n  * end: 10:00")).toBe("- b:\n  * start: 09:00\n  * end: 10:00");
  });
});
