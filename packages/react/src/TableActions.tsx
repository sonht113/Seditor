import { useCallback, useEffect, useRef, useState } from "react";
import {
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
} from "lexical";
import { $isTableSelection } from "@lexical/table";
import { isInTable, isTableHeaderRowActive } from "seditor-core";
import {
  canMergeTableCells,
  canUnmergeTableCell,
  deleteTable,
  insertTableRow,
  insertTableColumn,
  moveTableRow,
  moveTableColumn,
  deleteTableRow,
  deleteTableColumn,
  getActiveTableAlignment,
  getActiveTableCellBackgroundColor,
  getActiveTableCellVerticalAlign,
  getActiveTableBorder,
  getActiveTableKey,
  getTableSelectionBounds,
  isTableRowStripingActive,
  isTableHeaderColumnActive,
  $findCellNode,
  mergeTableCells,
  toggleTableHeaderRow,
  toggleTableHeaderColumn,
  toggleTableRowStriping,
  unmergeTableCell,
  setTableAlignment,
  setTableCellBackgroundColor,
  setTableCellVerticalAlign,
  setTableCellWidth,
  setTableColumnWidth,
  setTableRowHeight,
  setTableBorder,
} from "seditor-plugin-table";
import type { TableBorder } from "seditor-plugin-table";
import { useEditor } from "./Editor";

interface ActionsState {
  top: number;
  left: number;
  placement: "above" | "below";
  maxHeight: number;
}

function getActionPosition(bounds: {
  top: number;
  right: number;
  bottom: number;
  left: number;
}): ActionsState {
  const gap = 6;
  const padding = 8;
  const preferredHeight = Math.min(560, window.innerHeight * 0.8);
  const spaceBelow = window.innerHeight - bounds.bottom - gap - padding;
  const spaceAbove = bounds.top - gap - padding;
  const placement =
    spaceBelow < preferredHeight && spaceAbove > spaceBelow ? "above" : "below";
  const maxHeight = Math.max(
    80,
    placement === "above" ? spaceAbove : spaceBelow,
  );
  return {
    top: placement === "above" ? bounds.top - gap : bounds.bottom + gap,
    left: (bounds.left + bounds.right) / 2,
    placement,
    maxHeight,
  };
}

const ACTION_ICON = (path: string) =>
  `<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

const ROW_ABOVE_ICON = ACTION_ICON('<path d="M2 5h12M5 2v6M2 12h12"/>');
const ROW_BELOW_ICON = ACTION_ICON('<path d="M2 4h12M2 11h12M11 8v6"/>');
const COL_LEFT_ICON = ACTION_ICON('<path d="M4 2v12M11 2v12M2 5h12"/>');
const COL_RIGHT_ICON = ACTION_ICON('<path d="M5 2v12M12 2v12M2 8h12"/>');
const DELETE_ROW_ICON = ACTION_ICON('<path d="M2 5h12M4 2v6M2 12h12"/>');
const DELETE_COL_ICON = ACTION_ICON('<path d="M4 2v12M2 5h12"/>');
const HEADER_ICON = ACTION_ICON('<path d="M2 3h12v10H2zM2 7h12M6 3v10"/>');
const HEADER_COLUMN_ICON = ACTION_ICON(
  '<path d="M3 2h10v12H3zM7 2v12M3 6h10"/>',
);
const MERGE_ICON = ACTION_ICON('<path d="M2 4h5v8H2zM9 4h5v8H9zM7 8h2"/>');
const UNMERGE_ICON = ACTION_ICON(
  '<path d="M2 4h5v8H2zM9 4h5v8H9zM7 6h2M7 10h2"/>',
);
const DELETE_TABLE_ICON = ACTION_ICON('<path d="M3 3h10v10H3zM5 6h6M5 9h6"/>');
const STRIPING_ICON = ACTION_ICON(
  '<path d="M2 3h12v3H2zM2 8h12v3H2zM2 13h12"/>',
);
const MOVE_UP_ICON = ACTION_ICON('<path d="M2 11h12M8 3v8M5 6l3-3 3 3"/>');
const MOVE_DOWN_ICON = ACTION_ICON('<path d="M2 5h12M8 13V5M5 10l3 3 3-3"/>');
const MOVE_LEFT_ICON = ACTION_ICON('<path d="M11 2v12M5 8h8M8 5l-3 3 3 3"/>');
const MOVE_RIGHT_ICON = ACTION_ICON('<path d="M5 2v12M3 8h8M8 5l3 3-3 3"/>');

export function TableActions() {
  const instance = useEditor();
  const [state, setState] = useState<ActionsState | null>(null);
  const [isHeaderRow, setIsHeaderRow] = useState(false);
  const [isHeaderColumn, setIsHeaderColumn] = useState(false);
  const [canMerge, setCanMerge] = useState(false);
  const [canUnmerge, setCanUnmerge] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState<string | null>(null);
  const [verticalAlign, setVerticalAlign] = useState("top");
  const [tableAlign, setTableAlign] = useState("left");
  const [isStriped, setIsStriped] = useState(false);
  const [border, setBorder] = useState<TableBorder>({
    mode: "outer",
    style: "solid",
    color: "#e3e2e0",
    width: 1,
  });
  const [activeTableKey, setActiveTableKey] = useState<string | null>(null);
  const contextMenuOpen = useRef(false);

  const reposition = useCallback(() => {
    const tableBounds = getTableSelectionBounds(instance.editor);
    instance.editor.read(() => {
      const sel = $getSelection();
      if (
        (!$isRangeSelection(sel) && !$isTableSelection(sel)) ||
        ($isRangeSelection(sel) &&
          sel.isCollapsed() &&
          !contextMenuOpen.current)
      ) {
        setState(null);
        return;
      }
      if (!isInTable(instance.editor)) {
        setState(null);
        return;
      }
      const domSel = window.getSelection();
      const nativeRect =
        domSel && domSel.rangeCount > 0
          ? domSel.getRangeAt(0).getBoundingClientRect()
          : null;
      const rect = tableBounds ?? nativeRect;
      if (!rect) {
        setState(null);
        return;
      }
      setState(
        getActionPosition(
          tableBounds ?? {
            top: nativeRect!.top,
            right: nativeRect!.right,
            bottom: nativeRect!.bottom,
            left: nativeRect!.left,
          },
        ),
      );
      setIsHeaderRow(isTableHeaderRowActive(instance.editor));
      setIsHeaderColumn(isTableHeaderColumnActive(instance.editor));
      setCanMerge(canMergeTableCells(instance.editor));
      setCanUnmerge(canUnmergeTableCell(instance.editor));
      setBackgroundColor(getActiveTableCellBackgroundColor(instance.editor));
      setVerticalAlign(getActiveTableCellVerticalAlign(instance.editor));
      setTableAlign(getActiveTableAlignment(instance.editor));
      setIsStriped(isTableRowStripingActive(instance.editor));
       setBorder(getActiveTableBorder(instance.editor));
       setActiveTableKey(getActiveTableKey(instance.editor));
    });
  }, [instance]);

  useEffect(() => {
    const editor = instance.editor;
    const unregisterSelection = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        reposition();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
    const unregisterUpdate = editor.registerUpdateListener(() => {
      reposition();
    });
    return () => {
      unregisterSelection();
      unregisterUpdate();
    };
  }, [instance, reposition]);

  const close = useCallback(() => {
    contextMenuOpen.current = false;
    setState(null);
  }, []);

  const run = useCallback(
    (fn: () => void) => {
      fn();
      instance.editor.focus();
      close();
    },
    [instance, close],
  );

  useEffect(() => {
    if (!state) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".se-table-actions")) {
        close();
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [state, close]);

  useEffect(() => {
    const onContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const cell = target.closest("td, th");
      const root = instance.editor.getRootElement();
      if (!cell || !root || !root.contains(cell)) return;
      event.preventDefault();
      contextMenuOpen.current = true;

      const currentBounds = getTableSelectionBounds(instance.editor);
      const bounds = currentBounds ?? {
        top: event.clientY,
        right: event.clientX,
        bottom: event.clientY,
        left: event.clientX,
      };
      setState(getActionPosition(bounds));
      setIsHeaderRow(isTableHeaderRowActive(instance.editor));
      setIsHeaderColumn(isTableHeaderColumnActive(instance.editor));
      setCanMerge(canMergeTableCells(instance.editor));
      setCanUnmerge(canUnmergeTableCell(instance.editor));

      if (!currentBounds) {
        const key = cell.getAttribute("data-lexical-node-key");
        if (key) {
          instance.editor.update(() => {
            const node = $getNodeByKey(key);
            const cellNode = node ? $findCellNode(node) : null;
            cellNode?.selectStart();
          });
        }
      }
    };
    document.addEventListener("contextmenu", onContextMenu);
    return () => document.removeEventListener("contextmenu", onContextMenu);
  }, [instance]);

  useEffect(() => {
    let resize: {
      mode: "column" | "cell" | "row";
      key: string;
      startX: number;
      startY: number;
      startWidth: number;
      startHeight: number;
    } | null = null;

    const onPointerMove = (event: PointerEvent) => {
      if (!resize) return;
      if (resize.mode === "row") {
        setTableRowHeight(
          instance.editor,
          resize.key,
          resize.startHeight + event.clientY - resize.startY,
        );
      } else if (resize.mode === "cell") {
        setTableCellWidth(
          instance.editor,
          resize.key,
          resize.startWidth + event.clientX - resize.startX,
        );
      } else {
        setTableColumnWidth(
          instance.editor,
          resize.key,
          resize.startWidth + event.clientX - resize.startX,
        );
      }
    };
    const stopResize = () => {
      if (!resize) return;
      resize = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", stopResize);
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      const cell = target.closest("td, th") as HTMLTableCellElement | null;
      const root = instance.editor.getRootElement();
      if (!cell || !root || !root.contains(cell)) return;
      const rect = cell.getBoundingClientRect();
      const nearRight = rect.right - event.clientX <= 8;
      const nearBottom = rect.bottom - event.clientY <= 8;
      if (!nearRight && !nearBottom) return;
      const cellKey = cell.getAttribute("data-lexical-node-key");
      const rowKey = cell.parentElement?.getAttribute("data-lexical-node-key");
      if (!cellKey || !rowKey) return;
      event.preventDefault();
      const mode =
        nearRight && event.altKey ? "cell" : nearBottom ? "row" : "column";
      resize = {
        mode,
        key: mode === "row" ? rowKey : cellKey,
        startX: event.clientX,
        startY: event.clientY,
        startWidth: rect.width,
        startHeight: rect.height,
      };
      document.body.style.cursor = mode === "row" ? "row-resize" : "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", stopResize);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      stopResize();
    };
  }, [instance]);

  if (!state) return null;

  const btn = (label: string, icon: string, fn: () => void, active = false) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      data-active={active ? "true" : "false"}
      onClick={() => run(fn)}
      dangerouslySetInnerHTML={{ __html: `${icon}<span>${label}</span>` }}
    />
  );

  return (
    <div
      className="se-table-actions"
      style={{
        top: state.top,
        left: state.left,
        maxHeight: state.maxHeight,
        transform:
          state.placement === "above"
            ? "translate(-50%, -100%)"
            : "translateX(-50%)",
      }}
      role="menu"
    >
      {btn("Insert row above", ROW_ABOVE_ICON, () =>
        insertTableRow(instance.editor, false),
      )}
      {btn("Insert row below", ROW_BELOW_ICON, () =>
        insertTableRow(instance.editor, true),
      )}
      {btn("Move row up", MOVE_UP_ICON, () =>
        moveTableRow(instance.editor, false),
      )}
      {btn("Move row down", MOVE_DOWN_ICON, () =>
        moveTableRow(instance.editor, true),
      )}
      {btn("Insert column left", COL_LEFT_ICON, () =>
        insertTableColumn(instance.editor, false),
      )}
      {btn("Insert column right", COL_RIGHT_ICON, () =>
        insertTableColumn(instance.editor, true),
      )}
      {btn("Move column left", MOVE_LEFT_ICON, () =>
        moveTableColumn(instance.editor, false),
      )}
      {btn("Move column right", MOVE_RIGHT_ICON, () =>
        moveTableColumn(instance.editor, true),
      )}
      <div className="se-table-actions-separator" />
      {btn("Delete row", DELETE_ROW_ICON, () =>
        deleteTableRow(instance.editor),
      )}
      {btn("Delete column", DELETE_COL_ICON, () =>
        deleteTableColumn(instance.editor),
      )}
      <div className="se-table-actions-separator" />
      {btn(
        "Toggle header row",
        HEADER_ICON,
        () => toggleTableHeaderRow(instance.editor),
        isHeaderRow,
      )}
      {btn(
        "Toggle header column",
        HEADER_COLUMN_ICON,
        () => toggleTableHeaderColumn(instance.editor),
        isHeaderColumn,
      )}
      {canMerge && (
        <>
          <div className="se-table-actions-separator" />
          {btn("Merge cells", MERGE_ICON, () =>
            mergeTableCells(instance.editor),
          )}
        </>
      )}
      {canUnmerge &&
        btn("Unmerge cell", UNMERGE_ICON, () =>
          unmergeTableCell(instance.editor),
        )}
      <div className="se-table-actions-control">
        <label htmlFor="se-table-cell-color">Cell color</label>
        <input
          id="se-table-cell-color"
          type="color"
          value={backgroundColor ?? "#ffffff"}
          onMouseDown={(event) => event.stopPropagation()}
          onChange={(event) => {
            const color = event.currentTarget.value;
            setTableCellBackgroundColor(instance.editor, color);
            setBackgroundColor(color);
          }}
        />
        {backgroundColor && (
          <button
            type="button"
            className="se-table-actions-clear"
            onClick={() => {
              setTableCellBackgroundColor(instance.editor, null);
              setBackgroundColor(null);
            }}
          >
            Clear
          </button>
        )}
      </div>
      <div className="se-table-actions-control">
        <span>Vertical align</span>
        <div className="se-table-actions-inline">
          {(["top", "middle", "bottom"] as const).map((align) => (
            <button
              key={align}
              type="button"
              data-active={verticalAlign === align ? "true" : "false"}
              onClick={() =>
                run(() => setTableCellVerticalAlign(instance.editor, align))
              }
            >
              {align}
            </button>
          ))}
        </div>
      </div>
      <div className="se-table-actions-control">
        <span>Table align</span>
        <div className="se-table-actions-inline">
          {(["left", "center", "right"] as const).map((align) => (
            <button
              key={align}
              type="button"
              data-active={tableAlign === align ? "true" : "false"}
              onClick={() =>
                run(() => setTableAlignment(instance.editor, align))
              }
            >
              {align}
            </button>
          ))}
        </div>
      </div>
      <div className="se-table-actions-control">
        <label htmlFor="se-table-border-style">Border</label>
        <select
          value={border.mode ?? "outer"}
          aria-label="Border target"
          onChange={(event) => {
            const next = {
              ...border,
              mode: event.currentTarget.value as NonNullable<
                typeof border.mode
              >,
            };
            setBorder(next);
            setTableBorder(instance.editor, next, activeTableKey ?? undefined);
          }}
        >
          <option value="outer">Whole table</option>
          <option value="rows">Rows</option>
          <option value="columns">Columns</option>
        </select>
        <select
          id="se-table-border-style"
          value={border.style}
          onChange={(event) => {
            const next = {
              ...border,
              style: event.currentTarget.value as typeof border.style,
            };
            setBorder(next);
            setTableBorder(instance.editor, next, activeTableKey ?? undefined);
          }}
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
          <option value="double">Double</option>
          <option value="none">None</option>
        </select>
        <input
          type="color"
          value={border.color}
          aria-label="Table border color"
          onChange={(event) => {
            const next = { ...border, color: event.currentTarget.value };
            setBorder(next);
            setTableBorder(instance.editor, next, activeTableKey ?? undefined);
          }}
        />
        <select
          value={border.width}
          aria-label="Table border width"
          onChange={(event) => {
            const next = {
              ...border,
              width: Number(event.currentTarget.value),
            };
            setBorder(next);
            setTableBorder(instance.editor, next, activeTableKey ?? undefined);
          }}
        >
          {[0, 1, 2, 3, 4].map((width) => (
            <option key={width} value={width}>
              {width}px
            </option>
          ))}
        </select>
      </div>
      {btn(
        "Toggle striped rows",
        STRIPING_ICON,
        () => toggleTableRowStriping(instance.editor),
        isStriped,
      )}
      <div className="se-table-actions-separator" />
      {btn("Delete table", DELETE_TABLE_ICON, () =>
        deleteTable(instance.editor),
      )}
    </div>
  );
}
