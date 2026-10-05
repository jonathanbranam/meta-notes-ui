import { defineConfig } from "vitest/config";

// Executable bridle specs (design/specs); needs the bridle binary.
export default defineConfig({ test: { include: ["specs.test.ts"] } });
