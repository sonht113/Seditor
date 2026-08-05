import { CodeBlock } from "../components/CodeBlock";

const CREATE_CODE = `import { createSeditor } from "seditor-core";

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
instance.getJSON(); // -> Lexical EditorState JSON`;

const PLUGIN_CODE = `import type { SeditorPlugin } from "seditor-core";

const myPlugin: SeditorPlugin = {
  name: "my-plugin",
  nodes: [MyNode],
  listeners: (editor) => [editor.registerUpdateListener(() => {})],
  onInit: (editor) => {},
};`;

const COMMANDS = [
  {
    cmd: "toggleBold / toggleItalic / toggleUnderline / toggleStrikethrough",
    desc: "Inline text formats",
  },
  { cmd: "toggleHeading(tag)", desc: 'tag: "h1" | "h2" | "h3"' },
  { cmd: "setParagraph()", desc: "Convert block to paragraph" },
  { cmd: "toggleBulletList() / toggleNumberedList()", desc: "Lists" },
  { cmd: "setLink(url) / unsetLink()", desc: "Links" },
  {
    cmd: "setAlign(align)",
    desc: 'align: "left" | "center" | "right" — text blocks and images',
  },
  { cmd: "setTextColor(color) / clearTextColor()", desc: "Text color" },
  {
    cmd: "setTextBackgroundColor(color) / clearTextBackgroundColor()",
    desc: "Text background color",
  },
  {
    cmd: "setFontSize(size) / clearFontSize()",
    desc: 'Font size (e.g. "16px")',
  },
  { cmd: "undo() / redo()", desc: "History" },
  { cmd: "focus()", desc: "Focus the editor" },
];

const METHODS = [
  {
    method: "editor",
    desc: "The underlying LexicalEditor instance",
    returns: "LexicalEditor",
  },
  {
    method: "commands",
    desc: "Command dispatcher object",
    returns: "SeditorCommands",
  },
  {
    method: "registerPlugin(plugin)",
    desc: "Register a plugin at runtime",
    returns: "() => void",
  },
  {
    method: "getHTML()",
    desc: "Serialize editor content to HTML",
    returns: "string",
  },
  {
    method: "getJSON()",
    desc: "Serialize to Lexical EditorState JSON",
    returns: "unknown",
  },
  {
    method: "setHTML(html)",
    desc: "Replace editor content from HTML",
    returns: "void",
  },
  {
    method: "canUndo()",
    desc: "Whether undo is available",
    returns: "boolean",
  },
  {
    method: "canRedo()",
    desc: "Whether redo is available",
    returns: "boolean",
  },
  {
    method: "toolbarItems",
    desc: "Toolbar items contributed by plugins",
    returns: "ToolbarItem[]",
  },
  {
    method: "destroy()",
    desc: "Clean up listeners and free resources",
    returns: "void",
  },
];

export function CoreAPI() {
  return (
    <div className="docs-prose">
      <h1>Core API</h1>
      <p>
        The <code>seditor-core</code> package is the framework-agnostic
        foundation. It wraps Lexical with a clean command API, plugin system,
        and serialization helpers. Zero React dependency.
      </p>

      <h2>createSeditor(config)</h2>
      <p>Creates a new editor instance from a config object.</p>
      <CodeBlock code={CREATE_CODE} lang="ts" filename="example.ts" />

      <h3>SeditorConfig</h3>
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Default</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>namespace</code>
            </td>
            <td>
              <code>string</code>
            </td>
            <td>
              <code>"seditor"</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>html</code>
            </td>
            <td>
              <code>string</code>
            </td>
            <td>—</td>
          </tr>
          <tr>
            <td>
              <code>editable</code>
            </td>
            <td>
              <code>boolean</code>
            </td>
            <td>
              <code>true</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>placeholder</code>
            </td>
            <td>
              <code>string</code>
            </td>
            <td>—</td>
          </tr>
          <tr>
            <td>
              <code>plugins</code>
            </td>
            <td>
              <code>SeditorPlugin[]</code>
            </td>
            <td>
              <code>[]</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>theme</code>
            </td>
            <td>
              <code>Partial&lt;ThemeConfig&gt;</code>
            </td>
            <td>default theme</td>
          </tr>
          <tr>
            <td>
              <code>shortcuts</code>
            </td>
            <td>
              <code>boolean</code>
            </td>
            <td>
              <code>true</code>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>SeditorInstance methods</h2>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Description</th>
            <th>Returns</th>
          </tr>
        </thead>
        <tbody>
          {METHODS.map((m) => (
            <tr key={m.method}>
              <td>
                <code>{m.method}</code>
              </td>
              <td>{m.desc}</td>
              <td>
                <code>{m.returns}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Commands</h2>
      <p>
        Access commands via <code>instance.commands.*</code>. Each command is a
        zero-arg function (except where noted).
      </p>
      <table>
        <thead>
          <tr>
            <th>Command</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {COMMANDS.map((c) => (
            <tr key={c.cmd}>
              <td>
                <code>{c.cmd}</code>
              </td>
              <td>{c.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Plugin contract</h2>
      <p>
        Plugins extend the editor with custom nodes, listeners, toolbar items,
        and theme overrides.
      </p>
      <CodeBlock code={PLUGIN_CODE} lang="ts" filename="plugin.ts" />

      <h3>SeditorPlugin fields</h3>
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>name</code>
            </td>
            <td>
              <code>string</code>
            </td>
            <td>Unique plugin identifier</td>
          </tr>
          <tr>
            <td>
              <code>nodes</code>
            </td>
            <td>
              <code>Klass&lt;LexicalNode&gt;[]</code>
            </td>
            <td>Custom Lexical nodes to register</td>
          </tr>
          <tr>
            <td>
              <code>listeners</code>
            </td>
            <td>
              <code>(editor) =&gt; cleanup[]</code>
            </td>
            <td>Register update/selection listeners</td>
          </tr>
          <tr>
            <td>
              <code>toolbarItem</code>
            </td>
            <td>
              <code>ToolbarItem | ToolbarItem[]</code>
            </td>
            <td>Toolbar entries contributed by this plugin</td>
          </tr>
          <tr>
            <td>
              <code>theme</code>
            </td>
            <td>
              <code>Partial&lt;ThemeConfig&gt;</code>
            </td>
            <td>Theme overrides</td>
          </tr>
          <tr>
            <td>
              <code>onInit</code>
            </td>
            <td>
              <code>(editor) =&gt; void</code>
            </td>
            <td>Called when the editor is ready</td>
          </tr>
          <tr>
            <td>
              <code>onDestroy</code>
            </td>
            <td>
              <code>(editor) =&gt; void</code>
            </td>
            <td>Called on teardown</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
