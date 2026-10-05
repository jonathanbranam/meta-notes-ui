import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { mkdtemp } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import type { TodayResponse } from "../shared/types.js";
import { createApp } from "./app.js";
import { makeExampleRoot } from "./example.js";

const auth = { authorization: "Bearer t" };

describe("/api/today", () => {
  it("returns the daily note, due tasks and no agenda without calendar support", async () => {
    const { root, daily } = await makeExampleRoot();
    const app = createApp({ root, token: "t", version: "0", subscribe: () => () => {} });
    expect((await app.request("/api/today")).status).toBe(401);
    const res = await app.request("/api/today", { headers: auth });
    expect(res.status).toBe(200);
    const body = (await res.json()) as TodayResponse;
    expect(body.daily?.path).toBe(daily);
    expect(body.daily?.text).toContain("Time Block");
    expect(body.tasks.some((t) => t.text.includes("Call the dentist") && t.time === "09:30")).toBe(true);
    expect(body.agenda).toBeNull();
  });
});

describe("PWA files", () => {
  it("serve the manifest, worker and icons only with the token", async () => {
    const clientDir = await mkdtemp(path.join(tmpdir(), "mnui-client-"));
    await mkdir(clientDir, { recursive: true });
    await writeFile(path.join(clientDir, "manifest.webmanifest"), "{}");
    await writeFile(path.join(clientDir, "sw.js"), "//");
    await writeFile(path.join(clientDir, "icon-192.png"), "x");
    const { root } = await makeExampleRoot();
    const app = createApp({ root, token: "t", version: "0", clientDir, subscribe: () => () => {} });
    for (const p of ["/manifest.webmanifest", "/sw.js", "/icon-192.png"]) {
      expect((await app.request(p)).status).toBe(401);
      expect((await app.request(p, { headers: auth })).status).toBe(200);
    }
    const m = await app.request("/manifest.webmanifest", { headers: auth });
    expect(m.headers.get("content-type")).toContain("manifest+json");
    expect((await app.request("/icon-192.png", { headers: auth })).headers.get("content-type")).toBe("image/png");
  });
});
