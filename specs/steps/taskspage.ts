import { expect } from "vitest";
import type { Steps } from "vitest-bridle";
import type { TodayTask } from "../../shared/types.js";
import { createApp } from "../../server/app.js";
import { makeExampleRoot } from "../../server/example.js";
import { groupTasks, TASKS_PATH, type TaskGroups } from "../../client/src/tasks-page";
import { tabOf } from "../../client/src/tabs";

const TOKEN = "tasks-page-token";
type World = Record<string, any>;

async function appFor(w: World) {
  if (!w.app) {
    const { root } = await makeExampleRoot();
    w.root = root;
    w.app = createApp({ root, token: TOKEN, version: "0.0.0", subscribe: () => () => {} });
  }
  return w.app as ReturnType<typeof createApp>;
}

async function requestDue(w: World) {
  const app = await appFor(w);
  const res = await app.request("/api/tasks/due", { headers: { authorization: `Bearer ${TOKEN}` } });
  expect(res.status).toBe(200);
  w.listed = ((await res.json()) as { tasks: TodayTask[] }).tasks;
}

const task = (due: string | null): TodayTask => ({ file: "a.md", line: 1, text: `- [ ] T ${due ?? "none"}`, due, time: null });

export function tasksPageSteps(steps: Steps) {
  steps.when(/^the dated open tasks are requested$/, (w) => requestDue(w));
  steps.when(/^the listed task "([^"]+)" is marked done$/, async (w, text) => {
    const t = (w.listed as TodayTask[]).find((x) => x.file === "area/Home Care.md" && x.text.includes(text))!;
    w.marked = t;
    const app = await appFor(w);
    // What the row sends: the note, line and text as listed.
    const res = await app.request("/api/task", {
      method: "POST",
      headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
      body: JSON.stringify({ path: t.file, line: t.line, expect: t.text, status: "x" }),
    });
    expect(res.status).toBe(200);
  });
  steps.when(/^today is "([^"]+)"$/, (w, day) => {
    w.day = day;
  });
  steps.when(/^the page gets tasks due "([^"]+)", "([^"]+)", "([^"]+)" and one with no date$/, (w, a, b, c) => {
    w.groups = groupTasks([task(c), task(null), task(a), task(b)], w.day);
  });
  steps.then(/^the Tasks page lists "([^"]+)" in "([^"]+)"$/, (w, text, file) => {
    expect((w.listed as TodayTask[]).some((t) => t.file === file && t.text.includes(text))).toBe(true);
  });
  steps.then(/^it lists "([^"]+)" in "([^"]+)"$/, (w, text, file) => {
    expect((w.listed as TodayTask[]).some((t) => t.file === file && t.text.includes(text))).toBe(true);
  });
  const group = (w: World, key: keyof TaskGroups) => (w.groups as TaskGroups)[key].map((t) => t.due);
  steps.then(/^Overdue holds the task due "([^"]+)"$/, (w, d) => expect(group(w, "overdue")).toEqual([d]));
  steps.then(/^Due today holds the task due "([^"]+)"$/, (w, d) => expect(group(w, "today")).toEqual([d]));
  steps.then(/^Upcoming holds the task due "([^"]+)"$/, (w, d) => expect(group(w, "upcoming")).toEqual([d]));
  steps.then(/^the page shows (\d+) tasks$/, (w, n) => {
    const g = w.groups as TaskGroups;
    expect(g.overdue.length + g.today.length + g.upcoming.length).toBe(Number(n));
  });
  steps.then(/^the dated open tasks then no longer list "([^"]+)"$/, async (w, text) => {
    await requestDue(w);
    const m = w.marked as TodayTask;
    expect(m.text).toContain(text);
    expect((w.listed as TodayTask[]).some((t) => t.file === m.file && t.line === m.line)).toBe(false);
  });
  steps.then(/^the page belongs to the Tasks tab$/, (w) => {
    expect(w.address).toBe(TASKS_PATH);
    expect(tabOf(w.address)).toBe("tasks");
  });
}
