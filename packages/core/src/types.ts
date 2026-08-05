import type { Klass, LexicalEditor, LexicalNode } from "lexical";

export type HeadingTag = "h1" | "h2" | "h3";
export type ListKind = "bullet" | "number";
export type AlignType = "left" | "center" | "right";

export interface ToolbarItem {
  id: string;
  label: string;
  icon?: string;
  command: string;
  separator?: boolean;
  isActive?: (instance: SeditorInstance) => boolean;
  enable?: (instance: SeditorInstance) => boolean;
}

export type ThemeConfig = Record<string, unknown>;

export interface SeditorPlugin {
  name: string;
  nodes?: Array<Klass<LexicalNode>>;
  listeners?: (editor: LexicalEditor) => Array<() => void>;
  toolbarItem?: ToolbarItem | ToolbarItem[];
  theme?: Partial<ThemeConfig>;
  onInit?: (editor: LexicalEditor) => void;
  onDestroy?: (editor: LexicalEditor) => void;
}

export type PluginFactory<TConfig = unknown> = (
  config?: TConfig,
) => SeditorPlugin;

export interface SeditorConfig {
  namespace?: string;
  theme?: Partial<ThemeConfig>;
  plugins?: SeditorPlugin[];
  editable?: boolean;
  html?: string;
  placeholder?: string;
  shortcuts?: boolean;
  onError?: (error: Error) => void;
}

export interface SeditorCommands {
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  toggleStrikethrough: () => void;
  toggleHeading: (tag: HeadingTag) => void;
  setParagraph: () => void;
  setAlign: (align: AlignType) => void;
  toggleBulletList: () => void;
  toggleNumberedList: () => void;
  setLink: (url: string) => void;
  unsetLink: () => void;
  setTextColor: (color: string) => void;
  setTextBackgroundColor: (color: string) => void;
  clearTextColor: () => void;
  clearTextBackgroundColor: () => void;
  setFontSize: (size: string) => void;
  clearFontSize: () => void;
  undo: () => void;
  redo: () => void;
  focus: () => void;
}

export interface SeditorInstance {
  editor: LexicalEditor;
  commands: SeditorCommands;
  registerPlugin: (plugin: SeditorPlugin) => () => void;
  getHTML: () => string;
  getJSON: () => unknown;
  setHTML: (html: string) => void;
  setJSON: (json: unknown) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  placeholder: string | null;
  toolbarItems: ToolbarItem[];
  destroy: () => void;
}
