import { CodeBlock } from "../components/CodeBlock";

const BASIC_CODE = `import { Editor, Toolbar } from "seditor-react";
import "seditor-theme/index.css";

export function App() {
  return (
    <Editor config={{ placeholder: "Start writing..." }}>
      <Toolbar />
    </Editor>
  );
}`;

const USE_EDITOR_CODE = `import { Editor, Toolbar, useEditor } from "seditor-react";

function WordCount() {
  const instance = useEditor();
  const text = instance.editor.getEditorState().read(() => {
    const root = $getRoot();
    return root.getTextContent();
  });
  return <span>{text.trim().split(/\\s+/).length} words</span>;
}

export function App() {
  return (
    <Editor config={{ placeholder: "Start writing..." }}>
      <Toolbar />
      <WordCount />
    </Editor>
  );
}`;

const CUSTOM_TOOLBAR_CODE = `import { Editor, Toolbar } from "seditor-react";
import { defaultToolbarItems } from "seditor-react";
import type { ToolbarItem } from "seditor-core";

const minimalItems: ToolbarItem[] = [
  defaultToolbarItems.find((i) => i.id === "bold")!,
  defaultToolbarItems.find((i) => i.id === "italic")!,
  defaultToolbarItems.find((i) => i.id === "underline")!,
];

export function App() {
  return (
    <Editor config={{ placeholder: "Start writing..." }}>
      <Toolbar items={minimalItems} />
    </Editor>
  );
}`;

const EDITOR_PROPS = [
  {
    prop: "config",
    type: "SeditorConfig",
    desc: "Editor configuration (read once on mount)",
    default: "{}",
  },
  {
    prop: "className",
    type: "string",
    desc: "Custom class for the editor wrapper",
    default: '"se-editor"',
  },
  {
    prop: "onReady",
    type: "(instance: SeditorInstance) => void",
    desc: "Called when the editor is mounted",
    default: "—",
  },
  {
    prop: "children",
    type: "ReactNode",
    desc: "Toolbar and other components inside the editor context",
    default: "—",
  },
];

const TOOLBAR_PROPS = [
  {
    prop: "items",
    type: "ToolbarItem[]",
    desc: "Custom toolbar items. Omit to use defaults + plugin items.",
    default: "defaultToolbarItems",
  },
  {
    prop: "className",
    type: "string",
    desc: "Custom class for the toolbar wrapper",
    default: '"se-toolbar"',
  },
];

export function ReactAPI() {
  return (
    <div className="docs-prose">
      <h1>React API</h1>
      <p>
        The <code>seditor-react</code> package provides React bindings for the
        core editor: the <code>&lt;Editor&gt;</code> component, a{" "}
        <code>&lt;Toolbar&gt;</code>, and the <code>useEditor()</code> hook.
      </p>

      <h2>&lt;Editor&gt;</h2>
      <p>
        The main component. Creates a <code>SeditorInstance</code> from the{" "}
        <code>config</code> prop on mount and provides it via React context.
      </p>
      <CodeBlock code={BASIC_CODE} lang="tsx" filename="App.tsx" />

      <h3>EditorProps</h3>
      <table>
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Description</th>
            <th>Default</th>
          </tr>
        </thead>
        <tbody>
          {EDITOR_PROPS.map((p) => (
            <tr key={p.prop}>
              <td>
                <code>{p.prop}</code>
              </td>
              <td>
                <code>{p.type}</code>
              </td>
              <td>{p.desc}</td>
              <td>
                <code>{p.default}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>&lt;Toolbar&gt;</h2>
      <p>
        Renders toolbar buttons. Place it inside an <code>&lt;Editor&gt;</code>{" "}
        to access the editor instance via context.
      </p>
      <h3>ToolbarProps</h3>
      <table>
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Description</th>
            <th>Default</th>
          </tr>
        </thead>
        <tbody>
          {TOOLBAR_PROPS.map((p) => (
            <tr key={p.prop}>
              <td>
                <code>{p.prop}</code>
              </td>
              <td>
                <code>{p.type}</code>
              </td>
              <td>{p.desc}</td>
              <td>
                <code>{p.default}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>useEditor()</h2>
      <p>
        Hook to access the <code>SeditorInstance</code> from anywhere inside an
        <code>&lt;Editor&gt;</code> subtree. Throws if used outside.
      </p>
      <CodeBlock code={USE_EDITOR_CODE} lang="tsx" filename="WordCount.tsx" />

      <h2>Custom toolbar</h2>
      <p>
        Pass a subset of <code>defaultToolbarItems</code> (or your own{" "}
        <code>ToolbarItem[]</code>) to the <code>items</code> prop.
      </p>
      <CodeBlock code={CUSTOM_TOOLBAR_CODE} lang="tsx" filename="App.tsx" />

      <h2>Exports</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Kind</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>Editor</code>
            </td>
            <td>Component</td>
            <td>Main editor component</td>
          </tr>
          <tr>
            <td>
              <code>Toolbar</code>
            </td>
            <td>Component</td>
            <td>Toolbar with default or custom items</td>
          </tr>
          <tr>
            <td>
              <code>useEditor</code>
            </td>
            <td>Hook</td>
            <td>Access SeditorInstance from context</td>
          </tr>
          <tr>
            <td>
              <code>defaultToolbarItems</code>
            </td>
            <td>Constant</td>
            <td>Default toolbar item array</td>
          </tr>
          <tr>
            <td>
              <code>LinkTooltip</code>
            </td>
            <td>Component</td>
            <td>Link editing tooltip (auto-rendered)</td>
          </tr>
          <tr>
            <td>
              <code>ColorPicker</code>
            </td>
            <td>Component</td>
            <td>Text/background color picker</td>
          </tr>
          <tr>
            <td>
              <code>FontSizePicker</code>
            </td>
            <td>Component</td>
            <td>Font size dropdown</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
