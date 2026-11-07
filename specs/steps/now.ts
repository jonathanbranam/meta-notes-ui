import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect } from "vitest";
import type { Steps } from "vitest-bridle";
import { createApp } from "../../server/app.js";
import { makeExampleRoot } from "../../server/example.js";
import type { TodayResponse } from "../../shared/types.js";
import { parseTimeBlock } from "../../shared/today.js";
import { blocksOf, closedEntry, doneMessage, hm, nowState, shortTime, timers } from "../../client/src/now";
import { appendBody, parseTimeLog } from "../../client/src/timelog";

const TOKEN = "now-token";
type World = Record<string, any>;

const clock12 = (min: number) => `${Math.floor(min / 60) % 12 || 12}:${String(min % 60).padStart(2, "0")}${min >= 720 ? "pm" : "am"}`;
const min = (s: string) => {
  const [h, m] = s.replace(/am|pm/i, "").split(":").map(Number);
  return h * 60 + m + (/pm/i.test(s) && h !== 12 ? 720 : 0);
};

/** A daily note: Time Block rows of `[plan, from, to]` (quarter hours, inclusive) and a Log of `[name, start, end]`. */
function note(plans: [string, string, string][], log: [string, string, string?][]): string {
  const rows = plans.flatMap(([plan, from, to]) => {
    const out: string[] = [];
    for (let m = min(from); m <= min(to); m += 15) out.push(`| ${clock12(m)} | ${plan} | |`);
    return out;
  });
  const entries = log.map(([n, s, e]) => `- ${n}:\n  * start: ${s}${e ? `\n  * end: ${e}` : ""}`).join("\n");
  return `# Daily\n\n### Log\n\n${entries}\n\n### Time Block\n\n| Time | Plan | Actual |\n| --- | --- | --- |\n${rows.join("\n")}\n`;
}

const DRIVE: [string, string, string] = ["Drive to work", "7:45am", "8:00am"];

/** The world's app over a temp copy of the example notes with today's daily note replaced by `text`. */
async function setup(w: World, text: string) {
  if (!w.app) {
    const { root, daily } = await makeExampleRoot();
    w.root = root;
    w.daily = daily;
    w.app = createApp({ root, token: TOKEN, version: "0.0.0", subscribe: () => () => {} });
  }
  await writeFile(path.join(w.root, w.daily), text);
  w.text = text;
}

const read = (w: World) => readFile(path.join(w.root, w.daily), "utf8");
const timeBlockOf = (t: string) => t.slice(t.indexOf("### Time Block"));

async function post(w: World, url: string, body: unknown) {
  const res = await (w.app as ReturnType<typeof createApp>).request(url, {
    method: "POST",
    headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  w.status = res.status;
  w.reply = await res.json();
  expect(w.reply.ok, JSON.stringify(w.reply)).toBe(true);
}

export function nowSteps(steps: Steps) {
  steps.when(/^a daily note plans "Drive to work" at 7:45am and 8:00am, "work" from 8:15am to 9:30am, and "no plan" at 9:45am$/, (w) => {
    w.blocks = blocksOf(parseTimeBlock(note([DRIVE, ["work", "8:15am", "9:30am"], ["no plan", "9:45am", "9:45am"]], [])));
  });
  steps.then(/^the blocks are "Drive to work" 7:45-8:15 and "work" 8:15-9:45$/, (w) => {
    expect(w.blocks).toEqual([
      { plan: "Drive to work", start: 465, end: 495 },
      { plan: "work", start: 495, end: 585 },
    ]);
  });

  steps.when(/^the log's last entry "Drive to work" started at 07:50 with no end, in a block planned until 8:15, and it is (\d+):(\d+)$/, (w, h, m) => {
    const state = nowState(note([DRIVE], [["Drive to work", "07:50"]]), Number(h) * 60 + Number(m));
    w.timers = timers(state, (Number(h) * 60 + Number(m)) * 60);
  });
  steps.then(/^the time worked is (\d+) minutes$/, (w, n) => expect(w.timers.worked).toBe(Number(n) * 60));
  steps.then(/^the overage is (\d+)(?: minutes)?$/, (w, n) => expect(w.timers.over).toBe(Number(n) * 60));

  steps.when(/^the log's last entry is finished and it is 8:20 with "work" planned from 8:15 to 9:45$/, async (w) => {
    await setup(w, note([["work", "8:15am", "9:30am"]], [["Drive to work", "07:50", "08:10"]]));
    w.state = nowState(w.text, 500);
  });
  steps.then(/^the page shows "work" with nothing running$/, (w) => {
    expect(w.state.running).toBeNull();
    expect(w.state.block.plan).toBe("work");
  });
  steps.then(/^Start appends exactly one entry "- work" starting 08:20 and leaves the finished entry as it was$/, async (w) => {
    await post(w, "/api/timelog/append", appendBody(w.daily, w.state.block.plan, "08:20", parseTimeLog(w.text)!));
    const log = parseTimeLog(await read(w))!;
    expect(log.map((e) => [e.header, e.start, e.end])).toEqual([["- Drive to work:", "07:50", "08:10"], ["- work", "08:20", ""]]);
  });

  steps.when(/^"Drive to work" runs from 07:50, "work" is planned next, and the user presses Done at 8:04$/, async (w) => {
    await setup(w, note([DRIVE, ["work", "8:15am", "9:30am"]], [["Drive to work", "07:50"]]));
    const s = nowState(w.text, 484);
    await post(w, "/api/timelog/append", appendBody(w.daily, s.next!.plan, hm(484), parseTimeLog(w.text)!, true));
  });
  steps.then(/^exactly one entry "- work" is appended starting 08:04$/, async (w) => {
    const log = parseTimeLog(await read(w))!;
    expect(log).toHaveLength(2);
    expect([log[1].header, log[1].start]).toEqual(["- work", "08:04"]);
  });
  steps.then(/^"Drive to work" now ends at 08:04$/, async (w) => expect(parseTimeLog(await read(w))![0].end).toBe("08:04"));
  steps.then(/^the Time Block is unchanged$/, async (w) => expect(timeBlockOf(await read(w))).toBe(timeBlockOf(w.text)));

  steps.when(/^"work" runs from 08:15 with no block after it, and the user presses Done at 9:50$/, async (w) => {
    await setup(w, note([["work", "8:15am", "9:30am"]], [["work", "08:15"]]));
    const s = nowState(w.text, 590);
    expect(s.next).toBeNull();
    await post(w, "/api/timelog/update", { path: w.daily, expect: s.running!.entry.raw, text: closedEntry(s.running!.entry, hm(590)) });
  });
  steps.then(/^no entry is appended$/, async (w) => expect(parseTimeLog(await read(w))).toHaveLength(1));
  steps.then(/^"work" now ends at 09:50$/, async (w) => expect(parseTimeLog(await read(w))![0].end).toBe("09:50"));

  steps.when(/^"Drive to work" ran 7:50 to 8:19 in a block planned until 8:15, followed by "work" until 10:00$/, (w) => {
    w.message = doneMessage(nowState(note([DRIVE, ["work", "8:15am", "9:45am"]], [["Drive to work", "07:50"]]), 499), 499);
  });
  steps.then(/^the message reads "([^"]+)"$/, (w, text) => expect(w.message).toBe(text));

  steps.when(/^the daily note's Time Log gains a finished entry after the page was shown$/, async (w) => {
    await setup(w, note([["work", "8:15am", "9:30am"]], [["work", "08:15"]]));
    await writeFile(path.join(w.root, w.daily), note([["work", "8:15am", "9:30am"]], [["Drive to work", "07:50", "08:10"], ["work", "08:15"]]));
  });
  steps.then(/^a new read of the note shows that entry as the previous one$/, async (w) => {
    const res = await (w.app as ReturnType<typeof createApp>).request("/api/today", { headers: { authorization: `Bearer ${TOKEN}` } });
    const today = (await res.json()) as TodayResponse;
    expect(nowState(today.daily!.text, 500).previous?.header).toBe("- Drive to work:");
  });
  void shortTime;
}
