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

const CONTROLLED_CODE = `import { useState } from "react";
import { Editor, Toolbar } from "seditor-react";
import "seditor-theme/index.css";

export function App() {
  const [html, setHtml] = useState("<p>Hello</p>");
  return (
    <Editor
      value={html}
      onChange={setHtml}
      placeholder="Start writing..."
    >
      <Toolbar />
    </Editor>
  );
}`;

const FORM_CODE = `import { useForm, Controller } from "react-hook-form";
import { Editor, Toolbar } from "seditor-react";

export function Form() {
  const { control, handleSubmit } = useForm({
    defaultValues: { content: "<p>Hi</p>" },
  });
  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
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
      <button type="submit">Submit</button>
    </form>
  );
}`;

const JSON_CODE = `import { useState } from "react";
import { Editor, Toolbar } from "seditor-react";

export function App() {
  const [json, setJson] = useState("");
  return (
    <Editor
      valueFormat="json"
      onChange={setJson}
    >
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
    desc: "Initial-only config (plugins, theme, namespace, shortcuts). Cannot change after mount.",
    default: "{}",
  },
  {
    prop: "value",
    type: "string",
    desc: "Controlled content (HTML or JSON per valueFormat). Updates the editor when changed.",
    default: "—",
  },
  {
    prop: "defaultValue",
    type: "string",
    desc: "Initial content (uncontrolled). Priority: value > defaultValue > config.html.",
    default: "—",
  },
  {
    prop: "onChange",
    type: "(value, instance) => void",
    desc: "Fired on each content change. Receives serialized value per valueFormat.",
    default: "—",
  },
  {
    prop: "onChangeDebounceMs",
    type: "number",
    desc: "Debounce delay for onChange. 0 = synchronous. Flushed on blur/unmount.",
    default: "0",
  },
  {
    prop: "valueFormat",
    type: '"html" | "json"',
    desc: "Serialization format for value/defaultValue/onChange.",
    default: '"html"',
  },
  {
    prop: "onReady",
    type: "(instance: SeditorInstance) => void",
    desc: "Called once after the editor mounts.",
    default: "—",
  },
  {
    prop: "onFocus",
    type: "(event, instance) => void",
    desc: "Called when the editor root receives focus.",
    default: "—",
  },
  {
    prop: "onBlur",
    type: "(event, instance) => void",
    desc: "Called when the editor root loses focus. Flushes pending onChange first.",
    default: "—",
  },
  {
    prop: "onError",
    type: "(error: Error, instance) => void",
    desc: "Called when the editor throws an internal error.",
    default: "—",
  },
  {
    prop: "editable",
    type: "boolean",
    desc: "Controlled editable state (reactive). Overrides config.editable.",
    default: "true",
  },
  {
    prop: "onEditableChange",
    type: "(editable: boolean) => void",
    desc: "Called when the editable state changes.",
    default: "—",
  },
  {
    prop: "placeholder",
    type: "string",
    desc: "Placeholder text (reactive). Overrides config.placeholder.",
    default: "—",
  },
  {
    prop: "name",
    type: "string",
    desc: "Form field name. Renders a hidden <input> synced with content for form submission.",
    default: "—",
  },
  {
    prop: "id",
    type: "string",
    desc: "id for the contentEditable root (for <label htmlFor>).",
    default: "—",
  },
  {
    prop: "ariaLabel",
    type: "string",
    desc: "Accessible label for the editor.",
    default: "—",
  },
  {
    prop: "ariaLabelledBy",
    type: "string",
    desc: "id of an element that labels the editor.",
    default: "—",
  },
  {
    prop: "ariaDescribedBy",
    type: "string",
    desc: "id of an element that describes the editor.",
    default: "—",
  },
  {
    prop: "spellCheck",
    type: "boolean",
    desc: "Controls spell-check on the contentEditable root.",
    default: "—",
  },
  {
    prop: "autoFocus",
    type: "boolean",
    desc: "Focus the editor on mount.",
    default: "—",
  },
  {
    prop: "tabIndex",
    type: "number",
    desc: "Tab order for the contentEditable root.",
    default: "—",
  },
  {
    prop: "ref",
    type: "Ref<SeditorInstance>",
    desc: "Imperative instance (for form libraries like react-hook-form).",
    default: "—",
  },
  {
    prop: "className",
    type: "string",
    desc: "Custom class for the editor wrapper.",
    default: '"se-editor"',
  },
  {
    prop: "children",
    type: "ReactNode",
    desc: "Toolbar and other components inside the editor context.",
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
        Supports both uncontrolled (via <code>config.html</code> or{" "}
        <code>defaultValue</code>) and controlled (via <code>value</code>/
        <code>onChange</code>) usage.
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

      <h3>Controlled usage</h3>
      <p>
        Pass <code>value</code> and <code>onChange</code> to use the editor as a
        controlled component. The editor content is replaced whenever{" "}
        <code>value</code> changes (and differs from what the user just typed,
        to avoid loops).
      </p>
      <CodeBlock code={CONTROLLED_CODE} lang="tsx" filename="App.tsx" />

      <h3>Form integration (react-hook-form)</h3>
      <p>
        Use <code>ref</code>, <code>value</code>, <code>onChange</code>,{" "}
        <code>onBlur</code>, and <code>name</code> to integrate with form
        libraries. The <code>name</code> prop renders a hidden{" "}
        <code>&lt;input&gt;</code> for traditional form submission.
      </p>
      <CodeBlock code={FORM_CODE} lang="tsx" filename="Form.tsx" />

      <h3>JSON format</h3>
      <p>
        Set <code>valueFormat="json"</code> to serialize content as Lexical
        EditorState JSON (SSR-safe, no DOMParser). Works for both{" "}
        <code>value</code> and <code>onChange</code>.
      </p>
      <CodeBlock code={JSON_CODE} lang="tsx" filename="App.tsx" />

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
            <td>Main editor component (forwardRef to SeditorInstance)</td>
          </tr>
          <tr>
            <td>
              <code>EditorProps</code>
            </td>
            <td>Type</td>
            <td>Props for the Editor component</td>
          </tr>
          <tr>
            <td>
              <code>EditorValueFormat</code>
            </td>
            <td>Type</td>
            <td>"html" | "json" — serialization format</td>
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
