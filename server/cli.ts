import { realpath, stat } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { createLogin } from "./login.js";

export const CLI_USAGE = "usage: meta-notes-ui create-login <username> [<password>] [--root <notes root>]";

/** The notes root: --root, else the nearest directory upward from `from` that holds `.meta-notes`. */
export async function findRoot(given: string | undefined, from: string): Promise<string> {
  if (given) return realpath(given);
  for (let dir = from; ; dir = path.dirname(dir)) {
    if (await stat(path.join(dir, ".meta-notes")).then((s) => s.isDirectory(), () => false)) return realpath(dir);
    if (dir === path.dirname(dir)) throw new Error("no notes root found here; pass --root");
  }
}

/** Input read past the end of a line (piped input arrives in one chunk). */
let leftover = "";

/** Read a line from the terminal without echoing it (a plain line when stdin is not a terminal). */
export async function promptHidden(label: string): Promise<string> {
  const stdin = process.stdin;
  process.stderr.write(label);
  return new Promise((resolve) => {
    let line = "";
    let done = false;
    const finish = (rest: string) => {
      done = true;
      leftover = rest;
      if (stdin.isTTY) stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
      stdin.removeListener("end", onEnd);
      process.stderr.write("\n");
      resolve(line);
    };
    const feed = (text: string) => {
      for (let i = 0; i < text.length && !done; i++) {
        const ch = text[i];
        if (ch === "\n" || ch === "\r" || ch === "\x04") return finish(text.slice(i + 1));
        if (ch === "\x03") process.exit(130);
        if (ch === "\x7f" || ch === "\b") line = line.slice(0, -1);
        else line += ch;
      }
    };
    const onData = (buf: Buffer) => feed(buf.toString("utf8"));
    const onEnd = () => finish("");
    const first = leftover;
    leftover = "";
    feed(first);
    if (done) return;
    if (stdin.isTTY) stdin.setRawMode(true);
    stdin.on("end", onEnd);
    stdin.on("data", onData);
    stdin.resume();
  });
}

/** `create-login <username> [<password>]`; returns the exit status. */
export async function runCli(argv: string[], cwd: string = process.cwd()): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: { root: { type: "string" }, help: { type: "boolean", short: "h" } },
  });
  if (values.help) {
    console.log(CLI_USAGE);
    return 0;
  }
  const [cmd, username, given] = positionals;
  if (cmd !== "create-login" || !username || positionals.length > 3) {
    console.error(CLI_USAGE);
    return 2;
  }
  let password = given;
  if (password === undefined) {
    password = await promptHidden("Password: ");
    if (password !== (await promptHidden("Again: "))) {
      console.error("The passwords differ; nothing changed.");
      return 1;
    }
  }
  if (!password) {
    console.error("The password is empty; nothing changed.");
    return 1;
  }
  const root = await findRoot(values.root, cwd);
  await createLogin(root, username, password);
  console.log(`Login "${username}" set for ${root}; every session is revoked and the token no longer works.`);
  return 0;
}
