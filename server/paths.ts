import { realpath } from "node:fs/promises";
import path from "node:path";

/** Names never served or listed, at any depth (rule access). */
export const HIDDEN = new Set([".git", ".venv", ".meta-notes-cache", "node_modules"]);

export class PathError extends Error {}

/** True when any segment of a root-relative path is a hidden name. */
export function isHidden(rel: string): boolean {
  return rel.split(/[\\/]/).some((s) => HIDDEN.has(s));
}

/**
 * Resolve a root-relative path to an absolute one that is inside the root,
 * not hidden, and (after following symlinks) still inside the root.
 * `root` must already be a real path.
 */
export async function confine(root: string, rel: string): Promise<string> {
  if (rel.includes("\0") || path.isAbsolute(rel)) throw new PathError("bad path");
  const abs = path.resolve(root, rel);
  const back = path.relative(root, abs);
  if (back.startsWith("..") || path.isAbsolute(back)) throw new PathError("outside root");
  if (isHidden(back)) throw new PathError("hidden path");
  let real: string;
  try {
    real = await realpath(abs);
  } catch {
    throw new PathError("not found");
  }
  const realBack = path.relative(root, real);
  if (realBack.startsWith("..") || path.isAbsolute(realBack) || isHidden(realBack)) {
    throw new PathError("outside root");
  }
  return real;
}
