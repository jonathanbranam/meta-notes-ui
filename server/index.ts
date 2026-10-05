import { rmSync } from "node:fs";
import { mkdir, realpath, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import type { AddressInfo } from "node:net";
import type { ChangeEvent, ServerInfo } from "../shared/types.js";
import { createApp } from "./app.js";
import { loadToken } from "./token.js";
import { readVersion } from "./version.js";
import { watchRoot } from "./watcher.js";

const { values } = parseArgs({
  options: {
    root: { type: "string" },
    port: { type: "string", default: "0" },
    host: { type: "string", default: "127.0.0.1" },
    "token-file": { type: "string" },
  },
});
if (!values.root || !values["token-file"]) {
  console.error("usage: node index.js --root <notes root> --token-file <path> [--port N] [--host H]");
  process.exit(2);
}

const root = await realpath(values.root);
const token = await loadToken(values["token-file"]);
const version = readVersion();
const host = values.host!;

const listeners = new Set<(events: ChangeEvent[]) => void>();
const watcher = watchRoot(root, (events) => listeners.forEach((fn) => fn(events)));

const here = path.dirname(fileURLToPath(import.meta.url));
const app = createApp({
  root,
  token,
  version,
  clientDir: path.resolve(here, "../client"),
  subscribe: (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
});

const infoFile = path.join(root, ".meta-notes-cache", "ui", "server.json");

const server = serve({ fetch: app.fetch, hostname: host, port: Number(values.port) }, async (addr: AddressInfo) => {
  const shown = host.includes(":") ? `[${host}]` : host;
  const info: ServerInfo = {
    pid: process.pid,
    host,
    port: addr.port,
    url: `http://${shown}:${addr.port}`,
    version,
  };
  await mkdir(path.dirname(infoFile), { recursive: true });
  await writeFile(infoFile, JSON.stringify(info, null, 2) + "\n");
  console.log(`meta-notes-ui ${version} listening on ${info.url}`);
});

let stopping = false;
function stop(): void {
  if (stopping) return;
  stopping = true;
  watcher.close();
  server.close();
  process.exit(0);
}
process.on("exit", () => rmSync(infoFile, { force: true }));
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
