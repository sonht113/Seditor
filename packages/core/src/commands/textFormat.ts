import { FORMAT_TEXT_COMMAND, type LexicalEditor } from "lexical";

export function toggleBold(editor: LexicalEditor): void {
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
}

export function toggleItalic(editor: LexicalEditor): void {
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
}

export function toggleUnderline(editor: LexicalEditor): void {
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
}

export function toggleStrikethrough(editor: LexicalEditor): void {
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
}
