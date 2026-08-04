# @seditor/editor-theme

Default Notion-like theme for [Seditor](https://github.com/seditor/seditor). CSS variables under the `--se-*` namespace, with built-in dark mode.

## Install

```bash
npm install @seditor/editor-theme
```

## Usage

```ts
import "@seditor/editor-theme/index.css";
import "@seditor/editor-theme/dark.css"; // dark mode (auto via prefers-color-scheme)
```

Override variables to rebrand:

```css
:root {
  --se-color-primary: #ff6b35;
}
```

See the [main README](https://github.com/seditor/seditor#readme) for full docs.

## License

MIT
