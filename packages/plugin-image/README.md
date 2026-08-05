# seditor-plugin-image

Image plugin for [Seditor](https://github.com/seditor/seditor) — upload, resize, drag-and-drop, and alignment.

## Install

```bash
npm install seditor-plugin-image
```

Peer dependencies: `seditor-core`, `lexical`.

## Usage

```tsx
import { Editor, Toolbar } from "seditor-react";
import { createImagePlugin } from "seditor-plugin-image";

const uploadHandler = async (file: File) => {
  // upload and return URL
  return "/uploads/" + file.name;
};

export function App() {
  return (
    <Editor config={{ plugins: [createImagePlugin({ uploadHandler })] }}>
      <Toolbar />
    </Editor>
  );
}
```

See the [main README](https://github.com/seditor/seditor#readme) for full docs.

## License

MIT
