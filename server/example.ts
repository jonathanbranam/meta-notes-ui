import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, mkdtemp, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
/** The committed example root; never written to, only copied. */
// Same path from server/ (tests) and dist/server/ (built).
export const EXAMPLE_ROOT = [path.resolve(here, "../examples/notes"), path.resolve(here, "../../examples/notes")].find(existsSync)!;

/** Copy the example root to a temp dir and create today's daily note there with the real CLI. */
export async function makeExampleRoot(): Promise<{ root: string; daily: string }> {
  const base = await realpath(await mkdtemp(path.join(tmpdir(), "mnui-example-")));
  const root = path.join(base, "notes");
  await cp(EXAMPLE_ROOT, root, { recursive: true });
  const { stdout } = await run("meta-notes", ["note", "daily", "--root", root, "--json"]);
  return { root, daily: (JSON.parse(stdout) as { path: string }).path };
}
