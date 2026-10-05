import { readdir } from "node:fs/promises";
import path from "node:path";
import type { TreeNode } from "../shared/types.js";
import { HIDDEN } from "./paths.js";

/** The PPARA folders, listed before other folders. */
export const PPARA_ORDER = ["plan", "project", "area", "resource", "archive"];

function rank(n: TreeNode): number {
  if (n.type === "file") return PPARA_ORDER.length + 2;
  const i = PPARA_ORDER.indexOf(n.name);
  return i === -1 ? PPARA_ORDER.length + 1 : i;
}

export function sortNodes(nodes: TreeNode[]): TreeNode[] {
  return nodes.sort(
    (a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, undefined, { numeric: true }),
  );
}

/** Folders and `.md` files under `root`, hidden names skipped. Empty folders are kept out. */
export async function listTree(root: string, rel = ""): Promise<TreeNode[]> {
  const entries = await readdir(path.join(root, rel), { withFileTypes: true });
  const nodes: TreeNode[] = [];
  for (const e of entries) {
    if (HIDDEN.has(e.name)) continue;
    const childRel = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      const children = await listTree(root, childRel);
      if (children.length) nodes.push({ name: e.name, path: childRel, type: "dir", children });
    } else if (e.isFile() && e.name.endsWith(".md")) {
      nodes.push({ name: e.name, path: childRel, type: "file" });
    }
  }
  return sortNodes(nodes);
}
