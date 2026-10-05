import { describe, expect, it } from "vitest";
import type { TreeNode } from "../../shared/types";
import { flattenFiles, quickOpen, stripFrontmatter } from "./notes";

describe("stripFrontmatter", () => {
  it("removes a leading block only", () => {
    expect(stripFrontmatter("---\ntitle: x\n---\n# Hi\n")).toBe("# Hi\n");
    expect(stripFrontmatter("# Hi\n---\nnot front\n---\n")).toBe("# Hi\n---\nnot front\n---\n");
  });
});

const tree: TreeNode[] = [
  { name: "area", path: "area", type: "dir", children: [{ name: "health.md", path: "area/health.md", type: "file" }] },
  { name: "bread.md", path: "bread.md", type: "file" },
  { name: "x.md", path: "health/bread/x.md", type: "file" },
];

describe("quickOpen", () => {
  it("flattens and matches words in the path, name matches first", () => {
    const files = flattenFiles(tree);
    expect(files).toHaveLength(3);
    expect(quickOpen(files, "bread").map((f) => f.path)).toEqual(["bread.md", "health/bread/x.md"]);
    expect(quickOpen(files, "health bread").map((f) => f.path)).toEqual(["health/bread/x.md"]);
    expect(quickOpen(files, "  ")).toEqual([]);
  });
});

import { frontmatterLines as fmLines } from "./notes";
describe("frontmatterLines", () => {
  it("counts the lines the frontmatter takes, 0 without it", () => {
    expect(fmLines("---\na: 1\n---\n# T\n")).toBe(3);
    expect(fmLines("# T\n")).toBe(0);
  });
});
