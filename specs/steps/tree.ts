import { mkdir, mkdtemp, realpath, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect } from "vitest";
import type { Steps } from "vitest-bridle";
import type { ChangeEvent, TreeNode } from "../../shared/types.js";
import { createApp } from "../../server/app.js";
import { makeFixtureRoot } from "../../server/fixture.js";
import { watchRoot } from "../../server/watcher.js";

const TOKEN = "s3cret-token";
const auth = { authorization: `Bearer ${TOKEN}` };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function until(f: () => boolean) {
  for (let i = 0; i < 200 && !f(); i++) await sleep(25);
  expect(f()).toBe(true);
}

/** The tree the last response carried (set by the access step that made the request). */
async function treeOf(w: Record<string, any>): Promise<TreeNode[]> {
  return (w.tree ??= await w.res.json()) as TreeNode[];
}

function flatten(nodes: TreeNode[]): TreeNode[] {
  return nodes.flatMap((n) => [n, ...flatten(n.children ?? [])]);
}

/** The app of a world, with a subscriber set the steps can push events through. */
async function serverFor(w: Record<string, any>) {
  if (!w.app) {
    const { root } = await makeFixtureRoot();
    w.listeners = new Set<(e: ChangeEvent[]) => void>();
    w.app = createApp({
      root,
      token: TOKEN,
      version: "0.0.0",
      subscribe: (fn) => {
        w.listeners.add(fn);
        return () => w.listeners.delete(fn);
      },
    });
  }
  return w.app as ReturnType<typeof createApp>;
}

/** A throwaway empty root with a running watcher; closed by the world's cleanup. */
async function watcherFor(w: Record<string, any>, setup?: (root: string) => Promise<void>) {
  w.wroot = await realpath(await mkdtemp(path.join(tmpdir(), "mnui-spec-w-")));
  await setup?.(w.wroot);
  w.batches = [] as ChangeEvent[][];
  w.watcher = watchRoot(w.wroot, (e) => w.batches.push(e), 40);
  const { watcher, wroot } = w;
  cleanups.push(() => {
    watcher.close();
    return rm(wroot, { recursive: true, force: true });
  });
}

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()!();
});

const events = (w: Record<string, any>): ChangeEvent[] => w.batches.flat();
const hasEvent = (w: Record<string, any>, type: string, p: string) =>
  events(w).some((e) => e.type === type && e.path === p);
const file = (w: Record<string, any>, rel: string) => path.join(w.wroot, rel);
const linux = process.platform === "linux";

export function treeSteps(steps: Steps) {
  steps.then(/^the top-level names are "([^"]+)"$/, async (w, names) => {
    expect((await treeOf(w)).map((n: TreeNode) => n.name)).toEqual(names.split(", "));
  });
  steps.then(/^the tree holds the file "([^"]+)"$/, async (w, p) => {
    expect(flatten(await treeOf(w)).find((n) => n.path === p)?.type).toBe("file");
  });
  steps.then(/^the tree holds no path starting with "([^"]+)", "([^"]+)" or "([^"]+)"$/, async (w, a, b, c) => {
    const paths = flatten(await treeOf(w)).map((n) => n.path);
    for (const prefix of [a, b, c]) expect(paths.some((p) => p.startsWith(prefix))).toBe(false);
  });
  steps.then(/^the tree holds no "([^"]+)"$/, async (w, a) => {
    expect(flatten(await treeOf(w)).map((n) => n.name)).not.toContain(a);
  });

  steps.then(/^the note text is "(.*)"$/, async (w, text) => {
    w.note = await w.res.json();
    expect(w.note.text).toBe(text.replace(/\\n/g, "\n"));
  });
  steps.then(/^the note mtime is positive$/, (w) => expect(w.note.mtime).toBeGreaterThan(0));

  steps.when(/^a note "([^"]+)" is created in a watched root$/, async (w, p) => {
    await watcherFor(w);
    await writeFile(file(w, p), "one");
  });
  steps.then(/^an? "(\w+)" event for "([^"]+)" arrives$/, async (w, type, p) => {
    await until(() => hasEvent(w, type, p));
  });
  steps.when(/^"([^"]+)" is written again$/, async (w, p) => {
    await writeFile(file(w, p), "two");
  });
  steps.when(/^a note "([^"]+)" exists in a watched root and is deleted$/, async (w, p) => {
    await watcherFor(w, (root) => writeFile(path.join(root, p), "one"));
    await rm(file(w, p));
  });

  steps.when(/^a watched root holds a "\.git" folder and a folder "a"$/, async (w) => {
    if (!linux) return;
    await watcherFor(w, async (root) => {
      await mkdir(path.join(root, ".git"));
      await mkdir(path.join(root, "a"));
    });
  });
  steps.then(/^only the root and "a" are watched$/, async (w) => {
    if (!linux) return;
    await until(() => w.watcher.watched().length >= 2);
    expect(w.watcher.watched().sort()).toEqual(["", "a"]);
  });
  steps.when(/^a file is written in "\.git"$/, async (w) => {
    if (!linux) return;
    await writeFile(file(w, ".git/x"), "1");
    await sleep(150);
  });
  steps.then(/^no event for it arrives$/, (w) => {
    expect(events(w).some((e) => e.path.startsWith(".git"))).toBe(false);
  });

  steps.when(/^a watched root holds a folder "a" and "a\/b" is created$/, async (w) => {
    if (!linux) return;
    await watcherFor(w, (root) => mkdir(path.join(root, "a")));
    await until(() => w.watcher.watched().includes("a"));
    await mkdir(file(w, "a/b"));
  });
  steps.then(/^"a\/b" is watched$/, async (w) => {
    if (!linux) return;
    await until(() => w.watcher.watched().includes("a/b"));
  });
  steps.when(/^a folder with notes is moved into a watched root in one step$/, async (w) => {
    if (!linux) return;
    await watcherFor(w);
    const stage = await mkdtemp(path.join(tmpdir(), "mnui-spec-s-"));
    cleanups.push(() => rm(stage, { recursive: true, force: true }));
    await mkdir(path.join(stage, "d/sub"), { recursive: true });
    await writeFile(path.join(stage, "d/one.md"), "1");
    await writeFile(path.join(stage, "d/sub/two.md"), "2");
    await rename(path.join(stage, "d"), file(w, "d"));
  });
  steps.then(/^"added" events arrive for its notes, and the folder is watched$/, async (w) => {
    if (!linux) return;
    await until(() => hasEvent(w, "added", "d/one.md") && hasEvent(w, "added", "d/sub/two.md"));
    await until(() => w.watcher.watched().includes("d/sub"));
  });
  steps.when(/^a note is written in "a\/b"$/, async (w) => {
    if (!linux) return;
    await writeFile(file(w, "a/b/n.md"), "1");
  });
  steps.then(/^an event for "([^"]+)" arrives$/, async (w, p) => {
    if (!linux) return;
    await until(() => events(w).some((e) => e.path === p));
  });
  steps.when(/^"a" is removed$/, async (w) => {
    if (!linux) return;
    await rm(file(w, "a"), { recursive: true });
  });
  steps.then(/^only the root is watched$/, async (w) => {
    if (!linux) return;
    await until(() => w.watcher.watched().join() === "");
  });

  steps.when(/^a note "a\.md" is written three times and a note "b\.md" once within the quiet period$/, async (w) => {
    await watcherFor(w);
    for (const text of ["1", "2", "3"]) await writeFile(file(w, "a.md"), text);
    await writeFile(file(w, "b.md"), "1");
  });
  steps.then(/^one batch arrives holding "a\.md" and "b\.md" once each$/, async (w) => {
    await until(() => events(w).length > 0);
    await sleep(150);
    expect(w.batches).toHaveLength(1);
    expect(w.batches[0].map((e: ChangeEvent) => e.path).sort()).toEqual(["a.md", "b.md"]);
  });

  steps.when(/^a client opens "\/api\/events" with the right token$/, async (w) => {
    const app = await serverFor(w);
    w.res = await app.request("/api/events", { headers: auth });
    w.reader = w.res.body!.getReader();
    w.text = new TextDecoder().decode((await w.reader.read()).value);
    await until(() => w.listeners.size > 0);
  });
  steps.when(/^the root note "([^"]+)" changes$/, (w, p) => {
    w.listeners.forEach((fn: (e: ChangeEvent[]) => void) => fn([{ type: "changed", path: p }]));
  });
  steps.then(/^the stream is "([^"]+)"$/, (w, type) => {
    expect(w.res.headers.get("content-type")).toContain(type);
  });
  steps.then(/^it carries the data "changed ([^"]+)"$/, async (w, p) => {
    const dec = new TextDecoder();
    while (!w.text.includes(p)) w.text += dec.decode((await w.reader.read()).value);
    expect(w.text).toContain(`data: ${JSON.stringify({ type: "changed", path: p })}`);
    await w.reader.cancel();
  });
  steps.when(/^a client opens "\/api\/events" with the right token and disconnects$/, async (w) => {
    const app = await serverFor(w);
    w.res = await app.request("/api/events", { headers: auth });
    const reader = w.res.body!.getReader();
    await reader.read();
    await until(() => w.listeners.size > 0);
    await reader.cancel();
  });
  steps.then(/^the server holds no subscription for it$/, async (w) => {
    await until(() => w.listeners.size === 0);
  });
}
