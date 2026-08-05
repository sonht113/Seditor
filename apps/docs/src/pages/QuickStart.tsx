import { CodeBlock } from "../components/CodeBlock";

const INSTALL_CODE = `npm install seditor-react seditor-theme
# peer deps: react, react-dom, lexical`;

const QUICK_CODE = `import { Editor, Toolbar } from "seditor-react";
import "seditor-theme/index.css";
import "seditor-theme/dark.css";

export function App() {
  return (
    <Editor config={{ html: "<p>Hello <b>Seditor</b></p>" }}>
      <Toolbar />
    </Editor>
  );
}`;

const IMPERATIVE_CODE = `import { useState } from "react";
import { Editor, Toolbar, useEditor } from "seditor-react";
import type { SeditorInstance } from "seditor-core";
import "seditor-theme/index.css";

function SaveButton() {
  const instance = useEditor();
  return <button onClick={() => console.log(instance.getHTML())}>Save</button>;
}

export function App() {
  const [instance, setInstance] = useState<SeditorInstance | null>(null);
  return (
    <Editor config={{ placeholder: "Start writing..." }} onReady={setInstance}>
      <Toolbar />
      {instance && <SaveButton />}
    </Editor>
  );
}`;

export function QuickStart() {
  return (
    <div className="docs-prose">
      <h1>Quick Start</h1>

      <h2>Install</h2>
      <CodeBlock code={INSTALL_CODE} lang="bash" filename="terminal" />
      <p>
        Peer dependencies: <code>react</code>, <code>react-dom</code>,{" "}
        <code>lexical</code>.
      </p>

      <h2>Basic usage</h2>
      <p>
        Import the <code>Editor</code> and <code>Toolbar</code> components,
        plus the theme CSS. That's all you need for a fully functional editor.
      </p>
      <CodeBlock code={QUICK_CODE} lang="tsx" filename="App.tsx" />

      <blockquote className="border-l-4 border-brand-400 pl-4 my-6 text-[var(--docs-text-muted)] italic">
        <strong>Note:</strong> The <code>config</code> prop is read once on
        mount. To update content after mount, use the imperative API (
        <code>instance.setHTML()</code>, <code>instance.commands.*</code>) via
        the <code>onReady</code> callback.
      </blockquote>

      <h2>Imperative API</h2>
      <p>
        Use the <code>onReady</code> callback to get the{" "}
        <code>SeditorInstance</code>, or the <code>useEditor()</code> hook
        inside an <code>&lt;Editor&gt;</code> subtree.
      </p>
      <CodeBlock code={IMPERATIVE_CODE} lang="tsx" filename="App.tsx" />

      <h2>Next steps</h2>
      <ul>
        <li>
          Read the <a href="/Seditor/core-api">Core API reference</a> for the
          full command list.
        </li>
        <li>
          Learn about <a href="/Seditor/theming">theming</a> and CSS variables.
        </li>
        <li>
          Add the <a href="/Seditor/image-plugin">image plugin</a> for upload,
          resize, and drag-and-drop.
        </li>
        <li>
          Try the <a href="/Seditor/demo">live demo</a> to see it in action.
        </li>
      </ul>
    </div>
  );
}
