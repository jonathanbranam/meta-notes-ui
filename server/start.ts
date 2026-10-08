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

export const USAGE = "usage: node index.js --root <notes root> --token-file <path> [--port N] [--host H] [--bridle-url U --bridle-token-file F [--bridle-to T]]";

/** Thrown when --root or --token-file is missing; the entry point prints it and exits 2. */
export class UsageError extends Error {}

export interface RunningServer {
  info: ServerInfo;
  infoFile: string;
  /** Stop listening and watching, and remove server.json. */
  close: () => void;
}

/** Start the server from command-line arguments; resolves once it is listening and server.json is written. */
export async function startServer(args: string[]): Promise<RunningServer> {
  const { values } = parseArgs({
    args,
    options: {
      root: { type: "string" },
      port: { type: "string", default: "0" },
      host: { type: "string", default: "127.0.0.1" },
      "token-file": { type: "string" },
      "bridle-url": { type: "string" },
      "bridle-token-file": { type: "string" },
      "bridle-to": { type: "string" },
    },
  });
  if (!values.root || !values["token-file"]) throw new UsageError(USAGE);

  // Messaging is all or none; --bridle-to alone is a mistake too.
  if (!values["bridle-url"] !== !values["bridle-token-file"] || (values["bridle-to"] && !values["bridle-url"])) {
    throw new UsageError("--bridle-url and --bridle-token-file go together (--bridle-to is optional)");
  }
  const message = values["bridle-url"]
    ? { url: values["bridle-url"], tokenFile: values["bridle-token-file"]!, to: values["bridle-to"] ?? "external:advisor" }
    : undefined;

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
    message,
    clientDir: path.resolve(here, "../client"),
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  });

  const infoFile = path.join(root, ".meta-notes-cache", "ui", "server.json");

  let closed = false;
  return new Promise((resolve, reject) => {
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
      resolve({
        info,
        infoFile,
        close: () => {
          if (closed) return;
          closed = true;
          watcher.close();
          server.close();
          rmSync(infoFile, { force: true });
        },
      });
    });
    server.on("error", (err) => {
      watcher.close();
      reject(err);
    });
  });
}
