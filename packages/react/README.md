# seditor-react

React bindings for [Seditor](https://github.com/seditor/seditor).

## Install

```bash
npm install seditor-react seditor-theme
```

Peer dependencies: `react`, `react-dom`, `lexical`.

## Usage

### Uncontrolled

```tsx
import { Editor, Toolbar } from "seditor-react";
import "seditor-theme/index.css";

export function App() {
  return (
    <Editor config={{ html: "<p>Hello</p>" }}>
      <Toolbar />
    </Editor>
  );
}
```

### Controlled

```tsx
import { useState } from "react";
import { Editor, Toolbar } from "seditor-react";
import "seditor-theme/index.css";

export function App() {
  const [html, setHtml] = useState("<p>Hello</p>");
  return (
    <Editor value={html} onChange={setHtml} placeholder="Start writing...">
      <Toolbar />
    </Editor>
  );
}
```

### Form integration (react-hook-form)

```tsx
import { useForm, Controller } from "react-hook-form";
import { Editor, Toolbar } from "seditor-react";

export function Form() {
  const { control } = useForm({ defaultValues: { content: "<p>Hi</p>" } });
  return (
    <Controller
      name="content"
      control={control}
      render={({ field: { value, onChange, onBlur, ref } }) => (
        <Editor
          ref={ref}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          name="content"
        >
          <Toolbar />
        </Editor>
      )}
    />
  );
}
```

### JSON format

```tsx
<Editor valueFormat="json" value={jsonString} onChange={setJsonString} />
```

## Props

| Prop                                               | Type                        | Default       | Description                                                 |
| -------------------------------------------------- | --------------------------- | ------------- | ----------------------------------------------------------- |
| `config`                                           | `SeditorConfig`             | —             | Initial-only config (plugins, theme, namespace, shortcuts). |
| `value`                                            | `string`                    | —             | Controlled content (HTML or JSON per `valueFormat`).        |
| `defaultValue`                                     | `string`                    | —             | Initial content (uncontrolled).                             |
| `onChange`                                         | `(value, instance) => void` | —             | Fired on each content change.                               |
| `onChangeDebounceMs`                               | `number`                    | `0`           | Debounce delay for `onChange`.                              |
| `valueFormat`                                      | `"html" \| "json"`          | `"html"`      | Serialization format for `value`/`onChange`.                |
| `onReady`                                          | `(instance) => void`        | —             | Called once after mount.                                    |
| `onFocus` / `onBlur`                               | `(event, instance) => void` | —             | Focus/blur lifecycle.                                       |
| `onError`                                          | `(error, instance) => void` | —             | Lexical error handler.                                      |
| `editable`                                         | `boolean`                   | `true`        | Controlled editable state (reactive).                       |
| `onEditableChange`                                 | `(editable) => void`        | —             | Fired when editable changes.                                |
| `placeholder`                                      | `string`                    | —             | Placeholder text (reactive).                                |
| `name`                                             | `string`                    | —             | Form field name (renders hidden input).                     |
| `id`                                               | `string`                    | —             | id for the contentEditable root.                            |
| `ariaLabel` / `ariaLabelledBy` / `ariaDescribedBy` | `string`                    | —             | A11y attributes.                                            |
| `spellCheck`                                       | `boolean`                   | —             | Spell-check on the root.                                    |
| `autoFocus`                                        | `boolean`                   | —             | Focus on mount.                                             |
| `tabIndex`                                         | `number`                    | —             | Tab order.                                                  |
| `ref`                                              | `Ref<SeditorInstance>`      | —             | Imperative instance.                                        |
| `className`                                        | `string`                    | `"se-editor"` | Wrapper class.                                              |
| `children`                                         | `ReactNode`                 | —             | Toolbar, etc.                                               |

See the [main README](https://github.com/seditor/seditor#readme) for full API docs.

## License

MIT
