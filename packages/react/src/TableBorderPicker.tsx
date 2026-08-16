import { useEffect, useRef, useState } from "react";
import type {
  TableBorder,
  TableBorderMode,
  TableBorderStyle,
} from "seditor-plugin-table";
import {
  getActiveTableBorder,
  getActiveTableKey,
  setTableBorder,
} from "seditor-plugin-table";
import type { ToolbarItem } from "seditor-core";
import { useEditor } from "./Editor";

interface TableBorderPickerProps {
  item: ToolbarItem;
}

interface PopupState {
  top: number;
  left: number;
}

export function TableBorderPicker({ item }: TableBorderPickerProps) {
  const instance = useEditor();
  const containerRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const tableKeyRef = useRef<string | null>(null);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [tableKey, setTableKey] = useState<string | null>(null);
  const [border, setBorder] = useState<TableBorder>({
    mode: "outer",
    style: "solid",
    color: "#e3e2e0",
    width: 1,
  });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(item.enable?.(instance) ?? true);
    const unregister = instance.editor.registerUpdateListener(() => {
      setEnabled(item.enable?.(instance) ?? true);
      if (popup) setBorder(getActiveTableBorder(instance.editor));
    });
    return () => unregister();
  }, [instance, popup]);

  useEffect(() => {
    if (!popup) return;
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target)) {
        setPopup(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setPopup(null);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [popup]);

  const updateBorder = (changes: Partial<TableBorder>) => {
    const next = { ...border, ...changes };
    setBorder(next);
    setTableBorder(
      instance.editor,
      next,
      tableKeyRef.current ?? tableKey ?? undefined,
    );
  };

  return (
    <span className="se-table-border-picker" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        title={item.label}
        aria-label={item.label}
        aria-expanded={popup !== null}
        disabled={!enabled}
        className="se-toolbar-button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          if (!buttonRef.current) return;
          const rect = buttonRef.current.getBoundingClientRect();
          const activeTableKey = getActiveTableKey(instance.editor);
          tableKeyRef.current = activeTableKey;
          setTableKey(activeTableKey);
          setBorder(getActiveTableBorder(instance.editor));
          setPopup({ top: rect.bottom + 4, left: rect.left });
        }}
        dangerouslySetInnerHTML={item.icon ? { __html: item.icon } : undefined}
      />
      {popup && (
        <div
          ref={pickerRef}
          className="se-table-border-popup"
          style={{ top: popup.top, left: popup.left }}
          role="dialog"
          aria-label="Table border settings"
        >
          <label>
            Apply to
            <select
              value={border.mode ?? "outer"}
              onChange={(event) =>
                updateBorder({
                  mode: event.currentTarget.value as TableBorderMode,
                })
              }
            >
              <option value="outer">Whole table</option>
              <option value="rows">Rows</option>
              <option value="columns">Columns</option>
            </select>
          </label>
          <label>
            Style
            <select
              value={border.style}
              onChange={(event) =>
                updateBorder({
                  style: event.currentTarget.value as TableBorderStyle,
                })
              }
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="double">Double</option>
              <option value="none">None</option>
            </select>
          </label>
          <label>
            Color
            <input
              type="color"
              value={border.color}
              onChange={(event) =>
                updateBorder({ color: event.currentTarget.value })
              }
            />
          </label>
          <label>
            Width
            <select
              value={border.width}
              onChange={(event) =>
                updateBorder({ width: Number(event.currentTarget.value) })
              }
            >
              {[0, 1, 2, 3, 4].map((width) => (
                <option key={width} value={width}>
                  {width}px
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </span>
  );
}
