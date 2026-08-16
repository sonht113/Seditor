# Table Plugin

`seditor-plugin-table` adds table editing to Seditor for the React, Vue 3 and
Svelte bindings. It uses Lexical's table nodes and table selection model.

## Install

```bash
npm install seditor-plugin-table
```

Peer dependencies: `lexical` and `@lexical/table`.

## Usage

```tsx
import { Editor, Toolbar } from "seditor-react";
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
}
```

## Configuration

| Option                 | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| `defaultColumns`       | Default inserted column count. Defaults to `3`.                |
| `defaultRows`          | Default inserted row count. Defaults to `3`.                   |
| `defaultHeaders`       | Header configuration for new tables. Defaults to a header row. |
| `defaultRowStriping`   | Enables alternating row styling for new tables.                |
| `scrollable`           | Wraps wide tables in a horizontal scrolling container.         |
| `defaultFrozenRows`    | Freezes the leading row when scrolling is enabled.             |
| `defaultFrozenColumns` | Freezes the leading column when scrolling is enabled.          |

## Features

- Insert tables from the toolbar grid picker.
- Select one or more cells, including empty cells.
- Insert, delete and move rows or columns.
- Toggle header rows and columns.
- Merge and unmerge cells.
- Resize columns, individual cell widths and row heights.
- Set cell background color and vertical alignment.
- Align the table and toggle striped rows.
- Open the table border toolbar popup.
- Use `Ctrl/Cmd + Alt + T` to open the insert picker outside a table.

Move row/column operations intentionally no-op for tables containing merged
cells because Lexical only supports those operations for simple tables.

## Border Modes

The border picker supports independent targets:

- `outer`: border around the complete table.
- `rows`: horizontal borders between rows.
- `columns`: vertical borders between columns.

Each target supports solid, dashed, dotted, double or none styles, a color and
a width from `0px` to `4px`. Border settings are stored on the Lexical table
node and survive JSON/HTML serialization.
