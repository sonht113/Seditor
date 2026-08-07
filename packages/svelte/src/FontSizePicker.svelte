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

  $: activeSize = (() => {
    void tick;
    const pending = getPendingFontSize();
    return pending ?? "";
  })();

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
</script>

<div bind:this={rootRef} class="se-font-size-picker">
  <button
    type="button"
    class="se-toolbar-item"
    title="Font size"
    aria-label="Font size"
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
        <path d="M4 3h8M8 3v10M6 13h4" />
      </svg>
    </span>
  </button>
  {#if open}
    <div class="se-font-size-picker-dropdown">
      {#each FONT_SIZES as size (size.label)}
        <button
          type="button"
          class="se-font-size-option"
          class:active={activeSize === size.value}
          on:click={() => handleSelect(size.value)}
        >
          {size.label}
        </button>
      {/each}
    </div>
  {/if}
</div>
