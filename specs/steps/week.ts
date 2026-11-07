import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { expect } from "vitest";
import type { Steps } from "vitest-bridle";
import { createApp } from "../../server/app.js";
import { makeExampleRoot } from "../../server/example.js";
import type { WeekResponse } from "../../server/week.js";
import { cascade, type Slot, type SlotInputs } from "../../shared/week.js";

const run = promisify(execFile);
const TOKEN = "week-token";
type World = Record<string, any>;
/** After every date used here, so those days are in the past unless a scenario sets `now`. */
const LATER = "2026-11-10T12:00";
const DUE = "\u{1F4C5}";

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dailyPath = (date: string) => `plan/daily/26-Q4/${date} ${WEEKDAY[new Date(`${date}T12:00:00`).getDay()]}.md`;

async function setup(w: World) {
  if (!w.app) {
    const { root } = await makeExampleRoot();
    w.root = root;
    w.app = createApp({ root, token: TOKEN, version: "0.0.0", subscribe: () => () => {} });
  }
  return w.app as ReturnType<typeof createApp>;
}

async function writeDaily(w: World, date: string, text: string) {
  await setup(w);
  const file = path.join(w.root, dailyPath(date));
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, text);
}

async function getWeek(w: World, start: string, days: number, now = LATER) {
  const app = await setup(w);
  const res = await app.request(`/api/week?start=${start}&days=${days}&now=${now}`, { headers: { authorization: `Bearer ${TOKEN}` } });
  w.status = res.status;
  return res.status === 200 ? ((await res.json()) as WeekResponse) : null;
}

/** `Time Log "x", Actual "y", ...` or `nothing`. */
function inputsOf(s: string): SlotInputs {
  const get = (name: string) => new RegExp(`${name} "([^"]+)"`).exec(s)?.[1];
  return { log: get("Time Log"), actual: get("Actual"), plan: get("Plan"), calendar: get("Calendar") };
}

const block = (rows: [string, string][]) =>
  `\n### Time Block\n\n| Time | Plan | Actual |\n| --- | --- | --- |\n${rows.map(([t, p]) => `| ${t} | ${p} | |`).join("\n")}\n`;
const daily = (log: string, rows: [string, string][] = []) => `# Daily\n\n### Log\n\n${log}\n${block(rows)}`;
const slotAt = (day: WeekResponse["days"][number], hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return day.slots[(h * 60 + m) / 15];
};

/** A one-event calendar export dated in the scenario's week. */
const ICS = [
  "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//mnui//fixture//EN", "X-WR-CALNAME:Fixture",
  "BEGIN:VEVENT", "UID:w1@mnui", "DTSTAMP:20261101T000000Z", "DTSTART:20261103T140000", "DTEND:20261103T150000", "SUMMARY:Fixture standup", "END:VEVENT",
  "BEGIN:VEVENT", "UID:w2@mnui", "DTSTAMP:20261101T000000Z", "DTSTART;VALUE=DATE:20261104", "DTEND;VALUE=DATE:20261105", "SUMMARY:Fixture holiday", "END:VEVENT",
  "END:VCALENDAR", "",
].join("\r\n");

export function weekSteps(steps: Steps) {
  steps.when(/^a slot has (.+), and it is (before|after) now$/, (w, what, when) => {
    w.slot = cascade(540, when === "after", inputsOf(what));
  });
  steps.when(/^a slot has nothing, and it is (before|after) now$/, (w, when) => {
    w.slot = cascade(540, when === "after", {});
  });
  steps.then(/^the slot shows the (log|actual|plan|calendar) "([^"]+)" with (no badge|badge "([^"]+)")$/, (w, kind, text, _b, badge) => {
    const s = w.slot as Slot;
    expect([s.kind, s.text, s.badge]).toEqual([kind, text, badge]);
  });
  steps.then(/^the slot is empty$/, (w) => expect((w.slot as Slot).kind).toBe("empty"));
  steps.then(/^the slot is an error "([^"]+)" about "([^"]+)"$/, (w, label, text) => {
    const s = w.slot as Slot;
    expect([s.kind, s.error, s.text]).toEqual(["error", label, text]);
  });

  steps.when(/^a past day's Log has a good entry, an entry with two starts, an entry with two ends, an entry with no start and an entry with no end$/, async (w) => {
    await writeDaily(
      w,
      "2026-11-03",
      daily(
        [
          "- good:\n  * start: 08:30\n  * end: 09:00",
          "- twostarts:\n  * start: 09:15\n  * start: 09:20\n  * end: 09:45",
          "- twoends:\n  * start: 10:00\n  * end: 10:30\n  * end: 10:45",
          "- nostart:\n  * end: 11:30",
          "- noend:\n  * start: 12:00\n  * end:",
        ].join("\n"),
      ),
    );
    w.week = await getWeek(w, "2026-11-03", 2);
  });
  steps.then(/^the day shows the good entry normally$/, (w) => {
    const s = slotAt(w.week.days[0], "08:30");
    expect([s.kind, s.text, s.badge]).toEqual(["log", "good", undefined]);
    expect(slotAt(w.week.days[0], "08:45").kind).toBe("log");
  });
  steps.then(/^the day has error slots "([^"]+)", "([^"]+)", "([^"]+)" and "([^"]+)"$/, (w, ...labels) => {
    const found = (w.week.days[0].slots as Slot[]).filter((s) => s.kind === "error").map((s) => s.error);
    expect(found.sort()).toEqual([...labels].sort());
  });

  steps.when(/^today's last Log entry started at 10:15 with no end and it is 10:50$/, async (w) => {
    await writeDaily(w, "2026-11-03", daily("- before:\n  * start: 09:00\n  * end: 10:00\n- running:\n  * start: 10:15\n  * end:"));
    w.week = await getWeek(w, "2026-11-03", 2, "2026-11-03T10:50");
  });
  steps.then(/^that entry fills the slots from 10:15 to 10:45$/, (w) => {
    for (const t of ["10:15", "10:30", "10:45"]) expect([slotAt(w.week.days[0], t).kind, slotAt(w.week.days[0], t).text]).toEqual(["log", "running"]);
    expect(slotAt(w.week.days[0], "11:00").kind).toBe("empty");
  });
  steps.then(/^the day has no error slots$/, (w) => {
    expect(w.week.days[0].slots.filter((s: Slot) => s.kind === "error")).toEqual([]);
    expect(w.week.days[0].logErrors).toEqual([]);
  });

  steps.when(/^the week is requested without a token$/, async (w) => {
    const app = await setup(w);
    w.status = (await app.request("/api/week?start=2026-11-02&days=7")).status;
  });
  steps.then(/^the week is refused$/, (w) => expect(w.status).toBe(401));

  steps.when(/^the week is requested from 2026-11-02 for 7, 5 and 2 days, and for 3 days$/, async (w) => {
    w.weeks = [await getWeek(w, "2026-11-02", 7), await getWeek(w, "2026-11-02", 5), await getWeek(w, "2026-11-02", 2)];
    w.refused = (await getWeek(w, "2026-11-02", 3)) === null ? w.status : 0;
  });
  steps.then(/^the replies hold 7, 5 and 2 days of 96 slots, and the 3-day request is refused$/, (w) => {
    expect((w.weeks as WeekResponse[]).map((x) => x.days.length)).toEqual([7, 5, 2]);
    for (const x of w.weeks as WeekResponse[]) for (const d of x.days) expect(d.slots).toHaveLength(96);
    expect((w.weeks[0] as WeekResponse).days.map((d) => d.date)).toEqual(["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08"]);
    expect(w.refused).toBe(400);
  });

  steps.when(/^the week is requested for a day with a daily note holding a Time Block plan "([^"]+)" at 9:00am, and a day with none$/, async (w) => {
    await writeDaily(w, "2026-11-03", daily("", [["9:00am", "Review"]]));
    const before = await readFile(path.join(w.root, dailyPath("2026-11-03")), "utf8");
    w.week = await getWeek(w, "2026-11-02", 2);
    expect(await readFile(path.join(w.root, dailyPath("2026-11-03")), "utf8")).toBe(before);
  });
  steps.then(/^the day with the note shows the plan "([^"]+)" at 9:00$/, (w, plan) => {
    const d = w.week.days[1];
    expect(d.note).toBe(dailyPath("2026-11-03"));
    expect(slotAt(d, "09:00").kind).toBe("plan");
    expect(slotAt(d, "09:00").text).toBe(plan);
  });
  steps.then(/^the day without a note has no plan or log slots$/, (w) => {
    const d = w.week.days[0];
    expect(d.note).toBeNull();
    expect(d.slots.every((s: Slot) => s.kind === "empty")).toBe(true);
  });

  steps.when(/^the week is requested for days holding the tasks "([^"]+)" due 2026-11-03 and "([^"]+)" due 2026-11-05$/, async (w, a, b) => {
    await setup(w);
    await writeFile(path.join(w.root, "project/week-tasks.md"), `- [ ] ${a} ${DUE} 2026-11-03\n- [ ] ${b} ${DUE} 2026-11-05\n`);
    w.week = await getWeek(w, "2026-11-02", 7);
  });
  steps.then(/^(\d{4}-\d{2}-\d{2}) lists "([^"]+)" and no other day does$/, (w, date, text) => {
    for (const d of w.week.days) expect(d.tasks.some((t: any) => t.text.includes(text))).toBe(d.date === date);
  });
  steps.then(/^(\d{4}-\d{2}-\d{2}) lists "([^"]+)"$/, (w, date, text) => {
    expect(w.week.days.find((d: any) => d.date === date).tasks.some((t: any) => t.text.includes(text))).toBe(true);
  });

  steps.when(/^the week is requested for a root with a calendar export holding "([^"]+)" at 14:00 on 2026-11-03 and an all-day "([^"]+)" on 2026-11-04$/, async (w) => {
    await setup(w);
    try {
      await run("meta-notes", ["init", "--root", w.root]);
      await run(path.join(w.root, ".venv/bin/python3"), ["-c", "import icalendar, recurring_ical_events"]);
    } catch (e) {
      const err = new Error(`calendar skipped: cannot build the root's .venv (${(e as Error).message.split("\n")[0]})`);
      (err as any).skipScenario = true;
      throw err;
    }
    await mkdir(path.join(w.root, ".meta-notes-cache/ics"), { recursive: true });
    await writeFile(path.join(w.root, ".meta-notes-cache/ics/fixture.ics"), ICS);
    w.week = await getWeek(w, "2026-11-02", 7);
  });
  steps.then(/^(\d{4}-\d{2}-\d{2}) shows "([^"]+)" with badge "([^"]+)" at 14:00$/, (w, date, text, badge) => {
    const s = slotAt(w.week.days.find((d: any) => d.date === date), "14:00");
    expect([s.kind, s.text, s.badge]).toEqual(["calendar", text, badge]);
  });
  steps.then(/^(\d{4}-\d{2}-\d{2}) lists the all-day event "([^"]+)"$/, (w, date, text) => {
    expect(w.week.days.find((d: any) => d.date === date).allDay).toContain(text);
  });
}
