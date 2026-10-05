import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** `version` of the nearest package.json above this file (works from server/ and dist/server/). */
export function readVersion(): string {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (;;) {
    try {
      return JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8")).version;
    } catch {
      const up = path.dirname(dir);
      if (up === dir) return "unknown";
      dir = up;
    }
  }
}
