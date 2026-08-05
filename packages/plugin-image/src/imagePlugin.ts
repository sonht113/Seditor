import {
  $createRangeSelectionFromDom,
  $getNodeByKey,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGEND_COMMAND,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  SELECTION_CHANGE_COMMAND,
  type LexicalEditor,
  type NodeKey,
  type RangeSelection,
} from "lexical";
import {
  type SeditorPlugin,
  type ToolbarItem,
  SE_OPEN_IMAGE_COMMAND,
  SE_SET_ALIGN_COMMAND,
} from "seditor-core";
import {
  $createImageNode,
  $isImageNode,
  ImageNode,
  type ImageAlign,
  type ImagePayload,
  type SerializedImageNode,
} from "./imageNode";

export const INSERT_IMAGE_COMMAND = createCommand<ImagePayload>();

const DRAG_MIME = "application/x-lexical-drag-image";
const MIN_SIZE = 50;

const IMAGE_ICON =
  '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="12" height="10" rx="1"/><circle cx="5.5" cy="6.5" r="1"/><path d="M14 10l-3.5-3.5L5 12"/></svg>';

export interface ImagePluginConfig {
  uploadHandler?: (file: File) => Promise<string>;
}

export function createImagePlugin(config?: ImagePluginConfig): SeditorPlugin {
  const uploadHandler = config?.uploadHandler ?? defaultUploadHandler;

  const toolbarItem: ToolbarItem = {
    id: "image",
    label: "Image",
    icon: IMAGE_ICON,
    command: "openImageDialog",
  };

  const listeners = (editor: LexicalEditor): Array<() => void> => {
    let draggedNodeKey: string | null = null;

    const unregisterInsert = editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload: ImagePayload) => {
        editor.update(() => {
          $insertNodes([$createImageNode(payload)]);
        });
        return true;
      },
      0,
    );

    const unregisterOpen = editor.registerCommand(
      SE_OPEN_IMAGE_COMMAND,
      () => {
        openImageDialog(editor, uploadHandler);
        return true;
      },
      0,
    );

    const unregisterSetAlign = editor.registerCommand(
      SE_SET_ALIGN_COMMAND,
      (align: ImageAlign) => {
        const sel = $getSelection();
        if (!$isNodeSelection(sel)) return false;
        let handled = false;
        editor.update(() => {
          for (const key of sel._nodes) {
            const node = $getNodeByKey(key);
            if ($isImageNode(node)) {
              node.setAlign(align);
              handled = true;
            }
          }
        });
        return handled;
      },
      0,
    );

    const unregisterSelectionChange = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const root = editor.getRootElement();
        if (!root) return false;
        editor.read(() => {
          const sel = $getSelection();
          const selectedKeys = $isNodeSelection(sel) ? sel : null;
          const containers = root.querySelectorAll<HTMLElement>(".se-image");
          for (const el of containers) {
            const key = el.dataset.nodeKey;
            const isSelected = !!key && !!selectedKeys?.has(key);
            if (isSelected) {
              el.dataset.selected = "true";
            } else {
              delete el.dataset.selected;
            }
          }
        });
        return false;
      },
      0,
    );

    const unregisterDragStart = editor.registerCommand(
      DRAGSTART_COMMAND,
      (event: DragEvent) => {
        const target = event.target as HTMLElement | null;
        const img = target?.closest("img") as HTMLImageElement | null;
        const container = img?.closest(".se-image") as HTMLElement | null;
        if (!img || !container) return false;
        const key = container.dataset.nodeKey;
        if (!key || !event.dataTransfer) return false;
        const dt = event.dataTransfer;
        editor.read(() => {
          const node = $getNodeByKey(key);
          if (!$isImageNode(node)) return;
          dt.setData(DRAG_MIME, JSON.stringify(node.exportJSON()));
          dt.setData("text/plain", node.__src);
          dt.effectAllowed = "move";
        });
        draggedNodeKey = key;
        dt.setDragImage(img, 10, 10);
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );

    const unregisterDragOver = editor.registerCommand(
      DRAGOVER_COMMAND,
      (event: DragEvent) => {
        if (!event.dataTransfer) return false;
        const types = Array.from(event.dataTransfer.types);
        if (!types.includes(DRAG_MIME) && !types.includes("Files")) {
          return false;
        }
        event.preventDefault();
        event.dataTransfer.dropEffect = types.includes(DRAG_MIME)
          ? "move"
          : "copy";
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );

    const unregisterDrop = editor.registerCommand(
      DROP_COMMAND,
      (event: DragEvent) => {
        if (!event.dataTransfer) return false;
        const types = Array.from(event.dataTransfer.types);
        const hasImage = types.includes(DRAG_MIME);
        const files = Array.from(event.dataTransfer.files ?? []).filter((f) =>
          f.type.startsWith("image/"),
        );
        if (!hasImage && files.length === 0) return false;
        event.preventDefault();

        const dropSelection = resolveDropSelection(
          editor,
          event.clientX,
          event.clientY,
        );

        if (hasImage) {
          const raw = event.dataTransfer.getData(DRAG_MIME);
          if (raw) {
            try {
              const json = JSON.parse(raw) as SerializedImageNode;
              const sourceKey = draggedNodeKey;
              editor.update(() => {
                if (dropSelection) $setSelection(dropSelection);
                $insertNodes([$createImageNode(json)]);
                if (sourceKey) {
                  const original = $getNodeByKey(sourceKey);
                  if ($isImageNode(original)) original.remove();
                }
              });
              draggedNodeKey = null;
              return true;
            } catch {
              // fall through to file handling
            }
          }
        }

        if (files.length > 0) {
          void handleDroppedFiles(editor, uploadHandler, files, dropSelection);
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    const unregisterDragEnd = editor.registerCommand(
      DRAGEND_COMMAND,
      () => {
        draggedNodeKey = null;
        const root = editor.getRootElement();
        root?.querySelector(".se-image-drop-caret")?.remove();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return [
      unregisterInsert,
      unregisterOpen,
      unregisterSetAlign,
      unregisterSelectionChange,
      unregisterDragStart,
      unregisterDragOver,
      unregisterDrop,
      unregisterDragEnd,
    ];
  };

  return {
    name: "image",
    nodes: [ImageNode],
    listeners,
    toolbarItem,
  };
}

function resolveDropSelection(
  editor: LexicalEditor,
  x: number,
  y: number,
): RangeSelection | null {
  const root = editor.getRootElement();
  if (!root) return null;
  const doc = root.ownerDocument;
  const range = caretRangeFromPoint(doc, x, y);
  if (!range) return null;
  const domSel = doc.getSelection();
  if (!domSel) return null;
  domSel.removeAllRanges();
  domSel.addRange(range);
  return $createRangeSelectionFromDom(domSel, editor);
}

async function handleDroppedFiles(
  editor: LexicalEditor,
  uploadHandler: (file: File) => Promise<string>,
  files: File[],
  dropSelection: RangeSelection | null,
): Promise<void> {
  for (const file of files) {
    const placeholderKey = insertImagePlaceholder(
      editor,
      file.name,
      dropSelection,
    );
    try {
      const src = await uploadHandler(file);
      const dims = await loadImageDimensions(src);
      editor.update(() => {
        const node = $getNodeByKey(placeholderKey);
        if ($isImageNode(node)) {
          node.setSrc(src);
          node.setLoading(false);
          if (dims) {
            node.setWidth(dims.width);
            node.setHeight(dims.height);
          }
        }
      });
    } catch (error) {
      console.error("[Seditor/image] drop upload failed:", error);
      editor.update(() => {
        const node = $getNodeByKey(placeholderKey);
        if ($isImageNode(node)) node.remove();
      });
    }
  }
}

function insertImagePlaceholder(
  editor: LexicalEditor,
  alt: string,
  selection: RangeSelection | null,
): NodeKey {
  let key: NodeKey = "";
  editor.update(() => {
    if (selection) $setSelection(selection);
    const node = $createImageNode({ src: "", alt, loading: true });
    $insertNodes([node]);
    key = node.getKey();
  });
  return key;
}

function defaultUploadHandler(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImageDimensions(
  src: string,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    if (!src.startsWith("data:") && !src.startsWith("blob:")) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function caretRangeFromPoint(
  doc: Document,
  x: number,
  y: number,
): Range | null {
  const pointDoc = doc as Document & {
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
    caretPositionFromPoint?: (
      x: number,
      y: number,
    ) => {
      offsetNode: Node;
      offset: number;
    } | null;
  };
  if (typeof pointDoc.caretRangeFromPoint === "function") {
    return pointDoc.caretRangeFromPoint(x, y);
  }
  if (typeof pointDoc.caretPositionFromPoint === "function") {
    const pos = pointDoc.caretPositionFromPoint(x, y);
    if (!pos) return null;
    const range = doc.createRange();
    range.setStart(pos.offsetNode, pos.offset);
    range.collapse(true);
    return range;
  }
  return null;
}

function openImageDialog(
  editor: LexicalEditor,
  uploadHandler: (file: File) => Promise<string>,
): void {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.style.display = "none";
  document.body.appendChild(input);

  let removed = false;
  const removeInput = () => {
    if (!removed && input.parentNode) {
      removed = true;
      document.body.removeChild(input);
    }
  };

  input.addEventListener(
    "change",
    async () => {
      const file = input.files?.[0];
      if (!file) {
        removeInput();
        return;
      }
      const placeholderKey = insertImagePlaceholder(editor, file.name, null);
      try {
        const src = await uploadHandler(file);
        const dims = await loadImageDimensions(src);
        editor.update(() => {
          const node = $getNodeByKey(placeholderKey);
          if ($isImageNode(node)) {
            node.setSrc(src);
            node.setLoading(false);
            if (dims) {
              node.setWidth(dims.width);
              node.setHeight(dims.height);
            }
          }
        });
      } catch (error) {
        console.error("[Seditor/image] upload failed:", error);
        editor.update(() => {
          const node = $getNodeByKey(placeholderKey);
          if ($isImageNode(node)) node.remove();
        });
      } finally {
        removeInput();
      }
    },
    { once: true },
  );

  input.addEventListener("cancel", removeInput, { once: true });

  input.click();
}

export { MIN_SIZE };
