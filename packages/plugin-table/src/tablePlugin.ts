import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $insertNodes,
  COMMAND_PRIORITY_LOW,
  KEY_DOWN_COMMAND,
  type LexicalEditor,
} from "lexical";
import {
  TableCellNode,
  TableNode,
  TableRowNode,
  $createTableNodeWithDimensions,
  $deleteTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $findCellNode,
  $findTableNode,
  $getTableCellNodeFromLexicalNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $getTableRowIndexFromTableCellNode,
  $getTableColumnIndexFromTableCellNode,
  $isTableCellNode,
  $isTableRowNode,
  $isTableSelection,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  $mergeCells,
  $isSimpleTable,
  $moveTableColumn,
  $moveTableRow,
  $setTableColumnIsHeader,
  $setTableRowIsHeader,
  $unmergeCell,
  $isTableNode,
  INSERT_TABLE_COMMAND,
  registerTablePlugin,
  registerTableSelectionObserver,
  setScrollableTablesActive,
  type InsertTableCommandPayload,
  type InsertTableCommandPayloadHeaders,
} from "@lexical/table";
import {
  type SeditorPlugin,
  type ThemeConfig,
  type ToolbarItem,
  isInTable,
  SE_OPEN_TABLE_COMMAND,
} from "seditor-core";

export type TableCellVerticalAlign = "top" | "middle" | "bottom";
export type TableAlign = "left" | "center" | "right";
export type TableBorderStyle =
  "solid" | "dashed" | "dotted" | "double" | "none";
export type TableBorderMode = "outer" | "rows" | "columns";
export interface TableBorder {
  mode?: TableBorderMode;
  style: TableBorderStyle;
  color: string;
  width: number;
}
export interface TableSelectionBounds {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const TABLE_ICON =
  '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="12" height="12" rx="1"/><path d="M2 6h12M2 10h12M6 2v12M10 2v12"/></svg>';
const TABLE_BORDER_ICON =
  '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="2" width="12" height="12" rx="1"/><path d="M2 6h12M2 10h12M6 2v12M10 2v12"/><path d="M1 1h3M12 1h3M1 15h3M12 15h3"/></svg>';

export interface TablePluginConfig {
  /** Default number of columns when no payload is supplied. */
  defaultColumns?: number;
  /** Default number of rows when no payload is supplied. */
  defaultRows?: number;
  /**
   * Header configuration for newly inserted tables. Defaults to a header
   * row only (`{ rows: true, columns: false }`). Pass `true` for both row
   * and column headers, `false` for none.
   */
  defaultHeaders?: InsertTableCommandPayloadHeaders;
  /** Apply alternating row styling to newly inserted tables. */
  defaultRowStriping?: boolean;
  /** Wrap tables in a horizontally scrollable container. */
  scrollable?: boolean;
  /** Freeze the leading row when the table is scrollable. */
  defaultFrozenRows?: number;
  /** Freeze the leading column when the table is scrollable. */
  defaultFrozenColumns?: number;
}

const tableTheme: Partial<ThemeConfig> = {
  table: "se-table",
  tableRow: "se-table-row",
  tableCell: "se-table-cell",
  tableCellHeader: "se-table-cell-header",
  tableCellSelected: "se-table-cell-selected",
  tableRowStriping: "se-table-row-striping",
  tableAlignment: {
    center: "se-table-align-center",
    right: "se-table-align-right",
  },
  tableScrollableWrapper: "se-table-scrollable",
  tableFrozenRow: "se-table-frozen-row",
  tableFrozenColumn: "se-table-frozen-column",
};

export function createTablePlugin(config?: TablePluginConfig): SeditorPlugin {
  const defaultColumns = config?.defaultColumns ?? 3;
  const defaultRows = config?.defaultRows ?? 3;
  const defaultHeaders: InsertTableCommandPayloadHeaders =
    config?.defaultHeaders ?? { rows: true, columns: false };
  const defaultRowStriping = config?.defaultRowStriping ?? false;
  const defaultFrozenRows = Math.min(
    1,
    Math.max(0, config?.defaultFrozenRows ?? 0),
  );
  const defaultFrozenColumns = Math.min(
    1,
    Math.max(0, config?.defaultFrozenColumns ?? 0),
  );

  const toolbarItem: ToolbarItem[] = [
    {
      id: "table",
      label: "Table",
      icon: TABLE_ICON,
      command: "openTableDialog",
      enable: (inst) => !isInTable(inst.editor),
    },
    {
      id: "tableBorder",
      label: "Table border",
      icon: TABLE_BORDER_ICON,
      command: "openTableBorder",
      enable: (inst) => isInTable(inst.editor),
    },
  ];

  const listeners = (editor: LexicalEditor): Array<() => void> => {
    const unregisterTablePlugin = registerTablePlugin(editor);
    if (config?.scrollable) setScrollableTablesActive(editor, true);
    const unregisterSelectionObserver = registerTableSelectionObserver(
      editor,
      true,
    );

    const unregisterInsert = editor.registerCommand(
      INSERT_TABLE_COMMAND,
      (payload: InsertTableCommandPayload) => {
        const node = $createTableNodeWithDimensions(
          parseInt(payload.rows, 10) || defaultRows,
          parseInt(payload.columns, 10) || defaultColumns,
          payload.includeHeaders ?? defaultHeaders,
        );
        if (defaultRowStriping) node.setRowStriping(true);
        if (defaultFrozenRows) node.setFrozenRows(defaultFrozenRows);
        if (defaultFrozenColumns) node.setFrozenColumns(defaultFrozenColumns);
        $insertNodes([node]);
        return true;
      },
      0,
    );

    const unregisterOpen = editor.registerCommand(
      SE_OPEN_TABLE_COMMAND,
      () => {
        editor.dispatchCommand(INSERT_TABLE_COMMAND, {
          columns: String(defaultColumns),
          rows: String(defaultRows),
          includeHeaders: defaultHeaders,
        });
        return true;
      },
      0,
    );

    const unregisterShortcut = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if (
          event.key.toLowerCase() !== "t" ||
          !(event.ctrlKey || event.metaKey) ||
          !event.altKey ||
          isInTable(editor)
        ) {
          return false;
        }
        event.preventDefault();
        queueMicrotask(() => {
          editor.dispatchCommand(SE_OPEN_TABLE_COMMAND, undefined);
        });
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );

    return [
      unregisterTablePlugin,
      unregisterSelectionObserver,
      unregisterInsert,
      unregisterOpen,
      unregisterShortcut,
      ...(config?.scrollable
        ? [() => setScrollableTablesActive(editor, false)]
        : []),
    ];
  };

  return {
    name: "table",
    nodes: [TableNode, TableRowNode, TableCellNode],
    listeners,
    toolbarItem,
    theme: tableTheme,
  };
}

export {
  INSERT_TABLE_COMMAND,
  TableNode,
  TableRowNode,
  TableCellNode,
  $createTableNodeWithDimensions,
  $findCellNode,
  $findTableNode,
  $getTableCellNodeFromLexicalNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $getTableRowIndexFromTableCellNode,
  $getTableColumnIndexFromTableCellNode,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  $deleteTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $setTableColumnIsHeader,
  $mergeCells,
  $unmergeCell,
  $setTableRowIsHeader,
  $isTableNode,
};

export function insertTableRow(editor: LexicalEditor, after: boolean): void {
  editor.update(() => {
    const cell = getSelectedTableCell();
    if (!cell) return;
    $insertTableRowAtSelection(after);
  });
}

export function insertTableColumn(editor: LexicalEditor, after: boolean): void {
  editor.update(() => {
    const cell = getSelectedTableCell();
    if (!cell) return;
    $insertTableColumnAtSelection(after);
  });
}

export function deleteTableRow(editor: LexicalEditor): void {
  editor.update(() => {
    const cell = getSelectedTableCell();
    if (!cell) return;
    $deleteTableRowAtSelection();
  });
}

export function deleteTableColumn(editor: LexicalEditor): void {
  editor.update(() => {
    const cell = getSelectedTableCell();
    if (!cell) return;
    $deleteTableColumnAtSelection();
  });
}

export function toggleTableHeaderRow(editor: LexicalEditor): void {
  editor.update(() => {
    const cell = getSelectedTableCell();
    if (!cell) return;
    const table = $getTableNodeFromLexicalNodeOrThrow(cell);
    const rowIndex = $getTableRowIndexFromTableCellNode(cell);
    const isHeader = (cell.getHeaderStyles() & 1) !== 0;
    $setTableRowIsHeader(table, rowIndex, !isHeader);
  });
}

export function toggleTableHeaderColumn(editor: LexicalEditor): void {
  editor.update(() => {
    const cell = getSelectedTableCell();
    if (!cell) return;
    const table = $getTableNodeFromLexicalNodeOrThrow(cell);
    const columnIndex = $getTableColumnIndexFromTableCellNode(cell);
    const isHeader = (cell.getHeaderStyles() & 2) !== 0;
    $setTableColumnIsHeader(table, columnIndex, !isHeader);
  });
}

export function deleteTable(editor: LexicalEditor): void {
  editor.update(() => {
    const cell = getSelectedTableCell();
    if (!cell) return;
    const table = $getTableNodeFromLexicalNodeOrThrow(cell);
    table.remove();
    $insertNodes([$createParagraphNode()]);
  });
}

export function moveTableRow(editor: LexicalEditor, after: boolean): void {
  editor.update(() => {
    const cell = getSelectedTableCell();
    if (!cell) return;
    const table = $getTableNodeFromLexicalNodeOrThrow(cell);
    if (!$isSimpleTable(table)) return;
    const row = $getTableRowIndexFromTableCellNode(cell);
    const target = after ? row + 1 : row - 1;
    if (target < 0 || target >= table.getChildrenSize()) return;
    $moveTableRow(table, row, target);
  });
}

export function moveTableColumn(editor: LexicalEditor, after: boolean): void {
  editor.update(() => {
    const cell = getSelectedTableCell();
    if (!cell) return;
    const table = $getTableNodeFromLexicalNodeOrThrow(cell);
    if (!$isSimpleTable(table)) return;
    const column = $getTableColumnIndexFromTableCellNode(cell);
    const target = after ? column + 1 : column - 1;
    if (target < 0 || target >= table.getColumnCount()) return;
    $moveTableColumn(table, column, target);
  });
}

export function mergeTableCells(editor: LexicalEditor): void {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isTableSelection(selection)) return;
    $mergeCells(
      selection
        .getNodes()
        .map((node) => $findCellNode(node))
        .filter((cell): cell is NonNullable<typeof cell> => cell !== null),
    );
  });
}

export function unmergeTableCell(editor: LexicalEditor): void {
  editor.update(() => {
    if (!getSelectedTableCell()) return;
    $unmergeCell();
  });
}

export function isTableHeaderColumnActive(editor: LexicalEditor): boolean {
  return editor.read(() => {
    const cell = getSelectedTableCell();
    return cell !== null && (cell.getHeaderStyles() & 2) !== 0;
  });
}

export function getTableSelectionBounds(
  editor: LexicalEditor,
): TableSelectionBounds | null {
  return editor.read(() => {
    const selection = $getSelection();
    if (!$isTableSelection(selection)) return null;
    const rects = getSelectedTableCells()
      .map((cell) =>
        editor.getElementByKey(cell.getKey())?.getBoundingClientRect(),
      )
      .filter((rect): rect is DOMRect => rect !== undefined);
    if (rects.length === 0) return null;
    return {
      top: Math.min(...rects.map((rect) => rect.top)),
      right: Math.max(...rects.map((rect) => rect.right)),
      bottom: Math.max(...rects.map((rect) => rect.bottom)),
      left: Math.min(...rects.map((rect) => rect.left)),
    };
  });
}

export function canMergeTableCells(editor: LexicalEditor): boolean {
  return editor.read(() => {
    const selection = $getSelection();
    return (
      $isTableSelection(selection) &&
      selection.getNodes().filter((node) => $findCellNode(node)).length > 1
    );
  });
}

export function canUnmergeTableCell(editor: LexicalEditor): boolean {
  return editor.read(() => {
    const cell = getSelectedTableCell();
    return cell !== null && (cell.getRowSpan() > 1 || cell.getColSpan() > 1);
  });
}

export function setTableCellBackgroundColor(
  editor: LexicalEditor,
  color: string | null,
): void {
  editor.update(() => {
    for (const cell of getSelectedTableCells()) {
      cell.setBackgroundColor(color);
    }
  });
}

export function getActiveTableCellBackgroundColor(
  editor: LexicalEditor,
): string | null {
  return editor.read(
    () => getSelectedTableCell()?.getBackgroundColor() ?? null,
  );
}

export function setTableCellVerticalAlign(
  editor: LexicalEditor,
  align: TableCellVerticalAlign,
): void {
  editor.update(() => {
    for (const cell of getSelectedTableCells()) {
      cell.setVerticalAlign(align);
    }
  });
}

export function getActiveTableCellVerticalAlign(
  editor: LexicalEditor,
): TableCellVerticalAlign {
  return editor.read(
    () =>
      (getSelectedTableCell()?.getVerticalAlign() as TableCellVerticalAlign) ??
      "top",
  );
}

export function setTableAlignment(
  editor: LexicalEditor,
  align: TableAlign,
): void {
  editor.update(() => {
    const cell = getSelectedTableCell();
    if (!cell) return;
    $getTableNodeFromLexicalNodeOrThrow(cell).setFormat(align);
  });
}

export function getActiveTableAlignment(editor: LexicalEditor): TableAlign {
  return editor.read(() => {
    const cell = getSelectedTableCell();
    const format = cell
      ? $getTableNodeFromLexicalNodeOrThrow(cell).getFormatType()
      : "left";
    return format === "center" || format === "right" ? format : "left";
  });
}

export function toggleTableRowStriping(editor: LexicalEditor): void {
  editor.update(() => {
    const cell = getSelectedTableCell();
    if (!cell) return;
    const table = $getTableNodeFromLexicalNodeOrThrow(cell);
    table.setRowStriping(!table.getRowStriping());
  });
}

export function isTableRowStripingActive(editor: LexicalEditor): boolean {
  return editor.read(() => {
    const cell = getSelectedTableCell();
    return (
      cell !== null &&
      $getTableNodeFromLexicalNodeOrThrow(cell).getRowStriping()
    );
  });
}

export function setTableColumnWidth(
  editor: LexicalEditor,
  cellKey: string,
  width: number,
): void {
  editor.update(() => {
    const node = $getNodeByKey(cellKey);
    const cell = node ? $findCellNode(node) : null;
    if (!cell || width < 40) return;
    const table = $getTableNodeFromLexicalNodeOrThrow(cell);
    const widths = Array.from(
      table.getColWidths() ?? Array(table.getColumnCount()).fill(0),
    );
    const column = $getTableColumnIndexFromTableCellNode(cell);
    widths[column] = Math.round(width);
    table.setColWidths(widths);
  });
}

export function setTableCellWidth(
  editor: LexicalEditor,
  cellKey: string,
  width: number,
): void {
  editor.update(() => {
    const node = $getNodeByKey(cellKey);
    if (!$isTableCellNode(node) || width < 40) return;
    node.setWidth(Math.round(width));
  });
}

export function setTableRowHeight(
  editor: LexicalEditor,
  rowKey: string,
  height: number,
): void {
  editor.update(() => {
    const node = $getNodeByKey(rowKey);
    if (!$isTableRowNode(node) || height < 24) return;
    node.setHeight(Math.round(height));
  });
}

export function setTableBorder(
  editor: LexicalEditor,
  border: TableBorder,
  tableKey?: string,
): void {
  editor.update(() => {
    const selectedCell = getSelectedTableCell();
    const selectedTable = tableKey
      ? $getNodeByKey(tableKey)
      : selectedCell
        ? $getTableNodeFromLexicalNodeOrThrow(selectedCell)
        : null;
    if (!$isTableNode(selectedTable)) return;
    const table = selectedTable;
    const mode = border.mode ?? "outer";
    const current = parseTableBorderStyle(table.getStyle());
    current[mode] = {
      style: border.style,
      color: border.color,
      width: Math.max(0, Math.round(border.width)),
    };
    table.setStyle(buildTableBorderStyle(current, mode));
  });
}

export function getActiveTableBorder(editor: LexicalEditor): TableBorder {
  return editor.read(() => {
    const cell = getSelectedTableCell();
    const table = cell ? $getTableNodeFromLexicalNodeOrThrow(cell) : null;
    const values = parseTableBorderStyle(table?.getStyle() ?? "");
    return {
      mode: values.activeMode,
      ...values[values.activeMode],
    };
  });
}

export function getActiveTableKey(editor: LexicalEditor): string | null {
  return editor.read(() => {
    const cell = getSelectedTableCell();
    return cell ? $getTableNodeFromLexicalNodeOrThrow(cell).getKey() : null;
  });
}

type BorderValues = Record<
  Exclude<TableBorderMode, never>,
  { style: TableBorderStyle; color: string; width: number }
> & { activeMode: TableBorderMode };

function parseTableBorderStyle(style: string): BorderValues {
  const read = (name: string, fallback: string): string => {
    const match = style.match(new RegExp(`${name}\\s*:\\s*([^;]+)`, "i"));
    return match?.[1]?.trim() ?? fallback;
  };
  const readMode = (mode: TableBorderMode) => ({
    style: read(`--se-table-border-${mode}-style`, "solid") as TableBorderStyle,
    color: read(`--se-table-border-${mode}-color`, "#e3e2e0"),
    width:
      Number.parseInt(read(`--se-table-border-${mode}-width`, "1px"), 10) || 0,
  });
  const active = read("--se-table-border-active-mode", "outer");
  return {
    outer: readMode("outer"),
    rows: readMode("rows"),
    columns: readMode("columns"),
    activeMode: active === "rows" || active === "columns" ? active : "outer",
  };
}

function buildTableBorderStyle(
  values: BorderValues,
  activeMode: TableBorderMode,
): string {
  return [
    `--se-table-border-active-mode: ${activeMode}`,
    ...(["outer", "rows", "columns"] as const).flatMap((mode) => [
      `--se-table-border-${mode}-style: ${values[mode].style}`,
      `--se-table-border-${mode}-color: ${values[mode].color}`,
      `--se-table-border-${mode}-width: ${values[mode].width}px`,
    ]),
  ].join("; ");
}

export function getActiveTableInfo(
  editor: LexicalEditor,
): { rowIndex: number; columnIndex: number; isHeader: boolean } | null {
  return editor.read(() => {
    const sel = $getSelection();
    if (!$isRangeSelection(sel)) return null;
    const cell = $findCellNode(sel.getNodes()[0]);
    if (!cell) return null;
    return {
      rowIndex: $getTableRowIndexFromTableCellNode(cell),
      columnIndex: $getTableColumnIndexFromTableCellNode(cell),
      isHeader: cell.hasHeader(),
    };
  });
}

function getSelectedTableCell() {
  const selection = $getSelection();
  if (!$isTableSelection(selection) && !$isRangeSelection(selection)) {
    return null;
  }
  const node = selection.getNodes()[0];
  return node ? $findCellNode(node) : null;
}

function getSelectedTableCells() {
  const selection = $getSelection();
  if (!$isTableSelection(selection) && !$isRangeSelection(selection)) return [];
  const cells = new Map<
    string,
    NonNullable<ReturnType<typeof $findCellNode>>
  >();
  for (const node of selection.getNodes()) {
    const cell = $findCellNode(node);
    if (cell) cells.set(cell.getKey(), cell);
  }
  return [...cells.values()];
}
