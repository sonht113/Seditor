# seditor-core

Framework-agnostic core of [Seditor](https://github.com/seditor/seditor), built on [Lexical](https://lexical.dev).

## Install

```bash
npm install seditor-core lexical
```

## Usage

```ts
import { createSeditor } from "seditor-core";

const instance = createSeditor({
  html: "<p>Hello</p>",
  placeholder: "Start writing...",
});

instance.commands.toggleBold();
instance.getHTML();
```

See the [main README](https://github.com/seditor/seditor#readme) for full API docs.

## License

MIT
