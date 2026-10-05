import { execFile } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { afterAll, describe, expect, it } from "vitest";
import { EXAMPLE_ROOT, makeExampleRoot } from "./example.js";
import { createApp } from "./app.js";

const run = promisify(execFile);
const roots: string[] = [];
afterAll(() => Promise.all(roots.map((r) => rm(path.dirname(r), { recursive: true, force: true }))));

describe("example notes root", () => {
  it("copies to a temp root with today's daily note made by meta-notes", async () => {
    const { root, daily } = await makeExampleRoot();
    roots.push(root);
    expect(root).not.toContain(EXAMPLE_ROOT);
    expect(daily).toMatch(/^plan\/daily\/.*\.md$/);
    expect(await readFile(path.join(root, daily), "utf8")).toContain("### Time Block");
    // The committed files stay untouched.
    await expect(readFile(path.join(EXAMPLE_ROOT, daily))).rejects.toThrow();
  });

  it("serves its notes and has tasks meta-notes understands", async () => {
    const { root } = await makeExampleRoot();
    roots.push(root);
    const app = createApp({ root, token: "t", version: "0", clientDir: "/nonexistent", subscribe: () => () => {} });
    const res = await app.request("/api/note?path=project/make-bread/Home.md", { headers: { authorization: "Bearer t" } });
    expect(res.status).toBe(200);
    const { stdout } = await run("meta-notes", ["tasks", "--root", root, "--json"]);
    expect(stdout).toContain("Bake a first loaf");
  });
});
