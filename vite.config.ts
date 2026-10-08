import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";

const version = (JSON.parse(readFileSync("package.json", "utf8")) as { version: string }).version;

// The dev proxy target is the server started by hand (see README).
export default defineConfig({
  root: "client",
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(version) },
  build: { outDir: "../dist/client", emptyOutDir: true },
  server: {
    proxy: { "/api": process.env.MN_UI_SERVER ?? "http://127.0.0.1:4000" },
  },
});
