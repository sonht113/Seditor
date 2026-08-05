export { createSeditor } from "./createSeditor";
export { defaultTheme, mergeTheme } from "./theme";
export { getMvpNodes } from "./nodes";
export {
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleStrikethrough,
  toggleHeading,
  setParagraph,
  setAlign,
  toggleBulletList,
  toggleNumberedList,
  toggleList,
  clearList,
  setLink,
  unsetLink,
  setTextColor,
  setTextBackgroundColor,
  clearTextColor,
  clearTextBackgroundColor,
  clearPendingInlineStyles,
  setFontSize,
  clearFontSize,
  clearPendingFontSize,
  getPendingTextColor,
  getPendingBgColor,
  getPendingFontSize,
  undo,
  redo,
} from "./commands";
export { getHTML, getJSON, setHTML, setJSON } from "./serialization";
export { registerShortcuts, SE_OPEN_LINK_COMMAND } from "./shortcuts";
export { SE_OPEN_IMAGE_COMMAND, SE_SET_ALIGN_COMMAND } from "./pluginCommands";
export {
  isTextFormatActive,
  isHeadingActive,
  isBulletListActive,
  isNumberedListActive,
  isLinkActive,
  getLinkUrl,
  getTextColor,
  getTextBackgroundColor,
  getActiveAlign,
  getActiveFontSize,
  getActiveImageAlign,
} from "./queries";
export type {
  SeditorConfig,
  SeditorInstance,
  SeditorCommands,
  SeditorPlugin,
  PluginFactory,
  ToolbarItem,
  ThemeConfig,
  HeadingTag,
  ListKind,
  AlignType,
} from "./types";

export {
  createEditor,
  createCommand,
  type LexicalEditor,
  type EditorState,
  type LexicalNode,
  type Klass,
  $getRoot,
  $getSelection,
  $createParagraphNode,
  $createTextNode,
  $isTextNode,
  FORMAT_TEXT_COMMAND,
  INSERT_PARAGRAPH_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from "lexical";
