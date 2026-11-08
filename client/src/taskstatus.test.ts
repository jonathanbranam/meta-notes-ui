import { describe, expect, it } from "vitest";
import { taskStatusBody } from "./taskstatus";

describe("taskStatusBody", () => {
  it("sends the note, line and text as listed, with the status", () => {
    const t = { file: "area/health.md", line: 9, text: "- [ ] Call the dentist" };
    expect(taskStatusBody(t, "x")).toEqual({ path: "area/health.md", line: 9, expect: "- [ ] Call the dentist", status: "x" });
    expect(taskStatusBody(t, "-").status).toBe("-");
  });
});
