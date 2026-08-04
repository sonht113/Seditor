import {
  $applyNodeReplacement,
  $createNodeSelection,
  $getNodeByKey,
  $setSelection,
  type DOMConversionMap,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  DecoratorNode,
} from "lexical";

export interface ImagePayload {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: boolean;
  align?: ImageAlign;
}

export type ImageAlign = "left" | "center" | "right";

export type SerializedImageNode = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  align?: ImageAlign;
} & SerializedLexicalNode;

export class ImageNode extends DecoratorNode<null> {
  __src: string;
  __alt: string;
  __width?: number;
  __height?: number;
  __loading: boolean;
  __align: ImageAlign;

  static getType(): string {
    return "se-image";
  }

  static clone(prev: ImageNode): ImageNode {
    return new ImageNode(
      prev.__src,
      prev.__alt,
      prev.__width,
      prev.__height,
      prev.__loading,
      prev.__align,
      prev.__key,
    );
  }

  constructor(
    src: string,
    alt: string,
    width?: number,
    height?: number,
    loading?: boolean,
    align?: ImageAlign,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__width = width;
    this.__height = height;
    this.__loading = loading ?? false;
    this.__align = align ?? "center";
  }

  createDOM(_config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const container = document.createElement("div");
    container.className = "se-image";
    container.dataset.nodeKey = this.__key;
    container.dataset.align = this.__align;
    if (this.__loading) container.dataset.loading = "true";
    const img = document.createElement("img");
    img.src = this.__src;
    img.alt = this.__alt;
    img.draggable = true;
    if (this.__width) img.width = this.__width;
    if (this.__height) img.height = this.__height;
    container.appendChild(img);

    container.addEventListener("click", (e) => {
      e.stopPropagation();
      editor.update(() => {
        const sel = $createNodeSelection();
        sel.add(this.__key);
        $setSelection(sel);
      });
    });

    const corners: Array<"nw" | "ne" | "sw" | "se"> = ["nw", "ne", "sw", "se"];
    for (const corner of corners) {
      const handle = document.createElement("div");
      handle.className = "se-image-resize-handle";
      handle.dataset.corner = corner;
      handle.contentEditable = "false";
      handle.addEventListener("pointerdown", (e) =>
        startResize(e, editor, img, corner, this.__key),
      );
      container.appendChild(handle);
    }

    return container;
  }

  updateDOM(
    prevNode: ImageNode,
    dom: HTMLElement,
    _config: EditorConfig,
  ): boolean {
    if (prevNode.__loading !== this.__loading) {
      if (this.__loading) dom.dataset.loading = "true";
      else delete dom.dataset.loading;
    }
    if (
      prevNode.__src !== this.__src ||
      prevNode.__alt !== this.__alt ||
      prevNode.__width !== this.__width ||
      prevNode.__height !== this.__height
    ) {
      const img = dom.querySelector("img");
      if (img) {
        img.src = this.__src;
        img.alt = this.__alt;
        if (this.__width) img.width = this.__width;
        else img.removeAttribute("width");
        if (this.__height) img.height = this.__height;
        else img.removeAttribute("height");
      }
    }
    if (prevNode.__align !== this.__align) {
      dom.dataset.align = this.__align;
    }
    return false;
  }

  exportDOM(_editor: LexicalEditor): DOMExportOutput {
    const img = document.createElement("img");
    img.src = this.__src;
    img.alt = this.__alt;
    if (this.__width) img.width = this.__width;
    if (this.__height) img.height = this.__height;
    img.style.display = "block";
    if (this.__align === "center") {
      img.style.marginLeft = "auto";
      img.style.marginRight = "auto";
    } else if (this.__align === "right") {
      img.style.marginLeft = "auto";
      img.style.marginRight = "0";
    } else {
      img.style.marginLeft = "0";
      img.style.marginRight = "auto";
    }
    return { element: img };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: (element: HTMLElement) => {
          const img = element as HTMLImageElement;
          const src = img.getAttribute("src") || "";
          const alt = img.getAttribute("alt") || "";
          const widthAttr = img.getAttribute("width");
          const heightAttr = img.getAttribute("height");
          const width = widthAttr ? parseInt(widthAttr, 10) : undefined;
          const height = heightAttr ? parseInt(heightAttr, 10) : undefined;
          const align = inferAlignFromStyle(img);
          return {
            node: $createImageNode({ src, alt, width, height, align }),
          };
        },
        priority: 0,
      }),
    };
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      type: "se-image",
      src: this.__src,
      alt: this.__alt,
      width: this.__width,
      height: this.__height,
      align: this.__align,
    };
  }

  static importJSON(json: SerializedImageNode): ImageNode {
    return $createImageNode({
      src: json.src,
      alt: json.alt,
      width: json.width,
      height: json.height,
      align: json.align,
    });
  }

  setSrc(src: string): void {
    const writable = this.getWritable();
    writable.__src = src;
  }

  setAlt(alt: string): void {
    const writable = this.getWritable();
    writable.__alt = alt;
  }

  setWidth(width: number): void {
    const writable = this.getWritable();
    writable.__width = width;
  }

  setHeight(height: number): void {
    const writable = this.getWritable();
    writable.__height = height;
  }

  setLoading(loading: boolean): void {
    const writable = this.getWritable();
    writable.__loading = loading;
  }

  setAlign(align: ImageAlign): void {
    const writable = this.getWritable();
    writable.__align = align;
  }

  isInline(): boolean {
    return false;
  }

  isKeyboardSelectable(): boolean {
    return true;
  }

  decorate(): null {
    return null;
  }
}

const MIN_SIZE = 50;

function startResize(
  e: PointerEvent,
  editor: LexicalEditor,
  img: HTMLImageElement,
  corner: "nw" | "ne" | "sw" | "se",
  nodeKey: NodeKey,
): void {
  e.preventDefault();
  e.stopPropagation();

  const startX = e.clientX;
  const startY = e.clientY;
  const rect = img.getBoundingClientRect();
  const startW = rect.width;
  const startH = rect.height;
  const rootEl = editor.getRootElement();
  const maxW = rootEl ? rootEl.clientWidth : startW;

  let liveW = startW;
  let liveH = startH;

  const onMove = (ev: PointerEvent) => {
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;
    if (corner === "se") {
      liveW = startW + dx;
      liveH = startH + dy;
    } else if (corner === "nw") {
      liveW = startW - dx;
      liveH = startH - dy;
    } else if (corner === "ne") {
      liveW = startW + dx;
      liveH = startH - dy;
    } else {
      liveW = startW - dx;
      liveH = startH + dy;
    }
    liveW = Math.max(MIN_SIZE, Math.min(liveW, maxW));
    liveH = Math.max(MIN_SIZE, liveH);
    img.style.width = `${liveW}px`;
    img.style.height = `${liveH}px`;
  };

  const onUp = () => {
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerup", onUp);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setWidth(Math.round(liveW));
        node.setHeight(Math.round(liveH));
      }
    });
  };

  document.addEventListener("pointermove", onMove);
  document.addEventListener("pointerup", onUp);
}

export function $createImageNode(payload: ImagePayload): ImageNode {
  const node = new ImageNode(
    payload.src,
    payload.alt,
    payload.width,
    payload.height,
    payload.loading,
    payload.align,
  );
  return $applyNodeReplacement(node);
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}

function inferAlignFromStyle(img: HTMLImageElement): ImageAlign | undefined {
  const style = img.getAttribute("style") || "";
  const ml = /margin-left\s*:\s*auto/i.test(style);
  const mr = /margin-right\s*:\s*auto/i.test(style);
  if (ml && mr) return "center";
  if (ml) return "right";
  const floatMatch = style.match(/float\s*:\s*(left|right)/i);
  if (floatMatch) return floatMatch[1].toLowerCase() as ImageAlign;
  const textAlignMatch = style.match(/text-align\s*:\s*(left|center|right)/i);
  if (textAlignMatch) return textAlignMatch[1].toLowerCase() as ImageAlign;
  return undefined;
}
