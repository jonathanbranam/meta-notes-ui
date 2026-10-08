import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { chmod, mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

/** Session lifetime; each use pushes it out again. */
export const SESSION_MS = 30 * 24 * 60 * 60 * 1000;
/** Sliding expiry is written back at most this often. */
const PERSIST_MS = 60 * 60 * 1000;
const KEYLEN = 64;
const SCRYPT = { N: 16384, r: 8, p: 1 };

interface LoginFile {
  username: string;
  salt: string;
  hash: string;
  N: number;
  r: number;
  p: number;
}

const derive = (password: string, salt: Buffer, o: { N: number; r: number; p: number }) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, KEYLEN, { ...o, maxmem: 128 * o.N * o.r * 2 }, (err, key) => (err ? reject(err) : resolve(key))),
  );

const digest = (s: string) => createHash("sha256").update(s).digest();
const sameString = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

/** Where the login and the sessions live, under the notes root. */
export const loginFile = (root: string) => path.join(root, ".meta-notes-cache", "ui", "login");
export const sessionsFile = (root: string) => path.join(root, ".meta-notes-cache", "ui", "sessions.json");

async function writePrivate(file: string, text: string): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, text, { mode: 0o600 });
  await chmod(tmp, 0o600);
  await rename(tmp, file);
}

/** Write the one login (scrypt, random salt, mode 0600) and revoke every session. */
export async function createLogin(root: string, username: string, password: string): Promise<void> {
  if (!username || !password) throw new Error("a username and a password are required");
  const salt = randomBytes(16);
  const hash = await derive(password, salt, SCRYPT);
  const body: LoginFile = { username, salt: salt.toString("base64"), hash: hash.toString("base64"), ...SCRYPT };
  await rm(sessionsFile(root), { force: true });
  await writePrivate(loginFile(root), JSON.stringify(body) + "\n");
}

/** Check a username and password. Always does the scrypt work, so timing does not tell which was wrong. */
export async function verifyLogin(file: LoginFile, username: string, password: string): Promise<boolean> {
  const key = await derive(password, Buffer.from(file.salt, "base64"), file);
  const right = Buffer.from(file.hash, "base64");
  const hashOk = key.length === right.length && timingSafeEqual(key, right);
  return sameString(file.username, username) && hashOk;
}

/** The login and the sessions of one notes root; the login file is stat-ed on use, so no polling. */
export function createLoginStore(root: string, now: () => number = Date.now) {
  let cached: { sig: string; login: LoginFile | null } = { sig: "", login: null };
  /** sha256 hex of the session id -> expiry (ms). The id itself is never stored. */
  let sessions = new Map<string, { expires: number; saved: number }>();

  async function loadSessions(): Promise<void> {
    sessions = new Map();
    try {
      const raw = JSON.parse(await readFile(sessionsFile(root), "utf8")) as Record<string, number>;
      for (const [id, expires] of Object.entries(raw)) if (typeof expires === "number") sessions.set(id, { expires, saved: expires });
    } catch {
      // none yet
    }
  }

  async function saveSessions(): Promise<void> {
    const live: Record<string, number> = {};
    for (const [id, s] of sessions) {
      if (s.expires > now()) {
        live[id] = s.expires;
        s.saved = s.expires;
      }
    }
    await writePrivate(sessionsFile(root), JSON.stringify(live) + "\n");
  }

  /** The current login, or null when there is none. A changed login file drops the sessions. */
  async function current(): Promise<LoginFile | null> {
    const file = loginFile(root);
    let sig = "";
    try {
      const st = await stat(file);
      sig = `${st.mtimeMs}:${st.size}`;
    } catch {
      // no login file
    }
    if (sig !== cached.sig) {
      let login: LoginFile | null = null;
      if (sig) {
        try {
          login = JSON.parse(await readFile(file, "utf8")) as LoginFile;
        } catch {
          login = null;
        }
      }
      cached = { sig, login };
      await loadSessions();
    }
    return cached.login;
  }

  return {
    current,
    /** Start a session; returns the id for the cookie. */
    async start(): Promise<string> {
      const id = randomBytes(32).toString("base64url");
      const expires = now() + SESSION_MS;
      sessions.set(digest(id).toString("hex"), { expires, saved: expires });
      await saveSessions();
      return id;
    },
    /** Is the id a live session? Slides the expiry. */
    async valid(id: string | undefined): Promise<boolean> {
      if (!id) return false;
      const key = digest(id).toString("hex");
      const s = sessions.get(key);
      if (!s) return false;
      if (s.expires <= now()) {
        sessions.delete(key);
        return false;
      }
      s.expires = now() + SESSION_MS;
      if (s.expires - s.saved > PERSIST_MS) await saveSessions();
      return true;
    },
    async revoke(id: string | undefined): Promise<void> {
      if (!id) return;
      if (sessions.delete(digest(id).toString("hex"))) await saveSessions();
    },
  };
}

export type LoginStore = ReturnType<typeof createLoginStore>;
