import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import type { LexicalEditor } from "lexical";
import type { ListKind } from "../types";

export function toggleList(editor: LexicalEditor, kind: ListKind): void {
  if (kind === "bullet") {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  } else {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  }
}

export function toggleBulletList(editor: LexicalEditor): void {
  toggleList(editor, "bullet");
}

export function toggleNumberedList(editor: LexicalEditor): void {
  toggleList(editor, "number");
}

export function clearList(editor: LexicalEditor): void {
  editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
}
