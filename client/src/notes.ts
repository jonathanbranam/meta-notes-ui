import type { TreeNode } from "../../shared/types";

/** The note text without its leading `---` frontmatter block. */
export function stripFrontmatter(text: string): string {
  const m = /^---\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/.exec(text);
  return m ? text.slice(m[0].length) : text;
}

export function flattenFiles(nodes: TreeNode[]): TreeNode[] {
  return nodes.flatMap((n) => (n.type === "file" ? [n] : flattenFiles(n.children ?? [])));
}

/** Files whose path contains every word of the query (case-insensitive), name matches first. */
export function quickOpen(files: TreeNode[], query: string, limit = 20): TreeNode[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const hits = files.filter((f) => words.every((w) => f.path.toLowerCase().includes(w)));
  const byName = (f: TreeNode) => (words.every((w) => f.name.toLowerCase().includes(w)) ? 0 : 1);
  return hits.sort((a, b) => byName(a) - byName(b) || a.path.localeCompare(b.path)).slice(0, limit);
}

/** Lines `stripFrontmatter` removes, so rendered line numbers can be turned into file line numbers. */
export function frontmatterLines(text: string): number {
  const stripped = text.length - stripFrontmatter(text).length;
  return stripped === 0 ? 0 : text.slice(0, stripped).split("\n").length - 1;
}
