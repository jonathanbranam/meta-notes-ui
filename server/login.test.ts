import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { CLI_USAGE, findRoot, runCli } from "./cli.js";
import { createLogin, createLoginStore, loginFile, SESSION_MS, sessionsFile, verifyLogin } from "./login.js";

const newRoot = () => mkdtemp(path.join(tmpdir(), "mnui-login-"));
const readLogin = async (root: string) => JSON.parse(await readFile(loginFile(root), "utf8"));

describe("login file", () => {
  it("hashes with a random salt and verifies", async () => {
    const root = await newRoot();
    await createLogin(root, "me", "pw-123");
    const a = await readLogin(root);
    expect(await verifyLogin(a, "me", "pw-123")).toBe(true);
    expect(await verifyLogin(a, "me", "pw-124")).toBe(false);
    expect(await verifyLogin(a, "you", "pw-123")).toBe(false);
    await createLogin(root, "me", "pw-123");
    const b = await readLogin(root);
    expect(b.salt).not.toBe(a.salt);
    expect(b.hash).not.toBe(a.hash);
  });
});

describe("sessions", () => {
  it("expire after 30 days unused, slide on use, and revoke", async () => {
    const root = await newRoot();
    let t = 1_000_000;
    const store = createLoginStore(root, () => t);
    const id = await store.start();
    expect(JSON.stringify(await readFile(sessionsFile(root), "utf8"))).not.toContain(id);
    t += SESSION_MS - 1000;
    expect(await store.valid(id)).toBe(true);
    t += SESSION_MS - 1000; // still inside the window because use slid it
    expect(await store.valid(id)).toBe(true);
    t += SESSION_MS + 1;
    expect(await store.valid(id)).toBe(false);

    const other = await store.start();
    await store.revoke(other);
    expect(await store.valid(other)).toBe(false);
    expect(await store.valid("made-up")).toBe(false);
    expect((await stat(sessionsFile(root))).mode & 0o777).toBe(0o600);
  });

  it("survive a restart", async () => {
    const root = await newRoot();
    await createLogin(root, "me", "pw");
    const id = await (async () => {
      const first = createLoginStore(root);
      await first.current();
      return first.start();
    })();
    const second = createLoginStore(root);
    await second.current();
    expect(await second.valid(id)).toBe(true);
  });
});

describe("create-login", () => {
  it("writes the login for the root found upward from cwd", async () => {
    const root = await newRoot();
    await import("node:fs/promises").then((fs) => fs.mkdir(path.join(root, ".meta-notes"), { recursive: true }));
    await import("node:fs/promises").then((fs) => fs.mkdir(path.join(root, "a", "b"), { recursive: true }));
    expect(await findRoot(undefined, path.join(root, "a", "b"))).toBe(await import("node:fs/promises").then((fs) => fs.realpath(root)));
    expect(await runCli(["create-login", "me", "pw-123"], path.join(root, "a", "b"))).toBe(0);
    expect((await readLogin(root)).username).toBe("me");
    expect((await stat(loginFile(root))).mode & 0o777).toBe(0o600);
  });

  it("refuses a missing username", async () => {
    expect(await runCli(["create-login"])).toBe(2);
  });

  it("prints usage and exits 0 for --help and -h", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      expect(await runCli(["create-login", "--help"])).toBe(0);
      expect(await runCli(["-h"])).toBe(0);
      expect(log).toHaveBeenCalledWith(CLI_USAGE);
    } finally {
      log.mockRestore();
    }
  });
});
