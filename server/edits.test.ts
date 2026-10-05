import { readFile } from "node:fs/promises";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { makeExampleRoot } from "./example.js";

const TOKEN = "edit-token";
let root: string;
let app: ReturnType<typeof createApp>;

beforeAll(async () => {
  ({ root } = await makeExampleRoot());
  app = createApp({ root, token: TOKEN, version: "0", subscribe: () => () => {} });
}, 30_000);

const post = (url: string, body: unknown, token = TOKEN) =>
  app.request(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
const read = (rel: string) => readFile(path.join(root, rel), "utf8");
const HEALTH = "area/health.md";

describe("edit routes", () => {
  it("refuse without a token", async () => {
    for (const u of ["/api/task", "/api/write", "/api/new"]) expect((await post(u, {}, "bad")).status).toBe(401);
  });

  it("check a task off, spawning a recurring task's next line", async () => {
    const lines = (await read(HEALTH)).split("\n");
    const res = await post("/api/task", { path: HEALTH, line: 7, expect: lines[6], status: "x" });
    expect(res.status).toBe(200);
    const after = await read(HEALTH);
    expect(after).toContain("- [x] Annual checkup");
    expect(after.split("\n").filter((l) => l.includes("Annual checkup"))).toHaveLength(2);
  });

  it("refuses a stale task line and shows the current one", async () => {
    const res = await post("/api/task", { path: HEALTH, line: 10, expect: "- [ ] something else", status: "x" });
    expect(res.status).toBe(409);
    const body = (await res.json()) as { current: string; error: string };
    expect(body.current).toContain("Call the dentist");
    expect(await read(HEALTH)).toContain("- [ ] Call the dentist");
  });

  it("writes a block, with dashes and non-ASCII text intact", async () => {
    const file = "area/Home Care.md";
    const lines = (await read(file)).split("\n");
    const res = await post("/api/write", { path: file, from: 5, to: 6, expect: lines.slice(4, 6).join("\n"), text: "---\n- [ ] Order tiles 📅 2026-09-29" });
    expect(res.status).toBe(200);
    const after = (await read(file)).split("\n");
    expect(after.slice(4, 6)).toEqual(["---", "- [ ] Order tiles 📅 2026-09-29"]);
    expect(after.length).toBe(lines.length);
  });

  it("refuses a stale block write, returns the current lines and changes nothing", async () => {
    const before = await read(HEALTH);
    const res = await post("/api/write", { path: HEALTH, from: 1, to: 1, expect: "not what is there", text: "# Mine" });
    expect(res.status).toBe(409);
    expect(((await res.json()) as { current: string[] }).current).toEqual([before.split("\n")[0]]);
    expect(await read(HEALTH)).toBe(before);
  });

  it("creates a note from a template and refuses to overwrite", async () => {
    const res = await post("/api/new", { path: "area/new-thing.md" });
    expect(res.status).toBe(200);
    expect(await read("area/new-thing.md")).toContain("new-thing");
    expect((await post("/api/new", { path: "area/new-thing.md" })).status).toBe(409);
  });

  it("confines paths to the root", async () => {
    const bad = ["../x.md", "/etc/x.md", ".git/x.md", ".meta-notes-cache/x.md", "a/../../x.md", "notes.txt"];
    for (const p of bad) {
      expect((await post("/api/new", { path: p })).status).toBe(400);
      expect((await post("/api/write", { path: p, from: 1, to: 1, expect: "", text: "x" })).status).toBe(400);
      expect((await post("/api/task", { path: p, line: 1, expect: "", status: "x" })).status).toBe(400);
    }
  });

  it("rejects malformed bodies", async () => {
    expect((await post("/api/write", { path: HEALTH, from: 3, to: 2, expect: "", text: "" })).status).toBe(400);
    expect((await post("/api/task", { path: HEALTH, line: 1, expect: "", status: "xx" })).status).toBe(400);
  });
});
