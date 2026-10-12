// Screenshot the UI against a temp copy of examples/notes, for agents to look at.
// Usage: npm run shots [-- --out DIR] [--no-build] [route ...]   (routes are hash routes, default "#!today")
// Dev tooling only: needs the playwright devDependency and the system Chrome (no browser download).
import { execFileSync, spawn } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { chromium } from "playwright";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { values, positionals } = parseArgs({
  options: { out: { type: "string", default: ".shots" }, "no-build": { type: "boolean" } },
  allowPositionals: true,
});
const routes = positionals.length ? positionals : ["#!today"];
const out = path.resolve(values.out);
mkdirSync(out, { recursive: true });

if (!values["no-build"]) execFileSync("npm", ["run", "build"], { cwd: repo, stdio: "inherit" });

const base = mkdtempSync(path.join(tmpdir(), "mnui-shots-"));
const root = path.join(base, "notes");
cpSync(path.join(repo, "examples/notes"), root, { recursive: true });
execFileSync("meta-notes", ["note", "daily", "--root", root], { stdio: "inherit" });
const tokenFile = path.join(base, "token");

// Port 0: the OS picks a free port, so 7480 is never used.
const child = spawn(
  process.execPath,
  [path.join(repo, "dist/server/index.js"), "--root", root, "--token-file", tokenFile, "--port", "0"],
  { stdio: ["ignore", "pipe", "inherit"] },
);
let browser;
try {
  const url = await new Promise((resolve, reject) => {
    let buf = "";
    const timer = setTimeout(() => reject(new Error("server did not start")), 20000);
    child.stdout.on("data", (d) => {
      buf += d;
      const m = buf.match(/listening on (\S+)/);
      if (m) {
        clearTimeout(timer);
        resolve(m[1]);
      }
    });
    child.on("exit", () => reject(new Error("server exited early")));
  });
  const token = readFileSync(tokenFile, "utf8").trim();
  browser = await chromium.launch({ channel: "chrome" });
  const sizes = { desktop: { width: 1400, height: 900 }, mobile: { width: 400, height: 800 } };
  for (const [size, viewport] of Object.entries(sizes)) {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();
    await page.goto(`${url}/?token=${token}`);
    for (const route of routes) {
      const name = route.replace(/^#!?/, "").replace(/[^\w.-]+/g, "_") || "home";
      await page.goto(`${url}/${route.startsWith("#") ? route : "#" + route}`);
      await page.waitForSelector("main");
      await page.waitForTimeout(500);
      const shot = async (tree) => {
        const file = path.join(out, `${name}-${size}-tree-${tree}.png`);
        await page.screenshot({ path: file });
        console.log(file);
      };
      if (size === "desktop") {
        if (await page.locator(".tree-expand").count()) await page.click(".tree-expand");
        await shot("expanded");
        await page.click(".tree-collapse");
        await shot("collapsed");
        await page.click(".tree-expand"); // leave the stored state as found
      } else {
        await shot("collapsed");
        await page.click("button.menu");
        await page.waitForTimeout(500); // the drawer slides in
        await shot("expanded");
        await page.mouse.click(viewport.width - 5, viewport.height / 2); // the scrim, right of the drawer
      }
    }
    await ctx.close();
  }
} finally {
  await browser?.close();
  child.kill("SIGTERM");
  rmSync(base, { recursive: true, force: true });
}
