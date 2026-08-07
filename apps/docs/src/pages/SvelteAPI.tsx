import { CodeBlock } from "../components/CodeBlock";

const BASIC_CODE = `<script>
  import { Editor, Toolbar } from "seditor-svelte";
  import "seditor-theme/index.css";
</script>

<Editor config={{ placeholder: "Start writing..." }}>
  <Toolbar />
</Editor>`;

const CONTROLLED_CODE = `<script>
  import { Editor, Toolbar } from "seditor-svelte";
  import "seditor-theme/index.css";

  let html = "<p>Hello</p>";
</script>

<Editor bind:value={html} placeholder="Start writing...">
  <Toolbar />
</Editor>`;

const JSON_CODE = `<script>
  import { Editor, Toolbar } from "seditor-svelte";

  let json = "";
</script>

<Editor bind:value={json} valueFormat="json">
  <Toolbar />
</Editor>`;

const USE_EDITOR_CODE = `<script>
  import { Editor, Toolbar, useEditor } from "seditor-svelte";
  import type { SeditorInstance } from "seditor-core";
  import "seditor-theme/index.css";

  let instance = null;

  function getWordCount() {
    if (!instance) return 0;
    const text = instance.editor
      .getEditorState()
      .read(() => instance.editor.getRootElement()?.textContent ?? "");
    return text.trim().split(/\\s+/).filter(Boolean).length;
  }
</script>

<Editor config={{ placeholder: "Start writing..." }} on:ready={(e) => (instance = e.detail)}>
  <Toolbar />
  <span>{getWordCount()} words</span>
</Editor>`;

const CUSTOM_TOOLBAR_CODE = `<script>
  import { Editor, Toolbar, defaultToolbarItems } from "seditor-svelte";
  import type { ToolbarItem } from "seditor-core";

  const minimalItems = [
    defaultToolbarItems.find((i) => i.id === "bold"),
    defaultToolbarItems.find((i) => i.id === "italic"),
    defaultToolbarItems.find((i) => i.id === "underline"),
  ].filter(Boolean);
</script>

<Editor config={{ placeholder: "Start writing..." }}>
  <Toolbar items={minimalItems} />
</Editor>`;

export function SvelteAPI() {
  return (
    <div className="docs-prose">
      <h1>Svelte API</h1>
      <p>
        The <code>seditor-svelte</code> package provides Svelte bindings for the
        Seditor core.
      </p>

      <h2>Install</h2>
      <CodeBlock code="npm install seditor-svelte seditor-theme" lang="bash" />
      <p>
        Peer dependencies: <code>svelte</code>, <code>lexical</code>.
      </p>

      <h2>Basic usage</h2>
      <CodeBlock code={BASIC_CODE} lang="svelte" filename="App.svelte" />

      <h2>Controlled value</h2>
      <p>
        Use <code>bind:value</code> for controlled content. The format is
        determined by <code>valueFormat</code>.
      </p>
      <CodeBlock code={CONTROLLED_CODE} lang="svelte" filename="App.svelte" />

      <h2>JSON format</h2>
      <CodeBlock code={JSON_CODE} lang="svelte" filename="App.svelte" />

      <h2>Imperative API</h2>
      <p>
        Use the <code>on:ready</code> event to get the{" "}
        <code>SeditorInstance</code>, or the <code>useEditor()</code> function
        inside an <code>&lt;Editor&gt;</code> subtree.
      </p>
      <CodeBlock code={USE_EDITOR_CODE} lang="svelte" filename="App.svelte" />

      <h2>Custom toolbar</h2>
      <CodeBlock
        code={CUSTOM_TOOLBAR_CODE}
        lang="svelte"
        filename="App.svelte"
      />

      <h2>Props</h2>
      <table>
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>config</code>
            </td>
            <td>
              <code>SeditorConfig</code>
            </td>
            <td>—</td>
            <td>Initial-only config.</td>
          </tr>
          <tr>
            <td>
              <code>value</code>
            </td>
            <td>
              <code>string</code>
            </td>
            <td>—</td>
            <td>Controlled content.</td>
          </tr>
          <tr>
            <td>
              <code>defaultValue</code>
            </td>
            <td>
              <code>string</code>
            </td>
            <td>—</td>
            <td>Initial content (uncontrolled).</td>
          </tr>
          <tr>
            <td>
              <code>valueFormat</code>
            </td>
            <td>
              <code>&quot;html&quot; | &quot;json&quot;</code>
            </td>
            <td>
              <code>&quot;html&quot;</code>
            </td>
            <td>Serialization format.</td>
          </tr>
          <tr>
            <td>
              <code>onChangeDebounceMs</code>
            </td>
            <td>
              <code>number</code>
            </td>
            <td>
              <code>0</code>
            </td>
            <td>Debounce delay for change events.</td>
          </tr>
          <tr>
            <td>
              <code>editable</code>
            </td>
            <td>
              <code>boolean</code>
            </td>
            <td>—</td>
            <td>Controlled editable state.</td>
          </tr>
          <tr>
            <td>
              <code>placeholder</code>
            </td>
            <td>
              <code>string</code>
            </td>
            <td>—</td>
            <td>Placeholder text.</td>
          </tr>
          <tr>
            <td>
              <code>className</code>
            </td>
            <td>
              <code>string</code>
            </td>
            <td>
              <code>&quot;se-editor&quot;</code>
            </td>
            <td>Wrapper class.</td>
          </tr>
        </tbody>
      </table>

      <h2>Events</h2>
      <table>
        <thead>
          <tr>
            <th>Event</th>
            <th>Payload</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>on:ready</code>
            </td>
            <td>
              <code>instance</code>
            </td>
            <td>Called once after mount.</td>
          </tr>
          <tr>
            <td>
              <code>on:change</code>
            </td>
            <td>
              <code>{"{ value, instance }"}</code>
            </td>
            <td>Fired on each content change.</td>
          </tr>
          <tr>
            <td>
              <code>on:focus</code>
            </td>
            <td>
              <code>{"{ event, instance }"}</code>
            </td>
            <td>Focus lifecycle.</td>
          </tr>
          <tr>
            <td>
              <code>on:blur</code>
            </td>
            <td>
              <code>{"{ event, instance }"}</code>
            </td>
            <td>Blur lifecycle.</td>
          </tr>
          <tr>
            <td>
              <code>on:error</code>
            </td>
            <td>
              <code>{"{ error, instance }"}</code>
            </td>
            <td>Lexical error handler.</td>
          </tr>
          <tr>
            <td>
              <code>on:editableChange</code>
            </td>
            <td>
              <code>editable</code>
            </td>
            <td>Fired when editable changes.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
