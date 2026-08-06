import { describe, it, expect } from "vitest";
import {
  $getRoot,
  $getNodeByKey,
  $createNodeSelection,
  $setSelection,
  type LexicalEditor,
} from "lexical";
import { createSeditor, SE_SET_ALIGN_COMMAND } from "seditor-core";
import { createImagePlugin, $createImageNode, $isImageNode } from "./index";

if (typeof globalThis.DragEvent === "undefined") {
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

function makeEditor(): LexicalEditor {
  return createSeditor({
    plugins: [createImagePlugin()],
  }).editor;
}

function flush(editor: LexicalEditor): void {
  editor.read(() => {});
}

describe("createImagePlugin DOM interactions", () => {
  it("keeps image selected after editor blur so align still works", () => {
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
    const key = container.dataset.nodeKey!;

    editor.update(() => {
      const sel = $createNodeSelection();
      sel.add(key);
      $setSelection(sel);
    });
    flush(editor);

    // Simulate the editor losing focus (e.g. clicking a toolbar button).
    root.blur();
    root.dispatchEvent(new Event("blur", { bubbles: false }));

    editor.dispatchCommand(SE_SET_ALIGN_COMMAND, "right");
    flush(editor);

    editor.read(() => {
      const node = $getNodeByKey(key);
      expect($isImageNode(node)).toBe(true);
      if ($isImageNode(node)) {
        expect(node.__align).toBe("right");
      }
    });

    editor.setRootElement(null);
    root.remove();
  });

  it("sets align on image after focus moves to another element", () => {
    const editor = makeEditor();
    const root = document.createElement("div");
    const button = document.createElement("button");
    document.body.appendChild(root);
    document.body.appendChild(button);
    editor.setRootElement(root);

    editor.update(() => {
      $getRoot().clear();
      $getRoot().append($createImageNode({ src: "x", alt: "y" }));
    });
    flush(editor);

    const container = root.querySelector(".se-image") as HTMLElement;
    const key = container.dataset.nodeKey!;

    editor.update(() => {
      const sel = $createNodeSelection();
      sel.add(key);
      $setSelection(sel);
    });
    flush(editor);

    // Simulate clicking a toolbar button: focus leaves the editor.
    button.focus();
    root.dispatchEvent(new Event("blur", { bubbles: false }));

    editor.dispatchCommand(SE_SET_ALIGN_COMMAND, "left");
    flush(editor);

    editor.read(() => {
      const node = $getNodeByKey(key);
      expect($isImageNode(node)).toBe(true);
      if ($isImageNode(node)) {
        expect(node.__align).toBe("left");
      }
    });

    editor.setRootElement(null);
    root.remove();
    button.remove();
  });

  it("moves image via native dragstart + drop", () => {
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

    const store: Record<string, string> = {};
    const types: string[] = [];
    const dataTransfer = {
      types,
      files: [] as File[],
      getData: (mime: string) => store[mime] ?? "",
      setData: (mime: string, value: string) => {
        store[mime] = value;
        if (!types.includes(mime)) {
          types.push(mime);
        }
      },
      setDragImage: () => {},
      effectAllowed: "uninitialized" as const,
      dropEffect: "none" as const,
    } as unknown as DataTransfer;

    const dragStartEvent = new DragEvent("dragstart", {
      bubbles: true,
      cancelable: true,
    }) as DragEvent;
    Object.defineProperty(dragStartEvent, "target", {
      value: img,
      enumerable: true,
    });
    Object.defineProperty(dragStartEvent, "dataTransfer", {
      value: dataTransfer,
      enumerable: true,
    });

    root.dispatchEvent(dragStartEvent);
    flush(editor);

    expect(dataTransfer.types).toContain("application/x-lexical-drag-image");

    const dropEvent = new DragEvent("drop", {
      bubbles: true,
      cancelable: true,
    }) as DragEvent;
    Object.defineProperty(dropEvent, "target", {
      value: root,
      enumerable: true,
    });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: dataTransfer,
      enumerable: true,
    });
    Object.defineProperty(dropEvent, "clientX", { value: 0 });
    Object.defineProperty(dropEvent, "clientY", { value: 0 });

    root.dispatchEvent(dropEvent);
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
