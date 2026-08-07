# seditor-svelte

Svelte bindings for [Seditor](https://github.com/sonht113/Seditor).

## Install

```bash
npm install seditor-svelte seditor-theme
```

Peer dependencies: `svelte`, `lexical`.

## Usage

### Uncontrolled

```svelte
<script>
  import { Editor, Toolbar } from "seditor-svelte";
  import "seditor-theme/index.css";
  import "seditor-theme/dark.css";
</script>

<Editor config={{ html: "<p>Hello</p>" }}>
  <Toolbar />
</Editor>
```

### Controlled (bind:value)

```svelte
<script>
  import { Editor, Toolbar } from "seditor-svelte";
  import "seditor-theme/index.css";

  let html = "<p>Hello</p>";
</script>

<Editor bind:value={html} placeholder="Start writing...">
  <Toolbar />
</Editor>
```

### JSON format

```svelte
<Editor bind:value={jsonString} valueFormat="json" />
```

## Props

| Prop                 | Type               | Default       | Description                                      |
| -------------------- | ------------------ | ------------- | ------------------------------------------------ |
| `config`             | `SeditorConfig`    | —             | Initial-only config (plugins, theme, namespace). |
| `value`              | `string`           | —             | Controlled content (HTML or JSON).               |
| `defaultValue`       | `string`           | —             | Initial content (uncontrolled).                  |
| `valueFormat`        | `"html" \| "json"` | `"html"`      | Serialization format.                            |
| `onChangeDebounceMs` | `number`           | `0`           | Debounce delay for `onChange`.                   |
| `editable`           | `boolean`          | —             | Controlled editable state.                       |
| `placeholder`        | `string`           | —             | Placeholder text.                                |
| `id`                 | `string`           | —             | id for the contentEditable root.                 |
| `name`               | `string`           | —             | Form field name (renders hidden input).          |
| `ariaLabel`          | `string`           | —             | A11y label.                                      |
| `ariaLabelledBy`     | `string`           | —             | id of labelling element.                         |
| `ariaDescribedBy`    | `string`           | —             | id of describing element.                        |
| `spellCheck`         | `boolean`          | —             | Spell-check on the root.                         |
| `autoFocus`          | `boolean`          | —             | Focus on mount.                                  |
| `tabIndex`           | `number`           | —             | Tab order.                                       |
| `className`          | `string`           | `"se-editor"` | Wrapper class.                                   |

## Events

| Event            | Payload               | Description                   |
| ---------------- | --------------------- | ----------------------------- |
| `ready`          | `instance`            | Called once after mount.      |
| `change`         | `{ value, instance }` | Fired on each content change. |
| `focus`          | `{ event, instance }` | Focus lifecycle.              |
| `blur`           | `{ event, instance }` | Blur lifecycle.               |
| `error`          | `{ error, instance }` | Lexical error handler.        |
| `editableChange` | `editable`            | Fired when editable changes.  |

## License

MIT
