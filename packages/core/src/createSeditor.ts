import {
  createEditor,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  $getSelection,
  $isRangeSelection,
  $getNearestNodeFromDOMNode,
  $findMatchingParent,
  $createTextNode,
  $insertNodes,
  COMMAND_PRIORITY_LOW,
  CONTROLLED_TEXT_INSERTION_COMMAND,
  isDOMNode,
  type Klass,
  type LexicalEditor,
  type LexicalNode,
} from "lexical";
import { registerHistory, createEmptyHistoryState } from "@lexical/history";
import { registerList } from "@lexical/list";
import { registerRichText } from "@lexical/rich-text";
import {
  TOGGLE_LINK_COMMAND,
  $toggleLink,
  $isLinkNode,
  type LinkAttributes,
} from "@lexical/link";
import { getMvpNodes } from "./nodes";
import { defaultTheme, mergeTheme } from "./theme";
import { SE_SET_ALIGN_COMMAND } from "./pluginCommands";
import {
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleStrikethrough,
  toggleHeading,
  setParagraph,
  setAlign,
  toggleBulletList,
  toggleNumberedList,
  setLink,
  unsetLink,
  setTextColor,
  setTextBackgroundColor,
  clearTextColor,
  clearTextBackgroundColor,
  setFontSize,
  clearFontSize,
  clearPendingInlineStyles,
  clearPendingFontSize,
  getPendingTextColor,
  getPendingBgColor,
  getPendingFontSize,
  buildPendingStyle,
  undo,
  redo,
} from "./commands";
import { getHTML, getJSON, setHTML } from "./serialization";
import { registerShortcuts } from "./shortcuts";
import type {
  SeditorConfig,
  SeditorInstance,
  SeditorPlugin,
  ThemeConfig,
  AlignType,
} from "./types";

export function createSeditor(config: SeditorConfig = {}): SeditorInstance {
  const plugins = config.plugins ?? [];

  const pluginTheme = plugins.reduce<ThemeConfig>(
    (acc, p) => (p.theme ? mergeTheme(acc, p.theme) : acc),
    {},
  );
  const theme = mergeTheme(mergeTheme(defaultTheme, config.theme), pluginTheme);

  const pluginNodes = deduplicateNodes(plugins.flatMap((p) => p.nodes ?? []));
  const toolbarItems = plugins.flatMap((p) => {
    if (!p.toolbarItem) return [];
    return Array.isArray(p.toolbarItem) ? p.toolbarItem : [p.toolbarItem];
  });

  const editor = createEditor({
    namespace: config.namespace ?? "seditor",
    theme: theme as Record<string, unknown>,
    nodes: [...getMvpNodes(), ...pluginNodes],
    onError: (error) => {
      console.error("[Seditor]", error);
    },
  });

  const cleanups: Array<() => void> = [];
  cleanups.push(registerRichText(editor));
  cleanups.push(registerHistory(editor, createEmptyHistoryState(), 500));
  cleanups.push(registerList(editor));
  cleanups.push(
    editor.registerCommand(
      TOGGLE_LINK_COMMAND,
      (payload: string | ({ url: string } & LinkAttributes) | null) => {
        if (payload === null) {
          $toggleLink(null);
        } else if (typeof payload === "string") {
          $toggleLink(payload);
        } else {
          $toggleLink(payload.url, payload);
        }
        return true;
      },
      0,
    ),
  );

  cleanups.push(
    editor.registerCommand(
      CONTROLLED_TEXT_INSERTION_COMMAND,
      (event: InputEvent | string) => {
        if (
          getPendingTextColor() === null &&
          getPendingBgColor() === null &&
          getPendingFontSize() === null
        ) {
          return false;
        }
        const text = typeof event === "string" ? event : event.data;
        if (!text) return false;
        if (typeof event !== "string") event.preventDefault();
        const style = buildPendingStyle();
        const sel = $getSelection();
        if (!$isRangeSelection(sel)) return false;
        const node = $createTextNode(text);
        if (style) node.setStyle(style);
        $insertNodes([node]);
        return true;
      },
      COMMAND_PRIORITY_LOW,
    ),
  );

  cleanups.push(registerLinkClickHandler(editor));

  cleanups.push(
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const sel = $getSelection();
        if ($isRangeSelection(sel) && !sel.isCollapsed()) {
          clearPendingInlineStyles();
          clearPendingFontSize();
        }
      });
    }),
  );

  let canUndo = false;
  let canRedo = false;
  cleanups.push(
    editor.registerCommand(
      CAN_UNDO_COMMAND,
      (value: boolean) => {
        canUndo = value;
        return false;
      },
      0,
    ),
  );
  cleanups.push(
    editor.registerCommand(
      CAN_REDO_COMMAND,
      (value: boolean) => {
        canRedo = value;
        return false;
      },
      0,
    ),
  );

  if (config.shortcuts !== false) {
    cleanups.push(registerShortcuts(editor));
  }

  if (config.editable === false) {
    editor.setEditable(false);
  }

  for (const plugin of plugins) {
    registerPluginInternal(editor, plugin, cleanups);
  }

  if (config.html) {
    setHTML(editor, config.html);
  }

  const commands = {
    toggleBold: () => toggleBold(editor),
    toggleItalic: () => toggleItalic(editor),
    toggleUnderline: () => toggleUnderline(editor),
    toggleStrikethrough: () => toggleStrikethrough(editor),
    toggleHeading: (tag: Parameters<typeof toggleHeading>[1]) =>
      toggleHeading(editor, tag),
    setParagraph: () => setParagraph(editor),
    setAlign: (align: AlignType) => {
      editor.dispatchCommand(SE_SET_ALIGN_COMMAND, align);
      setAlign(editor, align);
    },
    toggleBulletList: () => toggleBulletList(editor),
    toggleNumberedList: () => toggleNumberedList(editor),
    setLink: (url: string) => setLink(editor, url),
    unsetLink: () => unsetLink(editor),
    setTextColor: (color: string) => setTextColor(editor, color),
    setTextBackgroundColor: (color: string) =>
      setTextBackgroundColor(editor, color),
    clearTextColor: () => clearTextColor(editor),
    clearTextBackgroundColor: () => clearTextBackgroundColor(editor),
    setFontSize: (size: string) => setFontSize(editor, size),
    clearFontSize: () => clearFontSize(editor),
    undo: () => undo(editor),
    redo: () => redo(editor),
    focus: () => editor.focus(),
  };

  const registerPlugin = (plugin: SeditorPlugin) => {
    if (plugin.nodes && plugin.nodes.length > 0) {
      console.warn(
        "[Seditor] Plugin '%s' has nodes but was registered dynamically. " +
          "Nodes must be passed via config.plugins to be registered before editor creation. " +
          "The nodes field is ignored for dynamically registered plugins.",
        plugin.name,
      );
    }
    const localCleanups: Array<() => void> = [];
    registerPluginInternal(editor, plugin, localCleanups);
    return () => {
      for (const fn of localCleanups) fn();
    };
  };

  const destroy = () => {
    for (const plugin of plugins) {
      plugin.onDestroy?.(editor);
    }
    for (const fn of cleanups) fn();
    cleanups.length = 0;
  };

  return {
    editor,
    commands,
    registerPlugin,
    getHTML: () => getHTML(editor),
    getJSON: () => getJSON(editor),
    setHTML: (html: string) => setHTML(editor, html),
    canUndo: () => canUndo,
    canRedo: () => canRedo,
    placeholder: config.placeholder ?? null,
    toolbarItems,
    destroy,
  };
}

function registerPluginInternal(
  editor: LexicalEditor,
  plugin: SeditorPlugin,
  cleanups: Array<() => void>,
): void {
  plugin.onInit?.(editor);
  if (plugin.listeners) {
    const unregisters = plugin.listeners(editor);
    for (const fn of unregisters) cleanups.push(fn);
  }
}

function deduplicateNodes(
  nodes: Array<Klass<LexicalNode>>,
): Array<Klass<LexicalNode>> {
  const seen = new Map<string, Klass<LexicalNode>>();
  for (const node of nodes) {
    const type = node.getType();
    seen.set(type, node);
  }
  return Array.from(seen.values());
}

function registerLinkClickHandler(editor: LexicalEditor): () => void {
  const onClick = (event: MouseEvent) => {
    const target = event.target;
    if (!isDOMNode(target)) return;
    const root = editor.getRootElement();
    if (!root || !root.contains(target as Node)) return;

    let url: string | null = null;
    editor.read(() => {
      const clickedNode = $getNearestNodeFromDOMNode(target as Node);
      if (!clickedNode) return;
      const linkNode = $findMatchingParent(clickedNode, $isLinkNode);
      if (linkNode && $isLinkNode(linkNode)) {
        url = linkNode.getURL();
      }
    });

    if (!url) return;

    const selection = editor.read(() => $getSelection());
    if ($isRangeSelection(selection) && !selection.isCollapsed()) {
      return;
    }

    event.preventDefault();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const root = editor.getRootElement();
  if (root) {
    root.addEventListener("click", onClick);
  }

  const unregisterRootListener = editor.registerRootListener(
    (nextRoot, prevRoot) => {
      if (prevRoot) prevRoot.removeEventListener("click", onClick);
      if (nextRoot) nextRoot.addEventListener("click", onClick);
    },
  );

  return () => {
    const r = editor.getRootElement();
    r?.removeEventListener("click", onClick);
    unregisterRootListener();
  };
}
