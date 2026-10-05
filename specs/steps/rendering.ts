import { writeFile } from "node:fs/promises";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { expect } from "vitest";
import type { Steps } from "vitest-bridle";
import { metaNotes, parseFrontmatter, propText, valueSegments } from "../../client/src/markdown.js";
import { stripFrontmatter } from "../../client/src/notes.js";
import { parseHash } from "../../shared/links.js";
import { EXAMPLE_ROOT } from "../../server/example.js";
import { createApp } from "../../server/app.js";
import { makeFixtureRoot } from "../../server/fixture.js";

const FILES = new Set([
  "area/health.md",
  "project/kitchen/Home.md",
  "plan/daily/26-Q4/2026-10-04 Sun.md",
  "plan/week/26-Q4/2026-09-28.md",
]);
const DAILY = "plan/daily/26-Q4/2026-10-04 Sun.md";
const BLOCK = `### Time Block

| Time    | Plan            | Actual           |
| ------- | --------------- | ---------------- |
|  8:45am | ~feed the dogs~ | slept in         |
|  9:00am | no plan         | email            |
|  9:15am | bridle          |                  |
|  9:30am |                 |                  |
`;

type World = Record<string, any>;

const unescape = (s: string) => s.replace(/\\n/g, "\n").replace(/\\"/g, '"');

/** The page for the world's note, as the browser renders it, with attribute quotes made single. */
function page(w: World): string {
  const ctx = { path: w.path ?? DAILY, files: FILES, today: "2026-10-04", nowMinutes: w.now ?? 9 * 60 + 20, tagAliases: w.aliases };
  const html = renderToStaticMarkup(
    createElement(ReactMarkdown, { remarkPlugins: [remarkGfm, metaNotes(ctx)], children: stripFrontmatter(w.md) }),
  );
  return html.replace(/"/g, "'");
}

const rows = (html: string) => html.split("<tr").slice(1);

export function renderingSteps(steps: Steps) {
  steps.when(/^a note holds "(.*)"$/, (w, md) => void (w.md = unescape(md)));
  steps.when(/^a note holds the code span "(.*)"$/, (w, text) => void (w.md = `\`${text}\``));
  steps.when(/^the note "([^"]+)" holds a Time Block$/, (w, p) => {
    w.path = p;
    w.md = BLOCK;
  });
  steps.when(/^the tag aliases are read from meta-notes for the example root$/, async (w) => {
    const app = createApp({ root: EXAMPLE_ROOT, token: "alias-token", version: "0.0.0", subscribe: () => () => {} });
    const res = await app.request("/api/tag-aliases", { headers: { authorization: "Bearer alias-token" } });
    w.aliases = (await res.json()) as Record<string, string>;
    if (!w.aliases.mtg) {
      const err = new Error("tag aliases skipped: this meta-notes reports no tag_aliases");
      (err as any).skipScenario = true;
      throw err;
    }
  });
  steps.when(/^the time is "(\d+):(\d+)"$/, (w, h, m) => void (w.now = Number(h) * 60 + Number(m)));

  steps.then(/^the page shows a link to "([^"]+)" labelled "([^"]+)"$/, (w, to, label) => {
    expect(page(w)).toContain(`<a href='#${to}' class='wikilink'>${label}</a>`);
  });
  steps.then(/^the page shows "([^"]+)" as a missing link$/, (w, label) => {
    expect(page(w)).toContain(`<span class='wikilink missing' title='No such note'>${label}</span>`);
  });
  steps.then(/^the page shows the code "([^"]+)" and no link$/, (w, text) => {
    const html = page(w);
    expect(html).toContain(`<code>${text}</code>`);
    expect(html).not.toContain("<a ");
  });

  steps.when(/^the address is "([^"]*)"$/, (w, hash) => void (w.hash = hash));
  steps.then(/^it opens the note "([^"]+)" at the heading "([^"]+)"$/, (w, p, heading) => {
    expect(parseHash(w.hash)).toEqual({ path: p, heading });
  });

  steps.then(/^its properties are "(.*)"$/, (w, props) => {
    expect(parseFrontmatter(w.md).map(([k, v]) => `${k}=${propText(v)}`).join("; ")).toBe(props);
  });
  steps.when(/^a property holds "(.*)"$/, (w, text) => void (w.value = text));
  steps.then(/^the value shows a link to "([^"]+)" labelled "([^"]+)"$/, (w, to, label) => {
    const segs = valueSegments(w.value, { path: DAILY, files: FILES, today: "2026-10-04", nowMinutes: 0 });
    expect(segs).toContainEqual({ text: label, href: `#${to}` });
  });
  steps.then(/^the value shows "([^"]+)" as a missing link$/, (w, label) => {
    const segs = valueSegments(w.value, { path: DAILY, files: FILES, today: "2026-10-04", nowMinutes: 0 });
    expect(segs).toContainEqual({ text: label, missing: true });
  });
  steps.then(/^the Log shows "([^"]+)"$/, (w, log) => {
    const found = [...page(w).matchAll(/<span class='logtime'>([^<]*)<\/span>/g)].map((m) => m[1]);
    expect(found.join(", ")).toBe(log);
  });
  steps.then(/^the page contains "([^"]+)"$/, (w, text) => expect(page(w)).toContain(text));
  steps.then(/^it has no properties$/, (w) => expect(parseFrontmatter(w.md)).toEqual([]));
  steps.then(/^its body is "(.*)"$/, (w, body) => expect(stripFrontmatter(w.md)).toBe(unescape(body)));

  steps.then(/^the page marks the tags "([^"]+)"$/, (w, tags) => {
    const found = [...page(w).matchAll(/data-tag='([^']*)'/g)].map((m) => m[1]);
    expect(found.join(", ")).toBe(tags);
  });
  steps.then(/^the page marks no tags$/, (w) => expect(page(w)).not.toContain("data-tag"));

  steps.then(/^the (task|checklist item) "([^"]+)" is (open|done|rescheduled|canceled|partial)( and (?:not )?overdue)?$/, (w, kind, text, status, overdue) => {
    const li = [...page(w).matchAll(/<li class='(task-item [^']*)'[^>]*>(.*?)<\/li>/g)].find((m) => m[2].includes(text));
    expect(li, `${kind} "${text}"`).toBeDefined();
    const classes = li![1].split(" ");
    expect(classes.includes("checklist")).toBe(kind === "checklist item");
    expect(classes).toContain(`status-${status === "rescheduled" ? "moved" : status}`);
    if (overdue) expect(classes.includes("overdue")).toBe(!overdue.includes("not"));
  });
  steps.then(/^the page does not contain "([^"]+)"$/, (w, text) => expect(page(w)).not.toContain(text));
  steps.then(/^the page shows the chips "([^"]+)"$/, (w, chips) => {
    const found = [...page(w).matchAll(/<span class='chip ([^']*)'>([^<]*)<\/span>/g)].map((m) => `${m[1]}: ${m[2]}`);
    expect(found.join(", ")).toBe(chips);
  });

  steps.then(/^the page shows a Time Block$/, (w) => expect(page(w)).toContain("<table class='timeblock'>"));
  steps.then(/^the page shows a table that is not a Time Block$/, (w) => {
    const html = page(w);
    expect(html).toContain("<table");
    expect(html).not.toContain("timeblock");
  });
  steps.then(/^the plan "([^"]+)" is struck through$/, (w, plan) => expect(page(w)).toContain(`<del>${plan}</del>`));
  steps.then(/^the row "([^"]+)" is dimmed$/, (w, time) => {
    expect(rows(page(w)).find((r) => r.includes(time))).toContain("class='noplan'");
  });
  steps.then(/^the highlighted row is "([^"]+)"$/, (w, time) => {
    const now = rows(page(w)).filter((r) => r.includes("class='now'"));
    expect(now).toHaveLength(1);
    expect(now[0]).toContain(time);
  });
  steps.then(/^no row is highlighted$/, (w) => expect(page(w)).not.toContain("class='now'"));

  steps.when(/^the note "([^"]+)" is changed to link to "([^"]+)"$/, async (w, p, link) => {
    const { root } = await makeFixtureRoot();
    w.app = createApp({ root, token: "s3cret-token", version: "0.0.0", subscribe: () => () => {} });
    await writeFile(path.join(root, p), `# A\n\n${link}\n`);
  });
  steps.then(/^the backlinks are "([^"]+)"$/, async (w, list) => {
    expect(((await w.res.json()) as { backlinks: string[] }).backlinks).toEqual(list.split(", "));
  });
  steps.then(/^there are no backlinks$/, async (w) => {
    expect(((await w.res.json()) as { backlinks: string[] }).backlinks).toEqual([]);
  });
}
