import {
  $getSelection,
  $isRangeSelection,
  $isElementNode,
  $createParagraphNode,
  type ElementNode,
  type LexicalEditor,
} from "lexical";
import { $createHeadingNode, type HeadingTagType } from "@lexical/rich-text";
import { $isListItemNode } from "@lexical/list";
import { $setBlocksType } from "@lexical/selection";
import type { AlignType, HeadingTag } from "../types";

export function toggleHeading(editor: LexicalEditor, tag: HeadingTag): void {
  editor.update(() => {
    const selection = $getSelection();
    if (selection === null) return;
    const tagType = tag as HeadingTagType;
    $setBlocksType(selection, () => $createHeadingNode(tagType));
  });
}

export function setParagraph(editor: LexicalEditor): void {
  editor.update(() => {
    const selection = $getSelection();
    if (selection === null) return;
    $setBlocksType(selection, () => $createParagraphNode());
  });
}

export function setAlign(editor: LexicalEditor, align: AlignType): void {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    const seen = new Set<ElementNode>();
    for (const node of selection.getNodes()) {
      const top = node.getTopLevelElement();
      if (!top || !$isElementNode(top) || seen.has(top)) continue;
      const target = resolveAlignTarget(top);
      if (!target || seen.has(target)) continue;
      seen.add(target);
      const writable = target.getWritable();
      writable.setFormat(align);
    }
  });
}

function resolveAlignTarget(top: ElementNode): ElementNode | null {
  if ($isListItemNode(top)) {
    const child = top.getFirstChild();
    if (child && $isElementNode(child)) return child;
    return null;
  }
  return top;
}
