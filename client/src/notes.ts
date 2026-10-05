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

const IMAGE = /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i;
export const isImage = (p: string) => IMAGE.test(p);
export const isNote = (p: string) => p.endsWith(".md");

/** The raw-file URL of a root-relative path. */
export const fileUrl = (p: string) => `/api/file?path=${encodeURIComponent(p)}`;

const dirOf = (p: string) => (p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "");

/** A root-relative path, from a path relative to the note's folder or (Obsidian) to the root, else by bare name. */
export function resolveFile(target: string, from: string, files: ReadonlySet<string>): string | null {
  const parts: string[] = [];
  for (const seg of [...dirOf(from).split("/"), ...target.split("/")]) {
    if (seg === "..") parts.pop();
    else if (seg && seg !== ".") parts.push(seg);
  }
  const rel = parts.join("/");
  for (const c of [rel, target]) if (files.has(c)) return c;
  const name = target.split("/").pop();
  return [...files].find((f) => f === name || f.endsWith(`/${name}`)) ?? null;
}

/** Obsidian `![[img.png]]` embeds of images become markdown images of the raw-file route. */
export function embedImages(text: string, from: string, files: ReadonlySet<string>): string {
  return text.replace(/!\[\[([^\]|#]+)(?:\|[^\]]*)?\]\]/g, (m, target: string) => {
    if (!isImage(target)) return m;
    const found = resolveFile(target, from, files);
    return found ? `![${target}](${fileUrl(found)})` : m;
  });
}
