import { describe, it, expect } from "vitest";
import { filterToolbarItems } from "./toolbar";
import type { ToolbarItem } from "./types";

const items: ToolbarItem[] = [
  { id: "bold", label: "Bold", command: "toggleBold" },
  { id: "italic", label: "Italic", command: "toggleItalic" },
  { id: "link", label: "Link", command: "setLink" },
];

describe("filterToolbarItems", () => {
  it("returns the original array when exclude is empty", () => {
    const result = filterToolbarItems(items, []);
    expect(result).toBe(items);
  });

  it("returns the original array when exclude is undefined", () => {
    const result = filterToolbarItems(items, undefined);
    expect(result).toBe(items);
  });

  it("filters out items whose id is in exclude", () => {
    const result = filterToolbarItems(items, ["italic"]);
    expect(result.map((i) => i.id)).toEqual(["bold", "link"]);
  });

  it("filters out multiple excluded ids", () => {
    const result = filterToolbarItems(items, ["bold", "link"]);
    expect(result.map((i) => i.id)).toEqual(["italic"]);
  });

  it("ignores unknown ids in exclude", () => {
    const result = filterToolbarItems(items, ["underline", "bold"]);
    expect(result.map((i) => i.id)).toEqual(["italic", "link"]);
  });
});
