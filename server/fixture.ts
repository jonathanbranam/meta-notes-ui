import { mkdir, mkdtemp, realpath, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

/** A throwaway notes root (never the human's real notes) and a secret outside it. */
export async function makeFixtureRoot(): Promise<{ root: string; outside: string }> {
  const base = await realpath(await mkdtemp(path.join(tmpdir(), "mnui-")));
  const root = path.join(base, "notes");
  const outside = path.join(base, "secret.md");
  const files: Record<string, string> = {
    "plan/daily/26-Q4/2026-10-04 Sun.md": "# Sunday\n- [ ] a task 📅 2026-10-04\n",
    "project/make-bread/Home.md": "# Bread\n",
    "area/health.md": "# Health\n",
    "zeta/z.md": "# Z\n",
    "alpha/a.md": "# A\n",
    "root.md": "# Root\n",
    "notes.txt": "not markdown",
    ".git/config.md": "git",
    ".meta-notes-cache/ui/x.md": "cache",
    "node_modules/pkg/readme.md": "dep",
  };
  for (const [rel, text] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, rel)), { recursive: true });
    await writeFile(path.join(root, rel), text);
  }
  await writeFile(outside, "secret");
  await symlink(outside, path.join(root, "link.md"));
  return { root, outside };
}
