import type { ToolbarItem } from "@seditor/editor-core";
import {
  isTextFormatActive,
  isHeadingActive,
  isBulletListActive,
  isNumberedListActive,
  isLinkActive,
  getActiveAlign,
  getActiveImageAlign,
} from "@seditor/editor-core";

const icon = (path: string) =>
  `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

const separator = (id: string): ToolbarItem => ({
  id,
  label: "",
  command: "",
  separator: true,
});

export const defaultToolbarItems: ToolbarItem[] = [
  {
    id: "bold",
    label: "Bold",
    icon: icon(
      '<path d="M4 3h5a2.5 2.5 0 0 1 0 5H4zM4 8h5.5a2.5 2.5 0 0 1 0 5H4z"/>',
    ),
    command: "toggleBold",
    isActive: (inst) => isTextFormatActive(inst.editor, "bold"),
  },
  {
    id: "italic",
    label: "Italic",
    icon: icon('<path d="M7 3h6M3 13h6M10 3L6 13"/>'),
    command: "toggleItalic",
    isActive: (inst) => isTextFormatActive(inst.editor, "italic"),
  },
  {
    id: "underline",
    label: "Underline",
    icon: icon('<path d="M4 3v5a4 4 0 0 0 8 0V3M4 14h8"/>'),
    command: "toggleUnderline",
    isActive: (inst) => isTextFormatActive(inst.editor, "underline"),
  },
  {
    id: "strikethrough",
    label: "Strikethrough",
    icon: icon('<path d="M3 8h10M5 3h6a2 2 0 0 1 0 4M5 13h6a2 2 0 0 0 0-4"/>'),
    command: "toggleStrikethrough",
    isActive: (inst) => isTextFormatActive(inst.editor, "strikethrough"),
  },
  separator("sep1"),
  {
    id: "h1",
    label: "Heading 1",
    icon: icon('<path d="M2 3v10M9 3v10M2 8h7M12 6l2-1v8"/>'),
    command: "toggleHeading",
    isActive: (inst) => isHeadingActive(inst.editor, "h1"),
  },
  {
    id: "h2",
    label: "Heading 2",
    icon: icon(
      '<path d="M2 3v10M9 3v10M2 8h7M12 5a1.5 1.5 0 1 1 3 0c0 1.5-3 2-3 4h3"/>',
    ),
    command: "toggleHeading",
    isActive: (inst) => isHeadingActive(inst.editor, "h2"),
  },
  separator("sep2"),
  {
    id: "bulletList",
    label: "Bullet list",
    icon: icon('<path d="M7 4h7M7 8h7M7 12h7M3 4h.01M3 8h.01M3 12h.01"/>'),
    command: "toggleBulletList",
    isActive: (inst) => isBulletListActive(inst.editor),
  },
  {
    id: "numberedList",
    label: "Numbered list",
    icon: icon('<path d="M7 4h7M7 8h7M7 12h7M3 3v3M2 6h2M3 9h.01M2 12h2v2"/>'),
    command: "toggleNumberedList",
    isActive: (inst) => isNumberedListActive(inst.editor),
  },
  separator("sep3"),
  {
    id: "left",
    label: "Align left",
    icon: icon('<path d="M2 3h12M2 6h8M2 9h12M2 12h8"/>'),
    command: "setAlign",
    isActive: (inst) =>
      (getActiveAlign(inst.editor) ?? getActiveImageAlign(inst.editor)) ===
      "left",
  },
  {
    id: "center",
    label: "Align center",
    icon: icon('<path d="M2 3h12M4 6h8M2 9h12M4 12h8"/>'),
    command: "setAlign",
    isActive: (inst) =>
      (getActiveAlign(inst.editor) ?? getActiveImageAlign(inst.editor)) ===
      "center",
  },
  {
    id: "right",
    label: "Align right",
    icon: icon('<path d="M2 3h12M6 6h8M2 9h12M6 12h8"/>'),
    command: "setAlign",
    isActive: (inst) =>
      (getActiveAlign(inst.editor) ?? getActiveImageAlign(inst.editor)) ===
      "right",
  },
  separator("sepAlign"),
  {
    id: "fontSize",
    label: "Font size",
    command: "fontSize",
  },
  separator("sepFontSize"),
  {
    id: "textColor",
    label: "Text color",
    icon: icon('<path d="M4 3h6M7 3v10M5 13h4M7 13v-2"/>'),
    command: "textColor",
  },
  {
    id: "bgColor",
    label: "Background color",
    icon: icon(
      '<path d="M3 3h10v10H3z" fill="currentColor" fill-opacity="0.15"/><path d="M3 3h10v10H3z"/><path d="M5 7h6M5 10h4"/>',
    ),
    command: "bgColor",
  },
  separator("sepColor"),
  {
    id: "link",
    label: "Link",
    icon: icon(
      '<path d="M6.5 9.5l3-3M5 11a2.5 2.5 0 0 1 0-3.5l1-1a2.5 2.5 0 0 1 3.5 0M11 5a2.5 2.5 0 0 1 0 3.5l-1 1a2.5 2.5 0 0 1-3.5 0"/>',
    ),
    command: "setLink",
    isActive: (inst) => isLinkActive(inst.editor),
  },
  separator("sep4"),
  {
    id: "undo",
    label: "Undo",
    icon: icon('<path d="M3 7v3h3M3 10a5 5 0 1 1 1.5 3.5"/>'),
    command: "undo",
    enable: (inst) => inst.canUndo(),
  },
  {
    id: "redo",
    label: "Redo",
    icon: icon('<path d="M13 7v3h-3M13 10a5 5 0 1 0-1.5 3.5"/>'),
    command: "redo",
    enable: (inst) => inst.canRedo(),
  },
];
