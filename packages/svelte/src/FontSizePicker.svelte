<script lang="ts">
  import { onDestroy } from "svelte";
  import { getPendingFontSize } from "seditor-core";
  import { useEditor } from "./context";

  const instance = useEditor();
  let open = false;
  let tick = 0;
  let rootRef: HTMLDivElement | null = null;

  function force() {
    tick += 1;
  }

  const unregister = instance.editor.registerUpdateListener(() => force());
  onDestroy(unregister);

  const FONT_SIZES: Array<{ label: string; value: string | null }> = [
    { label: "Default", value: null },
    { label: "10", value: "10px" },
    { label: "11", value: "11px" },
    { label: "12", value: "12px" },
    { label: "13", value: "13px" },
    { label: "14", value: "14px" },
    { label: "15", value: "15px" },
    { label: "16", value: "16px" },
    { label: "18", value: "18px" },
    { label: "20", value: "20px" },
    { label: "24", value: "24px" },
    { label: "28", value: "28px" },
    { label: "32", value: "32px" },
    { label: "36", value: "36px" },
    { label: "40", value: "40px" },
    { label: "48", value: "48px" },
    { label: "56", value: "56px" },
    { label: "64", value: "64px" },
  ];

  $: activeSize = tick > -1 ? getPendingFontSize() ?? "" : "";

  $: buttonClass = `se-toolbar-button se-fontsize-picker-button${activeSize ? " se-fontsize-picker-active" : ""}`;

  function handleSelect(value: string | null): void {
    if (value === null) {
      instance.commands.clearFontSize();
    } else {
      instance.commands.setFontSize(value);
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

  function sampleStyle(value: string | null): string {
    if (value) return `font-size: ${value}`;
    return "";
  }
</script>

<div bind:this={rootRef} class="se-fontsize-picker">
  <button
    type="button"
    class={buttonClass}
    title="Font size"
    aria-label="Font size"
    on:click={toggleOpen}
  >
    <svg viewBox="0 0 18 18" width="18" height="18">
      <text
        x="5"
        y="13"
        text-anchor="middle"
        font-size="13"
        font-weight="600"
        fill="currentColor"
      >A</text>
      <text
        x="13"
        y="13"
        text-anchor="middle"
        font-size="9"
        font-weight="600"
        fill="currentColor"
      >A</text>
    </svg>
  </button>
  {#if open}
    <div class="se-fontsize-picker-dropdown" role="menu">
      {#each FONT_SIZES as size (size.label)}
        <button
          type="button"
          class="se-fontsize-picker-option"
          title={size.label}
          aria-label={size.label}
          on:click={() => handleSelect(size.value)}
        >
          <span class="se-fontsize-picker-sample" style={sampleStyle(size.value)}>
            {size.label}
          </span>
        </button>
      {/each}
    </div>
  {/if}
</div>
