import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect } from "vitest";
import type { Steps } from "vitest-bridle";
import { createApp } from "../../server/app.js";
import { makeExampleRoot } from "../../server/example.js";

const TOKEN = "edit-token";
type World = Record<string, any>;

const unescape = (s: string) => s.replace(/\\n/g, "\n");

/** The world's app over a temp copy of the example notes; the CLI under it is the real one. */
async function appFor(w: World) {
  if (!w.app) {
    const { root } = await makeExampleRoot();
    w.root = root;
    w.app = createApp({ root, token: TOKEN, version: "0.0.0", subscribe: () => () => {} });
  }
  return w.app as ReturnType<typeof createApp>;
}

const read = async (w: World, rel: string) => (await readFile(path.join(w.root, rel), "utf8"));

/** Read a note before the first edit, so "unchanged" has something to compare with. */
async function before(w: World, rel: string) {
  await appFor(w);
  (w.before ??= {})[rel] = await read(w, rel);
}

async function post(w: World, url: string, body: unknown, token = TOKEN) {
  const app = await appFor(w);
  const res = await app.request(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  w.status = res.status;
  w.body = await res.json().catch(() => ({}));
}

const lineOf = async (w: World, rel: string, n: number) => (await read(w, rel)).split("\n")[n - 1];

export function editsSteps(steps: Steps) {
  steps.when(/^the client checks off line (\d+) of "([^"]+)" as it shows it$/, async (w, n, p) => {
    await before(w, p);
    await post(w, "/api/task", { path: p, line: Number(n), expect: await lineOf(w, p, Number(n)), status: "x" });
  });
  steps.when(/^the client checks off line (\d+) of "([^"]+)" believing it reads "([^"]*)"$/, async (w, n, p, shown) => {
    await before(w, p);
    await post(w, "/api/task", { path: p, line: Number(n), expect: shown, status: "x" });
  });
  steps.when(/^the client sets line (\d+) of "([^"]+)" as it shows it to status "(.)"$/, async (w, n, p, status) => {
    await before(w, p);
    await post(w, "/api/task", { path: p, line: Number(n), expect: await lineOf(w, p, Number(n)), status });
  });
  steps.when(/^the client writes lines (\d+) to (\d+) of "([^"]+)" as it shows them with "(.*)"$/, async (w, a, b, p, text) => {
    await before(w, p);
    const shown = (await read(w, p)).split("\n").slice(Number(a) - 1, Number(b)).join("\n");
    await post(w, "/api/write", { path: p, from: Number(a), to: Number(b), expect: shown, text: unescape(text) });
  });
  steps.when(/^the client writes line (\d+) of "([^"]+)" believing it reads "([^"]*)" with "(.*)"$/, async (w, n, p, shown, text) => {
    await before(w, p);
    await post(w, "/api/write", { path: p, from: Number(n), to: Number(n), expect: shown, text });
  });
  steps.when(/^the client writes line (\d+) to line (\d+) of "([^"]+)" believing it reads "([^"]*)" with "(.*)"$/, async (w, a, b, p, shown, text) => {
    await post(w, "/api/write", { path: p, from: Number(a), to: Number(b), expect: shown, text });
  });
  steps.when(/^the client adds the task "([^"]*)" due "([^"]*)" to "([^"]+)"$/, async (w, text, due, p) => {
    await before(w, p);
    await post(w, "/api/task/add", { path: p, text, due });
  });
  steps.when(/^the client sets the (plan|actual) of the "([^"]+)" row of "([^"]+)" to "([^"]*)", seeing it as "([^"]*)"$/, async (w, column, time, p, text, shown) => {
    await before(w, p);
    await post(w, "/api/timeblock", { path: p, time, column, expect: shown, text });
  });
  steps.when(/^the client replaces the rows "([^"]+)" to "([^"]+)" of "([^"]+)" as it shows them with "(.*)"$/, async (w, time, through, p, text) => {
    await before(w, p);
    const rows = (await read(w, p)).split("\n").filter((l) => /^\|\s*\d/.test(l));
    const shown = rows.map((l) => l.replace(/\s+/g, " ").replace(/ \|$/, " |")).slice(0, 2).join("\n");
    await post(w, "/api/timeblock/replace", { path: p, time, through, expect: shown, text: unescape(text) });
  });
  steps.when(/^the client replaces the rows "([^"]+)" to "([^"]+)" of "([^"]+)" believing they read "(.*)" with "(.*)"$/, async (w, time, through, p, shown, text) => {
    await before(w, p);
    await post(w, "/api/timeblock/replace", { path: p, time, through, expect: unescape(shown), text: unescape(text) });
  });
  steps.when(/^the client creates the note "([^"]+)"$/, async (w, p) => {
    await before(w, "area/health.md");
    await post(w, "/api/new", { path: p });
  });
  steps.when(/^a client creates the note "([^"]+)" with a wrong token$/, (w, p) => post(w, "/api/new", { path: p }, "wrong"));

  steps.then(/^the edit succeeds$/, (w) => {
    expect(w.status).toBe(200);
    expect(w.body.ok).toBe(true);
  });
  steps.then(/^the edit is refused as a conflict showing "([^"]+)"$/, (w, text) => {
    expect(w.status).toBe(409);
    expect(JSON.stringify([w.body.current, w.body.error])).toContain(text);
  });
  steps.then(/^the edit is refused as a bad request$/, (w) => expect(w.status).toBe(400));
  steps.then(/^the edit is refused as unauthorized$/, (w) => expect(w.status).toBe(401));

  steps.then(/^the note "([^"]+)" holds a line starting "([^"]+)"$/, async (w, p, line) => {
    expect((await read(w, p)).split("\n").some((l) => l.startsWith(line))).toBe(true);
  });
  steps.then(/^the note "([^"]+)" holds "([^"]+)"$/, async (w, p, text) => {
    expect(await read(w, p)).toContain(text);
  });
  steps.then(/^the note "([^"]+)" has (\d+) lines containing "([^"]+)"$/, async (w, p, n, text) => {
    expect((await read(w, p)).split("\n").filter((l) => l.includes(text))).toHaveLength(Number(n));
  });
  steps.then(/^lines (\d+) to (\d+) of the note "([^"]+)" are "(.*)"$/, async (w, a, b, p, text) => {
    expect((await read(w, p)).split("\n").slice(Number(a) - 1, Number(b)).join("\n")).toBe(unescape(text));
  });
  steps.then(/^the note "([^"]+)" is unchanged$/, async (w, p) => {
    expect(await read(w, p)).toBe(w.before[p]);
  });
}
