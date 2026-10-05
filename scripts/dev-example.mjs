// Build, copy the example notes root to a temp dir and run the server there.
// Usage: npm run dev:example [-- --port N]   (default: a free port)
// `bridle port allocate` is used only if no --port is given and bridle exists.
import { execFileSync, spawn } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { values } = parseArgs({ options: { port: { type: "string" } } });

let port = values.port;
let allocated = false;
if (!port) {
  try {
    port = execFileSync("bridle", ["port", "allocate"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim().match(/\d+/)?.[0];
    allocated = Boolean(port);
  } catch {
    // no bridle: a free port
  }
}

function release() {
  if (allocated) {
    try {
      execFileSync("bridle", ["port", "release", port], { stdio: "ignore" });
    } catch {
      // best effort
    }
    allocated = false;
  }
}

execFileSync("npm", ["run", "build"], { cwd: repo, stdio: "inherit" });

const base = mkdtempSync(path.join(tmpdir(), "mnui-example-"));
const root = path.join(base, "notes");
cpSync(path.join(repo, "examples/notes"), root, { recursive: true });
execFileSync("meta-notes", ["note", "daily", "--root", root], { stdio: "inherit" });
const tokenFile = path.join(base, "token");

const child = spawn(
  process.execPath,
  [path.join(repo, "dist/server/index.js"), "--root", root, "--token-file", tokenFile, "--port", port ?? "0"],
  { stdio: ["ignore", "pipe", "inherit"] },
);
let out = "";
let shown = false;
child.stdout.on("data", (d) => {
  out += d;
  const m = out.match(/listening on (\S+)/);
  if (m && !shown) {
    shown = true;
    const token = readFileSync(tokenFile, "utf8").trim();
    console.log(`example root: ${root}\nopen: ${m[1]}/?token=${token}`);
  }
});

function cleanup() {
  release();
  rmSync(base, { recursive: true, force: true });
}
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => child.kill(sig));
child.on("exit", (code) => {
  cleanup();
  process.exit(code ?? 0);
});
