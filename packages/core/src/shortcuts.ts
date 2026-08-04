import {
  COMMAND_PRIORITY_HIGH,
  IS_APPLE,
  KEY_DOWN_COMMAND,
  createCommand,
  isExactShortcutMatch,
  type LexicalEditor,
} from "lexical";
import {
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleStrikethrough,
  toggleHeading,
  toggleBulletList,
  toggleNumberedList,
  undo,
  redo,
} from "./commands";
import type { HeadingTag } from "./types";

export const SE_OPEN_LINK_COMMAND = createCommand<undefined>();

// Note: IS_APPLE is evaluated at module load time based on navigator.platform.
// This is correct for client-side usage. For SSR/SSG, ensure this module is only
// loaded in the browser (e.g., via dynamic import or client-only bundle).
const mod = IS_APPLE ? "metaKey" : "ctrlKey";
const CONTROL_OR_META = { [mod]: true } as Record<string, boolean>;

export function registerShortcuts(editor: LexicalEditor): () => void {
  return editor.registerCommand(
    KEY_DOWN_COMMAND,
    (event: KeyboardEvent) => {
      const evt = event as unknown as Parameters<
        typeof isExactShortcutMatch
      >[0];

      if (isExactShortcutMatch(evt, "b", CONTROL_OR_META)) {
        toggleBold(editor);
        event.preventDefault();
        return true;
      }
      if (isExactShortcutMatch(evt, "i", CONTROL_OR_META)) {
        toggleItalic(editor);
        event.preventDefault();
        return true;
      }
      if (isExactShortcutMatch(evt, "u", CONTROL_OR_META)) {
        toggleUnderline(editor);
        event.preventDefault();
        return true;
      }
      if (isExactShortcutMatch(evt, "x", { [mod]: true, shiftKey: true })) {
        toggleStrikethrough(editor);
        event.preventDefault();
        return true;
      }
      if (isExactShortcutMatch(evt, "z", CONTROL_OR_META)) {
        undo(editor);
        event.preventDefault();
        return true;
      }
      if (IS_APPLE) {
        if (isExactShortcutMatch(evt, "z", { metaKey: true, shiftKey: true })) {
          redo(editor);
          event.preventDefault();
          return true;
        }
      } else {
        if (isExactShortcutMatch(evt, "y", { ctrlKey: true })) {
          redo(editor);
          event.preventDefault();
          return true;
        }
        if (isExactShortcutMatch(evt, "z", { ctrlKey: true, shiftKey: true })) {
          redo(editor);
          event.preventDefault();
          return true;
        }
      }
      if (isExactShortcutMatch(evt, "k", { [mod]: true, shiftKey: true })) {
        editor.dispatchCommand(SE_OPEN_LINK_COMMAND, undefined);
        event.preventDefault();
        return true;
      }
      if (isExactShortcutMatch(evt, "1", { [mod]: true, altKey: true })) {
        toggleHeading(editor, "h1" as HeadingTag);
        event.preventDefault();
        return true;
      }
      if (isExactShortcutMatch(evt, "2", { [mod]: true, altKey: true })) {
        toggleHeading(editor, "h2" as HeadingTag);
        event.preventDefault();
        return true;
      }
      if (isExactShortcutMatch(evt, "3", { [mod]: true, altKey: true })) {
        toggleHeading(editor, "h3" as HeadingTag);
        event.preventDefault();
        return true;
      }
      if (isExactShortcutMatch(evt, "7", { [mod]: true, shiftKey: true })) {
        toggleNumberedList(editor);
        event.preventDefault();
        return true;
      }
      if (isExactShortcutMatch(evt, "8", { [mod]: true, shiftKey: true })) {
        toggleBulletList(editor);
        event.preventDefault();
        return true;
      }
      return false;
    },
    COMMAND_PRIORITY_HIGH,
  );
}
