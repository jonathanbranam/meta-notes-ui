import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { extractLinks, resolveLink } from "../shared/links.js";
import type { TreeNode } from "../shared/types.js";

interface Entry {
  mtime: number;
  targets: string[];
}

function files(nodes: TreeNode[]): string[] {
  return nodes.flatMap((n) => (n.type === "file" ? [n.path] : files(n.children ?? [])));
}

/**
 * Notes linking to a note. Link targets are cached per file by mtime, so a
 * request stats every note but reads only those that changed; no timers.
 */
export function createBacklinks(root: string) {
  let cache = new Map<string, Entry>();
  return async function backlinks(target: string, tree: TreeNode[]): Promise<string[]> {
    const all = files(tree);
    const set = new Set(all);
    const next = new Map<string, Entry>();
    const hits: string[] = [];
    for (const f of all) {
      if (f === target) continue;
      try {
        const abs = path.join(root, f);
        const { mtimeMs } = await stat(abs);
        let e = cache.get(f);
        if (!e || e.mtime !== mtimeMs) e = { mtime: mtimeMs, targets: extractLinks(await readFile(abs, "utf8")) };
        next.set(f, e);
        if (e.targets.some((t) => resolveLink(t, f, set) === target)) hits.push(f);
      } catch {
        // vanished mid-scan
      }
    }
    cache = next;
    return hits.sort();
  };
}
