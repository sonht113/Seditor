import { useEffect, useMemo, useState } from "react";
import { CAN_REDO_COMMAND, CAN_UNDO_COMMAND } from "lexical";
import { SE_OPEN_IMAGE_COMMAND, SE_OPEN_LINK_COMMAND } from "seditor-core";
import { useEditor } from "./Editor";
import { defaultToolbarItems } from "./defaultToolbar";
import { ColorPicker } from "./ColorPicker";
import { FontSizePicker } from "./FontSizePicker";
import type { ToolbarItem } from "seditor-core";

export interface ToolbarProps {
  items?: ToolbarItem[];
  className?: string;
}

export function Toolbar({ items, className }: ToolbarProps) {
  const instance = useEditor();
  const [, force] = useState(0);

  const allItems = useMemo(
    () => items ?? [...defaultToolbarItems, ...instance.toolbarItems],
    [items, instance.toolbarItems],
  );

  useEffect(() => {
    const editor = instance.editor;
    const unregisterUpdate = editor.registerUpdateListener(() => {
      force((n) => n + 1);
    });
    const unregisterUndo = editor.registerCommand(
      CAN_UNDO_COMMAND,
      () => {
        force((n) => n + 1);
        return false;
      },
      0,
    );
    const unregisterRedo = editor.registerCommand(
      CAN_REDO_COMMAND,
      () => {
        force((n) => n + 1);
        return false;
      },
      0,
    );
    return () => {
      unregisterUpdate();
      unregisterUndo();
      unregisterRedo();
    };
  }, [instance]);

  const handleClick = (item: ToolbarItem) => {
    if (item.command === "setLink") {
      instance.editor.dispatchCommand(SE_OPEN_LINK_COMMAND, undefined);
      force((n) => n + 1);
      return;
    }
    if (item.command === "openImageDialog") {
      instance.editor.dispatchCommand(SE_OPEN_IMAGE_COMMAND, undefined);
      force((n) => n + 1);
      return;
    }
    if (item.command === "toggleHeading") {
      const tag = item.id === "h1" ? "h1" : item.id === "h2" ? "h2" : "h3";
      instance.commands.toggleHeading(tag);
      force((n) => n + 1);
      return;
    }
    if (item.command === "setAlign") {
      const align =
        item.id === "left" ? "left" : item.id === "right" ? "right" : "center";
      instance.commands.setAlign(align);
      force((n) => n + 1);
      return;
    }
    const fn = (
      instance.commands as unknown as Record<
        string,
        (...args: unknown[]) => void
      >
    )[item.command];
    if (fn) fn();
    force((n) => n + 1);
  };

  return (
    <div className={className ?? "se-toolbar"} role="toolbar">
      {allItems.map((item) => {
        if (item.separator) {
          return <span key={item.id} className="se-toolbar-separator" />;
        }
        if (item.command === "textColor") {
          return <ColorPicker key={item.id} kind="text" />;
        }
        if (item.command === "bgColor") {
          return <ColorPicker key={item.id} kind="background" />;
        }
        if (item.command === "fontSize") {
          return <FontSizePicker key={item.id} />;
        }
        const active = item.isActive?.(instance) ?? false;
        const enabled = item.enable?.(instance) ?? true;
        return (
          <button
            key={item.id}
            type="button"
            title={item.label}
            aria-label={item.label}
            aria-pressed={active}
            disabled={!enabled}
            className={`se-toolbar-button${active ? " se-toolbar-button-active" : ""}`}
            onMouseDown={(event) => {
              // Keep the editor focused so image node-selection / text range
              // selection survives while the toolbar button is clicked.
              event.preventDefault();
            }}
            onClick={() => handleClick(item)}
            dangerouslySetInnerHTML={
              item.icon ? { __html: item.icon } : undefined
            }
          >
            {item.icon ? undefined : item.label}
          </button>
        );
      })}
    </div>
  );
}
