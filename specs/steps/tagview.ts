import { expect } from "vitest";
import type { Steps } from "vitest-bridle";
import type { TagTasksResponse } from "../../shared/types.js";
import { createApp } from "../../server/app.js";
import { makeExampleRoot } from "../../server/example.js";
import { tagFromPath } from "../../client/src/tagview";

const TOKEN = "tag-token";
type World = Record<string, any>;

async function appFor(w: World) {
  if (!w.app) {
    const { root } = await makeExampleRoot();
    w.root = root;
    w.app = createApp({ root, token: TOKEN, version: "0.0.0", subscribe: () => () => {} });
  }
  return w.app as ReturnType<typeof createApp>;
}

async function tasksFor(w: World, tag: string) {
  const app = await appFor(w);
  w.res = await app.request(`/api/tasks?tag=${encodeURIComponent(tag)}`, { headers: { authorization: `Bearer ${TOKEN}` } });
  w.tag = w.res.ok ? ((await w.res.clone().json()) as TagTasksResponse) : null;
}

export function tagviewSteps(steps: Steps) {
  steps.when(/^the tasks tagged "([^"]+)" are requested$/, (w, tag) => tasksFor(w, tag));
  steps.when(/^the listed task in "([^"]+)" is checked off$/, async (w, file) => {
    const t = (w.tag as TagTasksResponse).tasks.find((x) => x.file === file)!;
    w.checked = t;
    const app = await appFor(w);
    // What the tag view sends: the note, line and text as listed.
    const res = await app.request("/api/task", {
      method: "POST",
      headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
      body: JSON.stringify({ path: t.file, line: t.line, expect: t.text, status: "x" }),
    });
    expect(res.status).toBe(200);
  });
  steps.when(/^the address "([^"]+)" is opened$/, (w, address) => {
    w.address = address;
  });
  steps.then(/^(?:the tag view lists|it lists) a task in "([^"]+)" reading "([^"]+)"$/, (w, file, text) => {
    expect((w.tag as TagTasksResponse).tasks.some((t) => t.file === file && t.text.includes(text))).toBe(true);
  });
  steps.then(/^the tag view request is refused$/, (w) => expect(w.res.status).toBe(400));
  steps.then(/^the tasks tagged "([^"]+)" then no longer list it$/, async (w, tag) => {
    await tasksFor(w, tag);
    const t = w.checked as TagTasksResponse["tasks"][number];
    expect((w.tag as TagTasksResponse).tasks.some((x) => x.file === t.file && x.line === t.line)).toBe(false);
  });
  steps.then(/^it shows the tag view for "([^"]+)"$/, (w, tag) => expect(tagFromPath(w.address)).toBe(tag));
  steps.then(/^the address "([^"]+)" does not$/, (_w, address) => expect(tagFromPath(address)).toBeNull());
}
