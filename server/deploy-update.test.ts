import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, readlinkSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const script = resolve(__dirname, "../deploy/update.sh");

let dir: string;
let checkout: string;
let state: string;
let restarts: string;

const git = (...args: string[]) => execFileSync("git", ["-C", checkout, ...args], { stdio: "pipe" });

function commit(buildScript: string, msg: string) {
  writeFileSync(
    join(checkout, "package.json"),
    JSON.stringify({ name: "stub", scripts: { build: buildScript } }),
  );
  git("add", ".");
  git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", msg);
}

function update() {
  return spawnSync("bash", [script], {
    encoding: "utf8",
    env: {
      ...process.env,
      CHECKOUT: checkout,
      STATE: state,
      INSTALL_CMD: "true",
      RESTART_CMD: `echo restart >> ${restarts}`,
    },
  });
}

const current = () => readlinkSync(join(state, "current"));
const restartCount = () => (existsSync(restarts) ? readFileSync(restarts, "utf8").split("\n").filter(Boolean).length : 0);

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "mnui-update-"));
  checkout = join(dir, "checkout");
  state = join(dir, "state");
  restarts = join(dir, "restarts");
  execFileSync("git", ["init", "-q", "-b", "main", checkout]);
  commit("true", "one");
});

afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe("deploy/update.sh", () => {
  it("builds main, points current at it and restarts", () => {
    const r = update();
    expect(r.status).toBe(0);
    const sha = git("rev-parse", "main").toString().trim();
    expect(current()).toBe(join(state, "builds", sha));
    expect(readFileSync(join(state, "current", ".built-sha"), "utf8").trim()).toBe(sha);
    expect(restartCount()).toBe(1);
  });

  it("does nothing when main has not moved", () => {
    update();
    const r = update();
    expect(r.status).toBe(0);
    expect(restartCount()).toBe(1);
  });

  it("leaves current and the server alone when the build fails", () => {
    update();
    const before = current();
    commit("false", "broken");
    const r = update();
    expect(r.status).not.toBe(0);
    expect(current()).toBe(before);
    expect(restartCount()).toBe(1);
    expect(readdirSync(join(state, "builds"))).toEqual([before.split("/").pop()]);
  });

  it("keeps the last 3 builds", () => {
    for (let i = 0; i < 5; i++) {
      commit(`true # c${i}`, `c${i}`);
      expect(update().status).toBe(0);
    }
    expect(readdirSync(join(state, "builds"))).toHaveLength(3);
  });
});
