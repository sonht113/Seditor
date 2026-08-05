import { describe, it, expect } from "vitest";
import {
  $getRoot,
  $getNodeByKey,
  $createNodeSelection,
  $setSelection,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  type LexicalEditor,
} from "lexical";
import {
  createSeditor,
  setHTML,
  SE_SET_ALIGN_COMMAND,
} from "seditor-core";
import {
  ImageNode,
  $createImageNode,
  $isImageNode,
  INSERT_IMAGE_COMMAND,
  createImagePlugin,
} from "./index";

if (typeof globalThis.DragEvent === "undefined") {
  // jsdom does not expose DragEvent/ClipboardEvent; provide minimal stubs so
  // Lexical's internal drop/clipboard listeners do not throw during dispatch.
  (globalThis as unknown as { DragEvent: typeof Event }).DragEvent =
    class DragEvent extends Event {
      dataTransfer: DataTransfer | null = null;
      clientX = 0;
      clientY = 0;
      constructor(
        type: string,
        init?: EventInit & { dataTransfer?: DataTransfer | null },
      ) {
        super(type, init);
        if (init?.dataTransfer) this.dataTransfer = init.dataTransfer;
      }
    };
}
if (typeof globalThis.ClipboardEvent === "undefined") {
  (globalThis as unknown as { ClipboardEvent: typeof Event }).ClipboardEvent =
    class ClipboardEvent extends Event {
      clipboardData: DataTransfer | null = null;
      constructor(
        type: string,
        init?: EventInit & { clipboardData?: DataTransfer | null },
      ) {
        super(type, init);
        if (init?.clipboardData) this.clipboardData = init.clipboardData;
      }
    };
}

function makeEditor(): LexicalEditor {
  return createSeditor({
    plugins: [createImagePlugin()],
  }).editor;
}

function flush(editor: LexicalEditor): void {
  editor.read(() => {});
}

describe("ImageNode", () => {
  it("$createImageNode creates a node with correct fields", () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createImageNode({
        src: "https://example.com/img.png",
        alt: "Example",
        width: 100,
        height: 50,
      });
      expect(node).toBeInstanceOf(ImageNode);
      expect(node.__src).toBe("https://example.com/img.png");
      expect(node.__alt).toBe("Example");
      expect(node.__width).toBe(100);
      expect(node.__height).toBe(50);
    });
    flush(editor);
  });

  it("$isImageNode type-guards correctly", () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createImageNode({ src: "x", alt: "y" });
      expect($isImageNode(node)).toBe(true);
      expect($isImageNode(null)).toBe(false);
    });
    flush(editor);
  });

  it("getType returns 'se-image'", () => {
    expect(ImageNode.getType()).toBe("se-image");
  });

  it("exportJSON serializes correctly", () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createImageNode({
        src: "src1",
        alt: "alt1",
        width: 200,
      });
      const json = node.exportJSON();
      expect(json.type).toBe("se-image");
      expect(json.src).toBe("src1");
      expect(json.alt).toBe("alt1");
      expect(json.width).toBe(200);
    });
    flush(editor);
  });

  it("importJSON deserializes correctly", () => {
    const editor = makeEditor();
    editor.update(() => {
      const json = {
        type: "se-image",
        src: "s",
        alt: "a",
        width: 10,
        height: 20,
      };
      const node = ImageNode.importJSON(json as never);
      expect(node).toBeInstanceOf(ImageNode);
      expect(node.__src).toBe("s");
      expect(node.__alt).toBe("a");
    });
    flush(editor);
  });

  it("isInline returns false (block-level)", () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createImageNode({ src: "x", alt: "y" });
      expect(node.isInline()).toBe(false);
    });
    flush(editor);
  });

  it("setSrc/setAlt update writable", () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createImageNode({ src: "old", alt: "old" });
      node.setSrc("new-src");
      node.setAlt("new-alt");
      expect(node.__src).toBe("new-src");
      expect(node.__alt).toBe("new-alt");
    });
    flush(editor);
  });

  it("setWidth/setHeight update writable", () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createImageNode({ src: "x", alt: "y" });
      node.setWidth(320);
      node.setHeight(240);
      expect(node.__width).toBe(320);
      expect(node.__height).toBe(240);
    });
    flush(editor);
  });

  it("setLoading updates writable", () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createImageNode({ src: "x", alt: "y", loading: true });
      expect(node.__loading).toBe(true);
      node.setLoading(false);
      expect(node.__loading).toBe(false);
    });
    flush(editor);
  });

  it("createDOM sets data-loading when loading", () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createImageNode({ src: "", alt: "y", loading: true });
      const dom = node.createDOM({ theme: {} } as never, editor);
      expect(dom.dataset.loading).toBe("true");
    });
    flush(editor);
  });

  it("createDOM omits data-loading when not loading", () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createImageNode({ src: "x", alt: "y" });
      const dom = node.createDOM({ theme: {} } as never, editor);
      expect(dom.dataset.loading).toBeUndefined();
    });
    flush(editor);
  });

  it("exportJSON does not serialize loading state", () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createImageNode({ src: "x", alt: "y", loading: true });
      const json = node.exportJSON();
      expect(json.src).toBe("x");
      expect((json as Record<string, unknown>).loading).toBeUndefined();
    });
    flush(editor);
  });

  it("defaults align to center", () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createImageNode({ src: "x", alt: "y" });
      expect(node.__align).toBe("center");
    });
    flush(editor);
  });

  it("setAlign updates writable and exportJSON", () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createImageNode({ src: "x", alt: "y" });
      node.setAlign("right");
      expect(node.__align).toBe("right");
      const json = node.exportJSON();
      expect(json.align).toBe("right");
    });
    flush(editor);
  });

  it("createDOM sets data-align", () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createImageNode({ src: "x", alt: "y", align: "left" });
      const dom = node.createDOM({ theme: {} } as never, editor);
      expect(dom.dataset.align).toBe("left");
    });
    flush(editor);
  });

  it("exportDOM applies margin auto for center align", () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createImageNode({ src: "x", alt: "y", align: "center" });
      const output = node.exportDOM(editor);
      const el = output.element as HTMLImageElement;
      expect(el.style.marginLeft).toBe("auto");
      expect(el.style.marginRight).toBe("auto");
    });
    flush(editor);
  });

  it("exportDOM omits margin for left align", () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createImageNode({ src: "x", alt: "y", align: "left" });
      const output = node.exportDOM(editor);
      const el = output.element as HTMLImageElement;
      expect(el.style.display).toBe("block");
      expect(el.style.marginLeft).toBe("0px");
    });
    flush(editor);
  });

  it("importJSON preserves align", () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = ImageNode.importJSON({
        type: "se-image",
        src: "s",
        alt: "a",
        align: "right",
      } as never);
      expect(node.__align).toBe("right");
    });
    flush(editor);
  });
});

describe("ImageNode DOM", () => {
  it("createDOM creates a div.se-image with img", () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createImageNode({
        src: "https://x.com/i.png",
        alt: "alt",
      });
      const dom = node.createDOM({ theme: {} } as never, editor);
      expect(dom.className).toBe("se-image");
      const img = dom.querySelector("img");
      expect(img).not.toBeNull();
      expect(img?.getAttribute("src")).toBe("https://x.com/i.png");
      expect(img?.getAttribute("alt")).toBe("alt");
    });
    flush(editor);
  });

  it("createDOM attaches 4 resize handles and sets nodeKey", () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createImageNode({ src: "x", alt: "y" });
      const dom = node.createDOM({ theme: {} } as never, editor);
      const handles = dom.querySelectorAll(".se-image-resize-handle");
      expect(handles.length).toBe(4);
      const corners = Array.from(handles).map(
        (h) => (h as HTMLElement).dataset.corner,
      );
      expect(corners).toEqual(expect.arrayContaining(["nw", "ne", "sw", "se"]));
      expect(dom.dataset.nodeKey).toBe(node.__key);
    });
    flush(editor);
  });

  it("createDOM sets img.draggable = true", () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createImageNode({ src: "x", alt: "y" });
      const dom = node.createDOM({ theme: {} } as never, editor);
      const img = dom.querySelector("img");
      expect(img?.draggable).toBe(true);
    });
    flush(editor);
  });

  it("exportDOM produces an img element", () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createImageNode({
        src: "https://x.com/i.png",
        alt: "alt",
      });
      const output = node.exportDOM(editor);
      const element = output.element as HTMLElement;
      expect(element.tagName).toBe("IMG");
      expect(element.getAttribute("src")).toBe("https://x.com/i.png");
    });
    flush(editor);
  });

  it("importDOM maps img tag", () => {
    const map = ImageNode.importDOM();
    expect(map).not.toBeNull();
    expect(map).toHaveProperty("img");
  });
});

describe("createImagePlugin", () => {
  it("returns a valid SeditorPlugin", () => {
    const plugin = createImagePlugin();
    expect(plugin.name).toBe("image");
    expect(plugin.nodes).toContain(ImageNode);
    expect(plugin.toolbarItem).toBeDefined();
    const item = Array.isArray(plugin.toolbarItem)
      ? plugin.toolbarItem[0]
      : plugin.toolbarItem;
    expect(item?.command).toBe("openImageDialog");
  });

  it("registers INSERT_IMAGE_COMMAND handler", () => {
    const editor = makeEditor();
    editor.update(() => {
      $getRoot().clear();
    });
    flush(editor);
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
      src: "https://test.com/x.png",
      alt: "test",
    });
    flush(editor);
    const json = editor.getEditorState().toJSON() as {
      root: { children: Array<{ type: string; src?: string }> };
    };
    const imageChild = json.root.children.find((c) => c.type === "se-image");
    expect(imageChild).toBeDefined();
    expect(imageChild?.src).toBe("https://test.com/x.png");
  });

  it("image node round-trips through setHTML", () => {
    const editor = makeEditor();
    setHTML(editor, '<p>Before</p><img src="https://x.com/i.png" alt="pic"/>');
    flush(editor);
    const json = editor.getEditorState().toJSON() as {
      root: { children: Array<{ type: string }> };
    };
    expect(json.root.children.some((c) => c.type === "se-image")).toBe(true);
  });

  it("SE_SET_ALIGN_COMMAND sets align on selected image node", () => {
    const editor = makeEditor();
    const root = document.createElement("div");
    document.body.appendChild(root);
    editor.setRootElement(root);

    editor.update(() => {
      $getRoot().clear();
      $getRoot().append($createImageNode({ src: "x", alt: "y" }));
    });
    flush(editor);

    const container = root.querySelector(".se-image") as HTMLElement;
    expect(container).not.toBeNull();
    const key = container.dataset.nodeKey;
    expect(key).toBeDefined();

    editor.update(() => {
      const sel = $createNodeSelection();
      sel.add(key!);
      $setSelection(sel);
    });
    flush(editor);

    editor.dispatchCommand(SE_SET_ALIGN_COMMAND, "left");
    flush(editor);

    editor.read(() => {
      const node = $getNodeByKey(key!);
      expect($isImageNode(node)).toBe(true);
      if ($isImageNode(node)) {
        expect(node.__align).toBe("left");
      }
    });

    editor.setRootElement(null);
    root.remove();
  });

  it("DROP_COMMAND moves image node from drag data (cut + paste)", () => {
    const editor = makeEditor();
    const root = document.createElement("div");
    document.body.appendChild(root);
    editor.setRootElement(root);

    editor.update(() => {
      $getRoot().clear();
      $getRoot().append($createImageNode({ src: "orig", alt: "a" }));
    });
    flush(editor);

    const img = root.querySelector("img") as HTMLImageElement;
    expect(img).not.toBeNull();

    const dragData = JSON.stringify({
      type: "se-image",
      src: "orig",
      alt: "a",
      width: undefined,
      height: undefined,
    });

    const dataTransfer = {
      types: ["application/x-lexical-drag-image"],
      files: [] as File[],
      getData: (mime: string) =>
        mime === "application/x-lexical-drag-image" ? dragData : "",
      setData: () => {},
      setDragImage: () => {},
      effectAllowed: "move" as const,
      dropEffect: "move" as const,
    };

    const dragStartEvent = {
      target: img,
      dataTransfer,
      preventDefault: () => {},
      stopPropagation: () => {},
      clientX: 0,
      clientY: 0,
    } as unknown as DragEvent;

    editor.dispatchCommand(DRAGSTART_COMMAND, dragStartEvent);
    flush(editor);

    const dropEvent = {
      target: root,
      dataTransfer,
      preventDefault: () => {},
      stopPropagation: () => {},
      clientX: 0,
      clientY: 0,
    } as unknown as DragEvent;

    editor.dispatchCommand(DROP_COMMAND, dropEvent);
    flush(editor);

    const after = editor.getEditorState().toJSON() as {
      root: { children: Array<{ type: string; src?: string }> };
    };
    const images = after.root.children.filter((c) => c.type === "se-image");
    expect(images.length).toBe(1);
    expect(images[0]?.src).toBe("orig");

    editor.setRootElement(null);
    root.remove();
  });
});
