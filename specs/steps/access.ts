import { expect } from "vitest";
import type { Steps } from "vitest-bridle";
import { createApp } from "../../server/app.js";
import { makeFixtureRoot } from "../../server/fixture.js";

const TOKEN = "s3cret-token";

async function appFor(world: Record<string, any>) {
  if (!world.app) {
    const { root } = await makeFixtureRoot();
    world.app = createApp({ root, token: TOKEN, version: "0.0.0", subscribe: () => () => {} });
  }
  return world.app as ReturnType<typeof createApp>;
}

async function get(world: Record<string, any>, url: string, token?: string) {
  const app = await appFor(world);
  const headers: Record<string, string> = token ? { authorization: `Bearer ${token}` } : {};
  world.res = await app.request(url, { headers });
}

export function accessSteps(steps: Steps) {
  steps.when(/^a client requests "([^"]+)" without a token$/, (w, url) => get(w, url));
  steps.when(/^a client requests "([^"]+)" with the token "([^"]+)"$/, (w, url, t) => get(w, url, t));
  steps.when(/^a client requests "([^"]+)" with the right token$/, (w, url) => get(w, url, TOKEN));
  steps.when(/^a client requests the note "([^"]+)" with the right token$/, (w, p) =>
    get(w, `/api/note?path=${encodeURIComponent(p)}`, TOKEN),
  );
  steps.then(/^the response status is (\d+)$/, (w, n) => expect(w.res.status).toBe(Number(n)));
  steps.then(/^the note is served$/, (w) => expect(w.res.status).toBe(200));
  steps.then(/^the note is not served$/, async (w) => {
    expect(w.res.status).toBeGreaterThanOrEqual(400);
    expect(await w.res.text()).not.toContain("secret");
  });
}
