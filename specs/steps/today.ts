import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect } from "vitest";
import type { Steps } from "vitest-bridle";
import type { TodayResponse, TodayTask } from "../../shared/types.js";
import { createApp } from "../../server/app.js";
import { makeExampleRoot } from "../../server/example.js";
import { buildAlerts, currentRow, isPlanned, parseTimeBlock } from "../../client/src/today";

const TOKEN = "today-token";
type World = Record<string, any>;
const APP_FILES = ["/manifest.webmanifest", "/sw.js", "/icon-192.png", "/icon-512.png"];

const SAMPLE_NOTE = `# Daily

### Time Block

| Time    | Plan        | Actual |
| ------- | ----------- | ------ |
|  8:00am |             |        |
|  8:30am | start work  |        |
|  9:00am | no plan     |        |
|  9:30am | ~old~       |        |
| 12:15pm | lunch       |        |

## Other
| 1:00pm | nope |
`;

const SAMPLE_TASKS: TodayTask[] = [
  { file: "a.md", line: 3, text: "- [ ] Call the dentist ⏰ 09:30 📅 2026-10-04", due: "2026-10-04", time: "09:30" },
  { file: "a.md", line: 4, text: "- [ ] old ⏰ 09:30 📅 2026-10-01", due: "2026-10-01", time: "09:30" },
  { file: "a.md", line: 5, text: "- [ ] untimed 📅 2026-10-04", due: "2026-10-04", time: null },
];

/** The world's app over a temp copy of the example notes, serving the real client/public files. */
async function appFor(w: World) {
  if (!w.app) {
    const { root, daily } = await makeExampleRoot();
    w.daily = daily;
    w.app = createApp({
      root,
      token: TOKEN,
      version: "0.0.0",
      clientDir: path.resolve("client/public"),
      subscribe: () => () => {},
    });
  }
  return w.app as ReturnType<typeof createApp>;
}

async function getAll(w: World, urls: string[], token?: string) {
  const app = await appFor(w);
  const headers: Record<string, string> = token ? { authorization: `Bearer ${token}` } : {};
  w.responses = await Promise.all(urls.map((u) => app.request(u, { headers })));
}

export function todaySteps(steps: Steps) {
  steps.when(/^the Today view is requested without a token$/, (w) => getAll(w, ["/api/today"]));
  steps.when(/^the Today view is requested with the right token$/, async (w) => {
    await getAll(w, ["/api/today"], TOKEN);
    w.today = (await w.responses[0].json()) as TodayResponse;
  });
  steps.then(/^the Today view is refused$/, (w) => expect(w.responses[0].status).toBe(401));
  steps.then(/^the Today view holds the daily note with the text "([^"]+)"$/, (w, text) => {
    expect(w.today.daily?.path).toBe(w.daily);
    expect(w.today.daily?.text).toContain(text);
  });
  steps.then(/^the Today view lists the task "([^"]+)" at "([^"]+)"$/, (w, text, time) => {
    expect(w.today.tasks.some((t: TodayTask) => t.text.includes(text) && t.time === time)).toBe(true);
  });

  steps.when(/^the Time Block of the sample daily note is read$/, (w) => {
    w.rows = parseTimeBlock(SAMPLE_NOTE);
  });
  steps.then(/^the rows are "([^"]+)"$/, (w, list) => {
    expect(w.rows.map((r: any) => `${r.minutes}=${r.plan}`).join(", ")).toBe(list);
  });
  steps.then(/^the planned rows are "([^"]+)"$/, (w, list) => {
    expect(w.rows.filter((r: any) => isPlanned(r.plan)).map((r: any) => r.minutes).join(", ")).toBe(list);
  });
  steps.then(/^at minute (\d+) the current row starts at minute (\d+)$/, (w, now, start) => {
    expect(w.rows[currentRow(w.rows, Number(now))].minutes).toBe(Number(start));
  });
  steps.then(/^at minute (\d+) there is no current row$/, (w, now) => {
    expect(currentRow(w.rows, Number(now))).toBe(-1);
  });

  steps.when(/^alerts are built for 2026-10-04 from the sample tasks and the sample daily note$/, (w) => {
    w.alerts = buildAlerts(new Date(2026, 9, 4, 6, 0), "2026-10-04", SAMPLE_TASKS, parseTimeBlock(SAMPLE_NOTE));
  });
  steps.then(/^the alerts are "([^"]+)"$/, (w, list) => {
    expect(w.alerts.map((a: any) => a.title).join(", ")).toBe(list);
  });

  steps.when(/^the app files are requested without a token$/, (w) => getAll(w, APP_FILES));
  steps.when(/^the app files are requested with the right token$/, (w) => getAll(w, APP_FILES, TOKEN));
  steps.then(/^none is served$/, (w) => {
    for (const r of w.responses) expect(r.status).toBe(401);
  });
  steps.then(/^all are served$/, (w) => {
    for (const r of w.responses) expect(r.status).toBe(200);
  });
  steps.then(/^the manifest has the type "([^"]+)" and the display "([^"]+)"$/, async (w, type, display) => {
    expect(w.responses[0].headers.get("content-type")).toContain(type);
    expect(JSON.parse(await readFile("client/public/manifest.webmanifest", "utf8")).display).toBe(display);
  });
}
