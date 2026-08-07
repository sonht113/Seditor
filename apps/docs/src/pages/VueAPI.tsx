import { CodeBlock } from "../components/CodeBlock";

const BASIC_CODE = `<script setup lang="ts">
import { Editor, Toolbar } from "seditor-vue";
import "seditor-theme/index.css";
</script>

<template>
  <Editor :config="{ placeholder: 'Start writing...' }">
    <Toolbar />
  </Editor>
</template>`;

const V_MODEL_CODE = `<script setup lang="ts">
import { ref } from "vue";
import { Editor, Toolbar } from "seditor-vue";
import "seditor-theme/index.css";

const html = ref("<p>Hello</p>");
</script>

<template>
  <Editor v-model="html" placeholder="Start writing...">
    <Toolbar />
  </Editor>
</template>`;

const JSON_CODE = `<script setup lang="ts">
import { ref } from "vue";
import { Editor, Toolbar } from "seditor-vue";

const json = ref("");
</script>

<template>
  <Editor v-model="json" value-format="json">
    <Toolbar />
  </Editor>
</template>`;

const USE_EDITOR_CODE = `<script setup lang="ts">
import { ref } from "vue";
import { Editor, Toolbar, useEditor } from "seditor-vue";
import type { SeditorInstance } from "seditor-core";

const instance = ref<SeditorInstance | null>(null);

function getWordCount() {
  if (!instance.value) return 0;
  const text = instance.value.editor
    .getEditorState()
    .read(() => instance.value!.editor.getRootElement()?.textContent ?? "");
  return text.trim().split(/\\s+/).filter(Boolean).length;
}
</script>

<template>
  <Editor :config="{ placeholder: 'Start writing...' }" @ready="(i) => (instance = i)">
    <Toolbar />
    <span>{{ getWordCount() }} words</span>
  </Editor>
</template>`;

const CUSTOM_TOOLBAR_CODE = `<script setup lang="ts">
import { Editor, Toolbar, defaultToolbarItems } from "seditor-vue";
import type { ToolbarItem } from "seditor-core";

const minimalItems: ToolbarItem[] = [
  defaultToolbarItems.find((i) => i.id === "bold")!,
  defaultToolbarItems.find((i) => i.id === "italic")!,
  defaultToolbarItems.find((i) => i.id === "underline")!,
];
</script>

<template>
  <Editor :config="{ placeholder: 'Start writing...' }">
    <Toolbar :items="minimalItems" />
  </Editor>
</template>`;

const EDITOR_PROPS = [
  {
    prop: "modelValue",
    type: "string",
    desc: "Controlled content via v-model (HTML or JSON per valueFormat).",
    default: "—",
  },
  {
    prop: "defaultValue",
    type: "string",
    desc: "Initial content (uncontrolled). Priority: modelValue > defaultValue > config.html.",
    default: "—",
  },
  {
    prop: "config",
    type: "SeditorConfig",
    desc: "Initial-only config (plugins, theme, namespace, shortcuts). Cannot change after mount.",
    default: "{}",
  },
  {
    prop: "valueFormat",
    type: '"html" | "json"',
    desc: "Serialization format for v-model/change.",
    default: '"html"',
  },
  {
    prop: "onChangeDebounceMs",
    type: "number",
    desc: "Debounce delay for change/update:modelValue. 0 = synchronous. Flushed on blur/unmount.",
    default: "0",
  },
  {
    prop: "editable",
    type: "boolean",
    desc: "Controlled editable state (reactive). Overrides config.editable.",
    default: "true",
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
    prop: "className",
    type: "string",
    desc: "Custom class for the editor wrapper.",
    default: '"se-editor"',
  },
];

const EDITOR_EVENTS = [
  {
    event: "update:modelValue",
    payload: "(value: string, instance: SeditorInstance)",
    desc: "v-model sync. Fired on each content change (debounced per onChangeDebounceMs).",
  },
  {
    event: "change",
    payload: "(value: string, instance: SeditorInstance)",
    desc: "Fired on each content change. Same payload as update:modelValue.",
  },
  {
    event: "ready",
    payload: "(instance: SeditorInstance)",
    desc: "Called once after the editor mounts.",
  },
  {
    event: "focus",
    payload: "(event: FocusEvent, instance: SeditorInstance)",
    desc: "Called when the editor root receives focus.",
  },
  {
    event: "blur",
    payload: "(event: FocusEvent, instance: SeditorInstance)",
    desc: "Called when the editor root loses focus. Flushes pending change first.",
  },
  {
    event: "error",
    payload: "(error: Error, instance: SeditorInstance)",
    desc: "Called when the editor throws an internal error.",
  },
  {
    event: "editableChange",
    payload: "(editable: boolean)",
    desc: "Called when the editable state changes (via prop or command).",
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
    desc: "Custom class for the toolbar wrapper.",
    default: '"se-toolbar"',
  },
];

export function VueAPI() {
  return (
    <div className="docs-prose">
      <h1>Vue API</h1>
      <p>
        The <code>seditor-vue</code> package provides Vue 3 bindings for the
        core editor: the <code>&lt;Editor&gt;</code> component, a{" "}
        <code>&lt;Toolbar&gt;</code>, and the <code>useEditor()</code>{" "}
        composable. Built with Composition API and{" "}
        <code>&lt;script setup&gt;</code>.
      </p>

      <h2>&lt;Editor&gt;</h2>
      <p>
        The main component. Creates a <code>SeditorInstance</code> from the{" "}
        <code>config</code> prop on mount and provides it via Vue{" "}
        <code>provide</code>/<code>inject</code>. Supports both uncontrolled
        (via <code>config.html</code> or <code>defaultValue</code>) and
        controlled (via <code>v-model</code>) usage.
      </p>
      <CodeBlock code={BASIC_CODE} lang="vue" filename="App.vue" />

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

      <h3>EditorEmits</h3>
      <table>
        <thead>
          <tr>
            <th>Event</th>
            <th>Payload</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {EDITOR_EVENTS.map((e) => (
            <tr key={e.event}>
              <td>
                <code>{e.event}</code>
              </td>
              <td>
                <code>{e.payload}</code>
              </td>
              <td>{e.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Controlled usage (v-model)</h3>
      <p>
        Use <code>v-model</code> to bind the editor content to a ref. The editor
        content is replaced whenever the model value changes (and differs from
        what the user just typed, to avoid loops). Both{" "}
        <code>update:modelValue</code> and <code>change</code> events are
        emitted on content changes.
      </p>
      <CodeBlock code={V_MODEL_CODE} lang="vue" filename="App.vue" />

      <h3>JSON format</h3>
      <p>
        Set <code>value-format="json"</code> to serialize content as Lexical
        EditorState JSON (SSR-safe, no DOMParser). Works for both{" "}
        <code>v-model</code> and <code>change</code> event.
      </p>
      <CodeBlock code={JSON_CODE} lang="vue" filename="App.vue" />

      <h2>&lt;Toolbar&gt;</h2>
      <p>
        Renders toolbar buttons. Place it inside an <code>&lt;Editor&gt;</code>{" "}
        to access the editor instance via inject.
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
        Composable to access the <code>SeditorInstance</code> from anywhere
        inside an <code>&lt;Editor&gt;</code> subtree. Uses Vue{" "}
        <code>inject</code> under the hood. Throws if used outside.
      </p>
      <CodeBlock code={USE_EDITOR_CODE} lang="vue" filename="App.vue" />

      <h2>Custom toolbar</h2>
      <p>
        Pass a subset of <code>defaultToolbarItems</code> (or your own{" "}
        <code>ToolbarItem[]</code>) to the <code>items</code> prop.
      </p>
      <CodeBlock code={CUSTOM_TOOLBAR_CODE} lang="vue" filename="App.vue" />

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
            <td>Main editor component (defineExpose to SeditorInstance)</td>
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
            <td>Composable</td>
            <td>Access SeditorInstance via inject</td>
          </tr>
          <tr>
            <td>
              <code>SEDITOR_KEY</code>
            </td>
            <td>InjectionKey</td>
            <td>Symbol key for provide/inject (advanced use)</td>
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
