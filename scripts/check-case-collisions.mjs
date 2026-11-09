// Fails when two tracked source paths differ only by case (ignoring the
// extension): macOS and Windows file systems can't hold both, so the build
// breaks there while Linux passes. Rule: naming. Test: scripts/case-collisions.test.ts.
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SOURCE = /\.(ts|tsx|js|jsx|mjs|cjs)$/;

// Groups of paths that collide: same path once lowercased and the extension is stripped.
export function findCaseCollisions(paths) {
  const groups = new Map();
  for (const p of paths) {
    const key = p.toLowerCase().replace(/\.[^./]+$/, "");
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }
  return [...groups.values()].filter((g) => g.length > 1);
}

function trackedSourcePaths(root) {
  const out = execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" });
  return out.split("\0").filter((p) => SOURCE.test(p));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const collisions = findCaseCollisions(trackedSourcePaths(root));
  if (collisions.length) {
    for (const g of collisions) console.error(`case-only collision: ${g.join(" , ")}`);
    console.error("Rename so no two source paths differ only by case (rule: naming).");
    process.exit(1);
  }
  console.log("no case-only collisions among tracked source paths");
}
