import { defineConfig } from "vitest/config";

// Executable bridle specs (design/specs); needs the bridle binary.
// The longer timeout is for the calendar scenario, which builds a .venv.
export default defineConfig({ test: { include: ["specs.test.ts"], testTimeout: 60_000 } });
