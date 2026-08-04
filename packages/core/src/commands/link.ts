import { TOGGLE_LINK_COMMAND, $toggleLink } from "@lexical/link";
import type { LexicalEditor } from "lexical";

export function setLink(editor: LexicalEditor, url: string): void {
  const trimmed = url.trim();
  if (trimmed === "") {
    unsetLink(editor);
    return;
  }
  editor.dispatchCommand(TOGGLE_LINK_COMMAND, trimmed);
}

export function unsetLink(editor: LexicalEditor): void {
  editor.update(() => {
    $toggleLink(null);
  });
}
