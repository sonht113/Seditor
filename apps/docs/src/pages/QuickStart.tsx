import { useState } from "react";
import { CodeBlock } from "../components/CodeBlock";

const REACT_INSTALL = `npm install seditor-react seditor-theme
# peer deps: react, react-dom, lexical`;

const VUE_INSTALL = `npm install seditor-vue seditor-theme
# peer deps: vue, lexical`;

const SVELTE_INSTALL = `npm install seditor-svelte seditor-theme
# peer deps: svelte, lexical`;

const REACT_QUICK = `import { Editor, Toolbar } from "seditor-react";
import "seditor-theme/index.css";
import "seditor-theme/dark.css";

export function App() {
  return (
    <Editor config={{ html: "<p>Hello <b>Seditor</b></p>" }}>
      <Toolbar />
    </Editor>
  );
}`;

const VUE_QUICK = `<script setup lang="ts">
import { Editor, Toolbar } from "seditor-vue";
import "seditor-theme/index.css";
import "seditor-theme/dark.css";
</script>

<template>
  <Editor :config="{ html: '<p>Hello <b>Seditor</b></p>' }">
    <Toolbar />
  </Editor>
</template>`;

const SVELTE_QUICK = `<script>
  import { Editor, Toolbar } from "seditor-svelte";
  import "seditor-theme/index.css";
  import "seditor-theme/dark.css";
</script>

<Editor config={{ html: "<p>Hello <b>Seditor</b></p>" }}>
  <Toolbar />
</Editor>`;

const REACT_IMPERATIVE = `import { useState } from "react";
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

const VUE_IMPERATIVE = `<script setup lang="ts">
import { ref } from "vue";
import { Editor, Toolbar, useEditor } from "seditor-vue";
import type { SeditorInstance } from "seditor-core";
import "seditor-theme/index.css";

const instance = ref<SeditorInstance | null>(null);

function SaveButton() {
  const inst = useEditor();
  const save = () => console.log(inst.getHTML());
  return { save };
}
</script>

<template>
  <Editor
    :config="{ placeholder: 'Start writing...' }"
    @ready="(i) => (instance = i)"
  >
    <Toolbar />
  </Editor>
</template>`;

const SVELTE_IMPERATIVE = `<script>
  import { Editor, Toolbar, useEditor } from "seditor-svelte";
  import type { SeditorInstance } from "seditor-core";
  import "seditor-theme/index.css";

  let instance = null;

  function SaveButton() {
    const inst = useEditor();
    const save = () => console.log(inst.getHTML());
    return { save };
  }
</script>

<Editor config={{ placeholder: "Start writing..." }} on:ready={(e) => (instance = e.detail)}>
  <Toolbar />
</Editor>`;

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-brand-500/10 text-brand-400"
          : "text-[var(--docs-text-muted)] hover:bg-[var(--docs-surface)] hover:text-[var(--docs-text)]"
      }`}
    >
      {children}
    </button>
  );
}

export function QuickStart() {
  const [framework, setFramework] = useState<"react" | "vue" | "svelte">(
    "react",
  );

  return (
    <div className="docs-prose">
      <h1>Quick Start</h1>

      <div className="mb-6 flex gap-2">
        <TabButton
          active={framework === "react"}
          onClick={() => setFramework("react")}
        >
          React
        </TabButton>
        <TabButton
          active={framework === "vue"}
          onClick={() => setFramework("vue")}
        >
          Vue 3
        </TabButton>
        <TabButton
          active={framework === "svelte"}
          onClick={() => setFramework("svelte")}
        >
          Svelte
        </TabButton>
      </div>

      <h2>Install</h2>
      <CodeBlock
        code={
          framework === "react"
            ? REACT_INSTALL
            : framework === "vue"
              ? VUE_INSTALL
              : SVELTE_INSTALL
        }
        lang="bash"
        filename="terminal"
      />
      <p>
        Peer dependencies:{" "}
        {framework === "react" ? (
          <>
            <code>react</code>, <code>react-dom</code>,{" "}
          </>
        ) : framework === "vue" ? (
          <code>vue</code>
        ) : (
          <code>svelte</code>
        )}{" "}
        <code>lexical</code>.
      </p>

      <h2>Basic usage</h2>
      <p>
        Import the <code>Editor</code> and <code>Toolbar</code> components, plus
        the theme CSS. That's all you need for a fully functional editor.
      </p>
      <CodeBlock
        code={
          framework === "react"
            ? REACT_QUICK
            : framework === "vue"
              ? VUE_QUICK
              : SVELTE_QUICK
        }
        lang={
          framework === "react" ? "tsx" : framework === "vue" ? "vue" : "svelte"
        }
        filename={
          framework === "react"
            ? "App.tsx"
            : framework === "vue"
              ? "App.vue"
              : "App.svelte"
        }
      />

      <blockquote className="border-l-4 border-brand-400 pl-4 my-6 text-[var(--docs-text-muted)] italic">
        <strong>Note:</strong> The <code>config</code> prop is read once on
        mount. To update content after mount, use the imperative API (
        <code>instance.setHTML()</code>, <code>instance.commands.*</code>) via
        the {framework === "react" ? <code>onReady</code> : <code>@ready</code>}{" "}
        event.
      </blockquote>

      <h2>Imperative API</h2>
      <p>
        Use the{" "}
        {framework === "react" ? <code>onReady</code> : <code>@ready</code>}{" "}
        callback to get the <code>SeditorInstance</code>, or the{" "}
        <code>useEditor()</code> composable inside an{" "}
        <code>&lt;Editor&gt;</code> subtree.
      </p>
      <CodeBlock
        code={
          framework === "react"
            ? REACT_IMPERATIVE
            : framework === "vue"
              ? VUE_IMPERATIVE
              : SVELTE_IMPERATIVE
        }
        lang={
          framework === "react" ? "tsx" : framework === "vue" ? "vue" : "svelte"
        }
        filename={
          framework === "react"
            ? "App.tsx"
            : framework === "vue"
              ? "App.vue"
              : "App.svelte"
        }
      />

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
          Read the{" "}
          <a
            href={
              framework === "react"
                ? "/Seditor/react-api"
                : framework === "vue"
                  ? "/Seditor/vue-api"
                  : "/Seditor/svelte-api"
            }
          >
            {framework === "react"
              ? "React"
              : framework === "vue"
                ? "Vue"
                : "Svelte"}{" "}
            API reference
          </a>{" "}
          for the full component props and events.
        </li>
        <li>
          Try the <a href="/Seditor/demo">live demo</a> to see it in action.
        </li>
      </ul>
    </div>
  );
}
