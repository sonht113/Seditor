<script lang="ts">
  import { onDestroy } from "svelte";
  import {
    getPendingTextColor,
    getPendingBgColor,
  } from "seditor-core";
  import { useEditor } from "./context";

  export let kind: "text" | "background";

  const instance = useEditor();
  let open = false;
  let tick = 0;
  let rootRef: HTMLDivElement | null = null;

  function force() {
    tick += 1;
  }

  const unregister = instance.editor.registerUpdateListener(() => force());
  onDestroy(unregister);

  const TEXT_COLORS: Array<{ label: string; value: string | null }> = [
    { label: "Default", value: null },
    { label: "Dark gray", value: "#434343" },
    { label: "Gray", value: "#666666" },
    { label: "Light gray", value: "#999999" },
    { label: "Red", value: "#e03e3e" },
    { label: "Dark red", value: "#a56548" },
    { label: "Coral", value: "#e06666" },
    { label: "Orange", value: "#f08c00" },
    { label: "Dark orange", value: "#b45f06" },
    { label: "Amber", value: "#bf9000" },
    { label: "Yellow", value: "#dfab01" },
    { label: "Olive", value: "#808000" },
    { label: "Green", value: "#4f9b45" },
    { label: "Dark green", value: "#38761d" },
    { label: "Teal", value: "#008080" },
    { label: "Cyan", value: "#009eaf" },
    { label: "Blue", value: "#2383e2" },
    { label: "Dark blue", value: "#1155cc" },
    { label: "Indigo", value: "#3b5998" },
    { label: "Purple", value: "#9065b0" },
    { label: "Dark purple", value: "#674ea7" },
    { label: "Magenta", value: "#a4396b" },
    { label: "Pink", value: "#d6459d" },
    { label: "Brown", value: "#8b4513" },
  ];

  const BG_COLORS: Array<{ label: string; value: string | null }> = [
    { label: "None", value: null },
    { label: "Light gray", value: "#e3e2e0" },
    { label: "Gray", value: "#cccccc" },
    { label: "Dark gray", value: "#999999" },
    { label: "Light red", value: "#fde0e0" },
    { label: "Red", value: "#f7b3b3" },
    { label: "Salmon", value: "#fad7a0" },
    { label: "Light orange", value: "#fdebd0" },
    { label: "Orange", value: "#fbd9a8" },
    { label: "Light amber", value: "#fce8b3" },
    { label: "Light yellow", value: "#fcf2c7" },
    { label: "Yellow", value: "#fff2a8" },
    { label: "Light olive", value: "#e8e8c0" },
    { label: "Light green", value: "#dbeddb" },
    { label: "Green", value: "#b6d7a8" },
    { label: "Light teal", value: "#c0e0e0" },
    { label: "Light cyan", value: "#c0e8ec" },
    { label: "Light blue", value: "#d4e4fa" },
    { label: "Blue", value: "#a8c8f0" },
    { label: "Light indigo", value: "#c8d2e8" },
    { label: "Light purple", value: "#e5dcef" },
    { label: "Purple", value: "#c9b8e0" },
    { label: "Light pink", value: "#f8dcec" },
    { label: "Pink", value: "#f0b8d8" },
    { label: "Light brown", value: "#e0d0c0" },
  ];

  $: colors = kind === "text" ? TEXT_COLORS : BG_COLORS;
  $: label = kind === "text" ? "Text color" : "Background color";

  $: activeColor = (() => {
    void tick;
    const pending =
      kind === "text" ? getPendingTextColor() : getPendingBgColor();
    return pending ?? "";
  })();

  function handleSelect(value: string | null): void {
    if (kind === "text") {
      if (value === null) {
        instance.commands.clearTextColor();
      } else {
        instance.commands.setTextColor(value);
      }
    } else {
      if (value === null) {
        instance.commands.clearTextBackgroundColor();
      } else {
        instance.commands.setTextBackgroundColor(value);
      }
    }
    force();
    open = false;
  }

  function toggleOpen(): void {
    open = !open;
  }

  function onDocumentMouseDown(e: MouseEvent): void {
    if (rootRef && !rootRef.contains(e.target as Node)) {
      open = false;
    }
  }

  $: if (open) {
    document.addEventListener("mousedown", onDocumentMouseDown);
  } else {
    document.removeEventListener("mousedown", onDocumentMouseDown);
  }

  onDestroy(() => {
    document.removeEventListener("mousedown", onDocumentMouseDown);
  });
</script>

<div bind:this={rootRef} class="se-color-picker">
  <button
    type="button"
    class="se-toolbar-item"
    title={label}
    aria-label={label}
    on:click={toggleOpen}
  >
    <span class="se-toolbar-icon">
      <svg
        viewBox="0 0 16 16"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M4 3h6M7 3v10M5 13h4" />
      </svg>
    </span>
  </button>
  {#if open}
    <div class="se-color-picker-dropdown">
      {#each colors as color (color.label)}
        <button
          type="button"
          class="se-color-swatch"
          class:active={activeColor === color.value}
          title={color.label}
          aria-label={color.label}
          style="background-color: {color.value ?? 'transparent'}"
          on:click={() => handleSelect(color.value)}
        />
      {/each}
    </div>
  {/if}
</div>
