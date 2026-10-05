import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/** Read the token file; create it (mode 0600) with a random token if absent. */
export async function loadToken(file: string): Promise<string> {
  try {
    const t = (await readFile(file, "utf8")).trim();
    if (t) return t;
  } catch {
    // fall through to create
  }
  const token = randomBytes(24).toString("base64url");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, token + "\n", { mode: 0o600 });
  await chmod(file, 0o600);
  return token;
}

const digest = (s: string) => createHash("sha256").update(s).digest();

export function tokenMatches(expected: string, given: string | undefined): boolean {
  if (!given) return false;
  return timingSafeEqual(digest(expected), digest(given));
}
