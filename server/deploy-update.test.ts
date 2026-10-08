import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, readlinkSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const script = resolve(__dirname, "../deploy/update.sh");
const repo = resolve(__dirname, "..");
const nuc = join(repo, "deploy/nuc.md");

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

function update(extra: Record<string, string> = {}) {
  return spawnSync("bash", [script], {
    encoding: "utf8",
    env: {
      ...process.env,
      CHECKOUT: checkout,
      STATE: state,
      INSTALL_CMD: "true",
      RESTART_CMD: `echo restart >> ${restarts}`,
      ...extra,
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

describe("deploy/update.sh when main moves during a build", () => {
  it("builds again when main moved during the first build", () => {
    // The first build commits to the checkout, as a push during the build would.
    const flag = join(dir, "moved");
    const buildStub = join(dir, "build.sh");
    writeFileSync(
      buildStub,
      `#!/bin/sh\nif [ ! -f ${flag} ]; then\n  touch ${flag}\n  git -C ${checkout} -c user.name=t -c user.email=t@t commit --allow-empty -qm moved\nfi\n`,
    );
    chmodSync(buildStub, 0o755);

    const r = update({ BUILD_CMD: buildStub });
    expect(r.status).toBe(0);
    const sha = git("rev-parse", "main").toString().trim();
    expect(current()).toBe(join(state, "builds", sha));
    expect(readFileSync(join(state, "current", ".built-sha"), "utf8").trim()).toBe(sha);
    expect(restartCount()).toBe(2);
    expect(readdirSync(join(state, "builds")).sort()).toHaveLength(2);
  });
});

describe("deploy/nuc.md install loop", () => {
  // Runs the guide's install block over the three templates in a fake HOME, with
  // a stub meta-notes on PATH. Run from the repo root (it only reads deploy/), so
  // $PWD is the repo. The cd and daemon-reload lines are dropped: systemd is never touched.
  function install() {
    const home = join(dir, "home");
    const bin = join(dir, "bin");
    const nodeDir = dirname(process.execPath);
    mkdirSync(bin);
    writeFileSync(join(bin, "meta-notes"), "#!/bin/sh\n");
    chmodSync(join(bin, "meta-notes"), 0o755);

    const block = readFileSync(nuc, "utf8").match(/```sh\n([\s\S]*?)```/g)!
      .map((b) => b.replace(/^```sh\n|```$/g, ""))
      .find((b) => b.includes('sed -e "s|META_NOTES_BIN_DIR'))!;
    const lines = block.split("\n").filter((l) => !/^cd |systemctl/.test(l)).join("\n");

    const r = spawnSync("bash", ["-c", lines], {
      encoding: "utf8",
      cwd: repo,
      env: { HOME: home, PATH: `${bin}:${nodeDir}:/usr/bin:/bin` },
    });
    return { r, home, bin, nodeDir };
  }

  it("leaves the server's PATH and ExecStart with no placeholder", () => {
    const { r, home, bin, nodeDir } = install();
    expect(r.stderr).toBe("");
    expect(r.status).toBe(0);
    const unit = join(home, ".config/systemd/user");
    const server = readFileSync(join(unit, "meta-notes-ui.service"), "utf8").split("\n");
    const node = join(nodeDir, "node");

    expect(server).toContain(`Environment=PATH=${bin}:${nodeDir}:/usr/local/bin:/usr/bin:/bin`);
    expect(server).toContain(
      `ExecStart=${node} dist/server/index.js --root /srv/shared/work/notes-work/notes --port 7480 --host 127.0.0.1 --token-file /srv/shared/work/notes-work/notes/.meta-notes-cache/ui/token --bridle-url http://127.0.0.1:7404 --bridle-token-file /srv/shared/work/notes-work/.bridle/tokens/human --bridle-to external:advisor`,
    );

    for (const u of ["meta-notes-ui.service", "meta-notes-ui-update.service", "meta-notes-ui-update.path"]) {
      const body = readFileSync(join(unit, u), "utf8").split("\n").filter((l) => !l.startsWith("#"));
      expect(body.join("\n")).not.toMatch(/CHECKOUT|NOTES|NODE_BIN_DIR|META_NOTES_BIN_DIR|ExecStart=NODE/);
    }
    expect(readFileSync(join(unit, "meta-notes-ui-update.path"), "utf8")).toContain(
      `PathChanged=${repo}/.git/logs/refs/heads/main`,
    );
  });
});
