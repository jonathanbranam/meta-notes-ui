// Spec check and executable spec scenarios; skipped when the bridle binary is
// absent (CI has none yet). Rule: specs.
import { spawnSync } from "node:child_process";

const bridle = process.env.BRIDLE_BIN || "bridle";
if (spawnSync(bridle, ["--version"]).error) {
  console.log("bridle not found: skipping spec check and spec tests");
  process.exit(0);
}
for (const [cmd, args] of [
  [bridle, ["spec", "check", "--require-ids"]],
  ["npx", ["vitest", "run", "--config", "vitest.specs.config.ts"]],
]) {
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
