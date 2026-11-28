import { startServer, UsageError, type RunningServer } from "./start.js";

let running: RunningServer;
try {
  running = await startServer(process.argv.slice(2));
} catch (err) {
  if (!(err instanceof UsageError)) throw err;
  console.error(err.message);
  process.exit(2);
}
console.log(`meta-notes-ui ${running.info.version} listening on ${running.info.url}`);

let stopping = false;
function stop(): void {
  if (stopping) return;
  stopping = true;
  // close() bounds the flush, so a hung push cannot hang shutdown.
  void running.close().finally(() => process.exit(0));
}
process.on("exit", () => void running.close());
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
