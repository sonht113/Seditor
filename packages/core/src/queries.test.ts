import { describe, it, expect } from "vitest";
import { createSeditor } from "./createSeditor";
import { setHTML } from "./serialization";
import {
  isTextFormatActive,
  isHeadingActive,
  isBulletListActive,
  isNumberedListActive,
  isLinkActive,
  getLinkUrl,
  getActiveAlign,
  getActiveFontSize,
} from "./queries";

describe("queries", () => {
  it("isHeadingActive detects h1", () => {
    const instance = createSeditor();
    setHTML(instance.editor, "<h1>Title</h1>");
    expect(isHeadingActive(instance.editor, "h1")).toBe(true);
    expect(isHeadingActive(instance.editor, "h2")).toBe(false);
  });

  it("isHeadingActive returns false for paragraph", () => {
    const instance = createSeditor();
    setHTML(instance.editor, "<p>Plain</p>");
    expect(isHeadingActive(instance.editor, "h1")).toBe(false);
  });

  it("isTextFormatActive returns false without selection", () => {
    const instance = createSeditor();
    setHTML(instance.editor, "<p><b>Bold</b></p>");
    expect(isTextFormatActive(instance.editor, "bold")).toBe(false);
  });

  it("isBulletListActive detects bullet list", () => {
    const instance = createSeditor();
    setHTML(instance.editor, "<ul><li>Item</li></ul>");
    expect(isBulletListActive(instance.editor)).toBe(true);
    expect(isNumberedListActive(instance.editor)).toBe(false);
  });

  it("isNumberedListActive detects numbered list", () => {
    const instance = createSeditor();
    setHTML(instance.editor, "<ol><li>Item</li></ol>");
    expect(isNumberedListActive(instance.editor)).toBe(true);
    expect(isBulletListActive(instance.editor)).toBe(false);
  });

  it("isLinkActive detects link when selection is inside", () => {
    const instance = createSeditor();
    setHTML(instance.editor, '<p><a href="https://x.com">link</a></p>');
    expect(isLinkActive(instance.editor)).toBe(true);
  });

  it("isLinkActive returns false for plain text", () => {
    const instance = createSeditor();
    setHTML(instance.editor, "<p>plain text</p>");
    expect(isLinkActive(instance.editor)).toBe(false);
  });

  it("getLinkUrl returns URL when selection is inside link", () => {
    const instance = createSeditor();
    setHTML(instance.editor, '<p><a href="https://x.com">link</a></p>');
    expect(getLinkUrl(instance.editor)).toBe("https://x.com");
  });

  it("getLinkUrl returns empty string for plain text", () => {
    const instance = createSeditor();
    setHTML(instance.editor, "<p>plain text</p>");
    expect(getLinkUrl(instance.editor)).toBe("");
  });

  it("getActiveAlign detects align of cursor's block", () => {
    const instance = createSeditor();
    setHTML(instance.editor, '<p style="text-align: center">x</p>');
    expect(getActiveAlign(instance.editor)).toBe("center");
  });

  it("getActiveAlign returns null for unaligned paragraph", () => {
    const instance = createSeditor();
    setHTML(instance.editor, "<p>plain</p>");
    expect(getActiveAlign(instance.editor)).toBeNull();
  });

  it("getActiveFontSize returns empty string for plain text", () => {
    const instance = createSeditor();
    setHTML(instance.editor, "<p>plain</p>");
    expect(getActiveFontSize(instance.editor)).toBe("");
  });
});

describe("createSeditor undo/redo state", () => {
  it("canUndo/canRedo are booleans", () => {
    const instance = createSeditor();
    expect(typeof instance.canUndo()).toBe("boolean");
    expect(typeof instance.canRedo()).toBe("boolean");
  });
});
