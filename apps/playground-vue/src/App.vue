<script setup lang="ts">
import { ref } from "vue";
import { Editor, Toolbar } from "seditor-vue";
import {
  createImagePlugin,
  type ImagePluginConfig,
} from "seditor-plugin-image";
import type { SeditorInstance } from "seditor-core";
import "seditor-theme/index.css";
import "seditor-theme/dark.css";

const INITIAL_HTML =
  '<h1>Welcome to Seditor</h1><p>A beautiful, lightweight rich text editor built on <b>Lexical</b>.</p><h2>Features</h2><ul><li>Bold, italic, underline, strikethrough</li><li>Headings &amp; lists</li><li>Links &amp; undo/redo</li><li>Image upload, resize &amp; drag-and-drop</li>    <li>Alignment for text &amp; images</li><li>Font size, text &amp; background colors</li></ul><h2>Image demo</h2><p>Click the image below to select it, then drag the corner handles to resize. Drag the image to reposition it (copy). You can also drop image files from your desktop onto the editor. With an image (or text) selected, use the align buttons to set left/center/right alignment.</p><img src="https://picsum.photos/id/237/400/280" alt="Demo image" width="400" height="280"/><p>Try editing this text!</p>';

const demoUploadHandler: ImagePluginConfig["uploadHandler"] = async (file) => {
  console.info(
    "[playground] uploading file:",
    file.name,
    file.type,
    file.size,
    "bytes",
  );
  await new Promise((r) => setTimeout(r, 300));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      console.info("[playground] upload resolved (data URL)");
      resolve(reader.result as string);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

const instance = ref<SeditorInstance | null>(null);
const controlled = ref(false);
const html = ref(INITIAL_HTML);
const dark = ref(false);
const outputHtml = ref("");
const outputJson = ref("");

function onReady(inst: SeditorInstance): void {
  instance.value = inst;
}

function toggleDark(): void {
  dark.value = !dark.value;
  document.documentElement.setAttribute(
    "data-se-theme",
    dark.value ? "dark" : "light",
  );
}

function toggleMode(): void {
  controlled.value = !controlled.value;
}

function showHtml(): void {
  if (!instance.value) return;
  outputHtml.value = instance.value.getHTML();
  outputJson.value = "";
}

function showJson(): void {
  if (!instance.value) return;
  outputJson.value = JSON.stringify(instance.value.getJSON(), null, 2);
  outputHtml.value = "";
}

const imagePlugin = createImagePlugin({ uploadHandler: demoUploadHandler });
</script>

<template>
  <div class="app">
    <header class="app-header">
      <div class="app-brand">
        <span class="app-logo">S</span>
        <div>
          <h1>Seditor (Vue)</h1>
          <p>Beautiful, lightweight rich text editor</p>
        </div>
      </div>
      <div style="display: flex; gap: 8px">
        <button class="theme-toggle" @click="toggleMode">
          {{ controlled ? "↺ Switch to Uncontrolled" : "→ Switch to Controlled" }}
        </button>
        <button class="theme-toggle" @click="toggleDark">
          {{ dark ? "☀ Light" : "☾ Dark" }}
        </button>
      </div>
    </header>
    <main class="app-main">
      <Editor
        v-if="controlled"
        key="controlled"
        v-model="html"
        placeholder="Start writing..."
        :config="{ plugins: [imagePlugin] }"
        @ready="onReady"
      >
        <Toolbar />
      </Editor>
      <Editor
        v-else
        key="uncontrolled"
        :config="{
          html: INITIAL_HTML,
          placeholder: 'Start writing...',
          plugins: [imagePlugin],
        }"
        @change="(v: string) => (html = v)"
        @ready="onReady"
      >
        <Toolbar />
      </Editor>
      <div class="output">
        <div class="output-actions">
          <button :disabled="!instance" @click="showHtml">Get HTML</button>
          <button :disabled="!instance" @click="showJson">Get JSON</button>
        </div>
        <pre v-if="outputHtml"><code>{{ outputHtml }}</code></pre>
        <pre v-if="outputJson"><code>{{ outputJson }}</code></pre>
      </div>
      <div v-if="controlled" class="output">
        <div class="output-actions">
          <span>Controlled value (live):</span>
        </div>
        <pre><code>{{ html }}</code></pre>
      </div>
    </main>
  </div>
</template>
