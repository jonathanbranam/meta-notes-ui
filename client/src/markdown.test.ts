import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { metaNotes, noteDate, parseClock, parseFrontmatter, type RenderContext } from "./markdown";

const FILES = new Set(["area/health.md", "project/kitchen/Home.md", "plan/daily/26-Q4/2026-10-04 Sun.md"]);
const DAILY = "plan/daily/26-Q4/2026-10-04 Sun.md";

function html(md: string, over: Partial<RenderContext> = {}): string {
  const ctx: RenderContext = { path: DAILY, files: FILES, today: "2026-10-04", nowMinutes: 9 * 60 + 20, ...over };
  return renderToStaticMarkup(createElement(ReactMarkdown, { remarkPlugins: [remarkGfm, metaNotes(ctx)], children: md }));
}

describe("wiki links", () => {
  it("links resolved notes, with alias and folder notes", () => {
    const out = html("See [[area/health|my health]] and [[project/kitchen]].");
    expect(out).toContain('<a href="#area/health.md" class="wikilink">my health</a>');
    expect(out).toContain('<a href="#project/kitchen/Home.md" class="wikilink">project/kitchen</a>');
  });
  it("styles missing targets", () => {
    expect(html("Try [[project/nope]]")).toContain('<span class="wikilink missing" title="No such note">project/nope</span>');
  });
  it("leaves code alone", () => {
    expect(html("`[[area/health]]`")).toContain("<code>[[area/health]]</code>");
  });
});

describe("tags", () => {
  it("marks tags but not headings, anchors or words", () => {
    const out = html("# Title\n\nbuy #next and #Home-1, a#b, [x](http://e.com/#frag)");
    expect(out).toContain('<span class="tag" data-tag="next">#next</span>');
    expect(out).toContain('data-tag="home-1"');
    expect(out).not.toContain('data-tag="b"');
    expect(out).not.toContain('data-tag="frag"');
  });
});

describe("tasks", () => {
  it("shows status and chips; overdue only when open", () => {
    const open = html("- [ ] Order tiles #next 📅 2026-09-28\n- [x] Call plumber 📅 2026-09-20 ✅ 2026-09-22\n");
    expect(open).toContain('class="task-item status-open overdue"');
    expect(open).toContain('class="chip due overdue">📅 2026-09-28</span>');
    expect(open).toContain('class="task-item status-done"');
    expect(open).toContain('class="chip done">✅ 2026-09-22</span>');
    expect(open.match(/overdue/g)).toHaveLength(2);
  });
  it("reads custom statuses and strips the marker", () => {
    const out = html("- [>] Carried 📅 2026-10-10\n- [-] Dropped 🛫 2026-10-01\n- [.] Half ⏳ 2026-10-05\n");
    expect(out).toContain('status-moved');
    expect(out).toContain('status-canceled');
    expect(out).toContain('status-partial');
    expect(out).not.toContain("[&gt;]");
    expect(out).toContain('chip start">🛫 2026-10-01');
    expect(out).toContain('chip scheduled">⏳ 2026-10-05');
  });
  it("shows times and recurrence", () => {
    const out = html("- [ ] Call ⏰ 15:00 🔁 every 2 weeks 📅 2026-10-12\n- [ ] Meet 📅 2026-10-05 15:00\n");
    expect(out).toContain('chip time">⏰ 15:00');
    expect(out).toContain('chip recur">🔁 every 2 weeks');
    expect(out).toContain('chip due">📅 2026-10-05 15:00');
  });
  it("leaves plain checklist items as they are", () => {
    expect(html("- [ ] plain item\n")).toContain("task-item status-open");
  });
});

const BLOCK = `### Time Block

| Time    | Plan            | Actual           |
| ------- | --------------- | ---------------- |
|  8:45am | ~feed the dogs~ | slept in         |
|  9:00am | no plan         | email            |
|  9:15am | bridle          |                  |
|  9:30am |                 |                  |
`;

describe("time block", () => {
  it("strikes single-tilde plans, dims no plan, highlights the current row", () => {
    const out = html(BLOCK);
    expect(out).toContain('<table class="timeblock">');
    expect(out).toContain("<del>feed the dogs</del>");
    expect(out).toContain('<tr class="noplan">');
    const now = out.split("<tr").filter((r) => r.includes('class="now"'));
    expect(now).toHaveLength(1);
    expect(now[0]).toContain("9:15am");
  });
  it("highlights nothing on other days or after the last row", () => {
    expect(html(BLOCK, { path: "plan/daily/26-Q4/2026-10-03 Sat.md" })).not.toContain('class="now"');
    expect(html(BLOCK, { nowMinutes: 11 * 60 })).not.toContain('class="now"');
  });
  it("leaves other tables alone", () => {
    expect(html("| a | b |\n|---|---|\n| 1 | 2 |\n")).not.toContain("timeblock");
  });
});

describe("helpers", () => {
  it("parses clocks and note dates", () => {
    expect(parseClock("8:15am")).toBe(495);
    expect(parseClock("12:00pm")).toBe(720);
    expect(parseClock("12:30am")).toBe(30);
    expect(parseClock("Time")).toBeNull();
    expect(noteDate(DAILY)).toBe("2026-10-04");
    expect(noteDate("area/health.md")).toBeNull();
  });
  it("parses frontmatter properties", () => {
    expect(parseFrontmatter("---\ntitle: Hi\ntags: [a, b]\naliases:\n  - x\n  - y\n---\n# Hi")).toEqual([
      ["title", "Hi"],
      ["tags", "a, b"],
      ["aliases", "x, y"],
    ]);
    expect(parseFrontmatter("# none")).toEqual([]);
  });
});
