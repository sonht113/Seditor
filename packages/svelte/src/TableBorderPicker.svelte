<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    getActiveTableBorder,
    getActiveTableKey,
    setTableBorder,
    type TableBorder,
    type TableBorderMode,
    type TableBorderStyle,
  } from "seditor-plugin-table";
  import type { ToolbarItem } from "seditor-core";
  import { useEditor } from "./context";

  export let item: ToolbarItem;
  const instance = useEditor();
  let button: HTMLButtonElement;
  let popup: HTMLDivElement;
  let open = false;
  let border: TableBorder = getActiveTableBorder(instance.editor);
  let tableKey: string | null = null;

  $: enabled = item.enable?.(instance) ?? true;

  function update(changes: Partial<TableBorder>): void {
    border = { ...border, ...changes };
    setTableBorder(instance.editor, border, tableKey ?? undefined);
  }

  function handleStyleChange(event: Event): void {
    update({
      style: (event.currentTarget as HTMLSelectElement).value as TableBorderStyle,
    });
  }

  function handleModeChange(event: Event): void {
    update({
      mode: (event.currentTarget as HTMLSelectElement).value as TableBorderMode,
    });
  }

  function handleColorChange(event: Event): void {
    update({ color: (event.currentTarget as HTMLInputElement).value });
  }

  function handleWidthChange(event: Event): void {
    update({ width: Number((event.currentTarget as HTMLSelectElement).value) });
  }

  function close(): void {
    open = false;
  }

  function toggle(): void {
    if (!button) return;
    border = getActiveTableBorder(instance.editor);
    tableKey = getActiveTableKey(instance.editor);
    open = !open;
  }

  onMount(() => {
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (open && !popup?.contains(target) && !button?.contains(target)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (open && event.key === "Escape") close();
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  });

  onDestroy(close);
</script>

<span class="se-table-border-picker">
  <button
    bind:this={button}
    type="button"
    class="se-toolbar-button"
    title={item.label}
    aria-label={item.label}
    aria-expanded={open}
    disabled={!enabled}
    on:mousedown|preventDefault
    on:click={toggle}
  >
    {#if item.icon}{@html item.icon}{:else}{item.label}{/if}
  </button>
  {#if open}
    <div
      bind:this={popup}
      class="se-table-border-popup"
      style={`top: ${button.getBoundingClientRect().bottom + 4}px; left: ${button.getBoundingClientRect().left}px;`}
      role="dialog"
      aria-label="Table border settings"
    >
      <label>
        Apply to
        <select value={border.mode ?? "outer"} on:change={handleModeChange}>
          <option value="outer">Whole table</option>
          <option value="rows">Rows</option>
          <option value="columns">Columns</option>
        </select>
      </label>
      <label>
        Style
        <select
          value={border.style}
          on:change={handleStyleChange}
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
          <option value="double">Double</option>
          <option value="none">None</option>
        </select>
      </label>
      <label>
        Color
        <input type="color" value={border.color} on:change={handleColorChange} />
      </label>
      <label>
        Width
        <select value={border.width} on:change={handleWidthChange}>
          {#each [0, 1, 2, 3, 4] as width}<option value={width}>{width}px</option>{/each}
        </select>
      </label>
    </div>
  {/if}
</span>
