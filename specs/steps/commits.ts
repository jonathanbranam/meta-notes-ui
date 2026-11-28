import { execFile } from "node:child_process";
import { chmod, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterAll, expect } from "vitest";
import type { Steps } from "vitest-bridle";
import { createApp } from "../../server/app.js";
import { createCommitter, type Committer } from "../../server/committer.js";
import { makeExampleRoot } from "../../server/example.js";
import { startServer } from "../../server/start.js";

const run = promisify(execFile);
const TOKEN = "commit-token";
type World = Record<string, any>;

const HEALTH = "area/health.md";
const BREAD = "project/make-bread/Home.md";
const OTHER = "area/Home Care.md";
const STAGED = "resource/files/hello.txt";
const DAILY = "plan/daily/26-Q3/2026-10-01 Thu.md";

const committers: Committer[] = [];
afterAll(async () => {
  await Promise.all(committers.map((c) => c.close(0)));
});

const git = async (dir: string, ...args: string[]) => (await run("git", ["-c", "core.quotepath=false", ...args], { cwd: dir })).stdout.replace(/\n$/, "");
const head = (dir: string) => git(dir, "rev-parse", "HEAD");
const subject = (dir: string) => git(dir, "log", "-1", "--format=%s");
const committed = async (dir: string) => (await git(dir, "show", "--no-renames", "--name-status", "--format=", "HEAD")).split("\n").sort();

/** Make `dir` a repository that has committed everything in it. */
async function init(dir: string) {
  await git(dir, "init", "-q", "-b", "main");
  for (const [k, v] of [["user.name", "Test"], ["user.email", "test@example.invalid"], ["commit.gpgsign", "false"], ["core.hooksPath", ".git/hooks"]]) await git(dir, "config", k!, v!);
  await writeFile(path.join(dir, ".gitignore"), ".meta-notes-cache/\n.venv/\n");
  await git(dir, "add", "-A");
  await git(dir, "commit", "-q", "-m", "start");
}

/** A temp copy of the example notes as a repository with a local bare remote; `w.remote` is that remote. */
async function repo(w: World) {
  w.root = (await makeExampleRoot()).root;
  await init(w.root);
  w.remote = path.join(await mkdtemp(path.join(tmpdir(), "mnui-remote-")), "notes.git");
  await run("git", ["init", "-q", "--bare", "-b", "main", w.remote]);
  await git(w.remote, "config", "core.hooksPath", "hooks");
  await git(w.root, "remote", "add", "origin", w.remote);
  await git(w.root, "push", "-q", "-u", "origin", "main");
  w.start = await head(w.root);
}

/** An app over `w.root` with a committer; the delay is long unless the scenario waits for the timer. */
function app(w: World, delayMs = 600_000) {
  w.commits = createCommitter({ root: w.root, delayMs });
  committers.push(w.commits);
  w.app = createApp({ root: w.root, token: TOKEN, version: "0.0.0", commits: w.commits, subscribe: () => () => {} });
}

async function post(w: World, url: string, body: unknown) {
  const res = await w.app.request(url, { method: "POST", headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  expect(json, `${url}: ${JSON.stringify(json)}`).toMatchObject({ ok: true });
  return json;
}

const lines = async (w: World, rel: string) => (await readFile(path.join(w.root, rel), "utf8")).split("\n");
const lineNo = async (w: World, rel: string, start: string) => (await lines(w, rel)).findIndex((l) => l.startsWith(start)) + 1;
const append = (w: World, rel: string, text: string) => post(w, "/api/task/add", { path: rel, text });
const touch = async (w: World, rel: string) => writeFile(path.join(w.root, rel), (await readFile(path.join(w.root, rel), "utf8")) + "someone else\n");
/** A rename recorded as a move route would record it. */
const move = (w: World, from: string, to: string) =>
  w.commits.write(async () => {
    await mkdir(path.dirname(path.join(w.root, to)), { recursive: true });
    await rename(path.join(w.root, from), path.join(w.root, to));
  }, () => [from, to]);

/** The latest `commit` event a client connecting now gets. */
async function reported(w: World): Promise<string | null> {
  const res = await w.app.request("/api/events", { headers: { authorization: `Bearer ${TOKEN}` } });
  const reader = res.body!.getReader();
  let text = "";
  let found: RegExpExecArray | null = null;
  while (!found) {
    const { value, done } = await reader.read();
    if (done) break;
    text += new TextDecoder().decode(value);
    found = /event: commit\ndata: (.*)\n/.exec(text);
  }
  await reader.cancel();
  return (JSON.parse(found![1]!) as { error: string | null }).error;
}

async function hook(dir: string, name: string, script: string) {
  const file = path.join(dir, name);
  await mkdir(dir, { recursive: true });
  await writeFile(file, `#!/bin/sh\n${script}\n`);
  await chmod(file, 0o755);
}

export function commitsSteps(steps: Steps) {
  steps.when(/^the client makes two edits to "area\/health\.md" and one to "project\/make-bread\/Home\.md" within the delay, while "area\/Home Care\.md" has someone else's change and "resource\/files\/hello\.txt" is staged$/, async (w) => {
    await repo(w);
    await touch(w, OTHER);
    await touch(w, STAGED);
    await git(w.root, "add", STAGED);
    app(w, 2000);
    await append(w, HEALTH, "one");
    await append(w, BREAD, "two");
    await append(w, HEALTH, "three");
    expect(await head(w.root)).toBe(w.start);
    await expect.poll(() => git(w.remote, "rev-parse", "main"), { timeout: 15_000, interval: 200 }).not.toBe(w.start);
  });
  steps.then(/^one new commit "([^"]+)" lists "([^"]+)" and "([^"]+)" and holds only them$/, async (w, title, a, b) => {
    expect(await git(w.root, "rev-list", "--count", `${w.start}..HEAD`)).toBe("1");
    expect(await subject(w.root)).toBe(title);
    expect((await git(w.root, "log", "-1", "--format=%b")).trim().split("\n").sort()).toEqual([a, b].sort());
    expect(await committed(w.root)).toEqual([`M\t${a}`, `M\t${b}`].sort());
  });
  steps.then(/^"area\/Home Care\.md" is still modified and "resource\/files\/hello\.txt" still staged$/, async (w) => {
    expect((await git(w.root, "status", "--porcelain", "-z")).split("\0").filter(Boolean).sort()).toEqual([` M ${OTHER}`, `M  ${STAGED}`]);
  });
  steps.then(/^the remote has the new commit$/, async (w) => {
    const local = await head(w.root);
    expect(local).not.toBe(w.start);
    expect(await git(w.remote, "rev-parse", "main")).toBe(local);
  });

  steps.when(/^the client adds a task, writes lines, sets a Time Block cell, replaces rows, appends and edits a Time Log entry, makes a new note and checks off a list item with a source task, then the server flushes$/, async (w) => {
    await repo(w);
    const cli = async (...args: string[]) => JSON.parse((await run("meta-notes", [...args, "--root", w.root, "--json"])).stdout);
    const list = (await cli("list", "new", "Shop", "--date", "2026-10-01")).list as string;
    await cli("list", "item-add", list, "checkup", "--source", `${HEALTH}:${await lineNo(w, HEALTH, "- [ ] Annual")}`);
    await git(w.root, "add", "-A");
    await git(w.root, "commit", "-q", "-m", "list");
    w.start = await head(w.root);
    app(w);

    await append(w, "project/make-bread/starter.md", "feed it");
    await post(w, "/api/write", { path: BREAD, from: 1, to: 1, expect: (await lines(w, BREAD))[0], text: "# Bread, again" });
    await post(w, "/api/timeblock", { path: DAILY, time: "8:00am", column: "plan", expect: "", text: "breakfast" });
    const WED = "plan/daily/26-Q3/2026-09-30 Wed.md";
    const rows = (await lines(w, WED)).filter((l) => /^\|\s*\d/.test(l));
    const cells = rows[0]!.split("|").map((s) => s.trim());
    await post(w, "/api/timeblock/replace", { path: WED, time: cells[1], through: cells[1], expect: rows[0], text: `| ${cells[1]} | replaced | |` });
    await post(w, "/api/timelog/append", { path: DAILY, text: "- lunch", start: "12:00", prev: "- start work:", prevStart: "08:30", prevOpen: true, closePrev: true });
    const log = await lines(w, DAILY);
    const at = log.indexOf("- lunch");
    const entry = log.slice(at, at + 2).join("\n").trimEnd();
    await post(w, "/api/timelog/update", { path: DAILY, expect: entry, text: entry.replace("lunch", "brunch") });
    await post(w, "/api/new", { path: "area/new note.md" });
    await post(w, "/api/list/check", { list, n: 1, expect: "checkup", action: "check" });
    w.written = ["project/make-bread/starter.md", BREAD, DAILY, WED, "area/new note.md", list, HEALTH].sort();
    await w.commits.flush();
  });
  steps.then(/^the commit holds every note those writes changed, the list item's source note among them$/, async (w) => {
    expect((await committed(w.root)).map((l) => l.slice(2)).sort()).toEqual(w.written);
  });
  steps.then(/^nothing is left uncommitted$/, async (w) => {
    expect(await git(w.root, "status", "--porcelain")).toBe("");
  });

  steps.when(/^the client cancels an open list item whose source note has someone else's change, then the server flushes$/, async (w) => {
    await repo(w);
    const cli = async (...args: string[]) => JSON.parse((await run("meta-notes", [...args, "--root", w.root, "--json"])).stdout);
    w.list = (await cli("list", "new", "Shop", "--date", "2026-10-01")).list;
    await cli("list", "item-add", w.list, "checkup", "--source", `${HEALTH}:${await lineNo(w, HEALTH, "- [ ] Annual")}`);
    await git(w.root, "add", "-A");
    await git(w.root, "commit", "-q", "-m", "list");
    await touch(w, HEALTH);
    app(w);
    await post(w, "/api/list/check", { list: w.list, n: 1, expect: "checkup", action: "cancel" });
    await w.commits.flush();
  });
  steps.then(/^the commit holds only the list$/, async (w) => {
    expect(await committed(w.root)).toEqual([`M\t${w.list}`]);
    expect(await git(w.root, "status", "--porcelain")).toBe(` M ${HEALTH}`);
  });

  steps.when(/^a write moves "([^"]+)" to "([^"]+)" and the server flushes$/, async (w, from, to) => {
    await repo(w);
    app(w);
    await move(w, from, to);
    await w.commits.flush();
  });
  steps.then(/^the commit removes "([^"]+)" and adds "([^"]+)"$/, async (w, from, to) => {
    expect(await committed(w.root)).toEqual([`A\t${to}`, `D\t${from}`].sort());
  });

  steps.when(/^the client edits "area\/health\.md", someone else commits it, and the server flushes$/, async (w) => {
    await repo(w);
    app(w);
    await append(w, HEALTH, "one");
    await git(w.root, "commit", "-q", "-am", "someone else");
    w.start = await head(w.root);
    await w.commits.flush();
  });
  steps.when(/^a write names "([^"]+)" and the server flushes$/, async (w, rel) => {
    await repo(w);
    app(w);
    // Even a root that does not ignore the cache.
    await rm(path.join(w.root, ".gitignore"));
    await mkdir(path.dirname(path.join(w.root, rel)), { recursive: true });
    await w.commits.write(() => writeFile(path.join(w.root, rel), "cache"), () => [rel]);
    await w.commits.flush();
  });
  steps.then(/^no commit is added and no failure shows$/, async (w) => {
    expect(await head(w.root)).toBe(w.start);
    expect(await reported(w)).toBeNull();
  });

  steps.when(/^the client edits "area\/health\.md" in a root that is not a git repository and the server flushes$/, async (w) => {
    w.root = (await makeExampleRoot()).root;
    app(w);
    await append(w, HEALTH, "one");
    await w.commits.flush();
  });
  steps.then(/^the edit succeeds and no failure shows$/, async (w) => {
    expect((await lines(w, HEALTH)).join("\n")).toContain("- [ ] one");
    expect(await reported(w)).toBeNull();
  });
  steps.when(/^the client edits "area\/health\.md" in a root that is a folder of another repository and the server flushes$/, async (w) => {
    w.root = (await makeExampleRoot()).root;
    w.outer = path.dirname(w.root);
    await init(w.outer);
    w.start = await head(w.outer);
    app(w);
    await append(w, HEALTH, "one");
    await w.commits.flush();
  });
  steps.then(/^the outer repository has no new commit and nothing staged$/, async (w) => {
    expect(await head(w.outer)).toBe(w.start);
    expect(await git(w.outer, "diff", "--cached", "--name-only")).toBe("");
  });
  steps.then(/^no failure shows$/, async (w) => expect(await reported(w)).toBeNull());

  steps.when(/^the client edits "area\/health\.md" while the remote is unreachable and the server flushes$/, async (w) => {
    await repo(w);
    await git(w.root, "remote", "set-url", "origin", `${w.remote}.gone`);
    app(w);
    await append(w, HEALTH, "one");
    await w.commits.flush();
  });
  steps.then(/^the events stream reports a "([^"]+)" failure$/, async (w, what) => expect(await reported(w)).toContain(what));
  steps.then(/^after the remote is back, the next flush pushes the commit and the failure clears$/, async (w) => {
    await git(w.root, "remote", "set-url", "origin", w.remote);
    await w.commits.flush();
    expect(await git(w.remote, "rev-parse", "main")).toBe(await head(w.root));
    expect(await head(w.root)).not.toBe(w.start);
    expect(await reported(w)).toBeNull();
  });

  steps.when(/^the client edits "area\/health\.md" while a commit hook refuses and the server flushes$/, async (w) => {
    await repo(w);
    await hook(path.join(w.root, ".git/hooks"), "pre-commit", "echo refused >&2; exit 1");
    app(w);
    await append(w, HEALTH, "one");
    await w.commits.flush();
  });
  steps.then(/^a "([^"]+)" failure shows and no commit is added$/, async (w, what) => {
    expect(await reported(w)).toContain(what);
    expect(await head(w.root)).toBe(w.start);
  });
  steps.then(/^after the hook is removed, the next flush commits and pushes it$/, async (w) => {
    await rm(path.join(w.root, ".git/hooks/pre-commit"));
    await w.commits.flush();
    expect(await committed(w.root)).toEqual([`M\t${HEALTH}`]);
    expect(await git(w.remote, "rev-parse", "main")).toBe(await head(w.root));
  });

  steps.when(/^the client edits "area\/health\.md" while a merge is unfinished and the server flushes$/, async (w) => {
    await repo(w);
    await git(w.root, "switch", "-q", "-c", "side");
    await touch(w, OTHER);
    await git(w.root, "commit", "-q", "-am", "side");
    await git(w.root, "switch", "-q", "main");
    await git(w.root, "merge", "-q", "--no-ff", "--no-commit", "side");
    app(w);
    await append(w, HEALTH, "one");
    await w.commits.flush();
  });
  steps.then(/^a "([^"]+)" failure shows, no commit is added and the merge is still unfinished$/, async (w, what) => {
    expect(await reported(w)).toContain(what);
    expect(await head(w.root)).toBe(w.start);
    expect(await git(w.root, "rev-parse", "--verify", "MERGE_HEAD")).toMatch(/^[0-9a-f]{40}$/);
  });

  steps.when(/^a push fails, the server is restarted, the remote is back and the server flushes$/, async (w) => {
    await repo(w);
    await git(w.root, "remote", "set-url", "origin", `${w.remote}.gone`);
    app(w);
    await append(w, HEALTH, "one");
    await w.commits.close();
    await git(w.root, "remote", "set-url", "origin", w.remote);
    app(w);
    await w.commits.flush();
  });

  steps.when(/^the client edits "area\/health\.md" and the server is stopped before the delay passes$/, async (w) => {
    await repo(w);
    const tokenFile = path.join(await mkdtemp(path.join(tmpdir(), "mnui-token-")), "token");
    await writeFile(tokenFile, TOKEN);
    const server = await startServer(["--root", w.root, "--token-file", tokenFile], { commitDelayMs: 600_000 });
    const res = await fetch(`${server.info.url}/api/task/add`, {
      method: "POST",
      headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
      body: JSON.stringify({ path: HEALTH, text: "one" }),
    });
    expect(res.status).toBe(200);
    expect(await head(w.root)).toBe(w.start);
    await server.close();
  });

  steps.when(/^the server is closed while the remote never answers a push$/, async (w) => {
    await repo(w);
    await hook(path.join(w.remote, "hooks"), "pre-receive", "sleep 5");
    app(w);
    await append(w, HEALTH, "one");
    const began = Date.now();
    await w.commits.close(1000);
    w.took = Date.now() - began;
  });
  steps.then(/^closing returns within its bound$/, (w) => expect(w.took).toBeLessThan(3000));
  steps.then(/^the commit is still to be pushed at the next start$/, async (w) => {
    expect(await git(w.remote, "rev-parse", "main")).toBe(w.start);
    expect(await head(w.root)).not.toBe(w.start);
    const state = JSON.parse(await readFile(path.join(w.root, ".meta-notes-cache/ui/commits.json"), "utf8"));
    expect(state.unpushed).toBe(true);
  });
}
