import { useCallback, useEffect, useState } from "react";
import { COMMAND_PRIORITY_LOW } from "lexical";
import { SE_OPEN_TABLE_COMMAND } from "seditor-core";
import { INSERT_TABLE_COMMAND } from "seditor-plugin-table";
import { useEditor } from "./Editor";

const MAX_SIZE = 8;

interface PickerState {
  top: number;
  left: number;
}

export function TableGridPicker() {
  const instance = useEditor();
  const [state, setState] = useState<PickerState | null>(null);
  const [hover, setHover] = useState<{ rows: number; cols: number }>({
    rows: 1,
    cols: 1,
  });

  useEffect(() => {
    const unregister = instance.editor.registerCommand(
      SE_OPEN_TABLE_COMMAND,
      () => {
        const domSel = window.getSelection();
        let top = 0;
        let left = 0;
        if (domSel && domSel.rangeCount > 0) {
          const rect = domSel.getRangeAt(0).getBoundingClientRect();
          top = rect.bottom + 6;
          left = rect.left + rect.width / 2;
        }
        setState({ top, left });
        setHover({ rows: 1, cols: 1 });
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
    return unregister;
  }, [instance]);

  const close = useCallback(() => setState(null), []);

  const insert = useCallback(
    (rows: number, cols: number) => {
      instance.editor.dispatchCommand(INSERT_TABLE_COMMAND, {
        columns: String(cols),
        rows: String(rows),
        includeHeaders: { rows: true, columns: false },
      });
      instance.editor.focus();
      close();
    },
    [instance, close],
  );

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state, close]);

  useEffect(() => {
    if (!state) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".se-table-picker")) {
        close();
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [state, close]);

  if (!state) return null;

  const cells = [];
  for (let r = 1; r <= MAX_SIZE; r++) {
    for (let c = 1; c <= MAX_SIZE; c++) {
      const active = r <= hover.rows && c <= hover.cols;
      cells.push(
        <button
          key={`${r}-${c}`}
          type="button"
          className="se-table-picker-cell"
          data-active={active ? "true" : "false"}
          onMouseEnter={() => setHover({ rows: r, cols: c })}
          onClick={() => insert(r, c)}
          aria-label={`${r} rows by ${c} columns`}
        />,
      );
    }
  }

  return (
    <div
      className="se-table-picker"
      style={{
        top: state.top,
        left: state.left,
        transform: "translateX(-50%)",
        ["--se-table-picker-cols" as string]: MAX_SIZE,
      }}
      role="dialog"
      aria-label="Insert table"
    >
      <div className="se-table-picker-grid">{cells}</div>
      <div className="se-table-picker-label">
        {hover.rows} × {hover.cols}
      </div>
    </div>
  );
}
