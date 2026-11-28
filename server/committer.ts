import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { CommitStatus } from "../shared/types.js";
import { isHidden } from "./paths.js";

/**
 * Commits (and pushes) the notes the server's own writes touched, in batches (design/specs/commits.md).
 * One timer, restarted by each write; no polling. Only the recorded paths are added and committed.
 */
export interface Committer {
  /** Run a notes write and record the root-relative paths `paths` names from its result. */
  write<T>(run: () => Promise<T>, paths: (result: T) => string[]): Promise<T>;
  /** Commit the pending paths and push now. Never rejects; a failure shows in `status()`. */
  flush(): Promise<void>;
  /** Flush for shutdown, giving up (and stopping git) after `timeoutMs`; what is left stays pending. */
  close(timeoutMs?: number): Promise<void>;
  status(): CommitStatus;
  subscribe(fn: (status: CommitStatus) => void): () => void;
}

/** For an app that commits nothing. */
export const NO_COMMITS: Committer = {
  write: (run) => run(),
  flush: async () => {},
  close: async () => {},
  status: () => ({ error: null }),
  subscribe: () => () => {},
};

export const COMMIT_DELAY_MS = 60_000;
/** Under the 10 s `meta-notes ui stop` waits. */
export const CLOSE_TIMEOUT_MS = 8_000;
const GIT_TIMEOUT_MS = 60_000;

/** Variables that would point git at some other repository. */
const REPO_VARS = ["GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE", "GIT_COMMON_DIR", "GIT_OBJECT_DIRECTORY", "GIT_NAMESPACE"];

function gitEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, GIT_TERMINAL_PROMPT: "0", GCM_INTERACTIVE: "never", SSH_ASKPASS_REQUIRE: "never" };
  for (const v of REPO_VARS) delete env[v];
  return env;
}

/** The last lines of git's complaint, without any password in a remote URL. */
function reason(e: unknown): string {
  const err = e as { stderr?: string; stdout?: string; message?: string };
  const text = (err.stderr || err.stdout || err.message || String(e)).trim();
  return text.replace(/\/\/[^/@\s]+@/g, "//").split("\n").slice(-4).join("\n").slice(0, 400);
}

/** `root` must be a real path. `stateFile` keeps what is not yet committed or pushed across restarts. */
export function createCommitter(opts: { root: string; delayMs?: number; stateFile?: string }): Committer {
  const { root } = opts;
  const delay = opts.delayMs ?? COMMIT_DELAY_MS;
  const stateFile = opts.stateFile ?? path.join(root, ".meta-notes-cache", "ui", "commits.json");
  const abort = new AbortController();

  // Path to the number of the write that last touched it: a write during a commit keeps its path pending.
  const pending = new Map<string, number>();
  let writes = 0;
  let unpushed = false;
  let error: string | null = null;
  let timer: NodeJS.Timeout | undefined;
  let closed = false;
  let queue: Promise<void> = Promise.resolve();
  const inFlight = new Set<Promise<unknown>>();
  const listeners = new Set<(status: CommitStatus) => void>();

  const save = () => {
    try {
      mkdirSync(path.dirname(stateFile), { recursive: true });
      writeFileSync(stateFile, JSON.stringify({ paths: [...pending.keys()], unpushed }) + "\n");
    } catch (e) {
      console.error(`meta-notes-ui: cannot save ${stateFile}: ${reason(e)}`);
    }
  };

  const setError = (next: string | null) => {
    if (next === error) return;
    error = next;
    if (next) console.error(`meta-notes-ui: ${next}`);
    listeners.forEach((fn) => fn({ error }));
  };

  const git = (args: string[]) =>
    new Promise<string>((resolve, reject) => {
      execFile(
        "git",
        ["--literal-pathspecs", ...args],
        { cwd: root, env: gitEnv(), timeout: GIT_TIMEOUT_MS, maxBuffer: 1 << 24, signal: abort.signal },
        (err, stdout, stderr) => (err ? reject(Object.assign(err, { stdout, stderr })) : resolve(stdout)),
      );
    });
  const succeeds = (args: string[]) => git(args).then(() => true, () => false);

  /** True only when the root is itself the top of a work tree: never commit into a repository around it. */
  async function isRepo(): Promise<boolean> {
    if (!existsSync(path.join(root, ".git"))) return false;
    const top = (await git(["rev-parse", "--show-toplevel"])).replace(/\n$/, "");
    return realpathSync(top) === root;
  }

  async function commit(): Promise<void> {
    const batch = new Map(pending);
    if (!batch.size) return;
    const status = await git(["status", "--porcelain=v1", "-z", "--no-renames", "--untracked-files=all", "--", ...batch.keys()]);
    const entries = status.split("\0").filter(Boolean).map((e) => ({ x: e[0]!, y: e[1]!, path: e.slice(3) }));
    if (entries.length) {
      // Adding a conflicted file would mark it resolved, and a rebase leaves HEAD detached.
      if (entries.some((e) => e.x === "U" || e.y === "U" || (e.x === e.y && (e.x === "A" || e.x === "D")))) throw new Error("the notes repo has merge conflicts");
      if (await succeeds(["rev-parse", "-q", "--verify", "MERGE_HEAD"])) throw new Error("the notes repo is in the middle of a merge");
      if (!(await succeeds(["symbolic-ref", "-q", "HEAD"]))) throw new Error("the notes repo is not on a branch (rebase in progress?)");
      const unstaged = entries.filter((e) => e.y !== " ").map((e) => e.path);
      if (unstaged.length) await git(["add", "-A", "--", ...unstaged]);
      const paths = entries.map((e) => e.path);
      // With paths, only they are committed: what someone else staged stays staged.
      await git(["commit", "-q", "-m", `meta-notes-ui: ${paths.length} notes updated`, "-m", paths.join("\n"), "--", ...paths]);
      unpushed = true;
    }
    for (const [p, n] of batch) if (pending.get(p) === n) pending.delete(p);
    save();
  }

  async function push(): Promise<void> {
    if (!unpushed) return;
    if ((await git(["remote"])).trim()) {
      const env = process.env.GIT_SSH_COMMAND || process.env.GIT_SSH || (await succeeds(["config", "core.sshCommand"]));
      // ssh must fail rather than ask for a passphrase.
      await git([...(env ? [] : ["-c", "core.sshCommand=ssh -o BatchMode=yes"]), "push", "-q"]);
    }
    unpushed = false;
    save();
  }

  async function run(): Promise<void> {
    // Nothing to do: leave git alone.
    if (!pending.size && !unpushed) return setError(null);
    let step = "commit";
    try {
      if (!(await isRepo())) {
        pending.clear();
        unpushed = false;
        save();
      } else {
        await commit();
        step = "push";
        await push();
      }
      setError(null);
    } catch (e) {
      // A failed commit can still leave an earlier one to push.
      if (step === "commit") await push().catch(() => {});
      setError(`${step} failed: ${reason(e)}`);
    }
  }

  const flush = () => {
    clearTimeout(timer);
    return (queue = queue.then(run));
  };

  const arm = () => {
    clearTimeout(timer);
    if (!closed) timer = setTimeout(() => void flush(), delay);
  };

  const record = (paths: string[]) => {
    let added = false;
    for (const p of paths) {
      const rel = path.posix.normalize(p);
      if (isHidden(rel) || path.isAbsolute(rel) || rel.startsWith("..")) continue;
      pending.set(rel, ++writes);
      added = true;
    }
    if (!added) return;
    save();
    arm();
  };

  try {
    const kept = JSON.parse(readFileSync(stateFile, "utf8")) as { paths?: unknown; unpushed?: unknown };
    unpushed = kept.unpushed === true;
    if (Array.isArray(kept.paths)) for (const p of kept.paths) if (typeof p === "string") pending.set(p, ++writes);
    if (pending.size || unpushed) arm();
  } catch {
    // nothing kept
  }

  return {
    write(op, paths) {
      const done = op().then((result) => {
        record(paths(result));
        return result;
      });
      inFlight.add(done);
      const forget = () => void inFlight.delete(done);
      done.then(forget, forget);
      return done;
    },
    flush,
    async close(timeoutMs = CLOSE_TIMEOUT_MS) {
      if (closed) return;
      closed = true;
      clearTimeout(timer);
      let bound!: NodeJS.Timeout;
      const gaveUp = new Promise<void>((resolve) => {
        bound = setTimeout(() => {
          abort.abort();
          resolve();
        }, timeoutMs);
      });
      await Promise.race([Promise.allSettled(inFlight).then(flush), gaveUp]);
      clearTimeout(bound);
    },
    status: () => ({ error }),
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
