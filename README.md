# Seditor

> A beautiful, lightweight, framework-agnostic rich text editor built on [Lexical](https://lexical.dev). 100% MIT.

[![CI](https://github.com/seditor/seditor/actions/workflows/ci.yml/badge.svg)](https://github.com/seditor/seditor/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/seditor-react.svg)](https://www.npmjs.com/package/seditor-react)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Seditor is a Notion-like, easy-to-configure rich text editor. The core is
framework-agnostic (TypeScript, no React), with first-class React bindings and
a default theme. Vue and Svelte bindings are planned.

## Why Seditor?

- **Beautiful by default** — Notion-like typography and a clean toolbar out of the box.
- **Lightweight** — core is ~35 KB gzip (excluding the Lexical peer).
- **Framework-agnostic core** — `seditor-core` has zero React dependency. Build your own bindings.
- **Config as data** — toolbar and config are plain objects, not JSX children.
- **CSS variables theming** — dark mode is a variable override, not a class swap.
- **100% MIT** — no premium-gated features.

## Install

```bash
npm install seditor-react seditor-theme
```

Peer dependencies: `react`, `react-dom`, `lexical`.

## Quick start

```tsx
import { Editor, Toolbar } from "seditor-react";
import "seditor-theme/index.css";
import "seditor-theme/dark.css";

export function App() {
  return (
    <Editor config={{ html: "<p>Hello <b>Seditor</b></p>" }}>
      <Toolbar />
    </Editor>
  );
}
```

> **Note:** The `config` prop is read once on mount. To update content
> after mount, use the imperative API (`instance.setHTML()`,
> `instance.commands.*`) via the `onReady` callback.

## Packages

| Package                 | Description                                            | Size (gzip) |
| ----------------------- | ------------------------------------------------------ | ----------- |
| `seditor-core`  | Framework-agnostic core (Lexical wrapper + commands)   | ~35 KB      |
| `seditor-react` | React bindings: `<Editor>`, `<Toolbar>`, `useEditor()` | ~5 KB       |
| `seditor-theme` | Default Notion-like theme (CSS variables + dark mode)  | ~2 KB       |
| `seditor-plugin-image` | Image plugin: upload, resize, drag-and-drop, alignment | ~4 KB       |

## Core API

```ts
import { createSeditor } from "seditor-core";

const instance = createSeditor({
  namespace: "my-editor",
  html: "<p>Initial content</p>",
  editable: true,
});

instance.commands.toggleBold();
instance.commands.toggleHeading("h1");
instance.commands.toggleBulletList();
instance.commands.setLink("https://example.com");
instance.commands.undo();

instance.getHTML(); // -> "<p>...</p>"
instance.getJSON(); // -> Lexical EditorState JSON
```

### Commands

| Command                                                                   | Description                                                                  |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `toggleBold` / `toggleItalic` / `toggleUnderline` / `toggleStrikethrough` | Inline text formats                                                          |
| `toggleHeading(tag)`                                                      | `tag`: `"h1" \| "h2" \| "h3"`                                                |
| `setParagraph`                                                            | Convert block to paragraph                                                   |
| `toggleBulletList` / `toggleNumberedList`                                 | Lists                                                                        |
| `setLink(url)` / `unsetLink`                                              | Links                                                                        |
| `setAlign(align)`                                                         | `align`: `"left" \| "center" \| "right"` — applies to text blocks and images |
| `setTextColor(color)` / `clearTextColor()`                                | Text color                                                                   |
| `setTextBackgroundColor(color)` / `clearTextBackgroundColor()`            | Text background color                                                        |
| `setFontSize(size)` / `clearFontSize()`                                   | Font size (e.g. `"16px"`)                                                    |
| `undo` / `redo`                                                           | History                                                                      |
| `focus`                                                                   | Focus the editor                                                             |

### Plugin contract (Phase 2)

```ts
import type { SeditorPlugin } from "seditor-core";

const myPlugin: SeditorPlugin = {
  name: "my-plugin",
  nodes: [MyNode],
  listeners: (editor) => [editor.registerUpdateListener(() => {})],
  onInit: (editor) => {},
};
```

## Theming

The default theme uses CSS variables under the `--se-*` namespace. Override
them to rebrand:

```css
:root {
  --se-color-primary: #ff6b35;
  --se-color-link: #ff6b35;
  --se-font-size: 16px;
}
```

Dark mode ships as `seditor-theme/dark.css` and activates via
`prefers-color-scheme` or the `data-se-theme="dark"` attribute.

## Development

```bash
pnpm install
pnpm dev        # start playground
pnpm test       # run all tests
pnpm typecheck
pnpm lint
pnpm build
pnpm size       # check bundle size limits
```

### Architecture guardrails

1. `packages/core` **must not** import `react` or `@lexical/react`. CI checks this.
2. Config and toolbar are plain objects — no JSX children.
3. All theming uses CSS variables (`--se-*`).

## License

MIT © Seditor contributors
