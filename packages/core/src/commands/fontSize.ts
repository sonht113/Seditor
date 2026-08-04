import { $getSelection, $isRangeSelection, type LexicalEditor } from "lexical";
import { updateInlineStyle } from "./inlineStyle";

let pendingFontSize: string | null = null;

export function getPendingFontSize(): string | null {
  return pendingFontSize;
}

export function setFontSize(editor: LexicalEditor, size: string): void {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    if (selection.isCollapsed()) {
      pendingFontSize = size;
    } else {
      updateInlineStyle(editor, "font-size", size);
    }
  });
}

export function clearFontSize(editor: LexicalEditor): void {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    if (selection.isCollapsed()) {
      pendingFontSize = null;
    } else {
      updateInlineStyle(editor, "font-size", null);
    }
  });
}

export function clearPendingFontSize(): void {
  pendingFontSize = null;
}
