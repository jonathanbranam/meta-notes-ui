import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { expect } from "vitest";
import type { Steps } from "vitest-bridle";
import { createApp } from "../../server/app.js";
import { makeExampleRoot } from "../../server/example.js";
import { canceledItems, chooseList, gotItems, locateLine, openGroups, sourcePath, type ListFile } from "../../client/src/lists";
import { messageBody, listOf } from "../../client/src/tabs";

const run = promisify(execFile);
const TOKEN = "lists-token";
type World = Record<string, any>;

/** A meta-notes list command on the world's fixture root (the same CLI the server uses). */
const cli = async (w: World, ...args: string[]) => JSON.parse((await run("meta-notes", ["list", ...args, "--root", w.root, "--json"])).stdout);

async function app(w: World) {
  if (!w.app) {
    const { root } = await makeExampleRoot();
    w.root = root;
    w.app = createApp({ root, token: TOKEN, version: "0.0.0", subscribe: () => () => {} });
  }
}

async function call(w: World, url: string, body?: unknown) {
  const res = await (w.app as ReturnType<typeof createApp>).request(url, {
    method: body === undefined ? "GET" : "POST",
    headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  w.status = res.status;
  w.reply = await res.json();
  return w.reply;
}

const show = async (w: World): Promise<ListFile> => (await call(w, `/api/list?path=${encodeURIComponent(w.list)}`)) as ListFile;
const texts = (items: { text: string }[]) => items.map((i) => i.text);

export function listsSteps(steps: Steps) {
  steps.when(/^the day's current list is "Walmart", the last list shown was "Lowes", and both exist$/, (w) => {
    w.pick = chooseList("Walmart", "Lowes", ["Walmart", "Lowes"]);
  });
  steps.when(/^no list is current, the last list shown was "Lowes", and it exists$/, (w) => {
    w.pick = chooseList(null, "Lowes", ["Walmart", "Lowes"]);
  });
  steps.when(/^no list is current and the last list shown no longer exists$/, (w) => {
    w.pick = chooseList(null, "Gone", ["Walmart"]);
  });
  steps.then(/^the tab opens "([^"]+)"$/, (w, name) => expect(w.pick).toBe(name));
  steps.then(/^the tab opens the all-lists page$/, (w) => expect(w.pick).toBeNull());

  steps.when(/^lists dated 2026-11-05 "Lowes" and 2026-11-07 "Walmart" exist$/, async (w) => {
    await app(w);
    await cli(w, "new", "Lowes", "--date", "2026-11-05");
    await cli(w, "new", "Walmart", "--date", "2026-11-07");
    w.reply = await call(w, "/api/lists");
  });
  steps.then(/^the lists are "Walmart" then "Lowes"$/, (w) => expect(w.reply.lists.map((l: { name: string }) => l.name)).toEqual(["Walmart", "Lowes"]));

  steps.when(/^a list has "buns" and "milk\?" in Bread, "eggs" and "butter" in Dairy, "eggs" checked, and "milk\?" canceled$/, async (w) => {
    await app(w);
    w.list = (await cli(w, "new", "Walmart", "--date", "2026-11-07")).list;
    await cli(w, "group-add", w.list, "Bread");
    await cli(w, "group-add", w.list, "Dairy");
    for (const [t, g] of [["buns", "Bread"], ["milk?", "Bread"], ["eggs", "Dairy"], ["butter", "Dairy"]]) await cli(w, "item-add", w.list, t, "--group", g);
    const f = await show(w);
    const n = (t: string) => f.groups.flatMap((g) => g.items).find((i) => i.text === t)!.number;
    await cli(w, "check", w.list, String(n("eggs")));
    await cli(w, "cancel", w.list, String(n("milk?")));
    w.file = await show(w);
  });
  steps.then(/^the open items are Bread: "buns"; Dairy: "butter"$/, (w) => {
    expect(openGroups(w.file).map((g) => [g.name, texts(g.items)])).toEqual([["Bread", ["buns"]], ["Dairy", ["butter"]]]);
  });
  steps.then(/^the Got section is "eggs"$/, (w) => expect(texts(gotItems(w.file))).toEqual(["eggs"]));
  steps.then(/^the canceled items are "milk\?"$/, (w) => expect(texts(canceledItems(w.file))).toEqual(["milk?"]));

  const bunsList = async (w: World) => {
    await app(w);
    w.list = (await cli(w, "new", "Walmart", "--date", "2026-11-07")).list;
    await cli(w, "group-add", w.list, "Bread");
    await cli(w, "item-add", w.list, "buns", "--group", "Bread");
    await cli(w, "item-add", w.list, "chips", "--group", "Bread");
  };
  const buns = async (w: World) => (await show(w)).groups.flatMap((g) => g.items).find((i) => i.text === "buns")!;
  const bread = async (w: World) => texts(openGroups(await show(w))[0]?.items ?? []);
  const toggle = async (w: World, action: string) => call(w, "/api/list/check", { list: w.list, n: (await buns(w)).number, expect: "buns", action });

  steps.when(/^the user checks "buns" and then unchecks it$/, async (w) => {
    await bunsList(w);
    await toggle(w, "check");
    w.afterCheck = { got: texts(gotItems(await show(w))), bread: await bread(w) };
    await toggle(w, "uncheck");
    w.afterUncheck = await bread(w);
  });
  steps.then(/^after the check "buns" is in the Got section and not in Bread$/, (w) => {
    expect(w.afterCheck.got).toEqual(["buns"]);
    expect(w.afterCheck.bread).toEqual(["chips"]);
  });
  steps.then(/^after the uncheck "buns" is first in Bread again$/, (w) => expect(w.afterUncheck).toEqual(["buns", "chips"]));

  steps.when(/^the user checks "buns" after the item's text was changed to "rolls" in the file$/, async (w) => {
    await bunsList(w);
    const n = (await buns(w)).number;
    await cli(w, "item-edit", w.list, String(n), "--text", "rolls");
    await call(w, "/api/list/check", { list: w.list, n, expect: "buns", action: "check" });
  });
  steps.then(/^the server answers 409 with an error$/, (w) => {
    expect(w.status).toBe(409);
    expect(w.reply.ok).toBe(false);
    expect(w.reply.error).toBeTruthy();
  });
  steps.then(/^the item is still open$/, async (w) => expect(await bread(w)).toContain("rolls"));

  const src = { file: "area/t", line: 2, text: "- [ ] buy screws" };
  steps.when(/^an item's source is "area\/t" line 2, "- \[ \] buy screws", and the note's line 2 is "- \[ \] buy screws"$/, (w) => {
    w.open = { path: sourcePath(src), line: locateLine("# T\n- [ ] buy screws\n", src) };
  });
  steps.when(/^an item's source is "area\/t" line 2, "- \[ \] buy screws", and the note now has that task on line 4$/, (w) => {
    w.open = { path: sourcePath(src), line: locateLine("# T\n\nnew\n- [x] buy screws ✅ 2026-11-07\n", src) };
  });
  steps.then(/^the link opens "([^"]+)" at line (\d+)$/, (w, path, line) => expect(w.open).toEqual({ path, line: Number(line) }));

  steps.when(/^the user sends "([^"]+)" from the list page "([^"]+)"$/, (w, text, page) => {
    w.text = messageBody(text, listOf(page) ?? page);
  });
  steps.then(/^the message text starts "([^"]+)"$/, (w, head) => expect(w.text.startsWith(head)).toBe(true));
}
