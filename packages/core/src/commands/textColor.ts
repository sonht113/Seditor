import { $getSelection, $isRangeSelection, type LexicalEditor } from "lexical";
import { updateInlineStyle } from "./inlineStyle";
import { getPendingFontSize } from "./fontSize";

let pendingTextColor: string | null = null;
let pendingBgColor: string | null = null;

export function getPendingTextColor(): string | null {
  return pendingTextColor;
}

export function getPendingBgColor(): string | null {
  return pendingBgColor;
}

export function buildPendingStyle(): string {
  const parts: Array<string> = [];
  if (pendingTextColor) parts.push(`color: ${pendingTextColor}`);
  if (pendingBgColor) parts.push(`background-color: ${pendingBgColor}`);
  const fontSize = getPendingFontSize();
  if (fontSize) parts.push(`font-size: ${fontSize}`);
  return parts.join("; ");
}

export function setTextColor(editor: LexicalEditor, color: string): void {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    if (selection.isCollapsed()) {
      pendingTextColor = color;
    } else {
      updateInlineStyle(editor, "color", color);
    }
  });
}

export function setTextBackgroundColor(
  editor: LexicalEditor,
  color: string,
): void {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    if (selection.isCollapsed()) {
      pendingBgColor = color;
    } else {
      updateInlineStyle(editor, "background-color", color);
    }
  });
}

export function clearTextColor(editor: LexicalEditor): void {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    if (selection.isCollapsed()) {
      pendingTextColor = null;
    } else {
      updateInlineStyle(editor, "color", null);
    }
  });
}

export function clearTextBackgroundColor(editor: LexicalEditor): void {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    if (selection.isCollapsed()) {
      pendingBgColor = null;
    } else {
      updateInlineStyle(editor, "background-color", null);
    }
  });
}

export function clearPendingInlineStyles(): void {
  pendingTextColor = null;
  pendingBgColor = null;
}
