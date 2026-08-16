<script lang="ts">
  import { Editor, Toolbar } from "seditor-svelte";
  import { createImagePlugin, type ImagePluginConfig } from "seditor-plugin-image";
  import { createTablePlugin } from "seditor-plugin-table";
  import type { SeditorInstance } from "seditor-core";
  import "seditor-theme";
  import "seditor-theme/dark.css";

  const INITIAL_HTML =
    '<h1>Welcome to Seditor</h1><p>A beautiful, lightweight rich text editor built on <b>Lexical</b>.</p><h2>Features</h2><ul><li>Bold, italic, underline, strikethrough</li><li>Headings &amp; lists</li><li>Links &amp; undo/redo</li><li>Image upload, resize &amp; drag-and-drop</li><li>Alignment for text &amp; images</li><li>Font size, text &amp; background colors</li></ul><h2>Image demo</h2><p>Click the image below to select it, then drag the corner handles to resize. Drag the image to reposition it (copy). You can also drop image files from your desktop onto the editor. With an image (or text) selected, use the align buttons to set left/center/right alignment.</p><img src="https://picsum.photos/id/237/400/280" alt="Demo image" width="400" height="280"/><p>Try editing this text!</p>';

  const TABLE_HTML =
    '<h2>Table demo</h2><p>Select cells, try right-click actions, resize cell edges, and use the border toolbar button.</p><table><tr><th>Feature</th><th>Status</th><th>Notes</th></tr><tr><td>Selection</td><td>Ready</td><td></td></tr><tr><td>Resize</td><td></td><td>Try empty cells</td></tr><tr><td>Border</td><td>Ready</td><td></td></tr></table>';
  const DEMO_HTML = `${INITIAL_HTML}${TABLE_HTML}`;

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
  let html = DEMO_HTML;
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
  const tablePlugin = createTablePlugin({
    defaultRowStriping: true,
    scrollable: true,
  });
  $: plugins = [imagePlugin, tablePlugin];
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
         config={{ plugins }}
        on:ready={(e) => onReady(e.detail)}
      >
        <Toolbar />
      </Editor>
    {:else}
      <Editor
         config={{ html: DEMO_HTML, placeholder: "Start writing...", plugins }}
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
