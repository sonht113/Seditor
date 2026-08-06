# seditor-vue

Vue 3 bindings for [Seditor](https://github.com/sonht113/Seditor).

## Install

```bash
npm install seditor-vue seditor-theme
```

Peer dependencies: `vue`, `lexical`.

## Usage

### Uncontrolled

```vue
<script setup lang="ts">
import { Editor, Toolbar } from "seditor-vue";
import "seditor-theme/index.css";
</script>

<template>
  <Editor :config="{ html: '<p>Hello</p>' }">
    <Toolbar />
  </Editor>
</template>
```

### Controlled (v-model)

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Editor, Toolbar } from "seditor-vue";
import "seditor-theme/index.css";

const html = ref("<p>Hello</p>");
</script>

<template>
  <Editor v-model="html" placeholder="Start writing...">
    <Toolbar />
  </Editor>
</template>
```

### JSON format

```vue
<Editor v-model="jsonString" value-format="json" />
```

## Props

| Prop                  | Type                        | Default       | Description                                          |
| --------------------- | --------------------------- | ------------- | ---------------------------------------------------- |
| `modelValue`          | `string`                    | —             | Controlled content via `v-model` (HTML or JSON).    |
| `defaultValue`        | `string`                    | —             | Initial content (uncontrolled).                      |
| `config`              | `SeditorConfig`             | —             | Initial-only config (plugins, theme, namespace).     |
| `valueFormat`         | `"html" \| "json"`          | `"html"`      | Serialization format for `v-model`/`change`.        |
| `onChangeDebounceMs`  | `number`                    | `0`           | Debounce delay for `change`/`update:modelValue`.    |
| `editable`            | `boolean`                   | `true`        | Controlled editable state (reactive).                |
| `placeholder`         | `string`                    | —             | Placeholder text (reactive).                        |
| `name`                | `string`                    | —             | Form field name (renders hidden input).              |
| `id`                  | `string`                    | —             | id for the contentEditable root.                     |
| `ariaLabel`           | `string`                    | —             | A11y label.                                          |
| `ariaLabelledBy`      | `string`                    | —             | id of labelling element.                             |
| `ariaDescribedBy`     | `string`                    | —             | id of describing element.                            |
| `spellCheck`          | `boolean`                    | —             | Spell-check on the root.                             |
| `autoFocus`           | `boolean`                   | —             | Focus on mount.                                      |
| `tabIndex`            | `number`                    | —             | Tab order.                                           |
| `className`           | `string`                    | `"se-editor"` | Wrapper class.                                       |

## Events

| Event               | Payload                              | Description                          |
| ------------------- | ------------------------------------ | ------------------------------------ |
| `update:modelValue` | `(value, instance)`                  | v-model sync.                        |
| `change`            | `(value, instance)`                  | Fired on each content change.        |
| `ready`             | `(instance)`                         | Called once after mount.             |
| `focus`             | `(event, instance)`                  | Focus lifecycle.                     |
| `blur`              | `(event, instance)`                  | Blur lifecycle.                      |
| `error`             | `(error, instance)`                  | Lexical error handler.               |
| `editableChange`     | `(editable)`                         | Fired when editable changes.         |

## License

MIT
