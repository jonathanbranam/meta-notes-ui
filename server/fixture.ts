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
    "root.md": "# Root\n\nSee [[area/health|health]] and [[project/make-bread]].\n",
    "notes.txt": "not markdown",
    "page.html": "hi",
    "doc.pdf": "%PDF-1.4",
    "data.bin": "\u0000\u0001",
    ".git/config.md": "git",
    ".meta-notes-cache/ui/x.md": "cache",
    "node_modules/pkg/readme.md": "dep",
  };
  for (const [rel, text] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, rel)), { recursive: true });
    await writeFile(path.join(root, rel), text);
  }
  // A real 1x1 PNG.
  await mkdir(path.join(root, "img"), { recursive: true });
  await writeFile(
    path.join(root, "img/dot.png"),
    Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==", "base64"),
  );
  await writeFile(outside, "secret");
  await symlink(outside, path.join(root, "link.md"));
  return { root, outside };
}
