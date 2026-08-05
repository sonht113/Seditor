# seditor-react

React bindings for [Seditor](https://github.com/seditor/seditor).

## Install

```bash
npm install seditor-react seditor-theme
```

Peer dependencies: `react`, `react-dom`, `lexical`.

## Usage

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

See the [main README](https://github.com/seditor/seditor#readme) for full API docs.

## License

MIT
