import { describe, it, expect } from "vitest";
import {
  $getRoot,
  $isElementNode,
  KEY_DOWN_COMMAND,
  type LexicalEditor,
} from "lexical";
import { createSeditor, SE_OPEN_TABLE_COMMAND } from "seditor-core";
import {
  createTablePlugin,
  INSERT_TABLE_COMMAND,
  $isTableNode,
  deleteTable,
  getActiveTableAlignment,
  getActiveTableCellBackgroundColor,
  getActiveTableCellVerticalAlign,
  isTableRowStripingActive,
  setTableAlignment,
  setTableCellBackgroundColor,
  setTableCellVerticalAlign,
  setTableCellWidth,
  setTableColumnWidth,
  setTableRowHeight,
  setTableBorder,
  toggleTableRowStriping,
  toggleTableHeaderColumn,
} from "./index";

function makeEditor(): LexicalEditor {
  return createSeditor({
    plugins: [createTablePlugin()],
  }).editor;
}

function flush(editor: LexicalEditor): void {
  editor.read(() => {});
}

describe("createTablePlugin", () => {
  it("registers table nodes and inserts a table via INSERT_TABLE_COMMAND", () => {
    const editor = makeEditor();
    const root = document.createElement("div");
    document.body.appendChild(root);
    editor.setRootElement(root);

    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns: "3",
      rows: "2",
      includeHeaders: true,
    });
    flush(editor);

    const json = editor.getEditorState().toJSON() as {
      root: { children: Array<{ type: string }> };
    };
    const tables = json.root.children.filter((c) => c.type === "table");
    expect(tables.length).toBe(1);

    const tableEl = root.querySelector(".se-table") as HTMLElement;
    expect(tableEl).not.toBeNull();
    const rows = tableEl.querySelectorAll("tr");
    expect(rows.length).toBe(2);
    const cells = tableEl.querySelectorAll("td, th");
    expect(cells.length).toBe(6);

    editor.setRootElement(null);
    root.remove();
  });

  it("inserts a default table via SE_OPEN_TABLE_COMMAND", () => {
    const editor = makeEditor();
    const root = document.createElement("div");
    document.body.appendChild(root);
    editor.setRootElement(root);

    editor.dispatchCommand(SE_OPEN_TABLE_COMMAND, undefined);
    flush(editor);

    const tableEl = root.querySelector(".se-table") as HTMLElement;
    expect(tableEl).not.toBeNull();
    // default 3x3 with header row only -> 1 th row (3 th) + 2 td rows (3 td each)
    const headers = tableEl.querySelectorAll("th");
    expect(headers.length).toBe(3);
    const cells = tableEl.querySelectorAll("td");
    expect(cells.length).toBe(6);

    editor.setRootElement(null);
    root.remove();
  });

  it("respects custom default dimensions and headers config", () => {
    const editor = createSeditor({
      plugins: [
        createTablePlugin({
          defaultColumns: 2,
          defaultRows: 4,
          defaultHeaders: false,
        }),
      ],
    }).editor;
    const root = document.createElement("div");
    document.body.appendChild(root);
    editor.setRootElement(root);

    editor.dispatchCommand(SE_OPEN_TABLE_COMMAND, undefined);
    flush(editor);

    const tableEl = root.querySelector(".se-table") as HTMLElement;
    expect(tableEl).not.toBeNull();
    const rows = tableEl.querySelectorAll("tr");
    expect(rows.length).toBe(4);
    const headers = tableEl.querySelectorAll("th");
    expect(headers.length).toBe(0);
    const cells = tableEl.querySelectorAll("td");
    expect(cells.length).toBe(8);

    editor.setRootElement(null);
    root.remove();
  });

  it("exports a table node via $isTableNode", () => {
    const editor = makeEditor();
    editor.update(() => {
      $getRoot().clear();
      editor.dispatchCommand(INSERT_TABLE_COMMAND, {
        columns: "2",
        rows: "2",
      });
    });
    flush(editor);

    editor.read(() => {
      const child = $getRoot().getFirstChild();
      expect($isTableNode(child)).toBe(true);
    });
  });

  it("toggles a header column from the active cell", async () => {
    const editor = makeEditor();
    const root = document.createElement("div");
    document.body.appendChild(root);
    editor.setRootElement(root);

    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns: "2",
      rows: "2",
      includeHeaders: { rows: false, columns: false },
    });
    flush(editor);
    toggleTableHeaderColumn(editor);
    flush(editor);

    expect(root.querySelectorAll("th").length).toBe(2);
    expect(root.querySelectorAll("td").length).toBe(2);

    await new Promise((resolve) => setTimeout(resolve, 0));
    editor.setRootElement(null);
    root.remove();
  });

  it("deletes the active table", () => {
    const editor = makeEditor();
    const root = document.createElement("div");
    document.body.appendChild(root);
    editor.setRootElement(root);

    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns: "2",
      rows: "2",
    });
    flush(editor);
    deleteTable(editor);
    flush(editor);

    expect(root.querySelector(".se-table")).toBeNull();

    editor.setRootElement(null);
    root.remove();
  });

  it("applies cell and table formatting through the plugin API", async () => {
    const editor = makeEditor();
    const root = document.createElement("div");
    document.body.appendChild(root);
    editor.setRootElement(root);

    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns: "2",
      rows: "2",
      includeHeaders: false,
    });
    flush(editor);
    setTableCellBackgroundColor(editor, "#ff0000");
    setTableCellVerticalAlign(editor, "middle");
    setTableAlignment(editor, "right");
    toggleTableRowStriping(editor);
    flush(editor);

    expect(getActiveTableCellBackgroundColor(editor)).toBe("#ff0000");
    expect(getActiveTableCellVerticalAlign(editor)).toBe("middle");
    expect(getActiveTableAlignment(editor)).toBe("right");
    expect(isTableRowStripingActive(editor)).toBe(true);
    expect(
      root
        .querySelector(".se-table")
        ?.classList.contains("se-table-align-right"),
    ).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 0));
    editor.setRootElement(null);
    root.remove();
  });

  it("opens a table with Ctrl/Cmd+Alt+T", async () => {
    const editor = makeEditor();
    const root = document.createElement("div");
    document.body.appendChild(root);
    editor.setRootElement(root);

    const event = new KeyboardEvent("keydown", {
      key: "t",
      ctrlKey: true,
      altKey: true,
    });
    editor.dispatchCommand(KEY_DOWN_COMMAND, event);
    await new Promise((resolve) => setTimeout(resolve, 0));
    flush(editor);

    expect(root.querySelector(".se-table")).not.toBeNull();

    editor.setRootElement(null);
    root.remove();
  });

  it("persists resized column widths", async () => {
    const editor = makeEditor();
    const root = document.createElement("div");
    document.body.appendChild(root);
    editor.setRootElement(root);

    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns: "2",
      rows: "2",
    });
    flush(editor);
    let cellKey = "";
    editor.read(() => {
      const table = $getRoot().getFirstChild();
      const row = table && $isElementNode(table) ? table.getFirstChild() : null;
      const cell = row && $isElementNode(row) ? row.getFirstChild() : null;
      cellKey = cell?.getKey() ?? "";
    });
    setTableColumnWidth(editor, cellKey, 180);
    flush(editor);

    const json = editor.getEditorState().toJSON() as {
      root: { children: Array<{ colWidths?: number[] }> };
    };
    expect(json.root.children[0]?.colWidths?.[0]).toBe(180);

    await new Promise((resolve) => setTimeout(resolve, 0));
    editor.setRootElement(null);
    root.remove();
  });

  it("resizes a cell and row and applies table borders", async () => {
    const editor = makeEditor();
    const root = document.createElement("div");
    document.body.appendChild(root);
    editor.setRootElement(root);

    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns: "2",
      rows: "2",
    });
    flush(editor);
    let cellKey = "";
    let rowKey = "";
    editor.read(() => {
      const table = $getRoot().getFirstChild();
      const row = table && $isElementNode(table) ? table.getFirstChild() : null;
      const cell = row && $isElementNode(row) ? row.getFirstChild() : null;
      cellKey = cell?.getKey() ?? "";
      rowKey = row?.getKey() ?? "";
    });
    setTableCellWidth(editor, cellKey, 160);
    setTableRowHeight(editor, rowKey, 48);
    setTableBorder(editor, {
      style: "dashed",
      color: "#ff0000",
      width: 2,
    });
    flush(editor);

    const table = root.querySelector(".se-table") as HTMLTableElement;
    expect(table.style.getPropertyValue("--se-table-border-outer-style")).toBe(
      "dashed",
    );
    expect(table.style.getPropertyValue("--se-table-border-outer-width")).toBe(
      "2px",
    );
    expect(table.querySelector("td, th")?.getAttribute("style")).toContain(
      "width: 160px",
    );
    expect(table.querySelector("tr")?.getAttribute("style")).toContain(
      "height: 48px",
    );

    setTableBorder(editor, {
      mode: "rows",
      style: "dotted",
      color: "#00ff00",
      width: 3,
    });
    flush(editor);
    expect(table.style.getPropertyValue("--se-table-border-rows-style")).toBe(
      "dotted",
    );
    expect(table.style.getPropertyValue("--se-table-border-outer-style")).toBe(
      "dashed",
    );

    setTableBorder(editor, {
      mode: "columns",
      style: "double",
      color: "#0000ff",
      width: 1,
    });
    flush(editor);
    expect(
      table.style.getPropertyValue("--se-table-border-columns-style"),
    ).toBe("double");

    await new Promise((resolve) => setTimeout(resolve, 0));
    editor.setRootElement(null);
    root.remove();
  });
});
