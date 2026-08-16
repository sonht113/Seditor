import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $isElementNode,
  $isNodeSelection,
  $getNodeByKey,
  type LexicalEditor,
  type LexicalNode,
  type TextFormatType,
} from "lexical";
import { $isHeadingNode } from "@lexical/rich-text";
import { $isListNode, type ListNode } from "@lexical/list";
import { $isLinkNode, type LinkNode } from "@lexical/link";
import type { HeadingTag } from "./types";
import type { AlignType } from "./types";

function read<T>(editor: LexicalEditor, fn: () => T): T {
  let result: T;
  editor.read(() => {
    result = fn();
  });
  return result!;
}

export function isTextFormatActive(
  editor: LexicalEditor,
  format: TextFormatType,
): boolean {
  return read(editor, () => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return false;
    return selection.hasFormat(format);
  });
}

export function isHeadingActive(
  editor: LexicalEditor,
  tag: HeadingTag,
): boolean {
  return read(editor, () => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return false;
    const nodes = selection.getNodes();
    const node = nodes[0];
    if (!node) return false;
    const top = node.getTopLevelElement();
    if (!top) return false;
    return $isHeadingNode(top) && top.getTag() === tag;
  });
}

export function isBulletListActive(editor: LexicalEditor): boolean {
  return read(editor, () => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return false;
    const node = selection.getNodes()[0];
    if (!node) return false;
    const list = findAncestor(node, $isListNode) as ListNode | null;
    return list !== null && list.getListType() === "bullet";
  });
}

export function isNumberedListActive(editor: LexicalEditor): boolean {
  return read(editor, () => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return false;
    const node = selection.getNodes()[0];
    if (!node) return false;
    const list = findAncestor(node, $isListNode) as ListNode | null;
    return list !== null && list.getListType() === "number";
  });
}

export function isLinkActive(editor: LexicalEditor): boolean {
  return read(editor, () => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return false;
    const node = selection.getNodes()[0];
    if (!node) return false;
    return findAncestor(node, $isLinkNode) !== null;
  });
}

export function getLinkUrl(editor: LexicalEditor): string {
  return read(editor, () => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return "";
    const nodes = selection.getNodes();
    for (const node of nodes) {
      const link = findAncestor(node, $isLinkNode);
      if (link) return (link as LinkNode).getURL();
    }
    return "";
  });
}

function readStyle(editor: LexicalEditor, property: string): string {
  return read(editor, () => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return "";
    const nodes = selection.getNodes();
    for (const node of nodes) {
      if ($isTextNode(node)) {
        const style = node.getStyle();
        const match = style.match(
          new RegExp(`${property}\\s*:\\s*([^;]+)`, "i"),
        );
        if (match) return match[1].trim();
      }
    }
    return "";
  });
}

export function getTextColor(editor: LexicalEditor): string {
  return readStyle(editor, "color");
}

export function getTextBackgroundColor(editor: LexicalEditor): string {
  return readStyle(editor, "background-color");
}

export function getActiveFontSize(editor: LexicalEditor): string {
  return readStyle(editor, "font-size");
}

export function getActiveImageAlign(editor: LexicalEditor): AlignType | null {
  return read(editor, () => {
    const sel = $getSelection();
    if (!$isNodeSelection(sel)) return null;
    for (const key of sel._nodes) {
      const node = $getNodeByKey(key);
      const align = (node as { __align?: AlignType } | null)?.__align;
      if (align === "left" || align === "center" || align === "right") {
        return align;
      }
    }
    return null;
  });
}

export function getActiveAlign(editor: LexicalEditor): AlignType | null {
  return read(editor, () => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return null;
    const nodes = selection.getNodes();
    for (const node of nodes) {
      const top = node.getTopLevelElement();
      if (!top || !$isElementNode(top)) continue;
      const format = top.getFormatType() as AlignType | "";
      if (format === "left" || format === "center" || format === "right") {
        return format;
      }
    }
    return null;
  });
}

/**
 * Returns true when the current selection is inside a table cell. Works for
 * both range selections (caret in a cell) and table (cell) selections.
 */
export function isInTable(editor: LexicalEditor): boolean {
  return read(editor, () => {
    const selection = $getSelection();
    if (selection === null) return false;
    const nodes = selection.getNodes();
    if ($isRangeSelection(selection) && nodes.length === 0) {
      nodes.push(selection.anchor.getNode(), selection.focus.getNode());
    }
    if (nodes.length === 0) return false;
    for (const node of nodes) {
      const cell = findAncestor(
        node,
        (n) => $isElementNode(n) && n.getType() === "tablecell",
      );
      if (cell) return true;
    }
    return false;
  });
}

/**
 * Returns true when the row containing the current selection is a header row.
 */
export function isTableHeaderRowActive(editor: LexicalEditor): boolean {
  return read(editor, () => {
    const selection = $getSelection();
    if (selection === null) return false;
    const nodes = selection.getNodes();
    for (const node of nodes) {
      const cell = findAncestor(
        node,
        (n) => $isElementNode(n) && n.getType() === "tablecell",
      );
      if (cell && $isElementNode(cell)) {
        const headerState = (cell as unknown as { __headerState?: number })
          .__headerState;
        // TableCellHeaderStates.ROW === 1
        if ((headerState ?? 0) & 1) return true;
      }
    }
    return false;
  });
}

function findAncestor(
  node: LexicalNode,
  predicate: (n: LexicalNode | null | undefined) => boolean,
): LexicalNode | null {
  let current: LexicalNode | null = node;
  while (current !== null) {
    if (predicate(current)) return current;
    current = current.getParent();
  }
  return null;
}
