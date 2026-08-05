import { describe, it, expect, vi } from "vitest";
import {
  $createRangeSelection,
  $getRoot,
  $isTextNode,
  $setSelection,
  CONTROLLED_TEXT_INSERTION_COMMAND,
} from "lexical";
import { createSeditor } from "./createSeditor";
import { getHTML, getJSON, setHTML, setJSON } from "./serialization";
import {
  toggleBold,
  toggleHeading,
  setParagraph,
  setAlign,
  toggleBulletList,
  setLink,
  unsetLink,
  setTextColor,
  setTextBackgroundColor,
  clearTextColor,
  setFontSize,
  clearFontSize,
  getPendingTextColor,
  getPendingFontSize,
  undo,
  redo,
} from "./commands";

function seedEditor(html: string) {
  const instance = createSeditor({ html });
  return instance;
}

describe("createSeditor", () => {
  it("returns an instance with all commands", () => {
    const instance = createSeditor();
    const keys = Object.keys(instance.commands);
    expect(keys).toEqual(
      expect.arrayContaining([
        "toggleBold",
        "toggleItalic",
        "toggleUnderline",
        "toggleStrikethrough",
        "toggleHeading",
        "setParagraph",
        "toggleBulletList",
        "toggleNumberedList",
        "setLink",
        "unsetLink",
        "undo",
        "redo",
        "focus",
      ]),
    );
  });

  it("is editable by default", () => {
    const instance = createSeditor();
    expect(instance.editor.isEditable()).toBe(true);
  });

  it("respects editable: false", () => {
    const instance = createSeditor({ editable: false });
    expect(instance.editor.isEditable()).toBe(false);
  });
});

describe("serialization", () => {
  it("round-trips HTML", () => {
    const instance = seedEditor("<p>Hello <b>world</b></p>");
    const html = getHTML(instance.editor);
    expect(html).toContain("Hello");
    expect(html).toContain("world");
  });

  it("getJSON returns editor state object", () => {
    const instance = seedEditor("<p>Hi</p>");
    const json = getJSON(instance.editor) as { root: { children: unknown[] } };
    expect(json.root).toBeDefined();
    expect(json.root.children.length).toBeGreaterThan(0);
  });

  it("setHTML replaces content", () => {
    const instance = createSeditor();
    setHTML(instance.editor, "<p>First</p>");
    expect(getHTML(instance.editor)).toContain("First");
    setHTML(instance.editor, "<p>Second</p>");
    expect(getHTML(instance.editor)).toContain("Second");
    expect(getHTML(instance.editor)).not.toContain("First");
  });

  it("setJSON round-trips with getJSON", () => {
    const instance = seedEditor("<p>Hello <b>world</b></p>");
    const json = getJSON(instance.editor);
    setJSON(instance.editor, json);
    const html = getHTML(instance.editor);
    expect(html).toContain("Hello");
    expect(html).toContain("world");
  });

  it("setJSON accepts a JSON string", () => {
    const instance = seedEditor("<p>Original</p>");
    const json = JSON.stringify(getJSON(instance.editor));
    setJSON(instance.editor, json);
    expect(getHTML(instance.editor)).toContain("Original");
  });

  it("instance.setJSON replaces content", () => {
    const instance = seedEditor("<p>First</p>");
    const json = getJSON(instance.editor);
    setHTML(instance.editor, "<p>Other</p>");
    instance.setJSON(json);
    expect(getHTML(instance.editor)).toContain("First");
    expect(getHTML(instance.editor)).not.toContain("Other");
  });
});

describe("onError config", () => {
  it("invokes config.onError when an update throws", () => {
    const onError = vi.fn();
    const instance = createSeditor({ onError });
    instance.editor.update(() => {
      throw new Error("boom");
    });
    instance.editor.read(() => {});
    expect(onError).toHaveBeenCalled();
    const arg = onError.mock.calls[0][0];
    expect(arg).toBeInstanceOf(Error);
    expect((arg as Error).message).toBe("boom");
  });
});

describe("commands", () => {
  it("toggleBold does not throw without selection", () => {
    const instance = createSeditor();
    expect(() => toggleBold(instance.editor)).not.toThrow();
  });

  it("toggleHeading does not throw without selection", () => {
    const instance = seedEditor("<p>Text</p>");
    expect(() => toggleHeading(instance.editor, "h1")).not.toThrow();
  });

  it("setParagraph does not throw without selection", () => {
    const instance = seedEditor("<h1>Title</h1>");
    expect(() => setParagraph(instance.editor)).not.toThrow();
  });

  it("setAlign applies text-align to selected paragraph", () => {
    const instance = seedEditor("<p>Align me</p>");
    const editor = instance.editor;
    editor.update(() => {
      const root = $getRoot();
      const textNode = root.getFirstDescendant();
      if (textNode && $isTextNode(textNode)) {
        const sel = $createRangeSelection();
        sel.anchor.set(textNode.getKey(), 0, "text");
        sel.focus.set(textNode.getKey(), 4, "text");
        $setSelection(sel);
      }
    });
    editor.read(() => {});
    setAlign(editor, "center");
    editor.read(() => {});
    const html = getHTML(editor).toLowerCase();
    expect(html).toContain("text-align");
    expect(html).toContain("center");
  });

  it("setAlign applies text-align to selected heading", () => {
    const instance = seedEditor("<h1>Heading</h1>");
    const editor = instance.editor;
    editor.update(() => {
      const root = $getRoot();
      const textNode = root.getFirstDescendant();
      if (textNode && $isTextNode(textNode)) {
        const sel = $createRangeSelection();
        sel.anchor.set(textNode.getKey(), 0, "text");
        sel.focus.set(textNode.getKey(), 4, "text");
        $setSelection(sel);
      }
    });
    editor.read(() => {});
    setAlign(editor, "right");
    editor.read(() => {});
    const html = getHTML(editor).toLowerCase();
    expect(html).toContain("text-align");
    expect(html).toContain("right");
  });

  it("setAlign does not throw without selection", () => {
    const instance = seedEditor("<p>Text</p>");
    expect(() => setAlign(instance.editor, "left")).not.toThrow();
  });

  it("registers heading nodes (h1 round-trips via setHTML/getJSON)", () => {
    const instance = createSeditor();
    setHTML(instance.editor, "<h1>Title</h1>");
    const json = getJSON(instance.editor) as {
      root: { children: Array<{ type: string; tag?: string }> };
    };
    expect(json.root.children[0].type).toBe("heading");
    expect(json.root.children[0].tag).toBe("h1");
  });

  it("registers paragraph nodes", () => {
    const instance = createSeditor();
    setHTML(instance.editor, "<p>Plain</p>");
    const json = getJSON(instance.editor) as {
      root: { children: Array<{ type: string }> };
    };
    expect(json.root.children[0].type).toBe("paragraph");
  });

  it("toggleBulletList dispatches without error", () => {
    const instance = seedEditor("<p>Item</p>");
    expect(() => toggleBulletList(instance.editor)).not.toThrow();
  });

  it("setLink then unsetLink does not throw", () => {
    const instance = seedEditor("<p>Link text</p>");
    expect(() => setLink(instance.editor, "https://example.com")).not.toThrow();
    expect(() => unsetLink(instance.editor)).not.toThrow();
  });

  it("setLink applies a link to selected text", () => {
    const instance = seedEditor("<p>Link text</p>");
    const editor = instance.editor;
    editor.update(() => {
      const root = $getRoot();
      const textNode = root.getFirstDescendant();
      if (textNode && $isTextNode(textNode)) {
        const sel = $createRangeSelection();
        sel.anchor.set(textNode.getKey(), 0, "text");
        sel.focus.set(textNode.getKey(), 4, "text");
        $setSelection(sel);
      }
    });
    editor.read(() => {});
    setLink(editor, "https://example.com");
    editor.read(() => {});
    const html = getHTML(editor);
    expect(html).toContain("https://example.com");
  });

  it("click on linked text opens url in new tab", () => {
    const instance = seedEditor('<p><a href="https://x.com">link</a></p>');
    const root = document.createElement("div");
    document.body.appendChild(root);
    instance.editor.setRootElement(root);
    instance.editor.read(() => {});

    const anchor = root.querySelector("a") as HTMLAnchorElement;
    expect(anchor).not.toBeNull();

    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    anchor.click();
    expect(openSpy).toHaveBeenCalledWith(
      "https://x.com",
      "_blank",
      "noopener,noreferrer",
    );
    openSpy.mockRestore();
    instance.editor.setRootElement(null);
    root.remove();
  });

  it("undo/redo do not throw", () => {
    const instance = createSeditor();
    expect(() => undo(instance.editor)).not.toThrow();
    expect(() => redo(instance.editor)).not.toThrow();
  });

  it("setTextColor applies color to selected text", () => {
    const instance = seedEditor("<p>Color text</p>");
    const editor = instance.editor;
    editor.update(() => {
      const root = $getRoot();
      const textNode = root.getFirstDescendant();
      if (textNode && $isTextNode(textNode)) {
        const sel = $createRangeSelection();
        sel.anchor.set(textNode.getKey(), 0, "text");
        sel.focus.set(textNode.getKey(), 5, "text");
        $setSelection(sel);
      }
    });
    editor.read(() => {});
    setTextColor(editor, "#e03e3e");
    editor.read(() => {});
    const html = getHTML(editor).toLowerCase();
    expect(html).toContain("color");
    expect(html).toContain("224, 62, 62");
  });

  it("setTextBackgroundColor applies background to selected text", () => {
    const instance = seedEditor("<p>Bg text</p>");
    const editor = instance.editor;
    editor.update(() => {
      const root = $getRoot();
      const textNode = root.getFirstDescendant();
      if (textNode && $isTextNode(textNode)) {
        const sel = $createRangeSelection();
        sel.anchor.set(textNode.getKey(), 0, "text");
        sel.focus.set(textNode.getKey(), 2, "text");
        $setSelection(sel);
      }
    });
    editor.read(() => {});
    setTextBackgroundColor(editor, "#fde0e0");
    editor.read(() => {});
    const html = getHTML(editor).toLowerCase();
    expect(html).toContain("background-color");
    expect(html).toContain("253, 224, 224");
  });

  it("clearTextColor removes color from text", () => {
    const instance = seedEditor("<p>Clear text</p>");
    const editor = instance.editor;
    editor.update(() => {
      const root = $getRoot();
      const textNode = root.getFirstDescendant();
      if (textNode && $isTextNode(textNode)) {
        const sel = $createRangeSelection();
        sel.anchor.set(textNode.getKey(), 0, "text");
        sel.focus.set(textNode.getKey(), 5, "text");
        $setSelection(sel);
      }
    });
    editor.read(() => {});
    setTextColor(editor, "#e03e3e");
    editor.read(() => {});
    clearTextColor(editor);
    editor.read(() => {});
    const html = getHTML(editor).toLowerCase();
    expect(html).not.toContain("224, 62, 62");
  });

  it("setTextColor with collapsed selection sets pending color", () => {
    const instance = seedEditor("<p>Text</p>");
    const editor = instance.editor;
    editor.update(() => {
      const root = $getRoot();
      const textNode = root.getFirstDescendant();
      if (textNode && $isTextNode(textNode)) {
        const sel = $createRangeSelection();
        sel.anchor.set(textNode.getKey(), 4, "text");
        sel.focus.set(textNode.getKey(), 4, "text");
        $setSelection(sel);
      }
    });
    editor.read(() => {});
    expect(getPendingTextColor()).toBeNull();
    setTextColor(editor, "#e03e3e");
    editor.read(() => {});
    expect(getPendingTextColor()).toBe("#e03e3e");
  });

  it("clearTextColor with collapsed selection clears pending color", () => {
    const instance = seedEditor("<p>Text</p>");
    const editor = instance.editor;
    editor.update(() => {
      const root = $getRoot();
      const textNode = root.getFirstDescendant();
      if (textNode && $isTextNode(textNode)) {
        const sel = $createRangeSelection();
        sel.anchor.set(textNode.getKey(), 4, "text");
        sel.focus.set(textNode.getKey(), 4, "text");
        $setSelection(sel);
      }
    });
    editor.read(() => {});
    setTextColor(editor, "#e03e3e");
    editor.read(() => {});
    expect(getPendingTextColor()).toBe("#e03e3e");
    clearTextColor(editor);
    editor.read(() => {});
    expect(getPendingTextColor()).toBeNull();
  });

  it("CONTROLLED_TEXT_INSERTION_COMMAND inserts styled text when pending color set", () => {
    const instance = seedEditor("<p>Text</p>");
    const editor = instance.editor;
    editor.update(() => {
      const root = $getRoot();
      const textNode = root.getFirstDescendant();
      if (textNode && $isTextNode(textNode)) {
        const sel = $createRangeSelection();
        sel.anchor.set(textNode.getKey(), 4, "text");
        sel.focus.set(textNode.getKey(), 4, "text");
        $setSelection(sel);
      }
    });
    editor.read(() => {});
    setTextColor(editor, "#e03e3e");
    editor.read(() => {});
    editor.dispatchCommand(CONTROLLED_TEXT_INSERTION_COMMAND, "new");
    editor.read(() => {});
    const html = getHTML(editor).toLowerCase();
    expect(html).toContain("224, 62, 62");
    expect(html).toContain("new");
  });

  it("setFontSize applies font-size to selected text", () => {
    const instance = seedEditor("<p>Size text</p>");
    const editor = instance.editor;
    editor.update(() => {
      const root = $getRoot();
      const textNode = root.getFirstDescendant();
      if (textNode && $isTextNode(textNode)) {
        const sel = $createRangeSelection();
        sel.anchor.set(textNode.getKey(), 0, "text");
        sel.focus.set(textNode.getKey(), 4, "text");
        $setSelection(sel);
      }
    });
    editor.read(() => {});
    setFontSize(editor, "24px");
    editor.read(() => {});
    const html = getHTML(editor).toLowerCase();
    expect(html).toContain("font-size");
    expect(html).toContain("24px");
  });

  it("clearFontSize removes font-size from selected text", () => {
    const instance = seedEditor("<p>Size text</p>");
    const editor = instance.editor;
    editor.update(() => {
      const root = $getRoot();
      const textNode = root.getFirstDescendant();
      if (textNode && $isTextNode(textNode)) {
        const sel = $createRangeSelection();
        sel.anchor.set(textNode.getKey(), 0, "text");
        sel.focus.set(textNode.getKey(), 4, "text");
        $setSelection(sel);
      }
    });
    editor.read(() => {});
    setFontSize(editor, "24px");
    editor.read(() => {});
    clearFontSize(editor);
    editor.read(() => {});
    const html = getHTML(editor).toLowerCase();
    expect(html).not.toContain("24px");
  });

  it("setFontSize with collapsed selection sets pending font size", () => {
    const instance = seedEditor("<p>Text</p>");
    const editor = instance.editor;
    editor.update(() => {
      const root = $getRoot();
      const textNode = root.getFirstDescendant();
      if (textNode && $isTextNode(textNode)) {
        const sel = $createRangeSelection();
        sel.anchor.set(textNode.getKey(), 4, "text");
        sel.focus.set(textNode.getKey(), 4, "text");
        $setSelection(sel);
      }
    });
    editor.read(() => {});
    expect(getPendingFontSize()).toBeNull();
    setFontSize(editor, "18px");
    editor.read(() => {});
    expect(getPendingFontSize()).toBe("18px");
  });

  it("clearFontSize with collapsed selection clears pending font size", () => {
    const instance = seedEditor("<p>Text</p>");
    const editor = instance.editor;
    editor.update(() => {
      const root = $getRoot();
      const textNode = root.getFirstDescendant();
      if (textNode && $isTextNode(textNode)) {
        const sel = $createRangeSelection();
        sel.anchor.set(textNode.getKey(), 4, "text");
        sel.focus.set(textNode.getKey(), 4, "text");
        $setSelection(sel);
      }
    });
    editor.read(() => {});
    setFontSize(editor, "18px");
    editor.read(() => {});
    expect(getPendingFontSize()).toBe("18px");
    clearFontSize(editor);
    editor.read(() => {});
    expect(getPendingFontSize()).toBeNull();
  });

  it("CONTROLLED_TEXT_INSERTION_COMMAND inserts sized text when pending font size set", () => {
    const instance = seedEditor("<p>Text</p>");
    const editor = instance.editor;
    editor.update(() => {
      const root = $getRoot();
      const textNode = root.getFirstDescendant();
      if (textNode && $isTextNode(textNode)) {
        const sel = $createRangeSelection();
        sel.anchor.set(textNode.getKey(), 4, "text");
        sel.focus.set(textNode.getKey(), 4, "text");
        $setSelection(sel);
      }
    });
    editor.read(() => {});
    setFontSize(editor, "20px");
    editor.read(() => {});
    editor.dispatchCommand(CONTROLLED_TEXT_INSERTION_COMMAND, "big");
    editor.read(() => {});
    const html = getHTML(editor).toLowerCase();
    expect(html).toContain("font-size");
    expect(html).toContain("20px");
    expect(html).toContain("big");
  });

  it("pending inline styles are cleared on non-collapsed selection change", () => {
    const instance = seedEditor("<p>Text</p>");
    const editor = instance.editor;
    editor.update(() => {
      const root = $getRoot();
      const textNode = root.getFirstDescendant();
      if (textNode && $isTextNode(textNode)) {
        const sel = $createRangeSelection();
        sel.anchor.set(textNode.getKey(), 4, "text");
        sel.focus.set(textNode.getKey(), 4, "text");
        $setSelection(sel);
      }
    });
    editor.read(() => {});
    setTextColor(editor, "#e03e3e");
    setFontSize(editor, "18px");
    editor.read(() => {});
    expect(getPendingTextColor()).toBe("#e03e3e");
    expect(getPendingFontSize()).toBe("18px");

    editor.update(() => {
      const root = $getRoot();
      const textNode = root.getFirstDescendant();
      if (textNode && $isTextNode(textNode)) {
        const sel = $createRangeSelection();
        sel.anchor.set(textNode.getKey(), 0, "text");
        sel.focus.set(textNode.getKey(), 4, "text");
        $setSelection(sel);
      }
    });
    editor.read(() => {});
    expect(getPendingTextColor()).toBeNull();
    expect(getPendingFontSize()).toBeNull();
  });
});
