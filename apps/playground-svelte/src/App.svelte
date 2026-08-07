<script lang="ts">
  import { Editor, Toolbar } from "seditor-svelte";
  import { createImagePlugin, type ImagePluginConfig } from "seditor-plugin-image";
  import type { SeditorInstance } from "seditor-core";
  import "seditor-theme";
  import "seditor-theme/dark.css";

  const INITIAL_HTML =
    '<h1>Welcome to Seditor</h1><p>A beautiful, lightweight rich text editor built on <b>Lexical</b>.</p><h2>Features</h2><ul><li>Bold, italic, underline, strikethrough</li><li>Headings &amp; lists</li><li>Links &amp; undo/redo</li><li>Image upload, resize &amp; drag-and-drop</li><li>Alignment for text &amp; images</li><li>Font size, text &amp; background colors</li></ul>';

  const demoUploadHandler: ImagePluginConfig["uploadHandler"] = async (file) => {
    console.info("[playground] uploading file:", file.name, file.type, file.size, "bytes");
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

  let instance: SeditorInstance | null = null;
  let controlled = false;
  let html = INITIAL_HTML;
  let dark = false;
  let outputHtml = "";
  let outputJson = "";

  function onReady(inst: SeditorInstance): void {
    instance = inst;
  }

  function toggleDark(): void {
    dark = !dark;
    document.documentElement.setAttribute("data-se-theme", dark ? "dark" : "light");
  }

  function showHtml(): void {
    if (!instance) return;
    outputHtml = instance.getHTML();
    outputJson = "";
  }

  function showJson(): void {
    if (!instance) return;
    outputJson = JSON.stringify(instance.getJSON(), null, 2);
    outputHtml = "";
  }

  $: imagePlugin = createImagePlugin({ uploadHandler: demoUploadHandler });
</script>

<div class="app">
  <header class="app-header">
    <div class="app-brand">
      <span class="app-logo">S</span>
      <div>
        <h1>Seditor (Svelte)</h1>
        <p>Beautiful, lightweight rich text editor</p>
      </div>
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="theme-toggle" on:click={() => (controlled = !controlled)}>
        {controlled ? "↺ Switch to Uncontrolled" : "→ Switch to Controlled"}
      </button>
      <button class="theme-toggle" on:click={toggleDark}>
        {dark ? "☀ Light" : "☾ Dark"}
      </button>
    </div>
  </header>
  <main class="app-main">
    {#if controlled}
      <Editor
        bind:value={html}
        placeholder="Start writing..."
        config={{ plugins: [imagePlugin] }}
        on:ready={(e) => onReady(e.detail)}
      >
        <Toolbar />
      </Editor>
    {:else}
      <Editor
        config={{ html: INITIAL_HTML, placeholder: "Start writing...", plugins: [imagePlugin] }}
        on:change={(e) => (html = e.detail.value)}
        on:ready={(e) => onReady(e.detail)}
      >
        <Toolbar />
      </Editor>
    {/if}
    <div class="output">
      <div class="output-actions">
        <button disabled={!instance} on:click={showHtml}>Get HTML</button>
        <button disabled={!instance} on:click={showJson}>Get JSON</button>
      </div>
      {#if outputHtml}
        <pre><code>{outputHtml}</code></pre>
      {/if}
      {#if outputJson}
        <pre><code>{outputJson}</code></pre>
      {/if}
    </div>
    {#if controlled}
      <div class="output">
        <div class="output-actions">
          <span>Controlled value (live):</span>
        </div>
        <pre><code>{html}</code></pre>
      </div>
    {/if}
  </main>
</div>
