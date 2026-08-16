import { CodeBlock } from "../components/CodeBlock";

const BASIC_CODE = `import { Editor, Toolbar } from "seditor-react";
import { createTablePlugin } from "seditor-plugin-table";
import "seditor-theme/index.css";

export function App() {
  return (
    <Editor
      config={{
        plugins: [
          createTablePlugin({
            defaultRowStriping: true,
            scrollable: true,
          }),
        ],
      }}
    >
      <Toolbar />
    </Editor>
  );
}`;

const BORDER_CODE = `setTableBorder(editor, {
  mode: "outer", // "outer" | "rows" | "columns"
  style: "solid", // "solid" | "dashed" | "dotted" | "double" | "none"
  color: "#e3e2e0",
  width: 1,
});`;

export function TablePlugin() {
  return (
    <div className="docs-prose">
      <h1>Table Plugin</h1>
      <p>
        <code>seditor-plugin-table</code> adds table insertion, cell selection,
        row and column operations, resizing, formatting and border controls to
        Seditor.
      </p>

      <h2>Install</h2>
      <CodeBlock
        code="npm install seditor-plugin-table"
        lang="bash"
        filename="terminal"
      />

      <h2>Basic Usage</h2>
      <CodeBlock code={BASIC_CODE} lang="tsx" filename="App.tsx" />

      <h2>Configuration</h2>
      <table>
        <thead>
          <tr>
            <th>Option</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>defaultColumns</code>
            </td>
            <td>Default inserted column count. Defaults to 3.</td>
          </tr>
          <tr>
            <td>
              <code>defaultRows</code>
            </td>
            <td>Default inserted row count. Defaults to 3.</td>
          </tr>
          <tr>
            <td>
              <code>defaultHeaders</code>
            </td>
            <td>Controls row and column headers for new tables.</td>
          </tr>
          <tr>
            <td>
              <code>defaultRowStriping</code>
            </td>
            <td>Enables alternating row styling for new tables.</td>
          </tr>
          <tr>
            <td>
              <code>scrollable</code>
            </td>
            <td>Enables horizontal scrolling for wide tables.</td>
          </tr>
          <tr>
            <td>
              <code>defaultFrozenRows</code>
            </td>
            <td>Freezes the first row when scrolling is enabled.</td>
          </tr>
          <tr>
            <td>
              <code>defaultFrozenColumns</code>
            </td>
            <td>Freezes the first column when scrolling is enabled.</td>
          </tr>
        </tbody>
      </table>

      <h2>Toolbar Controls</h2>
      <ul>
        <li>
          Use the table icon to choose rows and columns from the insert grid.
        </li>
        <li>
          Use table actions to insert, delete, move, merge and format cells.
        </li>
        <li>
          Use the border icon inside a table to configure border settings.
        </li>
        <li>
          Use <code>Ctrl/Cmd + Alt + T</code> outside a table to open the
          picker.
        </li>
      </ul>

      <h2>Resize</h2>
      <ul>
        <li>Drag the right edge of a cell to resize its column.</li>
        <li>
          Hold <code>Alt</code> while dragging the right edge to resize one
          cell's width.
        </li>
        <li>Drag the bottom edge of a cell to resize its row height.</li>
      </ul>

      <h2>Border Modes</h2>
      <p>
        The border API and toolbar popup support independent outer, row and
        column borders:
      </p>
      <CodeBlock code={BORDER_CODE} lang="ts" filename="border.ts" />
      <ul>
        <li>
          <code>outer</code> draws a border around the complete table.
        </li>
        <li>
          <code>rows</code> controls horizontal borders between rows.
        </li>
        <li>
          <code>columns</code> controls vertical borders between columns.
        </li>
      </ul>

      <h2>Selection Notes</h2>
      <p>
        Empty cells are selectable and right-clicking a cell opens the table
        actions menu. Move row and column actions no-op for tables containing
        merged cells.
      </p>
    </div>
  );
}
