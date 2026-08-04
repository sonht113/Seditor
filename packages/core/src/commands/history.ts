import { REDO_COMMAND, UNDO_COMMAND, type LexicalEditor } from "lexical";

export function undo(editor: LexicalEditor): void {
  editor.dispatchCommand(UNDO_COMMAND, undefined);
}

export function redo(editor: LexicalEditor): void {
  editor.dispatchCommand(REDO_COMMAND, undefined);
}
