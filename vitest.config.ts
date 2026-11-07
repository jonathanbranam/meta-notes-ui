import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: { include: ["server/**/*.test.ts", "shared/**/*.test.ts", "client/src/**/*.test.ts"] },
});
